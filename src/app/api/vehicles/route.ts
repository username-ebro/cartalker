import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'demo-user';

    const vehicles = await prisma.vehicle.findMany({
      where: {
        user: {
          email: 'demo@cartalker.com' // For MVP, use demo user
        }
      },
      include: {
        maintenanceRecords: {
          orderBy: { date: 'desc' },
          take: 3 // Latest 3 maintenance records
        },
        issues: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } },
          orderBy: { dateFound: 'desc' }
        },
        _count: {
          select: {
            maintenanceRecords: true,
            issues: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: vehicles });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vin, nickname, color, mileage, notes } = body;

    if (!vin) {
      return NextResponse.json(
        { success: false, error: 'VIN is required' },
        { status: 400 }
      );
    }

    // Get user (for MVP, use demo user)
    const user = await prisma.user.findUnique({
      where: { email: 'demo@cartalker.com' }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Decode VIN to get vehicle data
    const vinResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/vin?vin=${vin}`);
    const vinData = await vinResponse.json();

    if (!vinData.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to decode VIN' },
        { status: 400 }
      );
    }

    // Create vehicle with decoded data and user inputs
    const vehicle = await prisma.vehicle.create({
      data: {
        ...vinData.data,
        nickname,
        color,
        mileage: mileage ? parseInt(mileage) : undefined,
        notes,
        userId: user.id,
      },
      include: {
        maintenanceRecords: true,
        issues: true,
        _count: {
          select: {
            maintenanceRecords: true,
            issues: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: vehicle }, { status: 201 });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create vehicle' },
      { status: 500 }
    );
  }
}