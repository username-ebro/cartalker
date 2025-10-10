'use client';

import { useState } from 'react';
import { Wrench, Clock, DollarSign, Car } from 'lucide-react';

interface QuickServiceTemplate {
  id: string;
  name: string;
  icon: string;
  type: string;
  category: string;
  description: string;
  estimatedCost: number;
  estimatedTime: string;
  commonDetails: any;
  intervalMiles?: number;
  intervalMonths?: number;
}

interface Vehicle {
  id: string;
  nickname?: string;
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
}

interface QuickServiceEntryProps {
  vehicles: Vehicle[];
  onServiceSelect: (template: QuickServiceTemplate, vehicleId: string) => void;
  onClose: () => void;
}

const QUICK_TEMPLATES: QuickServiceTemplate[] = [
  {
    id: 'oil_change',
    name: 'Oil Change',
    icon: '🛢️',
    type: 'OIL_CHANGE',
    category: 'ENGINE',
    description: 'Quick oil and filter change',
    estimatedCost: 45,
    estimatedTime: '30 min',
    intervalMiles: 5000,
    intervalMonths: 6,
    commonDetails: {
      oilType: 'Full Synthetic',
      oilViscosity: '5W-30',
      oilAmount: '5 quarts',
      filterIncluded: true
    }
  },
  {
    id: 'tire_rotation',
    name: 'Tire Rotation',
    icon: '🔄',
    type: 'TIRE_ROTATION',
    category: 'TIRES',
    description: 'Rotate tires for even wear',
    estimatedCost: 25,
    estimatedTime: '20 min',
    intervalMiles: 7500,
    intervalMonths: 6,
    commonDetails: {
      pattern: 'Front to back',
      pressureCheck: true,
      balanceCheck: false
    }
  },
  {
    id: 'air_filter',
    name: 'Air Filter',
    icon: '🌬️',
    type: 'AIR_FILTER',
    category: 'FILTERS',
    description: 'Replace engine air filter',
    estimatedCost: 35,
    estimatedTime: '15 min',
    intervalMiles: 15000,
    intervalMonths: 12,
    commonDetails: {
      filterType: 'Paper',
      location: 'Engine bay',
      difficulty: 'Easy'
    }
  },
  {
    id: 'cabin_filter',
    name: 'Cabin Filter',
    icon: '🍃',
    type: 'CABIN_FILTER',
    category: 'FILTERS',
    description: 'Replace cabin air filter',
    estimatedCost: 30,
    estimatedTime: '10 min',
    intervalMiles: 20000,
    intervalMonths: 12,
    commonDetails: {
      filterType: 'Activated carbon',
      location: 'Behind glove box',
      difficulty: 'Easy'
    }
  },
  {
    id: 'brake_inspection',
    name: 'Brake Check',
    icon: '🛑',
    type: 'BRAKE_INSPECTION',
    category: 'BRAKES',
    description: 'Visual brake inspection',
    estimatedCost: 0,
    estimatedTime: '15 min',
    intervalMiles: 10000,
    intervalMonths: 6,
    commonDetails: {
      inspectionType: 'Visual',
      componentsChecked: ['pads', 'rotors', 'fluid'],
      recommendationsGiven: false
    }
  },
  {
    id: 'battery_test',
    name: 'Battery Test',
    icon: '🔋',
    type: 'BATTERY',
    category: 'ELECTRICAL',
    description: 'Test battery health',
    estimatedCost: 0,
    estimatedTime: '10 min',
    intervalMonths: 6,
    commonDetails: {
      testType: 'Load test',
      voltage: null,
      coldCrankingAmps: null,
      condition: 'Good'
    }
  },
  {
    id: 'fluid_check',
    name: 'Fluid Top-Off',
    icon: '💧',
    type: 'OTHER',
    category: 'FLUIDS',
    description: 'Check and top off all fluids',
    estimatedCost: 15,
    estimatedTime: '20 min',
    intervalMiles: 5000,
    intervalMonths: 3,
    commonDetails: {
      fluidsChecked: ['engine oil', 'coolant', 'brake', 'power steering', 'windshield washer'],
      levelsGood: true,
      leaksFound: false
    }
  },
  {
    id: 'car_wash',
    name: 'Car Wash',
    icon: '🧽',
    type: 'OTHER',
    category: 'OTHER',
    description: 'Wash and detail vehicle',
    estimatedCost: 20,
    estimatedTime: '45 min',
    intervalMonths: 1,
    commonDetails: {
      washType: 'Hand wash',
      waxApplied: false,
      interiorCleaned: true
    }
  }
];

