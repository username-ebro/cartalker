import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vehicleId = searchParams.get('vehicleId');
    const status = searchParams.get('status');

    const where: any = {};
    if (vehicleId) where.vehicleId = vehicleId;
    if (status) where.status = status;

    const issues = await prisma.issue.findMany({
      where,
      include: {
        vehicle: {
          select: { id: true, nickname: true, make: true, model: true, year: true }
        }
      },
      orderBy: { dateFound: 'desc' }
    });

    return NextResponse.json({ success: true, data: issues });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch issues' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vehicleId,
      title,
      description,
      severity,
      cost,
      mileage,
      dateFound,
      notes
    } = body;

    if (!vehicleId || !title || !description || !severity || !dateFound) {
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

    const issue = await prisma.issue.create({
      data: {
        vehicleId,
        userId: vehicle.userId,
        title,
        description,
        severity,
        cost: cost ? parseFloat(cost) : undefined,
        mileage: mileage ? parseInt(mileage) : undefined,
        dateFound: new Date(dateFound),
        notes,
      },
      include: {
        vehicle: {
          select: { id: true, nickname: true, make: true, model: true, year: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: issue }, { status: 201 });
  } catch (error) {
    console.error('Error creating issue:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create issue' },
      { status: 500 }
    );
  }
}