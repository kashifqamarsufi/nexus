using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Api.Data;
using Nexus.Api.Models;

namespace Nexus.Api.Controllers;

[ApiController]
[Route("api/orders")]
public class OrdersController(NexusDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var orders = await db.Orders
            .Include(o => o.PickupWarehouse)
            .Include(o => o.Driver)
            .OrderByDescending(o => o.CreatedAt)
            .Take(100)
            .ToListAsync();
        return Ok(orders);
    }

    public record CreateOrderDto(
        string? OrderCode,
        string VendorName,
        string? CustomerName,
        string? CustomerPhone,
        string CustomerAddress,
        double? CustomerLat,
        double? CustomerLng,
        string PickupWarehouseId,
        string? Priority,
        double? DistanceKm,
        double? CarbonKg);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderDto body)
    {
        var utc = DateTime.UtcNow;
        var order = new Order
        {
            Id = Guid.NewGuid().ToString("n"),
            OrderCode = body.OrderCode ?? $"ORD-{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}",
            VendorName = body.VendorName,
            CustomerName = body.CustomerName,
            CustomerPhone = body.CustomerPhone,
            CustomerAddress = body.CustomerAddress,
            CustomerLat = body.CustomerLat,
            CustomerLng = body.CustomerLng,
            PickupWarehouseId = body.PickupWarehouseId,
            Status = "pending",
            Priority = body.Priority ?? "normal",
            DistanceKm = body.DistanceKm ?? 0,
            CarbonKg = body.CarbonKg ?? 0,
            CreatedAt = utc,
            UpdatedAt = utc,
        };
        db.Orders.Add(order);
        await db.SaveChangesAsync();
        await db.Entry(order).Reference(o => o.PickupWarehouse).LoadAsync();
        return Created($"/api/orders/{order.Id}", order);
    }
}
