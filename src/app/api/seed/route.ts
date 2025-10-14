import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting database seed...');

    // Create a default user
    const user = await prisma.user.upsert({
      where: { email: 'evan@evanstoudt.com' },
      update: {},
      create: {
        email: 'evan@evanstoudt.com',
        name: 'Evan Stoudt',
      },
    });

    console.log('👤 Created user:', user.email);

    // Create demo vehicle - 2020 Toyota Camry
    const demoCar = await prisma.vehicle.upsert({
      where: { vin: '4T1G11AK8LU912345' },
      update: {},
      create: {
        vin: '4T1G11AK8LU912345',
        year: 2020,
        make: 'TOYOTA',
        model: 'Camry',
        trim: 'SE',
        engine: '2.5L I4',
        transmission: 'Automatic',
        driveType: 'FWD/Front-Wheel Drive',
        fuelType: 'Gasoline',
        bodyClass: 'Sedan/Saloon',
        manufacturerName: 'TOYOTA MOTOR MANUFACTURING KENTUCKY',
        plantCity: 'GEORGETOWN',
        plantState: 'KENTUCKY',
        plantCountry: 'UNITED STATES (USA)',
        nickname: 'Daily Driver',
        color: 'Celestial Silver Metallic',
        mileage: 62000,
        purchaseDate: new Date('2020-09-15'),
        purchasePrice: 28500,
        currentValue: 21500,
        notes: 'Reliable daily commuter, great fuel economy',
        userId: user.id,
      },
    });

    console.log('🚗 Created demo vehicle:', demoCar.nickname);

    // Add maintenance records for demo car
    const demoMaintenanceRecords = [
      {
        type: 'OIL_CHANGE' as const,
        category: 'ENGINE' as const,
        title: 'Oil Change & Filter',
        description: 'Toyota synthetic 0W-20 oil, OEM filter',
        totalCost: 65,
        partsCost: 45,
        laborCost: 20,
        mileage: 58500,
        date: new Date('2024-06-15'),
        nextServiceDue: new Date('2024-12-15'),
        nextServiceMileage: 63500,
        serviceBy: 'Toyota Service Center',
        shopAddress: '123 Main St, Georgetown, KY',
        shopPhone: '(555) 123-4567',
        notes: 'Next oil change due at 63,500 miles or December 2024',
        vehicleId: demoCar.id,
        userId: user.id,
      },
      {
        type: 'TIRE_ROTATION' as const,
        category: 'TIRES' as const,
        title: 'Tire Rotation',
        description: 'Rotated all four tires, checked tire pressure',
        totalCost: 35,
        laborCost: 35,
        mileage: 55000,
        date: new Date('2024-03-20'),
        serviceBy: 'Discount Tire',
        shopAddress: '456 Highway Blvd, Georgetown, KY',
        shopPhone: '(555) 234-5678',
        vehicleId: demoCar.id,
        userId: user.id,
      },
      {
        type: 'BRAKE_INSPECTION' as const,
        category: 'BRAKES' as const,
        title: 'Brake Inspection',
        description: 'Comprehensive brake system inspection, all components in good condition',
        totalCost: 0,
        mileage: 50000,
        date: new Date('2023-11-05'),
        serviceBy: 'Toyota Service Center',
        shopAddress: '123 Main St, Georgetown, KY',
        shopPhone: '(555) 123-4567',
        notes: 'Front pads at 60%, rear pads at 70%, rotors within spec',
        vehicleId: demoCar.id,
        userId: user.id,
      },
    ];

    for (const record of demoMaintenanceRecords) {
      await prisma.maintenanceRecord.create({ data: record });
    }

    console.log('🔧 Created maintenance records');

    // Add an issue for demonstration
    await prisma.issue.create({
      data: {
        title: 'Tire Pressure Warning Light',
        description: 'Low tire pressure warning light came on. Front passenger tire appears slightly low.',
        severity: 'LOW',
        status: 'OPEN',
        mileage: 62000,
        dateFound: new Date('2024-10-10'),
        notes: 'Need to check tire pressure and inflate. Could be due to temperature change.',
        vehicleId: demoCar.id,
        userId: user.id,
      },
    });

    console.log('⚠️ Created issue');

    // Add service reminder
    await prisma.serviceReminder.create({
      data: {
        title: 'Oil Change Due Soon',
        description: 'Oil change is due at 63,500 miles or by December 15, 2024',
        reminderType: 'COMBINED',
        dueMileage: 63500,
        dueDate: new Date('2024-12-15'),
        intervalMiles: 5000,
        intervalMonths: 6,
        isActive: true,
        isCompleted: false,
        vehicleId: demoCar.id,
        userId: user.id,
      },
    });

    console.log('⏰ Created service reminder');
    console.log('✅ Database seeded successfully!');

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        user: user.email,
        vehicle: demoCar.nickname,
        maintenanceRecords: demoMaintenanceRecords.length,
      },
    });

  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to seed database',
      },
      { status: 500 }
    );
  }
}
