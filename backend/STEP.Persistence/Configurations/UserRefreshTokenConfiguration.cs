using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Identity;

namespace STEP.Persistence.Configurations
{
    public class UserRefreshTokenConfiguration : IEntityTypeConfiguration<UserRefreshToken>
    {
        public void Configure(EntityTypeBuilder<UserRefreshToken> builder)
        {
            builder.ToTable("UserRefreshTokens", "staff");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("UserRefreshTokenId");
            builder.Property(e => e.TokenHash).HasMaxLength(256).IsRequired();
            builder.Property(e => e.CreatedByIp).HasMaxLength(45);
            builder.Property(e => e.ReplacedByTokenHash).HasMaxLength(256);
            builder.Property(e => e.RowVersion).IsRowVersion();
            builder.HasIndex(e => e.TokenHash).IsUnique();

            builder.HasOne(e => e.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.Ignore(e => e.IsActive);
        }
    }
}
