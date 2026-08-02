using System.Collections.Generic;

namespace STEP.Application.Common.Models
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }
        public PaginationMeta? Meta { get; set; }
        public string CorrelationId { get; set; } = System.Guid.NewGuid().ToString("N");

        public static ApiResponse<T> Ok(T data, string message = "Success", PaginationMeta? meta = null)
        {
            return new ApiResponse<T>
            {
                Success = true,
                StatusCode = 200,
                Message = message,
                Data = data,
                Meta = meta
            };
        }

        public static ApiResponse<T> Fail(string message, List<string>? errors = null, int statusCode = 400)
        {
            return new ApiResponse<T>
            {
                Success = false,
                StatusCode = statusCode,
                Message = message,
                Errors = errors ?? new List<string> { message }
            };
        }
    }

    public class PaginationMeta
    {
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages => (int)System.Math.Ceiling((double)TotalCount / PageSize);
    }
}
