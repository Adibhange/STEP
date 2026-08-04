using System;
using MediatR;
using STEP.Application.Features.Offers.Common;

namespace STEP.Application.Features.Offers.Commands.GenerateOfferLetter
{
    public record GenerateOfferLetterCommand(int CandidateId, decimal OfferedCTC, DateTime JoiningDate, int PreparedByUserId) : IRequest<OfferLetterDto>;
}
