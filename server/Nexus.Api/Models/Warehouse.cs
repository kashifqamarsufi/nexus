namespace Nexus.Api.Models;

public class Warehouse
{
    public string Id { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string City { get; set; } = "Riyadh";
    public double Lat { get; set; }
    public double Lng { get; set; }
    public bool IsActive { get; set; } = true;
    public int QueueDepth { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Driver> Drivers { get; set; } = new List<Driver>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
