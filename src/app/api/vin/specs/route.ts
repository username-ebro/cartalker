import { NextRequest, NextResponse } from 'next/server';

interface VehicleSpecs {
  displacement?: string;
  cylinders?: number;
  horsepower?: number;
  torque?: number;
  compressionRatio?: string;
  fuelSystem?: string;
  engineConfiguration?: string;
  standardFeatures?: string[];
  optionalFeatures?: string[];
  dimensions?: {
    length?: string;
    width?: string;
    height?: string;
    wheelbase?: string;
    curbWeight?: string;
  };
  performance?: {
    acceleration0to60?: string;
    topSpeed?: string;
    quarterMile?: string;
  };
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

// NHTSA Vehicle API interfaces
interface NHTSAVariable {
  Variable: string;
  Value: string;
  ValueId: string;
}

interface NHTSAResponse {
  Count: number;
  Message: string;
  Results: NHTSAVariable[];
}

interface NHTSASafetyResponse {
  Count: number;
  Message: string;
  Results: NHTSASafety[];
}

interface NHTSASafety {
  VehicleId: number;
  OverallRating: string;
  OverallFrontCrashRating: string;
  FrontCrashDriversideRating: string;
  FrontCrashPassengersideRating: string;
  SideCrashRating: string;
  RolloverRating: string;
  SideCrashDriversideRating: string;
  SideCrashPassengersideRating: string;
  InvestigationCount: number;
}

function getStandardFeaturesByMakeModel(make: string, model: string, year: number): string[] {
  // This is a simplified example - in reality, this would come from a comprehensive database
  const featureMap: { [key: string]: string[] } = {
    'VOLKSWAGEN_GTI': [
      'Turbocharged Engine',
      'Manual or DSG Automatic Transmission',
      'Sport Suspension',
      'Performance Tires',
      'Disc Brakes (All Wheels)',
      'Electronic Stability Control',
      'Anti-lock Braking System',
      'Traction Control',
      'Air Conditioning',
      'Power Windows',
      'Power Locks',
      'Cruise Control',
    ],
    'JEEP_WRANGLER': [
      'Four-Wheel Drive',
      'Removable Doors and Roof',
      'Skid Plates',
      'Tow Hooks',
      'Rock Rails',
      'Hill Start Assist',
      'Electronic Stability Control',
      'Roll Cage',
      'Manual or Automatic Transmission',
      'Air Conditioning',
    ],
  };

  const key = `${make.toUpperCase()}_${model.toUpperCase()}`;
  return featureMap[key] || [
    'Air Conditioning',
    'Power Windows',
    'Power Locks',
    'Cruise Control',
    'Electronic Stability Control',
    'Anti-lock Braking System',
    'Airbags (Multiple)',
  ];
}

function getOptionalFeatures(make: string, model: string, year: number): string[] {
  // This would also come from a database in a real implementation
  const optionsMap: { [key: string]: string[] } = {
    'VOLKSWAGEN_GTI': [
      'Sunroof/Moonroof',
      'Leather Seats',
      'Premium Audio System',
      'Navigation System',
      'Adaptive Cruise Control',
      'Blind Spot Monitoring',
      'Performance Package',
    ],
    'JEEP_WRANGLER': [
      'Hard Top',
      'Soft Top',
      'Premium Audio',
      'Navigation',
      'Heated Seats',
      'LED Lighting Package',
      'Off-Road Package',
      'Rubicon Package',
    ],
  };

  const key = `${make.toUpperCase()}_${model.toUpperCase()}`;
  return optionsMap[key] || [
    'Sunroof',
    'Leather Interior',
    'Premium Audio',
    'Navigation System',
    'Heated Seats',
    'Backup Camera',
  ];
}

async function fetchNHTSASafetyRatings(make: string, model: string, year: number): Promise<SafetyRatings | undefined> {
  try {
    const response = await fetch(
      `https://api.nhtsa.gov/SafetyRatings/modelyear/${year}/make/${encodeURIComponent(make)}/model/${encodeURIComponent(model)}`,
      {
        headers: { 'User-Agent': 'CarTalker/1.0' },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) return undefined;

    const data: NHTSASafetyResponse = await response.json();

    if (!data.Results || data.Results.length === 0) return undefined;

    const safety = data.Results[0];
    return {
      overallRating: parseInt(safety.OverallRating) || undefined,
      frontCrashRating: parseInt(safety.OverallFrontCrashRating) || undefined,
      sideCrashRating: parseInt(safety.SideCrashRating) || undefined,
      rolloverRating: parseInt(safety.RolloverRating) || undefined,
      investigationCount: safety.InvestigationCount || 0,
    };
  } catch (error) {
    console.error('NHTSA Safety Ratings API error:', error);
    return undefined;
  }
}

async function fetchVehicleSpecs(vin: string): Promise<VehicleSpecs> {
  try {
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`,
      {
        headers: { 'User-Agent': 'CarTalker/1.0' },
      }
    );

    if (!response.ok) {
      throw new Error(`NHTSA Vehicle API error: ${response.status}`);
    }

    const data: NHTSAResponse = await response.json();

    if (data.Count === 0 || !data.Results || data.Results.length === 0) {
      throw new Error('No vehicle data found');
    }

    // Helper function to get value by variable name
    const getValue = (variable: string): string => {
      const item = data.Results.find(r => r.Variable === variable);
      return item?.Value || '';
    };

    const make = getValue('Make');
    const model = getValue('Model');
    const year = getValue('Model Year') ? parseInt(getValue('Model Year')) : 0;

    return {
      displacement: getValue('Displacement (L)') ? `${getValue('Displacement (L)')}L` : undefined,
      cylinders: getValue('Engine Number of Cylinders') ? parseInt(getValue('Engine Number of Cylinders')) : undefined,
      horsepower: getValue('Engine Power (kW)') ? parseInt(getValue('Engine Power (kW)')) : undefined,
      compressionRatio: getValue('Compression Ratio') || undefined,
      fuelSystem: getValue('Fuel Injection Type') || undefined,
      engineConfiguration: getValue('Engine Configuration') || undefined,
      standardFeatures: getStandardFeaturesByMakeModel(make, model, year),
      optionalFeatures: getOptionalFeatures(make, model, year),
      dimensions: {
        length: getValue('Overall Length (mm)') || undefined,
        width: getValue('Overall Width (mm)') || undefined,
        height: getValue('Overall Height (mm)') || undefined,
        wheelbase: getValue('Wheelbase (mm)') || undefined,
        curbWeight: getValue('Curb Weight (kg)') ? `${getValue('Curb Weight (kg)')} kg` : undefined,
      },
      // Performance data would typically come from a specialized database
      performance: {
        acceleration0to60: undefined, // Would need external data source
        topSpeed: undefined, // Would need external data source
        quarterMile: undefined, // Would need external data source
      },
    };
  } catch (error) {
    console.error('Error fetching vehicle specs:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const vin = searchParams.get('vin');

  if (!vin) {
    return NextResponse.json(
      { success: false, error: 'VIN parameter is required' },
      { status: 400 }
    );
  }

  // Validate VIN format
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  if (!vinRegex.test(vin)) {
    return NextResponse.json(
      { success: false, error: 'Invalid VIN format' },
      { status: 400 }
    );
  }

  try {
    // Fetch vehicle specifications
    const specs = await fetchVehicleSpecs(vin);

    // Also get basic vehicle info for safety ratings
    const basicResponse = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`,
      {
        headers: { 'User-Agent': 'CarTalker/1.0' },
      }
    );

    let safetyRatings: SafetyRatings | undefined;

    if (basicResponse.ok) {
      const basicData: NHTSAResponse = await basicResponse.json();
      if (basicData.Results && basicData.Results.length > 0) {
        const getValue = (variable: string): string => {
          const item = basicData.Results.find(r => r.Variable === variable);
          return item?.Value || '';
        };

        const make = getValue('Make');
        const model = getValue('Model');
        const year = getValue('Model Year') ? parseInt(getValue('Model Year')) : 0;

        if (make && model && year) {
          safetyRatings = await fetchNHTSASafetyRatings(make, model, year);
        }
      }
    }

    const responseData = {
      vin: vin.toUpperCase(),
      specifications: specs,
      safetyRatings,
    };

    // Filter out undefined values
    const cleanedData = JSON.parse(JSON.stringify(responseData, (key, value) => {
      if (value === undefined || value === null) return undefined;
      if (Array.isArray(value) && value.length === 0) return undefined;
      if (typeof value === 'object' && Object.keys(value).length === 0) return undefined;
      return value;
    }));

    return NextResponse.json({
      success: true,
      data: cleanedData,
    });

  } catch (error) {
    console.error('Vehicle specs error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch vehicle specifications. Please try again later.'
      },
      { status: 500 }
    );
  }
}