import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: 'demo@cartalker.com' },
    update: {},
    create: {
      email: 'demo@cartalker.com',
      name: 'Demo User',
    },
  });

  console.log('👤 Created user:', user.email);

  // Create vehicles with the test VINs
  const evansCar = await prisma.vehicle.upsert({
    where: { vin: '3VW447AU9GM030618' },
    update: {},
    create: {
      vin: '3VW447AU9GM030618',
      year: 2016,
      make: 'VOLKSWAGEN',
      model: 'Golf GTI',
      trim: '2.0T Base, Performance Pkg. S, SE, Autobahn',
      transmission: 'Automatic',
      fuelType: 'Gasoline',
      bodyClass: 'Hatchback/Liftback/Notchback',
      manufacturerName: 'VOLKSWAGEN DE MEXICO SA DE CV',
      plantCity: 'PUEBLA',
      plantCountry: 'MEXICO',
      nickname: "Evan's GTI",
      color: 'Dark Blue Metallic',
      mileage: 85000,
      purchaseDate: new Date('2018-06-15'),
      purchasePrice: 22000,
      currentValue: 18000,
      notes: 'Stage 1 tune, cold air intake, upgraded intercooler',
      userId: user.id,
    },
  });

  const bondsCar = await prisma.vehicle.upsert({
    where: { vin: '1C4GJWAG9CL102751' },
    update: {},
    create: {
      vin: '1C4GJWAG9CL102751',
      year: 2012,
      make: 'JEEP',
      model: 'Wrangler',
      trim: 'Sport',
      driveType: '4WD/4-Wheel Drive/4x4',
      fuelType: 'Flexible Fuel Vehicle (FFV)',
      bodyClass: 'Sport Utility Vehicle (SUV)/Multi-Purpose Vehicle (MPV)',
      manufacturerName: 'FCA US LLC',
      plantCity: 'TOLEDO',
      plantState: 'OHIO',
      plantCountry: 'UNITED STATES (USA)',
      nickname: "Bond's Wrangler",
      color: 'Bright White',
      mileage: 120000,
      purchaseDate: new Date('2015-03-22'),
      purchasePrice: 28000,
      currentValue: 25000,
      notes: 'Lifted 3 inches, 35" tires, LED light bar, winch',
      userId: user.id,
    },
  });

  console.log('🚗 Created vehicles:', evansCar.nickname, bondsCar.nickname);

  // Add some maintenance records for Evan's car
  const evansMaintenanceRecords = [
    {
      type: 'OIL_CHANGE' as const,
      category: 'ENGINE' as const,
      title: 'Oil Change & Filter',
      description: 'Liqui Moly 5W-40 synthetic oil',
      totalCost: 85,
      mileage: 84500,
      date: new Date('2024-08-15'),
      serviceBy: 'AutoZone',
      vehicleId: evansCar.id,
      userId: user.id,
    },
    {
      type: 'TIRE_ROTATION' as const,
      category: 'TIRES' as const,
      title: 'Tire Rotation',
      description: 'Rotated all four tires',
      totalCost: 30,
      mileage: 83000,
      date: new Date('2024-06-01'),
      serviceBy: 'Discount Tire',
      vehicleId: evansCar.id,
      userId: user.id,
    },
    {
      type: 'BRAKE_PADS' as const,
      category: 'BRAKES' as const,
      title: 'Front Brake Pads',
      description: 'Replaced front brake pads and rotors',
      totalCost: 450,
      mileage: 80000,
      date: new Date('2024-02-10'),
      serviceBy: 'German Auto Specialists',
      vehicleId: evansCar.id,
      userId: user.id,
    },
  ];

  for (const record of evansMaintenanceRecords) {
    await prisma.maintenanceRecord.create({ data: record });
  }

  // Add some maintenance records for Bond's car
  const bondsMaintenanceRecords = [
    {
      type: 'OIL_CHANGE' as const,
      category: 'ENGINE' as const,
      title: 'Oil Change',
      description: 'Mobil 1 5W-30 synthetic oil',
      totalCost: 75,
      mileage: 119500,
      date: new Date('2024-09-01'),
      serviceBy: 'Jiffy Lube',
      vehicleId: bondsCar.id,
      userId: user.id,
    },
    {
      type: 'INSPECTION' as const,
      category: 'INSPECTION' as const,
      title: 'Annual Safety Inspection',
      description: 'State safety and emissions inspection',
      totalCost: 25,
      mileage: 118000,
      date: new Date('2024-07-20'),
      serviceBy: 'State Inspection Station',
      vehicleId: bondsCar.id,
      userId: user.id,
    },
    {
      type: 'UPGRADE' as const,
      category: 'SUSPENSION' as const,
      title: 'Suspension Lift Kit',
      description: '3" suspension lift with new shocks',
      totalCost: 1200,
      mileage: 115000,
      date: new Date('2024-01-15'),
      serviceBy: '4 Wheel Parts',
      vehicleId: bondsCar.id,
      userId: user.id,
    },
  ];

  for (const record of bondsMaintenanceRecords) {
    await prisma.maintenanceRecord.create({ data: record });
  }

  console.log('🔧 Created maintenance records');

  // Add some issues for demonstration
  const issues = [
    {
      title: 'Check Engine Light',
      description: 'P0171 code - System too lean (Bank 1)',
      severity: 'MEDIUM' as const,
      status: 'FIXED' as const,
      cost: 120,
      mileage: 82000,
      dateFound: new Date('2024-03-15'),
      dateFixed: new Date('2024-03-20'),
      fixedBy: 'German Auto Specialists',
      notes: 'Replaced mass airflow sensor',
      vehicleId: evansCar.id,
      userId: user.id,
    },
    {
      title: 'Squeaky Brakes',
      description: 'Front brakes making noise when stopping',
      severity: 'LOW' as const,
      status: 'OPEN' as const,
      mileage: 119800,
      dateFound: new Date('2024-09-20'),
      notes: 'Likely just brake dust, monitor for now',
      vehicleId: bondsCar.id,
      userId: user.id,
    },
  ];

  for (const issue of issues) {
    await prisma.issue.create({ data: issue });
  }

  console.log('⚠️ Created issues');

  console.log('✅ Database seeded successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });