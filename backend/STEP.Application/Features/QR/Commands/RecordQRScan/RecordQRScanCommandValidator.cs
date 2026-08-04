using FluentValidation;

namespace STEP.Application.Features.QR.Commands.RecordQRScan
{
    public class RecordQRScanCommandValidator : AbstractValidator<RecordQRScanCommand>
    {
        public RecordQRScanCommandValidator()
        {
            RuleFor(x => x.Code).NotEmpty();
        }
    }
}
