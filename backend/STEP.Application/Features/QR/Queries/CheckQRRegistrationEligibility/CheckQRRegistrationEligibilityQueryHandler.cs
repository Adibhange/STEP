using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using STEP.Application.Common.Exceptions;
using STEP.Application.Common.Interfaces;
using STEP.Application.Features.Candidates.Common;
using STEP.Domain.Entities.QR;

namespace STEP.Application.Features.QR.Queries.CheckQRRegistrationEligibility
{
    public class CheckQRRegistrationEligibilityQueryHandler(IApplicationDbContext db)
        : IRequestHandler<CheckQRRegistrationEligibilityQuery, QRRegistrationEligibilityDto>
    {
        public async Task<QRRegistrationEligibilityDto> Handle(CheckQRRegistrationEligibilityQuery request, CancellationToken cancellationToken)
        {
            var email = request.Email?.Trim().ToLower();
            var phone = request.Phone?.Trim();

            if (string.IsNullOrEmpty(email) && string.IsNullOrEmpty(phone))
            {
                return new QRRegistrationEligibilityDto(true, null, null);
            }

            var qrCode = await db.QRCodes.FirstOrDefaultAsync(q => q.Code == request.Code, cancellationToken);
            int vacancyId;

            if (qrCode != null)
            {
                vacancyId = qrCode.VacancyId;
            }
            else
            {
                var vacancy = await db.Vacancies.FirstOrDefaultAsync(v => v.VacancyCode == request.Code, cancellationToken)
                    ?? throw new NotFoundException(nameof(QRCode), request.Code);
                vacancyId = vacancy.Id;
            }

            var lastApplication = await db.Candidates
                .Where(c => c.VacancyId == vacancyId
                    && ((!string.IsNullOrEmpty(email) && c.Email.ToLower() == email)
                        || (!string.IsNullOrEmpty(phone) && c.Phone == phone)))
                .OrderByDescending(c => c.CreatedAt)
                .Select(c => (DateTime?)c.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            var eligibility = CandidateReapplicationPolicy.Evaluate(lastApplication);
            return new QRRegistrationEligibilityDto(eligibility.CanApply, eligibility.EligibleFrom, eligibility.LastAppliedAt);
        }
    }
}
