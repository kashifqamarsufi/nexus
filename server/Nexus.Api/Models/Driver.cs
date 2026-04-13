namespace Nexus.Api.Models;

public class Driver
{
    public string Id { get; set; } = null!;
    public string DriverCode { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string? Phone { get; set; }
    public string VehicleType { get; set; } = "motorcycle";
    public string Status { get; set; } = "offline";
    public double? Lat { get; set; }
    public double? Lng { get; set; }
    public double Speed { get; set; }
    public double Heading { get; set; }
    public double PerformanceScore { get; set; } = 75;
    public int TotalDeliveries { get; set; }
    public int SuccessfulDeliveries { get; set; }
    public double Rating { get; set; } = 4.5;
    public DateTime? LastPingAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public string? HomeWarehouseId { get; set; }
    public Warehouse? HomeWarehouse { get; set; }

    public ICollection<Order> AssignedOrders { get; set; } = new List<Order>();
    public ICollection<Alert> Alerts { get; set; } = new List<Alert>();
}
