'use client';

import { useState, useEffect } from 'react';
import { Calendar, Car, DollarSign, FileText, MapPin, Phone, Upload, Clock, AlertCircle } from 'lucide-react';
import { ServiceTemplate, Vehicle } from '@/types';

interface ServiceRecordFormProps {
  onSave: (record: any) => void;
  onCancel: () => void;
  vehicles: Vehicle[];
  initialData?: any;
  template?: ServiceTemplate;
}

const SERVICE_TEMPLATES: ServiceTemplate[] = [
  {
    id: 'oil_change',
    name: 'Oil Change',
    type: 'OIL_CHANGE',
    category: 'ENGINE',
    description: 'Engine oil and filter replacement',
    estimatedCost: 45,
    estimatedTime: '30 min',
    intervalMiles: 5000,
    intervalMonths: 6,
    commonDetails: {
      oilType: 'Full Synthetic',
      oilViscosity: '5W-30',
      filterBrand: '',
      oilAmount: '5 quarts'
    }
  },
  {
    id: 'tire_rotation',
    name: 'Tire Rotation',
    type: 'TIRE_ROTATION',
    category: 'TIRES',
    description: 'Rotate tires to ensure even wear',
    estimatedCost: 25,
    estimatedTime: '20 min',
    intervalMiles: 7500,
    intervalMonths: 6,
    commonDetails: {
      pattern: 'Front to back',
      pressureCheck: true,
      treadDepth: ''
    }
  },
  {
    id: 'brake_pads',
    name: 'Brake Pad Replacement',
    type: 'BRAKE_PADS',
    category: 'BRAKES',
    description: 'Replace brake pads',
    estimatedCost: 200,
    estimatedTime: '60 min',
    intervalMiles: 25000,
    commonDetails: {
      position: 'Front',
      brand: '',
      rotorCondition: 'Good',
      fluidLevel: 'Good'
    }
  },
  {
    id: 'inspection',
    name: 'Annual Inspection',
    type: 'INSPECTION',
    category: 'INSPECTION',
    description: 'State vehicle inspection',
    estimatedCost: 35,
    estimatedTime: '15 min',
    intervalMonths: 12,
    commonDetails: {
      inspectionType: 'Safety & Emissions',
      certificateNumber: '',
      expirationDate: ''
    }
  }
];

