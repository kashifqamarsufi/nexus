namespace Nexus.Api.Models;

public class Alert
{
    public string Id { get; set; } = null!;
    public string Type { get; set; } = null!;
    public string Severity { get; set; } = "medium";
    public string Message { get; set; } = null!;
    public string? RecommendedAction { get; set; }
    public string? DriverId { get; set; }
    public Driver? Driver { get; set; }
    public string? OrderId { get; set; }
    public Order? Order { get; set; }
    public bool IsResolved { get; set; }
    public DateTime? ResolvedAt { get; set; }
    public string? ResolvedBy { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
