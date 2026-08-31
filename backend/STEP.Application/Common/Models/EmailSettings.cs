namespace STEP.Application.Common.Models
{
    public class EmailSettings
    {
        public const string SectionName = "EmailSettings";
        public string SenderEmail { get; set; } = "Recruitment@sthapatya.in";
        public string SenderDisplayName { get; set; } = "STEP Recruitment Team";
        public string? DefaultCc { get; set; }
        public string? DefaultBcc { get; set; }
        public string SmtpHost { get; set; } = "smtp.office365.com";
        public int SmtpPort { get; set; } = 587;
        public bool EnableSsl { get; set; } = true;
        public string? Username { get; set; } = "Recruitment@sthapatya.in";
        public string? Password { get; set; }
        public string AppBaseUrl { get; set; } = "http://localhost:3000";
    }
}