export function ServiceRecordForm({ onSave, onCancel, vehicles, initialData, template }: ServiceRecordFormProps) {
  const [formData, setFormData] = useState({
    vehicleId: initialData?.vehicleId || '',
    type: template?.type || initialData?.type || '',
    category: template?.category || initialData?.category || '',
    title: template?.name || initialData?.title || '',
    description: template?.description || initialData?.description || '',

    // Cost details
    totalCost: template?.estimatedCost?.toString() || initialData?.totalCost?.toString() || '',
    partsCost: initialData?.partsCost?.toString() || '',
    laborCost: initialData?.laborCost?.toString() || '',

    // Service details
    mileage: initialData?.mileage?.toString() || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    nextServiceDue: initialData?.nextServiceDue ? new Date(initialData.nextServiceDue).toISOString().split('T')[0] : '',
    nextServiceMileage: initialData?.nextServiceMileage?.toString() || '',

    // Service provider
    serviceBy: initialData?.serviceBy || '',
    shopAddress: initialData?.shopAddress || '',
    shopPhone: initialData?.shopPhone || '',

    // Service specifics
    serviceDetails: initialData?.serviceDetails || (template?.commonDetails ? JSON.stringify(template.commonDetails, null, 2) : '{}'),

    // Documentation
    notes: initialData?.notes || '',
    warrantyInfo: initialData?.warrantyInfo || '',
  });

  const [selectedTemplate, setSelectedTemplate] = useState<ServiceTemplate | null>(template || null);
  const [isCustom, setIsCustom] = useState(!template);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-calculate next service dates
  useEffect(() => {
    if (selectedTemplate && formData.mileage && formData.date) {
      const currentMileage = parseInt(formData.mileage);
      const serviceDate = new Date(formData.date);

      if (selectedTemplate.intervalMiles) {
        setFormData(prev => ({
          ...prev,
          nextServiceMileage: (currentMileage + selectedTemplate.intervalMiles!).toString()
        }));
      }

      if (selectedTemplate.intervalMonths) {
        const nextDate = new Date(serviceDate);
        nextDate.setMonth(nextDate.getMonth() + selectedTemplate.intervalMonths);
        setFormData(prev => ({
          ...prev,
          nextServiceDue: nextDate.toISOString().split('T')[0]
        }));
      }
    }
  }, [selectedTemplate, formData.mileage, formData.date]);

  const handleTemplateSelect = (template: ServiceTemplate) => {
    setSelectedTemplate(template);
    setIsCustom(false);
    setFormData(prev => ({
      ...prev,
      type: template.type,
      category: template.category,
      title: template.name,
      description: template.description,
      totalCost: template.estimatedCost.toString(),
      serviceDetails: JSON.stringify(template.commonDetails, null, 2)
    }));
  };

  const handleCustomService = () => {
    setSelectedTemplate(null);
    setIsCustom(true);
    setFormData(prev => ({
      ...prev,
      type: '',
      category: '',
      title: '',
      description: '',
      totalCost: '',
      serviceDetails: '{}'
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.vehicleId) newErrors.vehicleId = 'Vehicle is required';
    if (!formData.title) newErrors.title = 'Service title is required';
    if (!formData.type) newErrors.type = 'Service type is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';

    try {
      if (formData.serviceDetails) {
        JSON.parse(formData.serviceDetails);
      }
    } catch (e) {
      newErrors.serviceDetails = 'Service details must be valid JSON';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const serviceDetails = formData.serviceDetails ? JSON.parse(formData.serviceDetails) : {};

    const record = {
      ...formData,
      totalCost: formData.totalCost ? parseFloat(formData.totalCost) : undefined,
      partsCost: formData.partsCost ? parseFloat(formData.partsCost) : undefined,
      laborCost: formData.laborCost ? parseFloat(formData.laborCost) : undefined,
      mileage: formData.mileage ? parseInt(formData.mileage) : undefined,
      nextServiceMileage: formData.nextServiceMileage ? parseInt(formData.nextServiceMileage) : undefined,
      serviceDetails: JSON.stringify(serviceDetails),
    };

    onSave(record);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {initialData ? 'Edit Service Record' : 'Add Service Record'}
        </h2>
        <p className="text-gray-600">
          Record detailed maintenance and service information for your vehicle.
        </p>
      </div>

      {/* Quick Templates */}
      {!initialData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {SERVICE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template)}
                className={`p-3 text-left border rounded-lg hover:bg-blue-50 transition-colors ${
                  selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
              >
                <div className="font-medium text-gray-900">{template.name}</div>
                <div className="text-sm text-gray-600">${template.estimatedCost}</div>
              </button>
            ))}
          </div>
          <button
            onClick={handleCustomService}
            className={`px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors ${
              isCustom ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
            }`}
          >
            Custom Service
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Car className="w-4 h-4 inline mr-1" />
              Vehicle
            </label>
            <select
              value={formData.vehicleId}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicleId: e.target.value }))}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.vehicleId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.nickname || `${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                </option>
              ))}
            </select>
            {errors.vehicleId && <p className="text-red-500 text-sm mt-1">{errors.vehicleId}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Service Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.date ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
          </div>
        </div>

        {/* Service Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Oil Change, Brake Pad Replacement"
              className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mileage</label>
            <input
              type="number"
              value={formData.mileage}
              onChange={(e) => setFormData(prev => ({ ...prev, mileage: e.target.value }))}
              placeholder="Current mileage"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Detailed description of the service performed"
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Cost Breakdown */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            <DollarSign className="w-5 h-5 inline mr-1" />
            Cost Breakdown
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.totalCost}
                onChange={(e) => setFormData(prev => ({ ...prev, totalCost: e.target.value }))}
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parts Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.partsCost}
                onChange={(e) => setFormData(prev => ({ ...prev, partsCost: e.target.value }))}
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Labor Cost</label>
              <input
                type="number"
                step="0.01"
                value={formData.laborCost}
                onChange={(e) => setFormData(prev => ({ ...prev, laborCost: e.target.value }))}
                placeholder="0.00"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Service Provider */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            <MapPin className="w-5 h-5 inline mr-1" />
            Service Provider
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shop/Mechanic Name</label>
              <input
                type="text"
                value={formData.serviceBy}
                onChange={(e) => setFormData(prev => ({ ...prev, serviceBy: e.target.value }))}
                placeholder="e.g., Joe's Auto Shop, DIY"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Address
              </label>
              <input
                type="text"
                value={formData.shopAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, shopAddress: e.target.value }))}
                placeholder="Shop address"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone
              </label>
              <input
                type="tel"
                value={formData.shopPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, shopPhone: e.target.value }))}
                placeholder="(555) 123-4567"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Next Service Reminder */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            <Clock className="w-5 h-5 inline mr-1" />
            Next Service Reminder
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={formData.nextServiceDue}
                onChange={(e) => setFormData(prev => ({ ...prev, nextServiceDue: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Mileage</label>
              <input
                type="number"
                value={formData.nextServiceMileage}
                onChange={(e) => setFormData(prev => ({ ...prev, nextServiceMileage: e.target.value }))}
                placeholder="Mileage when next service is due"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Service-Specific Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            <FileText className="w-5 h-5 inline mr-1" />
            Service-Specific Details
          </h3>
          <textarea
            value={formData.serviceDetails}
            onChange={(e) => setFormData(prev => ({ ...prev, serviceDetails: e.target.value }))}
            placeholder="JSON format for service-specific data (e.g., oil type, filter brand, tire pressure)"
            rows={6}
            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
              errors.serviceDetails ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.serviceDetails && <p className="text-red-500 text-sm mt-1">{errors.serviceDetails}</p>}
          <p className="text-gray-500 text-sm mt-1">
            Use JSON format to store specific details like oil type, part numbers, etc.
          </p>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes or observations"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Warranty Information
            </label>
            <textarea
              value={formData.warrantyInfo}
              onChange={(e) => setFormData(prev => ({ ...prev, warrantyInfo: e.target.value }))}
              placeholder="Warranty details, expiration dates, terms"
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {initialData ? 'Update Record' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}