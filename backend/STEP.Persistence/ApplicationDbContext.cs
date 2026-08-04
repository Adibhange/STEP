using Microsoft.EntityFrameworkCore;

namespace STEP.Persistence;

/// <summary>
/// Production Entity Framework Core 10 DbContext for STEP Enterprise ATS.
/// Phase 0: Empty DbContext foundation registered for SQL Server database connectivity.
/// </summary>
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}
