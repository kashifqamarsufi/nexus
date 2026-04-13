import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const alerts = await db.alert.findMany({
      include: {
        driver: true,
        order: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    })
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const alert = await db.alert.update({
      where: { id: body.id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedBy: body.resolvedBy || 'system',
      },
    })
    return NextResponse.json(alert)
  } catch (error) {
    console.error('Error updating alert:', error)
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
  }
}
