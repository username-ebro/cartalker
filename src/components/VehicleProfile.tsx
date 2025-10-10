'use client';

import { useState, useEffect } from 'react';
import {
  Car, AlertTriangle, Shield, DollarSign, Wrench, TrendingUp,
  Settings, MessageSquare, Calendar, Fuel, Zap, Star
} from 'lucide-react';

interface RecallInfo {
  recallNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  dateInitiated: string;
  severity: 'Low' | 'Medium' | 'High';
}

interface ComplaintInfo {
  odometer: number;
  summary: string;
  dateOfIncident: string;
  component: string;
  crashIndicator: boolean;
  fireIndicator: boolean;
}

interface SafetyRatings {
  overallRating?: number;
  frontCrashRating?: number;
  sideCrashRating?: number;
  rolloverRating?: number;
  investigationCount?: number;
}

interface FuelEconomyInfo {
  city?: number;
  highway?: number;
  combined?: number;
  fuelType?: string;
  annualFuelCost?: number;
  co2Emissions?: number;
}

interface MarketValueInfo {
  estimatedValue?: number;
  valueLow?: number;
  valueHigh?: number;
  confidence?: string;
  lastUpdated?: string;
}

interface VehicleSpecs {
  displacement?: string;
  cylinders?: number;
  horsepower?: number;
  torque?: number;
  compressionRatio?: string;
  standardFeatures?: string[];
  optionalFeatures?: string[];
}

interface MaintenanceInfo {
  mileage: number;
  description: string;
  category: 'Oil Change' | 'Filter' | 'Fluid' | 'Inspection' | 'Major Service';
  estimatedCost?: number;
}

interface VehicleData {
  vin: string;
  year?: number;
  make?: string;
  model?: string;
  trim?: string;
  engine?: string;
  transmission?: string;
  driveType?: string;
  fuelType?: string;
  bodyClass?: string;
  manufacturerName?: string;
  plantCity?: string;
  plantState?: string;
  plantCountry?: string;
  recalls?: RecallInfo[];
  complaints?: ComplaintInfo[];
  safetyRatings?: SafetyRatings;
  fuelEconomy?: FuelEconomyInfo;
  marketValue?: MarketValueInfo;
  specifications?: VehicleSpecs;
  maintenanceSchedule?: MaintenanceInfo[];
  commonIssues?: string[];
}

interface VehicleProfileProps {
  vin: string;
  nickname?: string;
  color?: string;
  mileage?: number;
}

