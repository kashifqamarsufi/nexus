import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Riyadh warehouse coordinates
const warehouses = [
  {
    id: 'KR-05',
    name: 'Al Olaya Distribution Center',
    city: 'Riyadh',
    lat: 24.7136,
    lng: 46.6753,
    isActive: true,
    queueDepth: 0,
  },
  {
    id: 'KR-11',
    name: 'Al Malaz Hub',
    city: 'Riyadh',
    lat: 24.6877,
    lng: 46.7219,
    isActive: true,
    queueDepth: 0,
  },
  {
    id: 'KR-53',
    name: 'An Narjis Warehouse',
    city: 'Riyadh',
    lat: 24.7915,
    lng: 46.6602,
    isActive: true,
    queueDepth: 0,
  },
  {
    id: 'KR-72',
    name: 'Al Yasmin Center',
    city: 'Riyadh',
    lat: 24.8102,
    lng: 46.7234,
    isActive: true,
    queueDepth: 0,
  },
]

// Sample drivers
const drivers = [
  {
    driverCode: 'DRV-1847',
    name: 'Ahmad Al-Khalidi',
    phone: '+966501234567',
    vehicleType: 'motorcycle',
    status: 'idle',
    lat: 24.7200,
    lng: 46.6800,
    speed: 0,
    heading: 0,
    performanceScore: 92.5,
    totalDeliveries: 847,
    successfulDeliveries: 834,
    rating: 4.9,
    homeWarehouseId: 'KR-53',
    isActive: true,
  },
  {
    driverCode: 'DRV-2093',
    name: 'Fahad Al-Otaibi',
    phone: '+966502345678',
    vehicleType: 'motorcycle',
    status: 'delivering',
    lat: 24.7350,
    lng: 46.6950,
    speed: 35,
    heading: 45,
    performanceScore: 88.3,
    totalDeliveries: 523,
    successfulDeliveries: 512,
    rating: 4.7,
    homeWarehouseId: 'KR-05',
    isActive: true,
  },
  {
    driverCode: 'DRV-3156',
    name: 'Mohammed Al-Qahtani',
    phone: '+966503456789',
    vehicleType: 'car',
    status: 'at_pickup',
    lat: 24.6877,
    lng: 46.7219,
    speed: 0,
    heading: 0,
    performanceScore: 79.8,
    totalDeliveries: 312,
    successfulDeliveries: 298,
    rating: 4.5,
    homeWarehouseId: 'KR-11',
    isActive: true,
  },
  {
    driverCode: 'DRV-4421',
    name: 'Khalid Al-Rashid',
    phone: '+966504567890',
    vehicleType: 'motorcycle',
    status: 'idle',
    lat: 24.7915,
    lng: 46.6602,
    speed: 0,
    heading: 0,
    performanceScore: 95.2,
    totalDeliveries: 1245,
    successfulDeliveries: 1232,
    rating: 4.95,
    homeWarehouseId: 'KR-53',
    isActive: true,
  },
  {
    driverCode: 'DRV-5567',
    name: 'Omar Al-Dossari',
    phone: '+966505678901',
    vehicleType: 'van',
    status: 'idle',
    lat: 24.8102,
    lng: 46.7234,
    speed: 0,
    heading: 0,
    performanceScore: 86.7,
    totalDeliveries: 456,
    successfulDeliveries: 442,
    rating: 4.6,
    homeWarehouseId: 'KR-72',
    isActive: true,
  },
  {
    driverCode: 'DRV-6789',
    name: 'Saad Al-Harbi',
    phone: '+966506789012',
    vehicleType: 'motorcycle',
    status: 'delivering',
    lat: 24.7450,
    lng: 46.7100,
    speed: 28,
    heading: 180,
    performanceScore: 91.0,
    totalDeliveries: 678,
    successfulDeliveries: 665,
    rating: 4.8,
    homeWarehouseId: 'KR-05',
    isActive: true,
  },
  {
    driverCode: 'DRV-7890',
    name: 'Nasser Al-Mutairi',
    phone: '+966507890123',
    vehicleType: 'motorcycle',
    status: 'offline',
    lat: 24.7000,
    lng: 46.6500,
    speed: 0,
    heading: 0,
    performanceScore: 72.3,
    totalDeliveries: 189,
    successfulDeliveries: 175,
    rating: 4.2,
    homeWarehouseId: 'KR-11',
    isActive: true,
  },
  {
    driverCode: 'DRV-8901',
    name: 'Turki Al-Shammari',
    phone: '+966508901234',
    vehicleType: 'car',
    status: 'idle',
    lat: 24.7650,
    lng: 46.6800,
    speed: 0,
    heading: 0,
    performanceScore: 89.5,
    totalDeliveries: 534,
    successfulDeliveries: 522,
    rating: 4.75,
    homeWarehouseId: 'KR-72',
    isActive: true,
  },
]

