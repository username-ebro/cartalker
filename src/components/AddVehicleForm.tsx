'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, Car, AlertTriangle, Shield, DollarSign, Wrench, TrendingUp } from 'lucide-react';

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
  // Enhanced data
  recalls?: RecallInfo[];
  complaints?: ComplaintInfo[];
  safetyRatings?: SafetyRatings;
  fuelEconomy?: FuelEconomyInfo;
  marketValue?: MarketValueInfo;
  specifications?: VehicleSpecs;
  maintenanceSchedule?: MaintenanceInfo[];
  commonIssues?: string[];
}

export function AddVehicleForm() {
  const router = useRouter();
  const [vin, setVin] = useState('');
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [nickname, setNickname] = useState('');
  const [color, setColor] = useState('');
  const [mileage, setMileage] = useState('');
  const [notes, setNotes] = useState('');

  const [loadingVin, setLoadingVin] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleVinLookup = async () => {
    if (!vin || vin.length !== 17) {
      setError('Please enter a valid 17-character VIN');
      return;
    }

    setLoadingVin(true);
    setError(null);

    try {
      const response = await fetch(`/api/vin?vin=${vin}`);
      const data = await response.json();

      if (data.success) {
        setVehicleData(data.data);
        setNickname(data.data.nickname || '');
      } else {
        setError(data.error || 'Failed to decode VIN');
      }
    } catch (err) {
      setError('Failed to decode VIN. Please try again.');
    } finally {
      setLoadingVin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleData) {
      setError('Please decode the VIN first');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vin: vehicleData.vin,
          nickname,
          color,
          mileage,
          notes,
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/vehicles/${data.data.id}`);
      } else {
        setError(data.error || 'Failed to add vehicle');
      }
    } catch (err) {
      setError('Failed to add vehicle. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* VIN Input */}
        <div>
          <label htmlFor="vin" className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle Identification Number (VIN)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="vin"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              placeholder="Enter 17-character VIN"
              maxLength={17}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={submitting}
            />
            <button
              type="button"
              onClick={handleVinLookup}
              disabled={loadingVin || vin.length !== 17}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loadingVin ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            The VIN is usually found on your dashboard near the windshield or driver's side door frame.
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Vehicle Data Display */}
        {vehicleData && (
          <div className="space-y-6">
            {/* Basic Vehicle Information */}
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-center mb-2">
                <Car className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-sm font-medium text-green-800">Vehicle Found</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Make:</span> {vehicleData.make}
                </div>
                <div>
                  <span className="font-medium">Model:</span> {vehicleData.model}
                </div>
                <div>
                  <span className="font-medium">Year:</span> {vehicleData.year}
                </div>
                {vehicleData.trim && (
                  <div>
                    <span className="font-medium">Trim:</span> {vehicleData.trim}
                  </div>
                )}
                {vehicleData.engine && (
                  <div>
                    <span className="font-medium">Engine:</span> {vehicleData.engine}
                  </div>
                )}
                {vehicleData.transmission && (
                  <div>
                    <span className="font-medium">Transmission:</span> {vehicleData.transmission}
                  </div>
                )}
              </div>
            </div>

            {/* Market Value */}
            {vehicleData.marketValue && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-blue-800">Estimated Market Value</h3>
                </div>
                <div className="text-sm space-y-1">
                  <div className="text-lg font-semibold">
                    ${vehicleData.marketValue.estimatedValue?.toLocaleString()}
                  </div>
                  <div className="text-gray-600">
                    Range: ${vehicleData.marketValue.valueLow?.toLocaleString()} - ${vehicleData.marketValue.valueHigh?.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    Confidence: {vehicleData.marketValue.confidence} | Updated: {vehicleData.marketValue.lastUpdated}
                  </div>
                </div>
              </div>
            )}

            {/* Safety Ratings */}
            {vehicleData.safetyRatings && (
              <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <Shield className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-sm font-medium text-purple-800">Safety Ratings</h3>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {vehicleData.safetyRatings.overallRating && (
                    <div>
                      <span className="font-medium">Overall:</span> {vehicleData.safetyRatings.overallRating}/5 ⭐
                    </div>
                  )}
                  {vehicleData.safetyRatings.frontCrashRating && (
                    <div>
                      <span className="font-medium">Front Crash:</span> {vehicleData.safetyRatings.frontCrashRating}/5 ⭐
                    </div>
                  )}
                  {vehicleData.safetyRatings.sideCrashRating && (
                    <div>
                      <span className="font-medium">Side Crash:</span> {vehicleData.safetyRatings.sideCrashRating}/5 ⭐
                    </div>
                  )}
                  {vehicleData.safetyRatings.rolloverRating && (
                    <div>
                      <span className="font-medium">Rollover:</span> {vehicleData.safetyRatings.rolloverRating}/5 ⭐
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fuel Economy */}
            {vehicleData.fuelEconomy && (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600 mr-2" />
                  <h3 className="text-sm font-medium text-green-800">Fuel Economy</h3>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm text-center">
                  {vehicleData.fuelEconomy.city && (
                    <div>
                      <div className="font-medium text-lg">{vehicleData.fuelEconomy.city}</div>
                      <div className="text-xs text-gray-600">City MPG</div>
                    </div>
                  )}
                  {vehicleData.fuelEconomy.highway && (
                    <div>
                      <div className="font-medium text-lg">{vehicleData.fuelEconomy.highway}</div>
                      <div className="text-xs text-gray-600">Highway MPG</div>
                    </div>
                  )}
                  {vehicleData.fuelEconomy.combined && (
                    <div>
                      <div className="font-medium text-lg">{vehicleData.fuelEconomy.combined}</div>
                      <div className="text-xs text-gray-600">Combined MPG</div>
                    </div>
                  )}
                </div>
                {vehicleData.fuelEconomy.annualFuelCost && (
                  <div className="mt-2 text-sm text-center">
                    <span className="font-medium">Annual Fuel Cost:</span> ${vehicleData.fuelEconomy.annualFuelCost}
                  </div>
                )}
              </div>
            )}

            {/* Recalls */}
            {vehicleData.recalls && vehicleData.recalls.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                  <h3 className="text-sm font-medium text-red-800">
                    Active Recalls ({vehicleData.recalls.length})
                  </h3>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {vehicleData.recalls.slice(0, 3).map((recall, index) => (
                    <div key={index} className="text-xs bg-white p-2 rounded border">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{recall.component}</span>
                        <span className={`px-1 py-0.5 rounded text-xs ${
                          recall.severity === 'High' ? 'bg-red-100 text-red-800' :
                          recall.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {recall.severity}
                        </span>
                      </div>
                      <div className="text-gray-600 mt-1">{recall.summary.substring(0, 100)}...</div>
                    </div>
                  ))}
                  {vehicleData.recalls.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{vehicleData.recalls.length - 3} more recalls
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Maintenance Schedule */}
            {vehicleData.maintenanceSchedule && vehicleData.maintenanceSchedule.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <Wrench className="w-5 h-5 text-orange-600 mr-2" />
                  <h3 className="text-sm font-medium text-orange-800">
                    Upcoming Maintenance
                  </h3>
                </div>
                <div className="space-y-1 text-sm">
                  {vehicleData.maintenanceSchedule.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.description}</span>
                      <span className="text-gray-600">{item.mileage.toLocaleString()} mi</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Common Issues */}
            {vehicleData.commonIssues && vehicleData.commonIssues.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="flex items-center mb-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                  <h3 className="text-sm font-medium text-yellow-800">
                    Common Issues to Watch For
                  </h3>
                </div>
                <ul className="text-sm space-y-1">
                  {vehicleData.commonIssues.slice(0, 3).map((issue, index) => (
                    <li key={index} className="text-gray-700">• {issue}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Additional Details */}
        {vehicleData && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Additional Details</h3>

            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                Nickname (optional)
              </label>
              <input
                type="text"
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g., Daily Driver, The Beast"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-1">
                Color (optional)
              </label>
              <input
                type="text"
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="e.g., Red, Blue Metallic"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
                Current Mileage (optional)
              </label>
              <input
                type="number"
                id="mileage"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="e.g., 85000"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes about this vehicle..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        {vehicleData && (
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Adding Vehicle...
                </>
              ) : (
                'Add Vehicle'
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}