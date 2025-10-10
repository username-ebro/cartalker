import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Test VINs from the requirements
const TEST_VINS = {
  EVAN_GTI: '3VW447AU9GM030618', // 2016 VW GTI
  BOND_JEEP: '1C4GJWAG9CL102751' // 2012 Jeep
};

const SERVICE_DATA = {
  [TEST_VINS.EVAN_GTI]: [
    {
      type: 'OIL_CHANGE',
      category: 'ENGINE',
      title: 'Oil Change - Full Synthetic',
      description: 'Regular maintenance oil change with high-quality full synthetic oil',
      totalCost: 65.99,
      partsCost: 45.99,
      laborCost: 20.00,
      mileage: 85000,
      date: new Date('2024-01-15'),
      nextServiceDue: new Date('2024-07-15'),
      nextServiceMileage: 90000,
      serviceBy: 'European Auto Specialists',
      shopAddress: '1234 Main St, Anytown, ST 12345',
      shopPhone: '(555) 123-4567',
      serviceDetails: JSON.stringify({
        oilType: 'Full Synthetic',
        oilViscosity: '5W-40',
        filterBrand: 'Mann',
        oilAmount: '4.9 quarts',
        oilBrand: 'Liqui Moly'
      }),
      notes: 'Engine running smoothly. No leaks detected.',
      warrantyInfo: '6 months / 5,000 miles warranty on service'
    },
    {
      type: 'TRANSMISSION_SERVICE',
      category: 'TRANSMISSION',
      title: 'DSG Transmission Service',
      description: 'DSG dual-clutch transmission fluid and filter service',
      totalCost: 350.00,
      partsCost: 185.00,
      laborCost: 165.00,
      mileage: 82000,
      date: new Date('2023-11-20'),
      nextServiceDue: new Date('2026-11-20'),
      nextServiceMileage: 122000,
      serviceBy: 'VW Dealership Service',
      shopAddress: '5678 Auto Plaza Dr, Anytown, ST 12345',
      shopPhone: '(555) 987-6543',
      serviceDetails: JSON.stringify({
        fluidType: 'VW G 052 182 A2',
        filterPartNumber: '02E305051C',
        fluidAmount: '5.5 liters',
        clutchCondition: 'Good'
      }),
      notes: 'DSG service performed according to VW maintenance schedule. Transmission shifting smoothly.',
      warrantyInfo: '12 months / 12,000 miles warranty'
    },
    {
      type: 'BRAKE_PADS',
      category: 'BRAKES',
      title: 'Front Brake Pad Replacement',
      description: 'Replaced front brake pads with performance pads',
      totalCost: 280.00,
      partsCost: 180.00,
      laborCost: 100.00,
      mileage: 78000,
      date: new Date('2023-08-10'),
      nextServiceMileage: 103000,
      serviceBy: 'Brake Masters',
      shopAddress: '9012 Brake Ave, Anytown, ST 12345',
      shopPhone: '(555) 456-7890',
      serviceDetails: JSON.stringify({
        position: 'Front',
        brand: 'EBC RedStuff',
        rotorCondition: 'Resurfaced',
        fluidLevel: 'Good',
        padThickness: '12mm'
      }),
      notes: 'Rotors resurfaced. Brake pedal feel improved significantly.',
      warrantyInfo: '24 months / 25,000 miles on pads'
    },
    {
      type: 'TIRE_ROTATION',
      category: 'TIRES',
      title: 'Tire Rotation & Pressure Check',
      description: 'Rotated tires and checked/adjusted tire pressures',
      totalCost: 25.00,
      laborCost: 25.00,
      mileage: 84500,
      date: new Date('2023-12-20'),
      nextServiceMileage: 92000,
      serviceBy: 'Quick Tire',
      shopPhone: '(555) 111-2222',
      serviceDetails: JSON.stringify({
        pattern: 'Front to back',
        pressureCheck: true,
        frontPressure: '35 PSI',
        rearPressure: '33 PSI',
        treadDepth: '6/32"'
      }),
      notes: 'Tires wearing evenly. Good tread remaining.',
    },
    {
      type: 'AIR_FILTER',
      category: 'FILTERS',
      title: 'Engine Air Filter Replacement',
      description: 'Replaced dirty engine air filter',
      totalCost: 45.00,
      partsCost: 25.00,
      laborCost: 20.00,
      mileage: 83000,
      date: new Date('2023-10-05'),
      nextServiceMileage: 98000,
      serviceBy: 'Quick Lube Plus',
      serviceDetails: JSON.stringify({
        filterBrand: 'K&N',
        filterType: 'High-flow',
        oldFilterCondition: 'Very dirty'
      }),
      notes: 'Old filter was quite dirty. Should improve fuel economy slightly.'
    },
    {
      type: 'INSPECTION',
      category: 'INSPECTION',
      title: 'Annual State Inspection',
      description: 'Annual safety and emissions inspection',
      totalCost: 35.00,
      laborCost: 35.00,
      mileage: 85200,
      date: new Date('2024-02-01'),
      nextServiceDue: new Date('2025-02-28'),
      serviceBy: 'State Inspection Station',
      shopAddress: '3456 Inspection Ln, Anytown, ST 12345',
      serviceDetails: JSON.stringify({
        inspectionType: 'Safety & Emissions',
        certificateNumber: 'ST-2024-001234',
        expirationDate: '2025-02-28',
        result: 'PASS'
      }),
      notes: 'Vehicle passed all safety and emissions tests.',
      warrantyInfo: 'Valid until 2025-02-28'
    }
  ],
  [TEST_VINS.BOND_JEEP]: [
    {
      type: 'OIL_CHANGE',
      category: 'ENGINE',
      title: 'Oil Change - Conventional',
      description: 'Regular oil change with conventional oil',
      totalCost: 35.99,
      partsCost: 25.99,
      laborCost: 10.00,
      mileage: 145000,
      date: new Date('2024-01-20'),
      nextServiceDue: new Date('2024-04-20'),
      nextServiceMileage: 148000,
      serviceBy: 'Jiffy Lube',
      shopAddress: '7890 Quick St, Anytown, ST 12345',
      shopPhone: '(555) 321-4567',
      serviceDetails: JSON.stringify({
        oilType: 'Conventional',
        oilViscosity: '5W-30',
        filterBrand: 'Fram',
        oilAmount: '6 quarts',
        oilBrand: 'Valvoline'
      }),
      notes: 'Oil was quite dark. Engine running well for high mileage.',
      warrantyInfo: '3 months / 3,000 miles'
    },
    {
      type: 'DIFFERENTIAL_SERVICE',
      category: 'TRANSMISSION',
      title: 'Rear Differential Service',
      description: 'Rear differential fluid change and inspection',
      totalCost: 120.00,
      partsCost: 45.00,
      laborCost: 75.00,
      mileage: 142000,
      date: new Date('2023-09-15'),
      nextServiceMileage: 182000,
      serviceBy: '4x4 Specialists',
      shopAddress: '2468 Off-Road Blvd, Anytown, ST 12345',
      shopPhone: '(555) 654-3210',
      serviceDetails: JSON.stringify({
        fluidType: '75W-90 Gear Oil',
        fluidAmount: '2.5 quarts',
        condition: 'Fluid was dirty',
        magnetDrain: 'Normal metal shavings'
      }),
      notes: 'Differential in good condition. Fluid was due for change.',
      warrantyInfo: '12 months / 12,000 miles'
    },
    {
      type: 'BRAKE_SERVICE',
      category: 'BRAKES',
      title: 'Rear Brake Shoes & Drums',
      description: 'Replaced rear brake shoes and resurfaced drums',
      totalCost: 180.00,
      partsCost: 85.00,
      laborCost: 95.00,
      mileage: 140000,
      date: new Date('2023-06-30'),
      nextServiceMileage: 165000,
      serviceBy: 'Brake & Tire Pros',
      shopAddress: '1357 Service Dr, Anytown, ST 12345',
      serviceDetails: JSON.stringify({
        position: 'Rear',
        type: 'Drum brakes',
        shoeBrand: 'Raybestos',
        drumCondition: 'Resurfaced',
        adjustments: 'Self-adjusting'
      }),
      notes: 'Drums were within service limits. Shoes were worn to minimum.',
      warrantyInfo: '12 months / 12,000 miles on parts and labor'
    },
    {
      type: 'TIRE_REPLACEMENT',
      category: 'TIRES',
      title: 'All-Terrain Tire Installation',
      description: 'Installed new all-terrain tires',
      totalCost: 640.00,
      partsCost: 560.00,
      laborCost: 80.00,
      mileage: 143000,
      date: new Date('2023-11-10'),
      nextServiceMileage: 183000,
      serviceBy: 'Tire Kingdom',
      shopAddress: '9753 Tire Ave, Anytown, ST 12345',
      shopPhone: '(555) 987-1234',
      serviceDetails: JSON.stringify({
        brand: 'BFGoodrich All-Terrain T/A KO2',
        size: '245/75R16',
        quantity: '4 tires',
        balancing: 'Road force balanced',
        warranty: '60,000 miles'
      }),
      notes: 'Old tires were worn unevenly. New tires provide much better traction.',
      warrantyInfo: '60,000 mile tread warranty'
    },
    {
      type: 'TRANSMISSION_FLUID',
      category: 'TRANSMISSION',
      title: 'Transmission Fluid Service',
      description: 'Transmission fluid drain and fill',
      totalCost: 89.99,
      partsCost: 39.99,
      laborCost: 50.00,
      mileage: 144500,
      date: new Date('2023-12-15'),
      nextServiceMileage: 174500,
      serviceBy: 'AAMCO',
      shopAddress: '4680 Transmission Rd, Anytown, ST 12345',
      shopPhone: '(555) 456-0987',
      serviceDetails: JSON.stringify({
        fluidType: 'ATF+4',
        fluidAmount: '4 quarts',
        filterChanged: false,
        fluidCondition: 'Dark but not burnt'
      }),
      notes: 'Transmission shifting well. Fluid was overdue for service.',
      warrantyInfo: '12 months / 12,000 miles'
    },
    {
      type: 'SPARK_PLUGS',
      category: 'ENGINE',
      title: 'Spark Plug Replacement',
      description: 'Replaced all 6 spark plugs',
      totalCost: 110.00,
      partsCost: 48.00,
      laborCost: 62.00,
      mileage: 141000,
      date: new Date('2023-05-20'),
      nextServiceMileage: 171000,
      serviceBy: 'AutoZone Pro',
      serviceDetails: JSON.stringify({
        plugBrand: 'Champion',
        plugType: 'Copper core',
        gap: '0.035"',
        cylinderCount: 6,
        condition: 'Old plugs were fouled'
      }),
      notes: 'Engine idling much smoother after replacement. MPG should improve.',
      warrantyInfo: '12 months / 30,000 miles'
    }
  ]
};

