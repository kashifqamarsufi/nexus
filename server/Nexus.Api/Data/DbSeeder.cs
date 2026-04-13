using Microsoft.EntityFrameworkCore;
using Nexus.Api.Models;

namespace Nexus.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(NexusDbContext db)
    {
        if (await db.Warehouses.AnyAsync()) return;

        var utc = DateTime.UtcNow;
        var warehouses = new[]
        {
            new Warehouse
            {
                Id = "KR-05",
                Name = "Al Olaya Distribution Center",
                City = "Riyadh",
                Lat = 24.7136,
                Lng = 46.6753,
                IsActive = true,
                QueueDepth = 0,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new Warehouse
            {
                Id = "KR-11",
                Name = "Al Malaz Hub",
                City = "Riyadh",
                Lat = 24.6877,
                Lng = 46.7219,
                IsActive = true,
                QueueDepth = 0,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new Warehouse
            {
                Id = "KR-53",
                Name = "An Narjis Warehouse",
                City = "Riyadh",
                Lat = 24.7915,
                Lng = 46.6602,
                IsActive = true,
                QueueDepth = 0,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new Warehouse
            {
                Id = "KR-72",
                Name = "Al Yasmin Center",
                City = "Riyadh",
                Lat = 24.8102,
                Lng = 46.7234,
                IsActive = true,
                QueueDepth = 0,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
        };

        db.Warehouses.AddRange(warehouses);

        string Nid() => Guid.NewGuid().ToString("n")[..24];

        var drivers = new List<Driver>
        {
            new()
            {
                Id = Nid(),
                DriverCode = "DRV-1847",
                Name = "Ahmad Al-Khalidi",
                Phone = "+966501234567",
                VehicleType = "motorcycle",
                Status = "idle",
                Lat = 24.7200,
                Lng = 46.6800,
                Speed = 0,
                Heading = 0,
                PerformanceScore = 92.5,
                TotalDeliveries = 847,
                SuccessfulDeliveries = 834,
                Rating = 4.9,
                HomeWarehouseId = "KR-53",
                IsActive = true,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new()
            {
                Id = Nid(),
                DriverCode = "DRV-2093",
                Name = "Fahad Al-Otaibi",
                Phone = "+966502345678",
                VehicleType = "motorcycle",
                Status = "delivering",
                Lat = 24.7350,
                Lng = 46.6950,
                Speed = 35,
                Heading = 45,
                PerformanceScore = 88.3,
                TotalDeliveries = 523,
                SuccessfulDeliveries = 512,
                Rating = 4.7,
                HomeWarehouseId = "KR-05",
                IsActive = true,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new()
            {
                Id = Nid(),
                DriverCode = "DRV-3156",
                Name = "Mohammed Al-Qahtani",
                Phone = "+966503456789",
                VehicleType = "car",
                Status = "at_pickup",
                Lat = 24.6877,
                Lng = 46.7219,
                Speed = 0,
                Heading = 0,
                PerformanceScore = 79.8,
                TotalDeliveries = 312,
                SuccessfulDeliveries = 298,
                Rating = 4.5,
                HomeWarehouseId = "KR-11",
                IsActive = true,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new()
            {
                Id = Nid(),
                DriverCode = "DRV-4421",
                Name = "Khalid Al-Rashid",
                Phone = "+966504567890",
                VehicleType = "motorcycle",
                Status = "idle",
                Lat = 24.7915,
                Lng = 46.6602,
                Speed = 0,
                Heading = 0,
                PerformanceScore = 95.2,
                TotalDeliveries = 1245,
                SuccessfulDeliveries = 1232,
                Rating = 4.95,
                HomeWarehouseId = "KR-53",
                IsActive = true,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new()
            {
                Id = Nid(),
                DriverCode = "DRV-5567",
                Name = "Omar Al-Dossari",
                Phone = "+966505678901",
                VehicleType = "van",
                Status = "idle",
                Lat = 24.8102,
                Lng = 46.7234,
                Speed = 0,
                Heading = 0,
                PerformanceScore = 86.7,
                TotalDeliveries = 456,
                SuccessfulDeliveries = 442,
                Rating = 4.6,
                HomeWarehouseId = "KR-72",
                IsActive = true,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new()
            {
                Id = Nid(),
                DriverCode = "DRV-6789",
                Name = "Saad Al-Harbi",
                Phone = "+966506789012",
                VehicleType = "motorcycle",
                Status = "delivering",
                Lat = 24.7450,
                Lng = 46.7100,
                Speed = 28,
                Heading = 180,
                PerformanceScore = 91.0,
                TotalDeliveries = 678,
                SuccessfulDeliveries = 665,
                Rating = 4.8,
                HomeWarehouseId = "KR-05",
                IsActive = true,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new()
            {
                Id = Nid(),
                DriverCode = "DRV-7890",
                Name = "Nasser Al-Mutairi",
                Phone = "+966507890123",
                VehicleType = "motorcycle",
                Status = "offline",
                Lat = 24.7000,
                Lng = 46.6500,
                Speed = 0,
                Heading = 0,
                PerformanceScore = 72.3,
                TotalDeliveries = 189,
                SuccessfulDeliveries = 175,
                Rating = 4.2,
                HomeWarehouseId = "KR-11",
                IsActive = true,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new()
            {
                Id = Nid(),
                DriverCode = "DRV-8901",
                Name = "Turki Al-Shammari",
                Phone = "+966508901234",
                VehicleType = "car",
                Status = "idle",
                Lat = 24.7650,
                Lng = 46.6800,
                Speed = 0,
                Heading = 0,
                PerformanceScore = 89.5,
                TotalDeliveries = 534,
                SuccessfulDeliveries = 522,
                Rating = 4.75,
                HomeWarehouseId = "KR-72",
                IsActive = true,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
        };

        db.Drivers.AddRange(drivers);
        await db.SaveChangesAsync();

        var ahmad = drivers.First(d => d.DriverCode == "DRV-1847");
        var turki = drivers.First(d => d.DriverCode == "DRV-8901");

        var orders = new List<Order>
        {
            new()
            {
                Id = Nid(),
                OrderCode = "ORD-001",
                VendorName = "Domino's",
                CustomerName = "Abdullah Al-Saud",
                CustomerPhone = "+966511111111",
                CustomerAddress = "Al Olaya District, King Fahd Road",
                CustomerLat = 24.7100,
                CustomerLng = 46.6700,
                PickupWarehouseId = "KR-05",
                Status = "pending",
                Priority = "normal",
                DistanceKm = 4.5,
                CarbonKg = 0.8,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new()
            {
                Id = Nid(),
                OrderCode = "ORD-002",
                VendorName = "Kudu",
                CustomerName = "Sultan Al-Rashid",
                CustomerPhone = "+966522222222",
                CustomerAddress = "An Narjis District, Prince Sultan Road",
                CustomerLat = 24.7950,
                CustomerLng = 46.6550,
                PickupWarehouseId = "KR-53",
                DriverId = ahmad.Id,
                Status = "assigned",
                Priority = "high",
                DistanceKm = 3.2,
                CarbonKg = 0.6,
                AssignedAt = utc,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new()
            {
                Id = Nid(),
                OrderCode = "ORD-003",
                VendorName = "Al Baik",
                CustomerName = "Faisal Al-Thani",
                CustomerPhone = "+966533333333",
                CustomerAddress = "Al Yasmin District, Northern Ring Road",
                CustomerLat = 24.8150,
                CustomerLng = 46.7300,
                PickupWarehouseId = "KR-72",
                DriverId = turki.Id,
                Status = "picked_up",
                Priority = "normal",
                DistanceKm = 5.1,
                CarbonKg = 0.9,
                AssignedAt = utc,
                PickedUpAt = utc,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new()
            {
                Id = Nid(),
                OrderCode = "ORD-004",
                VendorName = "Domino's",
                CustomerName = "Mansour Al-Fahad",
                CustomerPhone = "+966544444444",
                CustomerAddress = "Al Malaz District, Sports City Road",
                CustomerLat = 24.6950,
                CustomerLng = 46.7150,
                PickupWarehouseId = "KR-11",
                Status = "delivered",
                Priority = "normal",
                DistanceKm = 2.8,
                CarbonKg = 0.5,
                ActualDeliveryAt = utc,
                CreatedAt = utc,
                UpdatedAt = utc,
            },
        };

        db.Orders.AddRange(orders);

        ahmad.Status = "at_pickup";
        turki.Status = "delivering";

        var rnd = new Random(42);
        var districts = new[]
        {
            "Al Olaya", "Al Malaz", "An Narjis", "Al Yasmin", "Al Sulaimaniyah", "Al Murabba", "Al Wurud", "Al Rawdah",
        };

        foreach (var district in districts)
        {
            db.HeatmapSnapshots.Add(new HeatmapSnapshot
            {
                Id = Nid(),
                District = district,
                Zone = rnd.NextDouble() > 0.6 ? "hot" : rnd.NextDouble() > 0.4 ? "warm" : "cool",
                PredictedOrders = rnd.Next(10, 60),
                Confidence = 0.7 + rnd.NextDouble() * 0.25,
                RecommendedDrivers = rnd.Next(2, 7),
                Hour = DateTime.UtcNow.Hour,
                DayOfWeek = (int)DateTime.UtcNow.DayOfWeek,
                CreatedAt = utc,
            });
        }

        db.Settings.AddRange(
            new Setting
            {
                Id = Nid(),
                Key = "system.status",
                Value = "operational",
                Category = "system",
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new Setting
            {
                Id = Nid(),
                Key = "assignment.auto",
                Value = "true",
                Category = "assignment",
                CreatedAt = utc,
                UpdatedAt = utc,
            },
            new Setting
            {
                Id = Nid(),
                Key = "batching.enabled",
                Value = "true",
                Category = "routing",
                CreatedAt = utc,
                UpdatedAt = utc,
            });

        db.Alerts.Add(new Alert
        {
            Id = Nid(),
            Type = "sla_breach",
            Severity = "high",
            Message = "Predicted delay on ORD-002 — traffic cluster on Prince Sultan Road",
            RecommendedAction = "Re-route via alternate corridor",
            DriverId = ahmad.Id,
            OrderId = orders[1].Id,
            IsResolved = false,
            CreatedAt = utc,
            UpdatedAt = utc,
        });

        await db.SaveChangesAsync();
    }
}
