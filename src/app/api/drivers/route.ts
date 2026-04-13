import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const drivers = await db.driver.findMany({
      include: {
        homeWarehouse: true,
      },
      orderBy: {
        performanceScore: 'desc',
      },
    })
    return NextResponse.json(drivers)
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json({ error: 'Failed to fetch drivers' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const driver = await db.driver.create({
      data: {
        driverCode: body.driverCode,
        name: body.name,
        phone: body.phone,
        vehicleType: body.vehicleType || 'motorcycle',
        status: 'offline',
        performanceScore: 75.0,
        totalDeliveries: 0,
        successfulDeliveries: 0,
        rating: 4.5,
        homeWarehouseId: body.homeWarehouseId,
        isActive: true,
      },
    })
    return NextResponse.json(driver, { status: 201 })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json({ error: 'Failed to create driver' }, { status: 500 })
  }
}
