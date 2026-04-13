using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Api.Data;

namespace Nexus.Api.Controllers;

[ApiController]
[Route("api/warehouses")]
public class WarehousesController(NexusDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var list = await db.Warehouses
            .Select(w => new
            {
                w.Id,
                w.Name,
                w.City,
                w.Lat,
                w.Lng,
                w.IsActive,
                w.QueueDepth,
                w.CreatedAt,
                w.UpdatedAt,
                _count = new
                {
                    drivers = db.Drivers.Count(d => d.HomeWarehouseId == w.Id),
                    orders = db.Orders.Count(o => o.PickupWarehouseId == w.Id),
                },
            })
            .ToListAsync();

        return Ok(list);
    }
}
