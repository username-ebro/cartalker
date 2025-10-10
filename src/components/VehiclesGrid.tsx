'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Car, Calendar, AlertTriangle, Wrench, Eye } from 'lucide-react';

interface Vehicle {
  id: string;
  vin: string;
  year?: number;
  make?: string;
  model?: string;
  nickname?: string;
  color?: string;
  mileage?: number;
  maintenanceRecords: any[];
  issues: any[];
  _count: {
    maintenanceRecords: number;
    issues: number;
  };
}

export function VehiclesGrid() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      const data = await response.json();

      if (data.success) {
        setVehicles(data.data);
      } else {
        setError(data.error || 'Failed to fetch vehicles');
      }
    } catch (err) {
      setError('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="flex justify-between">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchVehicles}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="text-center py-12">
        <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles yet</h3>
        <p className="text-gray-600 mb-6">
          Add your first vehicle to start tracking maintenance and issues.
        </p>
        <Link
          href="/vehicles/add"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          Add Your First Vehicle
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vehicles.map((vehicle) => (
        <div key={vehicle.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              </h3>
              <Link
                href={`/vehicles/${vehicle.id}`}
                className="text-blue-600 hover:text-blue-800"
              >
                <Eye className="w-5 h-5" />
              </Link>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center">
                <Car className="w-4 h-4 mr-2" />
                {vehicle.year} {vehicle.make} {vehicle.model}
              </div>
              {vehicle.color && (
                <div className="flex items-center">
                  <div className="w-4 h-4 mr-2 rounded-full border border-gray-300" style={{ backgroundColor: vehicle.color.toLowerCase() }}></div>
                  {vehicle.color}
                </div>
              )}
              {vehicle.mileage && (
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {vehicle.mileage.toLocaleString()} miles
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-600">
                <Wrench className="w-4 h-4 mr-1" />
                {vehicle._count.maintenanceRecords} records
              </div>
              <div className="flex items-center text-sm">
                <AlertTriangle className={`w-4 h-4 mr-1 ${vehicle.issues.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                <span className={vehicle.issues.length > 0 ? 'text-red-600' : 'text-gray-600'}>
                  {vehicle.issues.length} open issues
                </span>
              </div>
            </div>

            {vehicle.maintenanceRecords.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Recent Maintenance:</p>
                <div className="space-y-1">
                  {vehicle.maintenanceRecords.slice(0, 2).map((record, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      {record.title} - {new Date(record.date).toLocaleDateString()}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}