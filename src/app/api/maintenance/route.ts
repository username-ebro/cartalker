import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');

    const where = vehicleId ? { vehicleId } : {};

    const maintenanceRecords = await prisma.maintenanceRecord.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, nickname: true, make: true, model: true, year: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    return NextResponse.json({ success: true, data: maintenanceRecords });
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vehicleId,
      type,
      category,
      title,
      description,
      // Cost breakdown
      totalCost,
      partsCost,
      laborCost,
      // Service details
      mileage,
      date,
      nextServiceDue,
      nextServiceMileage,
      // Service provider
      serviceBy,
      shopAddress,
      shopPhone,
      // Service specifics
      serviceDetails,
      // Documentation
      notes,
      warrantyInfo,
      receiptImages
    } = body;

    if (!vehicleId || !type || !title || !date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user from vehicle
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { userId: true }
    });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    const maintenanceRecord = await prisma.maintenanceRecord.create({
      data: {
        vehicleId,
        userId: vehicle.userId,
        type,
        category: category || 'REPAIR',
        title,
        description,
        // Cost breakdown
        totalCost: totalCost ? parseFloat(totalCost) : undefined,
        partsCost: partsCost ? parseFloat(partsCost) : undefined,
        laborCost: laborCost ? parseFloat(laborCost) : undefined,
        // Service details
        mileage: mileage ? parseInt(mileage) : undefined,
        date: new Date(date),
        nextServiceDue: nextServiceDue ? new Date(nextServiceDue) : undefined,
        nextServiceMileage: nextServiceMileage ? parseInt(nextServiceMileage) : undefined,
        // Service provider
        serviceBy,
        shopAddress,
        shopPhone,
        // Service specifics
        serviceDetails,
        // Documentation
        notes,
        warrantyInfo,
        receiptImages,
      },
      include: {
        vehicle: {
          select: { id: true, nickname: true, make: true, model: true, year: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: maintenanceRecord }, { status: 201 });
  } catch (error) {
    console.error('Error creating maintenance record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create maintenance record' },
      { status: 500 }
    );
  }
}