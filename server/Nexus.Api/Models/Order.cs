namespace Nexus.Api.Models;

public class Order
{
    public string Id { get; set; } = null!;
    public string OrderCode { get; set; } = null!;
    public string VendorName { get; set; } = null!;
    public string? CustomerName { get; set; }
    public string? CustomerPhone { get; set; }
    public string CustomerAddress { get; set; } = null!;
    public double? CustomerLat { get; set; }
    public double? CustomerLng { get; set; }
    public string PickupWarehouseId { get; set; } = null!;
    public Warehouse PickupWarehouse { get; set; } = null!;
    public string? DriverId { get; set; }
    public Driver? Driver { get; set; }
    public string Status { get; set; } = "pending";
    public string Priority { get; set; } = "normal";
    public DateTime? PromisedEta { get; set; }
    public DateTime? PredictedEta { get; set; }
    public DateTime? ActualDeliveryAt { get; set; }
    public bool IsBatched { get; set; }
    public string? BatchGroupId { get; set; }
    public int BatchPosition { get; set; }
    public DateTime? AssignedAt { get; set; }
    public DateTime? PickedUpAt { get; set; }
    public double DistanceKm { get; set; }
    public double CarbonKg { get; set; }
    public int? MlEtaMinutes { get; set; }
    public int? BaseEtaMinutes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    public ICollection<Alert> Alerts { get; set; } = new List<Alert>();
}
