using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Nexus.Api.Data;
using Nexus.Api.Models;

namespace Nexus.Api.Controllers;

[ApiController]
[Route("api/drivers")]
public class DriversController(NexusDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var drivers = await db.Drivers
            .Include(d => d.HomeWarehouse)
            .OrderByDescending(d => d.PerformanceScore)
            .ToListAsync();
        return Ok(drivers);
    }

    public record CreateDriverDto(
        string DriverCode,
        string Name,
        string? Phone,
        string? VehicleType,
        string? HomeWarehouseId);

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateDriverDto body)
    {
        var id = Guid.NewGuid().ToString("n");
        var utc = DateTime.UtcNow;
        var driver = new Driver
        {
            Id = id,
            DriverCode = body.DriverCode,
            Name = body.Name,
            Phone = body.Phone,
            VehicleType = body.VehicleType ?? "motorcycle",
            Status = "offline",
            PerformanceScore = 75,
            TotalDeliveries = 0,
            SuccessfulDeliveries = 0,
            Rating = 4.5,
            HomeWarehouseId = body.HomeWarehouseId,
            IsActive = true,
            CreatedAt = utc,
            UpdatedAt = utc,
        };
        db.Drivers.Add(driver);
        await db.SaveChangesAsync();
        return Created($"/api/drivers/{driver.Id}", driver);
    }
}
