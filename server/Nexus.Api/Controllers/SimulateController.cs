using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Api.Data;
using Nexus.Api.Models;

namespace Nexus.Api.Controllers;

[ApiController]
[Route("api/simulate")]
public class SimulateController(NexusDbContext db) : ControllerBase
{
    public record SimulateBody(string Action, string? OrderId);

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] SimulateBody body)
    {
        var rnd = new Random();

        if (body.Action == "update_positions")
        {
            var activeDrivers = await db.Drivers
                .Where(d =>
                    (d.Status == "idle" || d.Status == "delivering" || d.Status == "at_pickup") &&
                    d.Lat != null && d.Lng != null)
                .ToListAsync();

            var updates = new List<object>();
            var utc = DateTime.UtcNow;

            foreach (var driver in activeDrivers)
            {
                if (driver.Lat is not { } lat || driver.Lng is not { } lng) continue;

                double newLat = lat, newLng = lng, newSpeed = driver.Speed, newHeading = driver.Heading;

                if (driver.Status == "delivering")
                {
                    var headingRad = driver.Heading * Math.PI / 180;
                    var moveDistance = 0.0005 + rnd.NextDouble() * 0.001;
                    newLat = lat + Math.Sin(headingRad) * moveDistance;
                    newLng = lng + Math.Cos(headingRad) * moveDistance;
                    newSpeed = 25 + rnd.NextDouble() * 20;
                    if (rnd.NextDouble() > 0.8)
                    {
                        newHeading = driver.Heading + (rnd.NextDouble() - 0.5) * 30;
                        if (newHeading < 0) newHeading += 360;
                        if (newHeading >= 360) newHeading -= 360;
                    }
                }
                else if (driver.Status == "idle")
                {
                    newLat = lat + (rnd.NextDouble() - 0.5) * 0.0002;
                    newLng = lng + (rnd.NextDouble() - 0.5) * 0.0002;
                    newSpeed = rnd.NextDouble() * 5;
                }
                else if (driver.Status == "at_pickup")
                {
                    newSpeed = 0;
                }

                driver.Lat = newLat;
                driver.Lng = newLng;
                driver.Speed = newSpeed;
                driver.Heading = newHeading;
                driver.LastPingAt = utc;

                updates.Add(new
                {
                    driver.Id,
                    driver.DriverCode,
                    lat = newLat,
                    lng = newLng,
                    speed = newSpeed,
                    heading = newHeading,
                    driver.Status,
                });
            }

            await db.SaveChangesAsync();
            return Ok(new { success = true, updated = updates.Count, drivers = updates });
        }

        if (body.Action == "create_order")
        {
            var warehouses = await db.Warehouses.Where(w => w.IsActive).ToListAsync();
            var wh = warehouses[rnd.Next(warehouses.Count)];

            var vendors = new[] { "Domino's", "Kudu", "Al Baik", "Shawarmer", "Al Romansiah" };
            var vendor = vendors[rnd.Next(vendors.Length)];

            var customerLat = 24.65 + rnd.NextDouble() * 0.2;
            var customerLng = 46.6 + rnd.NextDouble() * 0.15;

            var districts = new[]
            {
                "Al Olaya", "Al Malaz", "An Narjis", "Al Yasmin", "Al Sulaimaniyah", "Al Murabba",
            };
            var district = districts[rnd.Next(districts.Length)];

            var utc = DateTime.UtcNow;
            var order = new Order
            {
                Id = Guid.NewGuid().ToString("n"),
                OrderCode = $"ORD-{rnd.Next(0, 1_000_000):D6}",
                VendorName = vendor,
                CustomerName = $"Customer {rnd.Next(1000)}",
                CustomerPhone = $"+9665{rnd.Next(100_000_000):D8}",
                CustomerAddress = $"{district} District, Riyadh",
                CustomerLat = customerLat,
                CustomerLng = customerLng,
                PickupWarehouseId = wh.Id,
                Status = "pending",
                Priority = rnd.NextDouble() > 0.8 ? "high" : "normal",
                DistanceKm = Math.Round((rnd.NextDouble() * 8 + 2) * 10) / 10,
                CarbonKg = Math.Round(rnd.NextDouble() * 1.5 * 10) / 10,
                CreatedAt = utc,
                UpdatedAt = utc,
            };
            db.Orders.Add(order);
            await db.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                order,
                message = $"Created order {order.OrderCode} from {vendor} to {district}",
            });
        }

        if (body.Action == "complete_delivery")
        {
            if (string.IsNullOrEmpty(body.OrderId))
                return BadRequest(new { error = "Missing orderId" });

            var order = await db.Orders.Include(o => o.Driver).FirstOrDefaultAsync(o => o.Id == body.OrderId);
            if (order == null) return NotFound(new { error = "Order not found" });

            order.Status = "delivered";
            order.ActualDeliveryAt = DateTime.UtcNow;

            if (order.DriverId != null)
            {
                var drv = await db.Drivers.FindAsync(order.DriverId);
                if (drv != null)
                {
                    drv.Status = "idle";
                    drv.TotalDeliveries += 1;
                    drv.SuccessfulDeliveries += 1;
                }
            }

            await db.SaveChangesAsync();
            return Ok(new { success = true, message = $"Order {order.OrderCode} delivered successfully" });
        }

        return BadRequest(new { error = "Unknown action" });
    }

    [HttpGet]
    public async Task<IActionResult> GetStatus()
    {
        var drivers = await db.Drivers
            .Select(d => new
            {
                d.Id,
                d.DriverCode,
                d.Name,
                d.Status,
                d.Lat,
                d.Lng,
                d.Speed,
                d.Heading,
            })
            .ToListAsync();

        var orders = await db.Orders
            .Where(o => o.Status == "pending" || o.Status == "assigned" || o.Status == "picked_up")
            .Select(o => new { o.Id, o.OrderCode, o.Status })
            .ToListAsync();

        return Ok(new { drivers, activeOrders = orders });
    }
}
