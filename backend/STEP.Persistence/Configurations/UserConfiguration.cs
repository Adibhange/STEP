using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Identity;

namespace STEP.Persistence.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            builder.ToTable("Users", "staff");
            builder.HasKey(e => e.Id);
            builder.Property(e => e.Id).HasColumnName("UserId");
            builder.Property(e => e.EmployeeCode).HasMaxLength(30).IsRequired();
            builder.Property(e => e.FirstName).HasMaxLength(50).IsRequired();
            builder.Property(e => e.LastName).HasMaxLength(50).IsRequired();
            builder.Property(e => e.Email).HasMaxLength(150).IsRequired();
            builder.Property(e => e.PasswordHash).HasMaxLength(256).IsRequired();
            builder.Property(e => e.PinHash).HasMaxLength(256);
            builder.Property(e => e.RowVersion).IsRowVersion();

            builder.HasIndex(e => e.Email).IsUnique();
            builder.HasIndex(e => e.EmployeeCode).IsUnique();

            builder.HasOne(e => e.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(e => e.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.Department)
                .WithMany()
                .HasForeignKey(e => e.DepartmentId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }
}
