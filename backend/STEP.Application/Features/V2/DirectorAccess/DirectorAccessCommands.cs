using System;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using STEP.Application.Common.Interfaces;
using STEP.Domain.Entities.Identity;

namespace STEP.Application.Features.V2.DirectorAccess
{
    public record DirectorAccessLinkResultDto(
        string Token,
        string AccessUrl,
        DateTimeOffset ExpiresAt,
        string CandidateName,
        string CandidateCode,
        string VacancyTitle,
        bool IsExisting
    );

    public record DirectorAccessGatewayInfoDto(
        bool Valid,
        string Token,
        int? CandidateId,
        string? CandidateName,
        string? CandidateCode,
        string? VacancyTitle,
        string? CurrentStage,
        DateTimeOffset? CreatedAt,
        DateTimeOffset? ExpiresAt,
        bool IsExpired,
        int RemainingMinutes
    );

    public record CreateDirectorAccessLinkCommand(int CandidateId, bool Regenerate = false)
        : IRequest<DirectorAccessLinkResultDto>;

    public class CreateDirectorAccessLinkCommandHandler(
        IApplicationDbContext db,
        IConfiguration configuration)
        : IRequestHandler<CreateDirectorAccessLinkCommand, DirectorAccessLinkResultDto>
    {
        public async Task<DirectorAccessLinkResultDto> Handle(CreateDirectorAccessLinkCommand request, CancellationToken cancellationToken)
        {
            var candidate = await db.Candidates
                .Include(c => c.Vacancy)
                .FirstOrDefaultAsync(c => c.Id == request.CandidateId, cancellationToken)
                ?? throw new Exception($"Candidate ID {request.CandidateId} not found.");

            var frontendUrlRaw = configuration["FRONTEND_URL"] ?? "http://localhost:3000";
            var frontendUrl = frontendUrlRaw.TrimEnd('/');

            if (!request.Regenerate)
            {
                var existing = await db.DirectorAccessLinks
                    .FirstOrDefaultAsync(l => l.CandidateId == request.CandidateId 
                                           && !l.IsRevoked 
                                           && l.ExpiresAt > DateTimeOffset.UtcNow, cancellationToken);

                if (existing != null)
                {
                    return new DirectorAccessLinkResultDto(
                        existing.Token,
                        $"{frontendUrl}/?d={existing.Token}",
                        existing.ExpiresAt,
                        $"{candidate.FirstName} {candidate.LastName}",
                        candidate.CandidateCode,
                        candidate.Vacancy?.Title ?? "Open Role",
                        true
                    );
                }
            }

            // Revoke any existing active links
            var activeLinks = await db.DirectorAccessLinks
                .Where(l => l.CandidateId == request.CandidateId && !l.IsRevoked)
                .ToListAsync(cancellationToken);

            foreach (var l in activeLinks)
            {
                l.IsRevoked = true;
                l.RevokedAt = DateTimeOffset.UtcNow;
            }

            var rawToken = $"dir_{Convert.ToHexString(RandomNumberGenerator.GetBytes(4)).ToLowerInvariant()}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds():x}";
            var expiresAt = DateTimeOffset.UtcNow.AddHours(24);

            var newLink = new DirectorAccessLink
            {
                Token = rawToken,
                CandidateId = request.CandidateId,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = expiresAt,
                IsRevoked = false
            };

            db.DirectorAccessLinks.Add(newLink);
            await db.SaveChangesAsync(cancellationToken);

            return new DirectorAccessLinkResultDto(
                rawToken,
                $"{frontendUrl}/?d={rawToken}",
                expiresAt,
                $"{candidate.FirstName} {candidate.LastName}",
                candidate.CandidateCode,
                candidate.Vacancy?.Title ?? "Open Role",
                false
            );
        }
    }

    public record GetDirectorAccessGatewayQuery(string Token) : IRequest<DirectorAccessGatewayInfoDto>;

    public class GetDirectorAccessGatewayQueryHandler(IApplicationDbContext db)
        : IRequestHandler<GetDirectorAccessGatewayQuery, DirectorAccessGatewayInfoDto>
    {
        public async Task<DirectorAccessGatewayInfoDto> Handle(GetDirectorAccessGatewayQuery request, CancellationToken cancellationToken)
        {
            var link = await db.DirectorAccessLinks
                .Include(l => l.Candidate)
                    .ThenInclude(c => c.Vacancy)
                .FirstOrDefaultAsync(l => l.Token == request.Token, cancellationToken);

            if (link == null)
            {
                return new DirectorAccessGatewayInfoDto(false, request.Token, null, null, null, null, null, null, null, true, 0);
            }

            var isExpired = link.IsRevoked || link.ExpiresAt <= DateTimeOffset.UtcNow;
            var remaining = isExpired ? 0 : (int)Math.Max(0, (link.ExpiresAt - DateTimeOffset.UtcNow).TotalMinutes);

            return new DirectorAccessGatewayInfoDto(
                !isExpired,
                link.Token,
                link.CandidateId,
                $"{link.Candidate.FirstName} {link.Candidate.LastName}",
                link.Candidate.CandidateCode,
                link.Candidate.Vacancy?.Title ?? "Open Role",
                link.Candidate.CurrentStage,
                link.CreatedAt,
                link.ExpiresAt,
                isExpired,
                remaining
            );
        }
    }
}
