import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const orders = await db.order.findMany({
      include: {
        pickupWarehouse: true,
        driver: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
    })
    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const order = await db.order.create({
      data: {
        orderCode: body.orderCode || `ORD-${Date.now()}`,
        vendorName: body.vendorName,
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerAddress: body.customerAddress,
        customerLat: body.customerLat,
        customerLng: body.customerLng,
        pickupWarehouseId: body.pickupWarehouseId,
        status: 'pending',
        priority: body.priority || 'normal',
        distanceKm: body.distanceKm || 0,
        carbonKg: body.carbonKg || 0,
      },
      include: {
        pickupWarehouse: true,
      },
    })
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
