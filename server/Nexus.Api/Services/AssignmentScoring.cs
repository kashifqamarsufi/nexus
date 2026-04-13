using Nexus.Api.Models;

namespace Nexus.Api.Services;

public static class AssignmentScoring
{
    public static double CalculateDistance(double lat1, double lng1, double lat2, double lng2)
    {
        const double R = 6371;
        var dLat = (lat2 - lat1) * Math.PI / 180;
        var dLng = (lng2 - lng1) * Math.PI / 180;
        var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(lat1 * Math.PI / 180) * Math.Cos(lat2 * Math.PI / 180) *
                Math.Sin(dLng / 2) * Math.Sin(dLng / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    public static (double Score, Dictionary<string, double> Breakdown) CalculateDriverScore(
        Driver driver,
        Order order,
        Warehouse warehouse)
    {
        var breakdown = new Dictionary<string, double>();
        double score = 0;

        if (driver.Lat is { } dLat && driver.Lng is { } dLng)
        {
            var distanceToPickup = CalculateDistance(dLat, dLng, warehouse.Lat, warehouse.Lng);
            var distanceScore = Math.Max(0, 100 - distanceToPickup * 5);
            breakdown["distance"] = distanceScore * 0.35;
            score += breakdown["distance"];
        }
        else breakdown["distance"] = 0;

        breakdown["performance"] = driver.PerformanceScore * 0.25;
        score += breakdown["performance"];

        breakdown["rating"] = driver.Rating * 20 * 0.2;
        score += breakdown["rating"];

        var vehicleBonus = driver.VehicleType == "motorcycle" ? 100 : driver.VehicleType == "car" ? 80 : 60;
        breakdown["vehicle"] = vehicleBonus * 0.1;
        score += breakdown["vehicle"];

        var experienceScore = Math.Min(100, driver.TotalDeliveries / 10.0);
        breakdown["experience"] = experienceScore * 0.1;
        score += breakdown["experience"];

        return (Math.Round(score * 100) / 100, breakdown);
    }

    public static string DistrictFromAddress(string address)
    {
        const string suffix = " District";
        var idx = address.IndexOf(suffix, StringComparison.Ordinal);
        if (idx > 0) return address[..idx];
        return "Riyadh";
    }
}