// Sample orders
const orders = [
  {
    orderCode: 'ORD-001',
    vendorName: "Domino's",
    customerName: 'Abdullah Al-Saud',
    customerPhone: '+966511111111',
    customerAddress: 'Al Olaya District, King Fahd Road',
    customerLat: 24.7100,
    customerLng: 46.6700,
    pickupWarehouseId: 'KR-05',
    status: 'pending',
    priority: 'normal',
    distanceKm: 4.5,
    carbonKg: 0.8,
  },
  {
    orderCode: 'ORD-002',
    vendorName: 'Kudu',
    customerName: 'Sultan Al-Rashid',
    customerPhone: '+966522222222',
    customerAddress: 'An Narjis District, Prince Sultan Road',
    customerLat: 24.7950,
    customerLng: 46.6550,
    pickupWarehouseId: 'KR-53',
    status: 'assigned',
    priority: 'high',
    distanceKm: 3.2,
    carbonKg: 0.6,
  },
  {
    orderCode: 'ORD-003',
    vendorName: 'Al Baik',
    customerName: 'Faisal Al-Thani',
    customerPhone: '+966533333333',
    customerAddress: 'Al Yasmin District, Northern Ring Road',
    customerLat: 24.8150,
    customerLng: 46.7300,
    pickupWarehouseId: 'KR-72',
    status: 'picked_up',
    priority: 'normal',
    distanceKm: 5.1,
    carbonKg: 0.9,
  },
  {
    orderCode: 'ORD-004',
    vendorName: "Domino's",
    customerName: 'Mansour Al-Fahad',
    customerPhone: '+966544444444',
    customerAddress: 'Al Malaz District, Sports City Road',
    customerLat: 24.6950,
    customerLng: 46.7150,
    pickupWarehouseId: 'KR-11',
    status: 'delivered',
    priority: 'normal',
    distanceKm: 2.8,
    carbonKg: 0.5,
  },
]

async function main() {
  console.log('🌱 Seeding NEXUS database...')

  // Clear existing data
  await prisma.alert.deleteMany()
  await prisma.driverPing.deleteMany()
  await prisma.routeSegment.deleteMany()
  await prisma.heatmapSnapshot.deleteMany()
  await prisma.order.deleteMany()
  await prisma.driver.deleteMany()
  await prisma.warehouse.deleteMany()
  await prisma.setting.deleteMany()

  console.log('✅ Cleared existing data')

  // Seed warehouses
  for (const warehouse of warehouses) {
    await prisma.warehouse.create({ data: warehouse })
  }
  console.log('✅ Seeded warehouses:', warehouses.length)

  // Seed drivers
  for (const driver of drivers) {
    await prisma.driver.create({ data: driver })
  }
  console.log('✅ Seeded drivers:', drivers.length)

  // Seed orders
  for (const order of orders) {
    await prisma.order.create({ data: order })
  }
  console.log('✅ Seeded orders:', orders.length)

  // Create initial heatmap data
  const districts = ['Al Olaya', 'Al Malaz', 'An Narjis', 'Al Yasmin', 'Al Sulaimaniyah', 'Al Murabba', 'Al Wurud', 'Al Rawdah']
  for (const district of districts) {
    await prisma.heatmapSnapshot.create({
      data: {
        district,
        zone: Math.random() > 0.6 ? 'hot' : Math.random() > 0.4 ? 'warm' : 'cool',
        predictedOrders: Math.floor(Math.random() * 50) + 10,
        confidence: 0.7 + Math.random() * 0.25,
        recommendedDrivers: Math.floor(Math.random() * 5) + 2,
        hour: new Date().getHours(),
        dayOfWeek: new Date().getDay(),
      },
    })
  }
  console.log('✅ Seeded heatmap snapshots:', districts.length)

  // Create settings
  await prisma.setting.createMany({
    data: [
      { key: 'system.status', value: 'operational', category: 'system' },
      { key: 'assignment.auto', value: 'true', category: 'assignment' },
      { key: 'batching.enabled', value: 'true', category: 'routing' },
    ],
  })
  console.log('✅ Seeded settings')

  console.log('🎉 Database seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
