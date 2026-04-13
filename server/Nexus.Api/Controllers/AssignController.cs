using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Api.Data;
using Nexus.Api.Models;
using Nexus.Api.Services;

namespace Nexus.Api.Controllers;

[ApiController]
[Route("api/assign")]
public class AssignController(NexusDbContext db) : ControllerBase
{
    public record AssignRequest(string? OrderId, string? DriverId);

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] AssignRequest body)
    {
        if (string.IsNullOrEmpty(body.OrderId))
            return BadRequest(new { error = "Missing orderId" });

        if (!string.IsNullOrEmpty(body.DriverId))
        {
            var order = await db.Orders
                .Include(o => o.Driver)
                .Include(o => o.PickupWarehouse)
                .FirstOrDefaultAsync(o => o.Id == body.OrderId);
            if (order == null) return NotFound(new { error = "Order not found" });

            order.DriverId = body.DriverId;
            order.Status = "assigned";
            order.AssignedAt = DateTime.UtcNow;

            var driver = await db.Drivers.FindAsync(body.DriverId);
            if (driver != null) driver.Status = "at_pickup";

            await db.SaveChangesAsync();
            await db.Entry(order).Reference(o => o.Driver).LoadAsync();
            await db.Entry(order).Reference(o => o.PickupWarehouse).LoadAsync();

            return Ok(new
            {
                success = true,
                order,
                message = $"Order {order.OrderCode} assigned to {order.Driver?.Name}",
            });
        }

        var orderAuto = await db.Orders
            .Include(o => o.PickupWarehouse)
            .FirstOrDefaultAsync(o => o.Id == body.OrderId);
        if (orderAuto == null) return NotFound(new { error = "Order not found" });

        var availableDrivers = await db.Drivers
            .Where(d => d.Status == "idle" && d.IsActive)
            .ToListAsync();

        if (availableDrivers.Count == 0)
        {
            var busyDrivers = await db.Drivers
                .Where(d => d.Status == "delivering" && d.IsActive)
                .Select(d => new { d.Id, d.Name, code = d.DriverCode })
                .Take(3)
                .ToListAsync();

            if (busyDrivers.Count == 0)
            {
                return Ok(new
                {
                    error = "No available drivers",
                    message = "All drivers are busy or offline",
                });
            }

            return Ok(new
            {
                error = "No idle drivers",
                message = $"{busyDrivers.Count} drivers are currently delivering. Try again in a few minutes.",
                suggestions = busyDrivers,
            });
        }

        var warehouse = orderAuto.PickupWarehouse;
        var scored = availableDrivers
            .Select(d => new
            {
                driver = d,
                result = AssignmentScoring.CalculateDriverScore(d, orderAuto, warehouse),
            })
            .OrderByDescending(x => x.result.Score)
            .First();

        var best = scored.driver;
        orderAuto.DriverId = best.Id;
        orderAuto.Status = "assigned";
        orderAuto.AssignedAt = DateTime.UtcNow;
        best.Status = "at_pickup";

        await db.SaveChangesAsync();

        var baseEta = (int)Math.Round(scored.result.Breakdown.GetValueOrDefault("distance", 0) / 35 * 5);
        var mlEta = baseEta + 3;
        var assignmentId = Guid.NewGuid().ToString("n");

        return Ok(new
        {
            success = true,
            order = await db.Orders
                .Include(o => o.Driver)
                .Include(o => o.PickupWarehouse)
                .FirstAsync(o => o.Id == orderAuto.Id),
            assignment = new
            {
                id = assignmentId,
                driverCode = best.DriverCode,
                driverName = best.Name,
                score = scored.result.Score,
                breakdown = scored.result.Breakdown,
                warehouseId = warehouse.Id,
                warehouseName = warehouse.Name,
                district = AssignmentScoring.DistrictFromAddress(orderAuto.CustomerAddress),
                baseEta,
                mlEta,
                isBatched = false,
                timestamp = DateTime.UtcNow.ToString("o"),
            },
        });
    }
}
