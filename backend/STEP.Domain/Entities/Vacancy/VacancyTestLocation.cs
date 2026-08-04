using STEP.Domain.Common;
using STEP.Domain.Entities.Master;

namespace STEP.Domain.Entities.Vacancy
{
    /// <summary>Join table: a Vacancy to one or more MasterTestLocations (single for Walk-in, multiple for Direct hiring).</summary>
    public class VacancyTestLocation : BaseEntity
    {
        public int VacancyId { get; set; }
        public Vacancy Vacancy { get; set; } = null!;

        public int MasterTestLocationId { get; set; }
        public MasterTestLocation MasterTestLocation { get; set; } = null!;
    }
}
