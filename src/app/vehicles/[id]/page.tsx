import { VehicleDetail } from '@/components/VehicleDetail';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    id: string;
  };
}

async function getVehicle(id: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/vehicles/${id}`, {
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    return null;
  }
}

export default async function VehicleDetailPage({ params }: PageProps) {
  const vehicle = await getVehicle(params.id);

  if (!vehicle) {
    notFound();
  }

  return <VehicleDetail vehicle={vehicle} />;
}