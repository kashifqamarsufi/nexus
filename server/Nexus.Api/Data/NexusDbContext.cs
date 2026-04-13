using Microsoft.EntityFrameworkCore;
using Nexus.Api.Models;

namespace Nexus.Api.Data;

public class NexusDbContext(DbContextOptions<NexusDbContext> options) : DbContext(options)
{
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<Driver> Drivers => Set<Driver>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<Alert> Alerts => Set<Alert>();
    public DbSet<HeatmapSnapshot> HeatmapSnapshots => Set<HeatmapSnapshot>();
    public DbSet<Setting> Settings => Set<Setting>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Warehouse>(e =>
        {
            e.ToTable("warehouses");
            e.HasKey(w => w.Id);
            e.Property(w => w.Name).HasMaxLength(256);
            e.Property(w => w.City).HasMaxLength(128);
        });

        modelBuilder.Entity<Driver>(e =>
        {
            e.ToTable("drivers");
            e.HasKey(d => d.Id);
            e.HasIndex(d => d.DriverCode).IsUnique();
            e.Property(d => d.DriverCode).HasMaxLength(64);
            e.Property(d => d.Name).HasMaxLength(256);
            e.HasOne(d => d.HomeWarehouse)
                .WithMany(w => w.Drivers)
                .HasForeignKey(d => d.HomeWarehouseId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.ToTable("orders");
            e.HasKey(o => o.Id);
            e.HasIndex(o => o.OrderCode).IsUnique();
            e.HasIndex(o => o.Status);
            e.HasIndex(o => o.DriverId);
            e.HasIndex(o => o.PickupWarehouseId);
            e.Property(o => o.OrderCode).HasMaxLength(64);
            e.Property(o => o.VendorName).HasMaxLength(256);
            e.HasOne(o => o.PickupWarehouse)
                .WithMany(w => w.Orders)
                .HasForeignKey(o => o.PickupWarehouseId)
                .OnDelete(DeleteBehavior.Restrict);
            e.HasOne(o => o.Driver)
                .WithMany(d => d.AssignedOrders)
                .HasForeignKey(o => o.DriverId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Alert>(e =>
        {
            e.ToTable("alerts");
            e.HasKey(a => a.Id);
            e.HasIndex(a => a.IsResolved);
            e.HasIndex(a => a.Severity);
            e.HasOne(a => a.Driver)
                .WithMany(d => d.Alerts)
                .HasForeignKey(a => a.DriverId)
                .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(a => a.Order)
                .WithMany(o => o.Alerts)
                .HasForeignKey(a => a.OrderId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<HeatmapSnapshot>(e =>
        {
            e.ToTable("heatmap_snapshots");
            e.HasKey(h => h.Id);
            e.HasIndex(h => new { h.District, h.Hour, h.DayOfWeek });
        });

        modelBuilder.Entity<Setting>(e =>
        {
            e.ToTable("settings");
            e.HasKey(s => s.Id);
            e.HasIndex(s => s.Key).IsUnique();
        });
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var utc = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries())
        {
            if (entry.State != EntityState.Modified) continue;
            switch (entry.Entity)
            {
                case Warehouse w:
                    w.UpdatedAt = utc;
                    break;
                case Driver d:
                    d.UpdatedAt = utc;
                    break;
                case Order o:
                    o.UpdatedAt = utc;
                    break;
                case Alert a:
                    a.UpdatedAt = utc;
                    break;
                case Setting s:
                    s.UpdatedAt = utc;
                    break;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}
