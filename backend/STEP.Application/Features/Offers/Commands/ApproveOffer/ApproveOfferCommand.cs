using MediatR;

namespace STEP.Application.Features.Offers.Commands.ApproveOffer
{
    /// <summary>Mandatory Director PIN verification for this high-privilege decision, per the blueprint.</summary>
    public record ApproveOfferCommand(int OfferLetterId, string DirectorPin, int DirectorUserId) : IRequest<bool>;
}
