using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Offers.Common;
using STEP.Domain.Entities.Interview;

namespace STEP.Application.Features.Offers.Queries.GetOfferLetterById
{
    public class GetOfferLetterByIdQueryHandler(IApplicationDbContext db) : IRequestHandler<GetOfferLetterByIdQuery, OfferLetterDto>
    {
        public async Task<OfferLetterDto> Handle(GetOfferLetterByIdQuery request, CancellationToken cancellationToken)
        {
            var offer = await db.OfferLetters
                .Include(o => o.Candidate)
                .Include(o => o.Vacancy)
                .Include(o => o.PreparedBy)
                .Include(o => o.ApprovedBy)
                .AsNoTracking()
                .FirstOrDefaultAsync(o => o.Id == request.Id, cancellationToken)
                ?? throw new NotFoundException(nameof(OfferLetter), request.Id);

            return new OfferLetterDto(
                offer.Id, offer.CandidateId, $"{offer.Candidate.FirstName} {offer.Candidate.LastName}",
                offer.VacancyId, offer.Vacancy.Title, offer.OfferedCTC, offer.JoiningDate, offer.Status,
                $"{offer.PreparedBy.FirstName} {offer.PreparedBy.LastName}",
                offer.ApprovedBy != null ? $"{offer.ApprovedBy.FirstName} {offer.ApprovedBy.LastName}" : null,
                offer.ApprovedAt, offer.GeneratedPdfPath);
        }
    }
}
