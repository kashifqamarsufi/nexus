using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Api.Data;

namespace Nexus.Api.Controllers;

[ApiController]
[Route("api/alerts")]
public class AlertsController(NexusDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var alerts = await db.Alerts
            .Include(a => a.Driver)
            .Include(a => a.Order)
            .OrderByDescending(a => a.CreatedAt)
            .Take(50)
            .ToListAsync();
        return Ok(alerts);
    }

    public record PatchAlertDto(string Id, string? ResolvedBy);

    [HttpPatch]
    public async Task<IActionResult> Resolve([FromBody] PatchAlertDto body)
    {
        var alert = await db.Alerts.FindAsync(body.Id);
        if (alert == null) return NotFound();

        var utc = DateTime.UtcNow;
        alert.IsResolved = true;
        alert.ResolvedAt = utc;
        alert.ResolvedBy = body.ResolvedBy ?? "system";
        alert.UpdatedAt = utc;
        await db.SaveChangesAsync();
        return Ok(alert);
    }
}
