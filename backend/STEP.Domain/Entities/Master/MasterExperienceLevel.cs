namespace STEP.Domain.Entities.Master
{
    /// <summary>
    /// Experience level taxonomy for job vacancies and candidate profiles
    /// (e.g. Fresher, 1-2 Years, 3-5 Years, 5+ Years, Senior).
    /// </summary>
    public class MasterExperienceLevel : MasterDataEntity
    {
        public decimal MinYears { get; set; } = 0.0m;
        public decimal MaxYears { get; set; } = 99.0m;
    }
}
