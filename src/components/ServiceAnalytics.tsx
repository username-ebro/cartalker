'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Wrench, AlertCircle, Clock } from 'lucide-react';

interface ServiceRecord {
  id: string;
  type: string;
  category: string;
  title: string;
  totalCost?: number;
  date: string;
  mileage?: number;
  serviceBy?: string;
  vehicle: {
    id: string;
    nickname?: string;
    make?: string;
    model?: string;
    year?: number;
  };
}

interface Vehicle {
  id: string;
  nickname?: string;
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
}

interface ServiceAnalyticsProps {
  records: ServiceRecord[];
  vehicles: Vehicle[];
}

const CATEGORY_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6B7280'
];

export function ServiceAnalytics({ records, vehicles }: ServiceAnalyticsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState('12months');
  const [selectedVehicle, setSelectedVehicle] = useState('all');

  // Filter records based on timeframe and vehicle
  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    // Filter by vehicle
    if (selectedVehicle !== 'all') {
      filtered = filtered.filter(record => record.vehicle.id === selectedVehicle);
    }

    // Filter by timeframe
    const now = new Date();
    const timeframeDays = {
      '6months': 180,
      '12months': 365,
      '24months': 730,
      'all': Infinity
    }[selectedTimeframe] ?? Infinity;

    if (timeframeDays !== Infinity) {
      const cutoffDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(record => new Date(record.date) >= cutoffDate);
    }

    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [records, selectedTimeframe, selectedVehicle]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalCost = filteredRecords.reduce((sum, record) => sum + (record.totalCost || 0), 0);
    const recordCount = filteredRecords.length;
    const averageCost = recordCount > 0 ? totalCost / recordCount : 0;

    // Calculate cost per mile
    const vehicleData = vehicles.find(v => v.id === selectedVehicle);
    const totalMiles = vehicleData?.mileage || 0;
    const costPerMile = totalMiles > 0 ? totalCost / totalMiles : 0;

    // Calculate maintenance frequency (services per month)
    const timeSpan = selectedTimeframe === 'all' ? 12 : parseInt(selectedTimeframe.replace('months', ''));
    const servicesPerMonth = recordCount / timeSpan;

    // Most expensive service
    const mostExpensive = filteredRecords.reduce((max, record) => {
      return (record.totalCost || 0) > (max.totalCost || 0) ? record : max;
    }, filteredRecords[0]);

    // Most frequent service provider
    const providerCounts = filteredRecords.reduce((acc, record) => {
      if (record.serviceBy) {
        acc[record.serviceBy] = (acc[record.serviceBy] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const topProvider = Object.entries(providerCounts).sort(([,a], [,b]) => b - a)[0];

    return {
      totalCost,
      recordCount,
      averageCost,
      costPerMile,
      servicesPerMonth,
      mostExpensive,
      topProvider: topProvider ? { name: topProvider[0], count: topProvider[1] } : null
    };
  }, [filteredRecords, selectedVehicle, selectedTimeframe, vehicles]);

  // Cost by category data
  const costByCategory = useMemo(() => {
    const categoryTotals = filteredRecords.reduce((acc, record) => {
      const category = record.category || 'OTHER';
      acc[category] = (acc[category] || 0) + (record.totalCost || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  // Monthly spending trend
  const monthlySpending = useMemo(() => {
    const monthlyTotals = filteredRecords.reduce((acc, record) => {
      const date = new Date(record.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      acc[monthKey] = (acc[monthKey] || 0) + (record.totalCost || 0);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyTotals)
      .map(([month, total]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        total
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [filteredRecords]);

  // Service frequency by type
  const serviceFrequency = useMemo(() => {
    const typeCounts = filteredRecords.reduce((acc, record) => {
      const type = record.type || 'OTHER';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(typeCounts)
      .map(([name, count]) => ({ name: name.replace('_', ' '), count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [filteredRecords]);

  // Service provider analysis
  const providerAnalysis = useMemo(() => {
    const providerData = filteredRecords.reduce((acc, record) => {
      if (!record.serviceBy) return acc;

      if (!acc[record.serviceBy]) {
        acc[record.serviceBy] = {
          name: record.serviceBy,
          serviceCount: 0,
          totalCost: 0,
          averageCost: 0
        };
      }

      acc[record.serviceBy].serviceCount += 1;
      acc[record.serviceBy].totalCost += record.totalCost || 0;
      acc[record.serviceBy].averageCost = acc[record.serviceBy].totalCost / acc[record.serviceBy].serviceCount;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(providerData)
      .sort((a: any, b: any) => b.totalCost - a.totalCost)
      .slice(0, 5);
  }, [filteredRecords]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="6months">Last 6 Months</option>
              <option value="12months">Last 12 Months</option>
              <option value="24months">Last 24 Months</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle</label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Vehicles</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.totalCost)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Wrench className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Service Records</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.recordCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Average Cost</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(metrics.averageCost)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Services/Month</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.servicesPerMonth.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Spending Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
              <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Cost by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={costByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {costByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Frequency */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Common Services</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serviceFrequency} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Provider Comparison */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Provider Analysis</h3>
          <div className="space-y-4">
            {providerAnalysis.map((provider, index) => (
              <div key={provider.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{provider.name}</div>
                  <div className="text-sm text-gray-600">{provider.serviceCount} services</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">{formatCurrency(provider.totalCost)}</div>
                  <div className="text-sm text-gray-600">Avg: {formatCurrency(provider.averageCost)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights and Recommendations */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          <AlertCircle className="w-5 h-5 inline mr-2" />
          Insights & Recommendations
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Cost Analysis</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {metrics.costPerMile > 0 && (
                <li>• Maintenance cost: {formatCurrency(metrics.costPerMile)}/mile</li>
              )}
              {metrics.mostExpensive && (
                <li>• Most expensive service: {metrics.mostExpensive.title} ({formatCurrency(metrics.mostExpensive.totalCost || 0)})</li>
              )}
              {costByCategory.length > 0 && (
                <li>• Highest category spend: {costByCategory[0].name} ({formatCurrency(costByCategory[0].value)})</li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Service Patterns</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              {metrics.topProvider && (
                <li>• Most used provider: {metrics.topProvider.name} ({metrics.topProvider.count} services)</li>
              )}
              {serviceFrequency.length > 0 && (
                <li>• Most common service: {serviceFrequency[0].name} ({serviceFrequency[0].count} times)</li>
              )}
              <li>• Service frequency: Every {(12 / metrics.servicesPerMonth).toFixed(1)} months</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Upcoming Service Forecast */}
      {selectedVehicle !== 'all' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Maintenance Forecast</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900">Next 3 Months</h4>
              <p className="text-sm text-blue-700">Estimated: {formatCurrency(metrics.averageCost * (metrics.servicesPerMonth * 3))}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-900">Next 6 Months</h4>
              <p className="text-sm text-green-700">Estimated: {formatCurrency(metrics.averageCost * (metrics.servicesPerMonth * 6))}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-medium text-purple-900">Annual Budget</h4>
              <p className="text-sm text-purple-700">Estimated: {formatCurrency(metrics.averageCost * (metrics.servicesPerMonth * 12))}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}