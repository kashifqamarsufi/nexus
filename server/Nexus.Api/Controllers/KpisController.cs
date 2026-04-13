using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Api.Data;

namespace Nexus.Api.Controllers;

[ApiController]
[Route("api/kpis")]
public class KpisController(NexusDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var today = DateTime.UtcNow.Date;
        var tomorrow = today.AddDays(1);

        var allDrivers = await db.Drivers.CountAsync();
        var activeDrivers = await db.Drivers.CountAsync(d => d.Status != "offline");

        var todayOrders = await db.Orders.CountAsync(o =>
            o.CreatedAt >= today && o.CreatedAt < tomorrow);

        var successfulToday = await db.Orders.CountAsync(o =>
            o.CreatedAt >= today && o.CreatedAt < tomorrow && o.Status == "delivered");

        var pendingOrders = await db.Orders.CountAsync(o => o.Status == "pending");

        var successRate = todayOrders > 0 ? successfulToday / (double)todayOrders * 100 : 97.5;

        var activeOrders = await db.Orders.CountAsync(o =>
            o.Status == "assigned" || o.Status == "picked_up");

        var unresolvedAlerts = await db.Alerts.CountAsync(a => !a.IsResolved);

        return Ok(new
        {
            dailyLoad = todayOrders,
            fleetSuccessRate = Math.Round(successRate * 10) / 10,
            missedRevenue = Math.Round(pendingOrders / Math.Max(todayOrders, 1.0) * 100 * 10) / 10,
            activeDrivers,
            totalDrivers = allDrivers,
            activeOrders,
            pendingOrders,
            successfulToday,
            unresolvedAlerts,
        });
    }
}
