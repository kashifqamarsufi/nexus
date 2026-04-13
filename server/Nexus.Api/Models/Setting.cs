namespace Nexus.Api.Models;

public class Setting
{
    public string Id { get; set; } = null!;
    public string Key { get; set; } = null!;
    public string Value { get; set; } = null!;
    public string Category { get; set; } = "general";
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
