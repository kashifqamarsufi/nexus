import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Simulate driver movement and GPS updates
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'update_positions') {
      // Get all active drivers
      const activeDrivers = await db.driver.findMany({
        where: {
          status: { in: ['idle', 'delivering', 'at_pickup'] },
          lat: { not: null },
          lng: { not: null },
        },
      })

      const updates = []

      for (const driver of activeDrivers) {
        if (driver.lat === null || driver.lng === null) continue

        // Simulate movement
        let newLat = driver.lat
        let newLng = driver.lng
        let newSpeed = driver.speed
        let newHeading = driver.heading
        let newStatus = driver.status

        if (driver.status === 'delivering') {
          // Move toward a random destination
          const headingRad = (driver.heading * Math.PI) / 180
          const moveDistance = 0.0005 + Math.random() * 0.001 // Random distance
          newLat = driver.lat + Math.sin(headingRad) * moveDistance
          newLng = driver.lng + Math.cos(headingRad) * moveDistance
          newSpeed = 25 + Math.random() * 20 // 25-45 km/h

          // Occasionally change heading slightly
          if (Math.random() > 0.8) {
            newHeading = driver.heading + (Math.random() - 0.5) * 30
            if (newHeading < 0) newHeading += 360
            if (newHeading >= 360) newHeading -= 360
          }
        } else if (driver.status === 'idle') {
          // Small random movement (walking around)
          newLat = driver.lat + (Math.random() - 0.5) * 0.0002
          newLng = driver.lng + (Math.random() - 0.5) * 0.0002
          newSpeed = Math.random() * 5 // 0-5 km/h
        } else if (driver.status === 'at_pickup') {
          // Stationary at pickup
          newSpeed = 0
        }

        // Update driver
        const updated = await db.driver.update({
          where: { id: driver.id },
          data: {
            lat: newLat,
            lng: newLng,
            speed: newSpeed,
            heading: newHeading,
            lastPingAt: new Date(),
          },
        })

        updates.push({
          id: updated.id,
          driverCode: updated.driverCode,
          lat: updated.lat,
          lng: updated.lng,
          speed: updated.speed,
          heading: updated.heading,
          status: updated.status,
        })
      }

      return NextResponse.json({
        success: true,
        updated: updates.length,
        drivers: updates,
      })
    }

    if (action === 'create_order') {
      // Create a random order for testing
      const warehouses = await db.warehouse.findMany({ where: { isActive: true } })
      const randomWarehouse = warehouses[Math.floor(Math.random() * warehouses.length)]

      const vendors = ["Domino's", 'Kudu', 'Al Baik', 'Shawarmer', 'Al Romansiah']
      const randomVendor = vendors[Math.floor(Math.random() * vendors.length)]

      // Random customer location in Riyadh
      const customerLat = 24.65 + Math.random() * 0.2
      const customerLng = 46.6 + Math.random() * 0.15

      const districts = ['Al Olaya', 'Al Malaz', 'An Narjis', 'Al Yasmin', 'Al Sulaimaniyah', 'Al Murabba']
      const randomDistrict = districts[Math.floor(Math.random() * districts.length)]

      const order = await db.order.create({
        data: {
          orderCode: `ORD-${Date.now().toString().slice(-6)}`,
          vendorName: randomVendor,
          customerName: `Customer ${Math.floor(Math.random() * 1000)}`,
          customerPhone: `+9665${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
          customerAddress: `${randomDistrict} District, Riyadh`,
          customerLat,
          customerLng,
          pickupWarehouseId: randomWarehouse.id,
          status: 'pending',
          priority: Math.random() > 0.8 ? 'high' : 'normal',
          distanceKm: Math.round((Math.random() * 8 + 2) * 10) / 10,
          carbonKg: Math.round(Math.random() * 1.5 * 10) / 10,
        },
      })

      return NextResponse.json({
        success: true,
        order,
        message: `Created order ${order.orderCode} from ${randomVendor} to ${randomDistrict}`,
      })
    }

    if (action === 'complete_delivery') {
      const { orderId } = body

      if (!orderId) {
        return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
      }

      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { driver: true },
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Update order
      await db.order.update({
        where: { id: orderId },
        data: {
          status: 'delivered',
          actualDeliveryAt: new Date(),
        },
      })

      // Update driver
      if (order.driverId) {
        await db.driver.update({
          where: { id: order.driverId },
          data: {
            status: 'idle',
            totalDeliveries: { increment: 1 },
            successfulDeliveries: { increment: 1 },
          },
        })
      }

      return NextResponse.json({
        success: true,
        message: `Order ${order.orderCode} delivered successfully`,
      })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('Simulation error:', error)
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 })
  }
}

// Get simulation status
export async function GET() {
  try {
    const drivers = await db.driver.findMany({
      select: {
        id: true,
        driverCode: true,
        name: true,
        status: true,
        lat: true,
        lng: true,
        speed: true,
        heading: true,
      },
    })

    const orders = await db.order.findMany({
      where: {
        status: { in: ['pending', 'assigned', 'picked_up'] },
      },
      select: {
        id: true,
        orderCode: true,
        status: true,
      },
    })

    return NextResponse.json({
      drivers,
      activeOrders: orders,
    })
  } catch (error) {
    console.error('Error getting simulation status:', error)
    return NextResponse.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
