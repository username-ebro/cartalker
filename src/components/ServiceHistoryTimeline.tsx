'use client';

import { useState, useMemo } from 'react';
import { Calendar, DollarSign, MapPin, Wrench, Filter, Download, Search, Clock, AlertTriangle } from 'lucide-react';

interface ServiceRecord {
  id: string;
  type: string;
  category: string;
  title: string;
  description?: string;
  totalCost?: number;
  partsCost?: number;
  laborCost?: number;
  mileage?: number;
  date: string;
  nextServiceDue?: string;
  nextServiceMileage?: number;
  serviceBy?: string;
  shopAddress?: string;
  shopPhone?: string;
  serviceDetails?: string;
  notes?: string;
  warrantyInfo?: string;
  vehicle: {
    id: string;
    nickname?: string;
    make?: string;
    model?: string;
    year?: number;
  };
}

interface ServiceHistoryTimelineProps {
  records: ServiceRecord[];
  vehicles: any[];
  currentMileage?: number;
}

const CATEGORY_COLORS = {
  ENGINE: 'bg-red-100 text-red-800 border-red-200',
  TRANSMISSION: 'bg-orange-100 text-orange-800 border-orange-200',
  BRAKES: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  TIRES: 'bg-green-100 text-green-800 border-green-200',
  ELECTRICAL: 'bg-blue-100 text-blue-800 border-blue-200',
  SUSPENSION: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  HVAC: 'bg-purple-100 text-purple-800 border-purple-200',
  FLUIDS: 'bg-pink-100 text-pink-800 border-pink-200',
  FILTERS: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  INSPECTION: 'bg-gray-100 text-gray-800 border-gray-200',
  REPAIR: 'bg-red-100 text-red-800 border-red-200',
  UPGRADE: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

export function ServiceHistoryTimeline({ records, vehicles, currentMileage }: ServiceHistoryTimelineProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  // Get unique categories and years for filters
  const categories = useMemo(() => {
    const cats = [...new Set(records.map(r => r.category))];
    return cats.sort();
  }, [records]);

  const years = useMemo(() => {
    const years = [...new Set(records.map(r => new Date(r.date).getFullYear()))];
    return years.sort((a, b) => b - a);
  }, [records]);

  // Filter records
  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = searchTerm === '' ||
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.serviceBy?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = selectedCategory === '' || record.category === selectedCategory;
      const matchesVehicle = selectedVehicle === '' || record.vehicle.id === selectedVehicle;
      const matchesYear = selectedYear === '' || new Date(record.date).getFullYear().toString() === selectedYear;

      return matchesSearch && matchesCategory && matchesVehicle && matchesYear;
    });
  }, [records, searchTerm, selectedCategory, selectedVehicle, selectedYear]);

  // Get upcoming services based on current records
  const upcomingServices = useMemo(() => {
    const upcoming = records
      .filter(record => record.nextServiceDue || record.nextServiceMileage)
      .map(record => {
        const dueDate = record.nextServiceDue ? new Date(record.nextServiceDue) : null;
        const dueMileage = record.nextServiceMileage;
        const today = new Date();

        let daysUntilDue = null;
        let milesUntilDue = null;
        let isOverdue = false;

        if (dueDate) {
          daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          isOverdue = daysUntilDue < 0;
        }

        if (dueMileage && currentMileage) {
          milesUntilDue = dueMileage - currentMileage;
          isOverdue = isOverdue || milesUntilDue <= 0;
        }

        return {
          ...record,
          daysUntilDue,
          milesUntilDue,
          isOverdue,
          urgency: isOverdue ? 'overdue' :
            (daysUntilDue !== null && daysUntilDue <= 30) ||
            (milesUntilDue !== null && milesUntilDue <= 1000) ? 'soon' : 'later'
        };
      })
      .filter(service => service.daysUntilDue !== null || service.milesUntilDue !== null)
      .sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;

        const aUrgency = Math.min(a.daysUntilDue || Infinity, (a.milesUntilDue || Infinity) / 30);
        const bUrgency = Math.min(b.daysUntilDue || Infinity, (b.milesUntilDue || Infinity) / 30);

        return aUrgency - bUrgency;
      });

    return upcoming;
  }, [records, currentMileage]);

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

  const parseServiceDetails = (detailsString?: string) => {
    if (!detailsString) return {};
    try {
      return JSON.parse(detailsString);
    } catch {
      return {};
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Date', 'Vehicle', 'Service', 'Category', 'Mileage', 'Total Cost',
      'Parts Cost', 'Labor Cost', 'Service Provider', 'Description', 'Notes'
    ];

    const csvData = filteredRecords.map(record => [
      formatDate(record.date),
      record.vehicle.nickname || `${record.vehicle.year} ${record.vehicle.make} ${record.vehicle.model}`,
      record.title,
      record.category,
      record.mileage || '',
      record.totalCost || '',
      record.partsCost || '',
      record.laborCost || '',
      record.serviceBy || '',
      record.description || '',
      record.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upcoming Services Alert */}
      {upcomingServices.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-yellow-800">Upcoming Services</h3>
          </div>
          <div className="space-y-2">
            {upcomingServices.slice(0, 3).map((service) => (
              <div key={service.id} className={`flex items-center justify-between p-2 rounded ${
                service.isOverdue ? 'bg-red-100 border border-red-200' : 'bg-white border border-yellow-200'
              }`}>
                <div>
                  <span className="font-medium">{service.title}</span>
                  <span className="text-sm text-gray-600 ml-2">
                    {service.vehicle.nickname || `${service.vehicle.year} ${service.vehicle.make} ${service.vehicle.model}`}
                  </span>
                </div>
                <div className="text-sm">
                  {service.isOverdue && <span className="text-red-600 font-medium">OVERDUE</span>}
                  {service.daysUntilDue !== null && !service.isOverdue && (
                    <span className="text-gray-600">
                      {service.daysUntilDue} days
                    </span>
                  )}
                  {service.milesUntilDue !== null && !service.isOverdue && (
                    <span className="text-gray-600 ml-2">
                      {service.milesUntilDue.toLocaleString()} mi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
          {upcomingServices.length > 3 && (
            <button
              onClick={() => setShowUpcoming(!showUpcoming)}
              className="text-sm text-yellow-700 hover:text-yellow-800 mt-2"
            >
              {showUpcoming ? 'Show less' : `Show ${upcomingServices.length - 3} more`}
            </button>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services, descriptions, or providers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Vehicles</option>
            {vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          <button
            onClick={exportToCSV}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredRecords.length} of {records.length} records
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredRecords.map((record, index) => {
          const serviceDetails = parseServiceDetails(record.serviceDetails);
          const isExpanded = expandedRecord === record.id;

          return (
            <div key={record.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div
                className="p-6 cursor-pointer"
                onClick={() => setExpandedRecord(isExpanded ? null : record.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Wrench className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {formatDate(record.date)}
                          </span>
                          {record.mileage && (
                            <span>{record.mileage.toLocaleString()} miles</span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs border ${
                            CATEGORY_COLORS[record.category as keyof typeof CATEGORY_COLORS] || 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}>
                            {record.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {record.description && (
                      <p className="text-gray-600 mb-3">{record.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="text-blue-600">
                        {record.vehicle.nickname || `${record.vehicle.year} ${record.vehicle.make} ${record.vehicle.model}`}
                      </span>

                      {record.serviceBy && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {record.serviceBy}
                        </span>
                      )}

                      {/* Next service reminder */}
                      {(record.nextServiceDue || record.nextServiceMileage) && (
                        <span className="flex items-center text-orange-600">
                          <Clock className="w-4 h-4 mr-1" />
                          Next: {record.nextServiceDue && formatDate(record.nextServiceDue)}
                          {record.nextServiceMileage && ` / ${record.nextServiceMileage.toLocaleString()} mi`}
                        </span>
                      )}
                    </div>
                  </div>

                  {record.totalCost && (
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900 flex items-center">
                        <DollarSign className="w-5 h-5 mr-1" />
                        {formatCurrency(record.totalCost)}
                      </div>
                      {(record.partsCost || record.laborCost) && (
                        <div className="text-sm text-gray-600">
                          {record.partsCost && `Parts: ${formatCurrency(record.partsCost)}`}
                          {record.partsCost && record.laborCost && ' • '}
                          {record.laborCost && `Labor: ${formatCurrency(record.laborCost)}`}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Service Details */}
                    {Object.keys(serviceDetails).length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Service Details</h4>
                        <div className="space-y-1 text-sm">
                          {Object.entries(serviceDetails).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                              <span className="text-gray-900">{String(value)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Provider Info */}
                    {(record.shopAddress || record.shopPhone) && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Service Provider</h4>
                        <div className="space-y-1 text-sm">
                          {record.shopAddress && (
                            <div className="flex items-start">
                              <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                              <span className="text-gray-600">{record.shopAddress}</span>
                            </div>
                          )}
                          {record.shopPhone && (
                            <div className="flex items-center">
                              <span className="w-4 h-4 mr-2 text-gray-400">📞</span>
                              <span className="text-gray-600">{record.shopPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {record.notes && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                        <p className="text-sm text-gray-600">{record.notes}</p>
                      </div>
                    )}

                    {/* Warranty */}
                    {record.warrantyInfo && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Warranty Information</h4>
                        <p className="text-sm text-gray-600">{record.warrantyInfo}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Wrench className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No service records found</h3>
            <p className="text-gray-600">
              Try adjusting your filters or add some service records to get started.
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredRecords.length}</div>
              <div className="text-sm text-gray-600">Service Records</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(filteredRecords.reduce((sum, record) => sum + (record.totalCost || 0), 0))}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(filteredRecords.reduce((sum, record) => sum + (record.totalCost || 0), 0) / Math.max(filteredRecords.length, 1))}
              </div>
              <div className="text-sm text-gray-600">Average Cost</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{upcomingServices.length}</div>
              <div className="text-sm text-gray-600">Upcoming Services</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}