export function QuickServiceEntry({ vehicles, onServiceSelect, onClose }: QuickServiceEntryProps) {
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<QuickServiceTemplate | null>(null);

  const handleTemplateClick = (template: QuickServiceTemplate) => {
    if (!selectedVehicle) {
      alert('Please select a vehicle first');
      return;
    }
    setSelectedTemplate(template);
  };

  const handleConfirmService = () => {
    if (selectedTemplate && selectedVehicle) {
      onServiceSelect(selectedTemplate, selectedVehicle);
    }
  };

  const getNextServiceDate = (template: QuickServiceTemplate) => {
    if (!template.intervalMonths) return null;
    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + template.intervalMonths);
    return nextDate;
  };

  const getNextServiceMileage = (template: QuickServiceTemplate, currentMileage?: number) => {
    if (!template.intervalMiles || !currentMileage) return null;
    return currentMileage + template.intervalMiles;
  };

  const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Quick Service Entry</h2>
              <p className="text-gray-600 mt-1">Select a common service to quickly add a record</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Vehicle Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Car className="w-4 h-4 inline mr-1" />
              Select Vehicle
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a vehicle...</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  {vehicle.mileage && ` (${vehicle.mileage.toLocaleString()} miles)`}
                </option>
              ))}
            </select>
          </div>

          {/* Service Templates Grid */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Services</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {QUICK_TEMPLATES.map((template) => {
                const isSelected = selectedTemplate?.id === template.id;
                return (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className={`p-4 border rounded-lg text-left hover:shadow-md transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${!selectedVehicle ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={!selectedVehicle}
                  >
                    <div className="text-2xl mb-2">{template.icon}</div>
                    <div className="font-semibold text-gray-900 mb-1">{template.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{template.description}</div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center">
                        <DollarSign className="w-3 h-3 mr-1" />
                        ${template.estimatedCost}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {template.estimatedTime}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Preview */}
          {selectedTemplate && selectedVehicleData && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Service Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="text-gray-900">{selectedTemplate.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="text-gray-900">{selectedTemplate.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Cost:</span>
                      <span className="text-gray-900">${selectedTemplate.estimatedCost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Time:</span>
                      <span className="text-gray-900">{selectedTemplate.estimatedTime}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Next Service Due</h4>
                  <div className="space-y-2 text-sm">
                    {selectedTemplate.intervalMonths && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="text-gray-900">
                          {getNextServiceDate(selectedTemplate)?.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {selectedTemplate.intervalMiles && selectedVehicleData.mileage && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Mileage:</span>
                        <span className="text-gray-900">
                          {getNextServiceMileage(selectedTemplate, selectedVehicleData.mileage)?.toLocaleString()} miles
                        </span>
                      </div>
                    )}
                    {!selectedTemplate.intervalMonths && !selectedTemplate.intervalMiles && (
                      <div className="text-gray-500">No scheduled interval</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Common Details Preview */}
              {Object.keys(selectedTemplate.commonDetails).length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Typical Service Details</h4>
                  <div className="bg-white rounded p-3 font-mono text-xs text-gray-600">
                    {JSON.stringify(selectedTemplate.commonDetails, null, 2)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="border-t border-gray-200 p-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmService}
            disabled={!selectedTemplate || !selectedVehicle}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Continue with Full Form
          </button>
        </div>
      </div>
    </div>
  );
}