import { VehicleDetail } from '@/components/VehicleDetail';
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    id: string;
  };
}

async function getVehicle(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        maintenanceRecords: {
          orderBy: {
            date: 'desc',
          },
        },
        issues: {
          orderBy: {
            dateFound: 'desc',
          },
        },
        _count: {
          select: {
            maintenanceRecords: true,
            issues: true,
          },
        },
      },
    });

    return vehicle;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return null;
  }
}

export default async function VehicleDetailPage({ params }: PageProps) {
  // In Next.js 15, params must be awaited before accessing properties
  const resolvedParams = await params;
  const vehicle = await getVehicle(resolvedParams.id);

  if (!vehicle) {
    notFound();
  }

  return <VehicleDetail vehicle={vehicle} />;
}