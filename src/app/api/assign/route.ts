import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// Calculate driver score for assignment
function calculateDriverScore(
  driver: {
    id: string
    driverCode: string
    name: string
    lat: number | null
    lng: number | null
    status: string
    performanceScore: number
    totalDeliveries: number
    rating: number
    vehicleType: string
  },
  order: {
    pickupWarehouseId: string
    customerLat: number | null
    customerLng: number | null
  },
  warehouse: { lat: number; lng: number }
): { score: number; breakdown: Record<string, number> } {
  let score = 0
  const breakdown: Record<string, number> = {}

  // Factor 1: Distance to pickup (weight: 35%)
  if (driver.lat && driver.lng) {
    const distanceToPickup = calculateDistance(driver.lat, driver.lng, warehouse.lat, warehouse.lng)
    const distanceScore = Math.max(0, 100 - distanceToPickup * 5)
    breakdown.distance = distanceScore * 0.35
    score += breakdown.distance
  } else {
    breakdown.distance = 0
  }

  // Factor 2: Driver performance score (weight: 25%)
  breakdown.performance = driver.performanceScore * 0.25
  score += breakdown.performance

  // Factor 3: Driver rating (weight: 20%)
  breakdown.rating = driver.rating * 20 * 0.2
  score += breakdown.rating

  // Factor 4: Vehicle type suitability (weight: 10%)
  const vehicleBonus = driver.vehicleType === 'motorcycle' ? 100 : driver.vehicleType === 'car' ? 80 : 60
  breakdown.vehicle = vehicleBonus * 0.1
  score += breakdown.vehicle

  // Factor 5: Experience (weight: 10%)
  const experienceScore = Math.min(100, driver.totalDeliveries / 10)
  breakdown.experience = experienceScore * 0.1
  score += breakdown.experience

  return { score: Math.round(score * 100) / 100, breakdown }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { orderId, driverId } = body

    // If specific driver provided, assign directly
    if (driverId && orderId) {
      const order = await db.order.update({
        where: { id: orderId },
        data: {
          driverId,
          status: 'assigned',
          assignedAt: new Date(),
        },
        include: {
          driver: true,
          pickupWarehouse: true,
        },
      })

      // Update driver status
      await db.driver.update({
        where: { id: driverId },
        data: { status: 'at_pickup' },
      })

      return NextResponse.json({
        success: true,
        order,
        message: `Order ${order.orderCode} assigned to ${order.driver?.name}`,
      })
    }

    // Auto-assign: Find best driver for the order
    if (orderId) {
      const order = await db.order.findUnique({
        where: { id: orderId },
        include: { pickupWarehouse: true },
      })

      if (!order) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      // Get available drivers
      const availableDrivers = await db.driver.findMany({
        where: {
          status: 'idle',
          isActive: true,
        },
      })

      if (availableDrivers.length === 0) {
        // Try to find drivers who will be available soon
        const busyDrivers = await db.driver.findMany({
          where: {
            status: { in: ['delivering'] },
            isActive: true,
          },
        })

        if (busyDrivers.length === 0) {
          return NextResponse.json({
            error: 'No available drivers',
            message: 'All drivers are busy or offline',
          })
        }

        return NextResponse.json({
          error: 'No idle drivers',
          message: `${busyDrivers.length} drivers are currently delivering. Try again in a few minutes.`,
          suggestions: busyDrivers.slice(0, 3).map((d) => ({
            id: d.id,
            name: d.name,
            code: d.driverCode,
          })),
        })
      }

      // Score each driver
      const warehouse = order.pickupWarehouse
      const scoredDrivers = availableDrivers.map((driver) => {
        const { score, breakdown } = calculateDriverScore(driver, order, warehouse)
        return { driver, score, breakdown }
      })

      // Sort by score and pick the best
      scoredDrivers.sort((a, b) => b.score - a.score)
      const bestMatch = scoredDrivers[0]

      // Assign order to best driver
      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: {
          driverId: bestMatch.driver.id,
          status: 'assigned',
          assignedAt: new Date(),
        },
        include: {
          driver: true,
          pickupWarehouse: true,
        },
      })

      // Update driver status
      await db.driver.update({
        where: { id: bestMatch.driver.id },
        data: { status: 'at_pickup' },
      })

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        assignment: {
          driverCode: bestMatch.driver.driverCode,
          driverName: bestMatch.driver.name,
          score: bestMatch.score,
          breakdown: bestMatch.breakdown,
          warehouseId: warehouse.id,
          warehouseName: warehouse.name,
          baseEta: Math.round((bestMatch.breakdown.distance / 35) * 5),
          mlEta: Math.round((bestMatch.breakdown.distance / 35) * 5 + 3),
          timestamp: new Date().toISOString(),
        },
      })
    }

    return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })
  } catch (error) {
    console.error('Error in assignment:', error)
    return NextResponse.json({ error: 'Assignment failed' }, { status: 500 })
  }
}
