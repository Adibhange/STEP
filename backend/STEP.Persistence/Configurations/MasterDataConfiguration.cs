using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STEP.Domain.Entities.Master;

namespace STEP.Persistence.Configurations
{
    /// <summary>Shared Fluent config applied to each of the five Phase 1 master-data lookup tables.</summary>
    internal static class MasterDataConfiguration
    {
        public static void ConfigureMaster<T>(EntityTypeBuilder<T> builder, string tableName) where T : MasterDataEntity
        {
            builder.ToTable(tableName, "master");
            builder.HasKey(e => e.Id);
            // tableName is plural (e.g. "MasterRoles"); the PK column drops the trailing 's' and adds "Id" (e.g. "MasterRoleId").
            builder.Property(e => e.Id).HasColumnName(tableName.TrimEnd('s') + "Id");
            builder.Property(e => e.Name).HasMaxLength(150).IsRequired();
            builder.Property(e => e.Code).HasMaxLength(30).IsRequired();
            builder.Property(e => e.Description).HasMaxLength(250);
            builder.Property(e => e.RowVersion).IsRowVersion();
            builder.HasIndex(e => e.Code).IsUnique();
            builder.HasQueryFilter(e => !e.IsDeleted);
        }
    }

    public class MasterRoleConfiguration : IEntityTypeConfiguration<MasterRole>
    {
        public void Configure(EntityTypeBuilder<MasterRole> builder) => MasterDataConfiguration.ConfigureMaster(builder, "MasterRoles");
    }

    public class MasterDepartmentConfiguration : IEntityTypeConfiguration<MasterDepartment>
    {
        public void Configure(EntityTypeBuilder<MasterDepartment> builder) => MasterDataConfiguration.ConfigureMaster(builder, "MasterDepartments");
    }

    public class MasterHiringLocationConfiguration : IEntityTypeConfiguration<MasterHiringLocation>
    {
        public void Configure(EntityTypeBuilder<MasterHiringLocation> builder) => MasterDataConfiguration.ConfigureMaster(builder, "MasterHiringLocations");
    }

    public class MasterTestLocationConfiguration : IEntityTypeConfiguration<MasterTestLocation>
    {
        public void Configure(EntityTypeBuilder<MasterTestLocation> builder) => MasterDataConfiguration.ConfigureMaster(builder, "MasterTestLocations");
    }

    public class MasterEmploymentTypeConfiguration : IEntityTypeConfiguration<MasterEmploymentType>
    {
        public void Configure(EntityTypeBuilder<MasterEmploymentType> builder) => MasterDataConfiguration.ConfigureMaster(builder, "MasterEmploymentTypes");
    }
}