export function VehicleProfile({ vin, nickname, color, mileage }: VehicleProfileProps) {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchVehicleData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/vin?vin=${vin}`);
        const data = await response.json();

        if (data.success) {
          setVehicleData(data.data);
        } else {
          setError(data.error || 'Failed to fetch vehicle data');
        }
      } catch (err) {
        setError('Failed to fetch vehicle data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (vin) {
      fetchVehicleData();
    }
  }, [vin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading vehicle data...</span>
      </div>
    );
  }

  if (error || !vehicleData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
          <span className="text-red-800">{error || 'Vehicle data not found'}</span>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Car },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'recalls', label: 'Recalls', icon: AlertTriangle },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'specs', label: 'Specifications', icon: Settings },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'value', label: 'Market Value', icon: DollarSign },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderStarRating = (rating?: number) => {
    if (!rating) return 'N/A';
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="bg-white shadow-lg rounded-lg">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {nickname || `${vehicleData.year} ${vehicleData.make} ${vehicleData.model}`}
            </h1>
            <p className="text-blue-100 mt-1">
              VIN: {vehicleData.vin} {color && `• Color: ${color}`} {mileage && `• ${mileage.toLocaleString()} miles`}
            </p>
          </div>
          <Car className="w-12 h-12 text-blue-200" />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="font-medium">Year:</span> {vehicleData.year}</div>
                <div><span className="font-medium">Make:</span> {vehicleData.make}</div>
                <div><span className="font-medium">Model:</span> {vehicleData.model}</div>
                <div><span className="font-medium">Trim:</span> {vehicleData.trim || 'N/A'}</div>
                <div><span className="font-medium">Engine:</span> {vehicleData.engine || 'N/A'}</div>
                <div><span className="font-medium">Transmission:</span> {vehicleData.transmission || 'N/A'}</div>
                <div><span className="font-medium">Drive Type:</span> {vehicleData.driveType || 'N/A'}</div>
                <div><span className="font-medium">Fuel Type:</span> {vehicleData.fuelType || 'N/A'}</div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                {vehicleData.safetyRatings?.overallRating && (
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Safety Rating</div>
                    <div className="text-lg font-bold">{vehicleData.safetyRatings.overallRating}/5 ⭐</div>
                  </div>
                )}
                {vehicleData.fuelEconomy?.combined && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Combined MPG</div>
                    <div className="text-lg font-bold">{vehicleData.fuelEconomy.combined}</div>
                  </div>
                )}
                {vehicleData.recalls && (
                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-sm text-red-600 font-medium">Active Recalls</div>
                    <div className="text-lg font-bold">{vehicleData.recalls.length}</div>
                  </div>
                )}
                {vehicleData.marketValue?.estimatedValue && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Est. Value</div>
                    <div className="text-lg font-bold">${vehicleData.marketValue.estimatedValue.toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'safety' && (
          <div className="space-y-6">
            {vehicleData.safetyRatings ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">NHTSA Safety Ratings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium">Overall Rating</div>
                    {renderStarRating(vehicleData.safetyRatings.overallRating)}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium">Front Crash</div>
                    {renderStarRating(vehicleData.safetyRatings.frontCrashRating)}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium">Side Crash</div>
                    {renderStarRating(vehicleData.safetyRatings.sideCrashRating)}
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="font-medium">Rollover</div>
                    {renderStarRating(vehicleData.safetyRatings.rolloverRating)}
                  </div>
                </div>
                {vehicleData.safetyRatings?.investigationCount && vehicleData.safetyRatings.investigationCount > 0 && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="font-medium text-yellow-800">
                      {vehicleData.safetyRatings.investigationCount} Active Safety Investigation(s)
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Safety ratings not available for this vehicle.</div>
            )}
          </div>
        )}

        {activeTab === 'recalls' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Recalls ({vehicleData.recalls?.length || 0})</h3>
            {vehicleData.recalls && vehicleData.recalls.length > 0 ? (
              <div className="space-y-4">
                {vehicleData.recalls.map((recall, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium">{recall.component}</div>
                      <span className={`px-2 py-1 rounded text-xs border ${getSeverityColor(recall.severity)}`}>
                        {recall.severity}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Campaign:</strong> {recall.recallNumber} | <strong>Date:</strong> {recall.dateInitiated}
                    </div>
                    <div className="text-sm mb-2">
                      <strong>Summary:</strong> {recall.summary}
                    </div>
                    <div className="text-sm mb-2">
                      <strong>Consequence:</strong> {recall.consequence}
                    </div>
                    <div className="text-sm">
                      <strong>Remedy:</strong> {recall.remedy}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-green-600 bg-green-50 p-4 rounded-lg">
                No active recalls found for this vehicle.
              </div>
            )}
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Consumer Complaints ({vehicleData.complaints?.length || 0})</h3>
            {vehicleData.complaints && vehicleData.complaints.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {vehicleData.complaints.slice(0, 20).map((complaint, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-600">
                        {complaint.dateOfIncident} | {complaint.odometer?.toLocaleString()} miles
                      </div>
                      <div className="flex space-x-2">
                        {complaint.crashIndicator && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Crash</span>
                        )}
                        {complaint.fireIndicator && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">Fire</span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm mb-2">
                      <strong>Component:</strong> {complaint.component}
                    </div>
                    <div className="text-sm">{complaint.summary}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No complaints found for this vehicle.</div>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="space-y-6">
            {vehicleData.specifications && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Engine Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {vehicleData.specifications.displacement && (
                    <div><span className="font-medium">Displacement:</span> {vehicleData.specifications.displacement}</div>
                  )}
                  {vehicleData.specifications.cylinders && (
                    <div><span className="font-medium">Cylinders:</span> {vehicleData.specifications.cylinders}</div>
                  )}
                  {vehicleData.specifications.horsepower && (
                    <div><span className="font-medium">Horsepower:</span> {vehicleData.specifications.horsepower} HP</div>
                  )}
                  {vehicleData.specifications.torque && (
                    <div><span className="font-medium">Torque:</span> {vehicleData.specifications.torque} lb-ft</div>
                  )}
                </div>

                {vehicleData.fuelEconomy && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Fuel Economy</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {vehicleData.fuelEconomy.city && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-lg font-bold">{vehicleData.fuelEconomy.city}</div>
                          <div className="text-xs text-gray-600">City MPG</div>
                        </div>
                      )}
                      {vehicleData.fuelEconomy.highway && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-lg font-bold">{vehicleData.fuelEconomy.highway}</div>
                          <div className="text-xs text-gray-600">Highway MPG</div>
                        </div>
                      )}
                      {vehicleData.fuelEconomy.combined && (
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="text-lg font-bold">{vehicleData.fuelEconomy.combined}</div>
                          <div className="text-xs text-gray-600">Combined MPG</div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {vehicleData.specifications.standardFeatures && vehicleData.specifications.standardFeatures.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Standard Features</h4>
                    <ul className="text-sm space-y-1">
                      {vehicleData.specifications.standardFeatures.map((feature, index) => (
                        <li key={index} className="text-gray-700">• {feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Maintenance Schedule</h3>
            {vehicleData.maintenanceSchedule && vehicleData.maintenanceSchedule.length > 0 ? (
              <div className="space-y-3">
                {vehicleData.maintenanceSchedule.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{item.description}</div>
                      <div className="text-sm text-gray-600">{item.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{item.mileage.toLocaleString()} mi</div>
                      {item.estimatedCost && (
                        <div className="text-sm text-gray-600">${item.estimatedCost}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500">No maintenance schedule available.</div>
            )}

            {vehicleData.commonIssues && vehicleData.commonIssues.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold mb-2">Common Issues to Watch For</h4>
                <ul className="text-sm space-y-1">
                  {vehicleData.commonIssues.map((issue, index) => (
                    <li key={index} className="text-gray-700">• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'value' && (
          <div className="space-y-6">
            {vehicleData.marketValue ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Market Value Estimate</h3>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-800">
                      ${vehicleData.marketValue.estimatedValue?.toLocaleString()}
                    </div>
                    <div className="text-blue-600 mt-1">Estimated Market Value</div>
                    <div className="text-sm text-gray-600 mt-2">
                      Range: ${vehicleData.marketValue.valueLow?.toLocaleString()} - ${vehicleData.marketValue.valueHigh?.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Confidence: {vehicleData.marketValue.confidence} | Updated: {vehicleData.marketValue.lastUpdated}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-4">
                  <p>This is an estimated value based on year, make, model, and market conditions.
                  Actual value may vary based on condition, mileage, location, and other factors.</p>
                </div>
              </div>
            ) : (
              <div className="text-gray-500">Market value estimate not available.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}