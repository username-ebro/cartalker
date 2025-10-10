'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wrench, Calendar, DollarSign, Car, Plus, Filter } from 'lucide-react';

interface MaintenanceRecord {
  id: string;
  type: string;
  title: string;
  description?: string;
  cost?: number;
  mileage?: number;
  date: string;
  serviceBy?: string;
  vehicle: {
    id: string;
    nickname?: string;
    make?: string;
    model?: string;
    year?: number;
  };
}

export function MaintenanceList() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/maintenance');
      const data = await response.json();

      if (data.success) {
        setRecords(data.data);
      }
    } catch (error) {
      console.error('Error fetching maintenance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredRecords = records.filter(record =>
    record.title.toLowerCase().includes(filter.toLowerCase()) ||
    record.type.toLowerCase().includes(filter.toLowerCase()) ||
    (record.vehicle.nickname && record.vehicle.nickname.toLowerCase().includes(filter.toLowerCase())) ||
    (record.vehicle.make && record.vehicle.make.toLowerCase().includes(filter.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Filters and Controls */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search maintenance records..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.map((record) => (
          <div key={record.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Wrench className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {record.type.replace('_', ' ')}
                  </span>
                </div>

                {record.description && (
                  <p className="text-gray-600 mb-3">{record.description}</p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Car className="w-4 h-4 mr-1" />
                    <Link
                      href={`/vehicles/${record.vehicle.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {record.vehicle.nickname ||
                       `${record.vehicle.year} ${record.vehicle.make} ${record.vehicle.model}`}
                    </Link>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {formatDate(record.date)}
                  </div>

                  {record.mileage && (
                    <div className="flex items-center">
                      <span>{record.mileage.toLocaleString()} miles</span>
                    </div>
                  )}

                  {record.serviceBy && (
                    <div className="flex items-center">
                      <span>Service by: {record.serviceBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {record.cost && (
                <div className="text-right">
                  <div className="flex items-center text-lg font-semibold text-gray-900">
                    <DollarSign className="w-5 h-5 mr-1" />
                    {formatCurrency(record.cost)}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredRecords.length === 0 && !loading && (
          <div className="text-center py-12">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter ? 'No records found' : 'No maintenance records yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter
                ? 'Try adjusting your search terms.'
                : 'Start by adding a maintenance record for one of your vehicles.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {records.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{records.length}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(records.reduce((sum, record) => sum + (record.cost || 0), 0))}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(records.reduce((sum, record) => sum + (record.cost || 0), 0) / records.length)}
              </div>
              <div className="text-sm text-gray-600">Average Cost</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}