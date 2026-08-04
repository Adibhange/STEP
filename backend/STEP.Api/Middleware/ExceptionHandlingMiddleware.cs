using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Models;

namespace STEP.Api.Middleware
{
    /// <summary>Maps Application-layer exceptions to a consistent ApiResponse envelope and HTTP status code.</summary>
    public class ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await next(context);
            }
            catch (ValidationException ex)
            {
                await WriteResponse(context, HttpStatusCode.BadRequest,
                    ApiResponse<object>.Fail("Validation failed", ex.Errors.SelectMany(kv => kv.Value).ToList(), 400));
            }
            catch (NotFoundException ex)
            {
                await WriteResponse(context, HttpStatusCode.NotFound, ApiResponse<object>.Fail(ex.Message, statusCode: 404));
            }
            catch (AuthenticationFailedException ex)
            {
                await WriteResponse(context, HttpStatusCode.Unauthorized, ApiResponse<object>.Fail(ex.Message, statusCode: 401));
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unhandled exception processing {Path}", context.Request.Path);
                await WriteResponse(context, HttpStatusCode.InternalServerError,
                    ApiResponse<object>.Fail("An unexpected error occurred.", statusCode: 500));
            }
        }

        private static async Task WriteResponse(HttpContext context, HttpStatusCode statusCode, ApiResponse<object> body)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;
            await context.Response.WriteAsJsonAsync(body);
        }
    }
}
