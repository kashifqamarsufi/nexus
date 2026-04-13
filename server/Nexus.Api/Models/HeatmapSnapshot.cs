namespace Nexus.Api.Models;

public class HeatmapSnapshot
{
    public string Id { get; set; } = null!;
    public string District { get; set; } = null!;
    public string Zone { get; set; } = "cool";
    public int PredictedOrders { get; set; }
    public double Confidence { get; set; }
    public int RecommendedDrivers { get; set; }
    public int Hour { get; set; }
    public int DayOfWeek { get; set; }
    public DateTime CreatedAt { get; set; }
}