async function seedServiceData() {
  console.log('🌱 Starting service data seeding...');

  try {
    // Find or create a test user
    let user = await prisma.user.findFirst({
      where: { email: 'test@cartalker.com' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'test@cartalker.com',
          name: 'Test User'
        }
      });
      console.log('✅ Created test user');
    }

    // Process each test vehicle
    for (const [vin, serviceRecords] of Object.entries(SERVICE_DATA)) {
      console.log(`\n🚗 Processing vehicle: ${vin}`);

      // Find the vehicle by VIN
      const vehicle = await prisma.vehicle.findUnique({
        where: { vin }
      });

      if (!vehicle) {
        console.log(`⚠️  Vehicle with VIN ${vin} not found. Creating it...`);

        // Create the vehicle based on VIN
        const vehicleData = vin === TEST_VINS.EVAN_GTI ? {
          vin,
          year: 2016,
          make: 'Volkswagen',
          model: 'Golf GTI',
          trim: 'S',
          engine: '2.0L Turbo I4',
          transmission: '6-Speed DSG Automatic',
          nickname: "Evan's GTI",
          mileage: 85500,
          userId: user.id
        } : {
          vin,
          year: 2012,
          make: 'Jeep',
          model: 'Wrangler',
          trim: 'Sport',
          engine: '3.6L V6',
          transmission: '6-Speed Manual',
          nickname: "Bond's Jeep",
          mileage: 146000,
          userId: user.id
        };

        const newVehicle = await prisma.vehicle.create({
          data: vehicleData
        });

        console.log(`✅ Created vehicle: ${newVehicle.nickname}`);

        // Now create service records for this vehicle
        await createServiceRecords(newVehicle.id, user.id, serviceRecords);
      } else {
        console.log(`✅ Found existing vehicle: ${vehicle.nickname || vehicle.make + ' ' + vehicle.model}`);

        // Check if service records already exist
        const existingRecords = await prisma.maintenanceRecord.findMany({
          where: { vehicleId: vehicle.id }
        });

        if (existingRecords.length === 0) {
          await createServiceRecords(vehicle.id, vehicle.userId, serviceRecords);
        } else {
          console.log(`ℹ️  Vehicle already has ${existingRecords.length} service records`);
        }
      }
    }

    console.log('\n🎉 Service data seeding completed successfully!');

    // Print summary
    const totalRecords = await prisma.maintenanceRecord.count();
    const totalVehicles = await prisma.vehicle.count();
    console.log(`\n📊 Summary:`);
    console.log(`   • Total vehicles: ${totalVehicles}`);
    console.log(`   • Total service records: ${totalRecords}`);

  } catch (error) {
    console.error('❌ Error seeding service data:', error);
    throw error;
  }
}

async function createServiceRecords(vehicleId: string, userId: string, serviceRecords: any[]) {
  console.log(`   📝 Creating ${serviceRecords.length} service records...`);

  for (const record of serviceRecords) {
    try {
      await prisma.maintenanceRecord.create({
        data: {
          ...record,
          vehicleId,
          userId
        }
      });
      console.log(`   ✅ Created: ${record.title}`);
    } catch (error) {
      console.error(`   ❌ Failed to create: ${record.title}`, error);
    }
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedServiceData()
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { seedServiceData };