'use client';

import { useState, useEffect } from 'react';
import { Plus, BarChart3, Clock, FileText, Zap } from 'lucide-react';
import { MaintenanceList } from '@/components/MaintenanceList';
import { ServiceRecordForm } from '@/components/ServiceRecordForm';
import { ServiceHistoryTimeline } from '@/components/ServiceHistoryTimeline';
import { ServiceAnalytics } from '@/components/ServiceAnalytics';
import { QuickServiceEntry } from '@/components/QuickServiceEntry';
import { Vehicle, MaintenanceRecord, ServiceTemplate } from '@/types';

type ViewMode = 'list' | 'timeline' | 'analytics' | 'add' | 'quick';

export default function MaintenancePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | undefined>(undefined);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vehiclesResponse, recordsResponse] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/maintenance')
      ]);

      const vehiclesData = await vehiclesResponse.json();
      const recordsData = await recordsResponse.json();

      if (vehiclesData.success) {
        setVehicles(vehiclesData.data);
      }
      if (recordsData.success) {
        setRecords(recordsData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecord = async (recordData: any) => {
    try {
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });

      const result = await response.json();

      if (result.success) {
        await fetchData(); // Refresh data
        setViewMode('timeline'); // Return to timeline view
      } else {
        console.error('Error saving record:', result.error);
        alert('Error saving record: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Error saving record. Please try again.');
    }
  };

  const renderViewModeContent = () => {
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

    switch (viewMode) {
      case 'list':
        return <MaintenanceList />;
      case 'timeline':
        return (
          <ServiceHistoryTimeline
            records={records}
            vehicles={vehicles}
            currentMileage={vehicles.length > 0 ? vehicles[0].mileage : undefined}
          />
        );
      case 'analytics':
        return <ServiceAnalytics records={records} vehicles={vehicles} />;
      case 'add':
        return (
          <ServiceRecordForm
            onSave={handleSaveRecord}
            onCancel={() => setViewMode('timeline')}
            vehicles={vehicles}
            template={selectedTemplate}
          />
        );
      case 'quick':
        return (
          <QuickServiceEntry
            vehicles={vehicles}
            onServiceSelect={(template, vehicleId) => {
              // Pre-fill the form with template data
              const vehicle = vehicles.find((v: any) => v.id === vehicleId);
              const nextServiceDate = template.intervalMonths
                ? new Date(Date.now() + template.intervalMonths * 30 * 24 * 60 * 60 * 1000)
                : null;
              const nextServiceMileage = template.intervalMiles && vehicle?.mileage
                ? vehicle.mileage + template.intervalMiles
                : null;

              setSelectedTemplate({
                ...template,
                estimatedCost: template.estimatedCost
              });
              setViewMode('add');
            }}
            onClose={() => {
              setSelectedTemplate(undefined);
              setViewMode('timeline');
            }}
          />
        );
      default:
        return <MaintenanceList />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Records</h1>
            <p className="mt-2 text-gray-600">
              Comprehensive maintenance tracking and analytics for your vehicles.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <button
              onClick={() => {
                setSelectedTemplate(undefined);
                setViewMode('quick');
              }}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Entry
            </button>
            <button
              onClick={() => {
                setSelectedTemplate(undefined);
                setViewMode('add');
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Full Form
            </button>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setViewMode('timeline')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'timeline'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Clock className="w-4 h-4 inline mr-2" />
              Timeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'list'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              List View
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-4 h-4 inline mr-2" />
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {renderViewModeContent()}
    </div>
  );
}