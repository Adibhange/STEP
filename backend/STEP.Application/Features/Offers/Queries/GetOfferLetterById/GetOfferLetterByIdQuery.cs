using MediatR;
using STEP.Application.Features.Offers.Common;

namespace STEP.Application.Features.Offers.Queries.GetOfferLetterById
{
    public record GetOfferLetterByIdQuery(int Id) : IRequest<OfferLetterDto>;
}
