import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get today's date range
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get all drivers
    const allDrivers = await db.driver.count()
    const activeDrivers = await db.driver.count({
      where: { status: { not: 'offline' } },
    })

    // Get today's orders
    const todayOrders = await db.order.count({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    })

    // Get successful deliveries today
    const successfulToday = await db.order.count({
      where: {
        createdAt: { gte: today, lt: tomorrow },
        status: 'delivered',
      },
    })

    // Get pending/unassigned orders
    const pendingOrders = await db.order.count({
      where: { status: 'pending' },
    })

    // Calculate success rate
    const successRate = todayOrders > 0 ? (successfulToday / todayOrders) * 100 : 97.5

    // Get active orders (in progress)
    const activeOrders = await db.order.count({
      where: {
        status: { in: ['assigned', 'picked_up'] },
      },
    })

    // Get alerts count
    const unresolvedAlerts = await db.alert.count({
      where: { isResolved: false },
    })

    return NextResponse.json({
      dailyLoad: todayOrders,
      fleetSuccessRate: Math.round(successRate * 10) / 10,
      missedRevenue: Math.round((pendingOrders / Math.max(todayOrders, 1)) * 100 * 10) / 10,
      activeDrivers,
      totalDrivers: allDrivers,
      activeOrders,
      pendingOrders,
      successfulToday,
      unresolvedAlerts,
    })
  } catch (error) {
    console.error('Error fetching KPIs:', error)
    return NextResponse.json({ error: 'Failed to fetch KPIs' }, { status: 500 })
  }
}
