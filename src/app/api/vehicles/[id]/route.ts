import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        maintenanceRecords: {
          orderBy: { date: 'desc' }
        },
        issues: {
          orderBy: { dateFound: 'desc' }
        },
        user: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: {
            maintenanceRecords: true,
            issues: true
          }
        }
      }
    });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicle' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { nickname, color, mileage, notes, currentValue } = body;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        nickname,
        color,
        mileage: mileage ? parseInt(mileage) : undefined,
        notes,
        currentValue: currentValue ? parseFloat(currentValue) : undefined,
      },
      include: {
        maintenanceRecords: {
          orderBy: { date: 'desc' },
          take: 3
        },
        issues: {
          where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }
        },
        _count: {
          select: {
            maintenanceRecords: true,
            issues: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: vehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const { id } = await params;
    await prisma.vehicle.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete vehicle' },
      { status: 500 }
    );
  }
}