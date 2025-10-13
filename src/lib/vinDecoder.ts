// Shared VIN decoding logic that can be used by multiple routes
import { VinDecodeResponse } from '@/app/api/vin/route';

export async function decodeVIN(vin: string): Promise<VinDecodeResponse> {
  // Validate VIN format (17 characters, alphanumeric except I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  if (!vinRegex.test(vin)) {
    return {
      success: false,
      error: 'Invalid VIN format'
    };
  }

  try {
    // Fetch basic vehicle data from NHTSA
    const response = await fetch(
      `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`,
      {
        headers: { 'User-Agent': 'CarTalker/1.0' },
      }
    );

    if (!response.ok) {
      throw new Error(`NHTSA Vehicle API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.Count === 0 || !data.Results || data.Results.length === 0) {
      return {
        success: false,
        error: 'No data found for this VIN'
      };
    }

    const result = data.Results[0];

    // Extract basic vehicle information
    const year = result.ModelYear ? parseInt(result.ModelYear) : undefined;
    const make = result.Make || '';
    const model = result.Model || '';

    // Map NHTSA response to our basic format
    const vehicleData = {
      vin: vin.toUpperCase(),
      year,
      make,
      model,
      trim: result.Trim || undefined,
      engine: result.EngineModel ? `${result.EngineModel} ${result.DisplacementL || ''}L`.trim() : undefined,
      transmission: result.TransmissionStyle || undefined,
      driveType: result.DriveType || undefined,
      fuelType: result.FuelTypePrimary || undefined,
      bodyClass: result.BodyClass || undefined,
      manufacturerName: result.Manufacturer || undefined,
      plantCity: result.PlantCity || undefined,
      plantState: result.PlantState || undefined,
      plantCountry: result.PlantCountry || undefined,
    };

    return {
      success: true,
      data: vehicleData
    };

  } catch (error) {
    console.error('VIN decode error:', error);
    return {
      success: false,
      error: 'Failed to decode VIN. Please try again later.'
    };
  }
}
