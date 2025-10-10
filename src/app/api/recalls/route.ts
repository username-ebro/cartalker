import { NextRequest, NextResponse } from 'next/server';
import cache, { CACHE_DURATION } from '@/utils/cache';

/**
 * NHTSA Recall API Integration for CarTalker
 *
 * This route accepts a VIN and returns comprehensive recall information
 * from the National Highway Traffic Safety Administration (NHTSA).
 *
 * Features:
 * - VIN validation
 * - 24-hour caching to reduce API load
 * - Comprehensive error handling
 * - Safety severity classification
 * - Clean, structured JSON response
 */

// ========================================
// TypeScript Interfaces
// ========================================

interface NHTSAVinDecodeResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NHTSAVehicleResult[];
}

interface NHTSAVehicleResult {
  ModelYear?: string;
  Make?: string;
  Model?: string;
  Trim?: string;
  ErrorCode?: string;
  ErrorText?: string;
  [key: string]: any;
}

interface NHTSARecallResponse {
  count?: number;
  Count?: number;
  message?: string;
  Message?: string;
  results?: NHTSARecall[];
  Results?: NHTSARecall[];
}

interface NHTSARecall {
  Manufacturer: string;
  NHTSACampaignNumber: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  ReportReceivedDate: string;
  parkIt?: string;
  parkOutSide?: string;
}

interface RecallInfo {
  recallId: string;
  componentAffected: string;
  description: string;
  safetyRisk: string;
  severityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  remedyAvailable: string;
  dateInitiated: string;
  manufacturer: string;
  parkVehicle?: boolean;
  parkOutside?: boolean;
}

interface RecallAPIResponse {
  success: boolean;
  data?: {
    vin: string;
    vehicle: {
      year: number;
      make: string;
      model: string;
      trim?: string;
    };
    recallCount: number;
    lastChecked: string;
    recalls: RecallInfo[];
    dataSource: string;
    cacheStatus: 'hit' | 'miss';
  };
  error?: string;
  details?: string;
}

// ========================================
// Helper Functions
// ========================================

/**
 * Validates VIN format
 * Valid VIN: 17 characters, alphanumeric, excludes I, O, Q
 */
function validateVIN(vin: string): { valid: boolean; error?: string } {
  if (!vin || typeof vin !== 'string') {
    return { valid: false, error: 'VIN is required' };
  }

  const trimmedVin = vin.trim().toUpperCase();

  // Must be exactly 17 characters
  if (trimmedVin.length !== 17) {
    return {
      valid: false,
      error: `Invalid VIN length: ${trimmedVin.length} characters (must be 17)`
    };
  }

  // Must only contain valid characters (A-Z, 0-9, excluding I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/;
  if (!vinRegex.test(trimmedVin)) {
    return {
      valid: false,
      error: 'Invalid VIN format: must be alphanumeric (excluding I, O, Q)'
    };
  }

  return { valid: true };
}

/**
 * Determines safety severity based on consequence description
 * Uses keyword analysis to classify risk level
 */
function determineSeverity(consequence: string, parkIt?: string, parkOutside?: string): RecallInfo['severityLevel'] {
  const consequenceLower = consequence.toLowerCase();

  // Critical keywords (immediate safety concern)
  const criticalKeywords = [
    'death', 'fatal', 'fatality', 'die',
    'park outside', 'do not drive', 'stop driving',
    'explosion', 'rollaway'
  ];

  // High severity keywords (serious safety risk)
  const highSeverityKeywords = [
    'crash', 'fire', 'injury', 'injured', 'hurt',
    'brake', 'braking', 'steering', 'steer',
    'airbag', 'air bag', 'seatbelt', 'seat belt',
    'fuel leak', 'gas leak', 'leaking fuel',
    'loss of control', 'sudden', 'acceleration',
    'deceleration', 'collision', 'burn', 'smoke'
  ];

  // Low severity keywords (minor inconvenience)
  const lowSeverityKeywords = [
    'warning light', 'indicator', 'display',
    'noise', 'vibration', 'cosmetic', 'label',
    'minor', 'slight', 'small', 'comfort'
  ];

  // Check for park-related warnings
  if (parkIt === 'Y' || parkOutside === 'Y') {
    return 'Critical';
  }

  // Check critical keywords
  if (criticalKeywords.some(keyword => consequenceLower.includes(keyword))) {
    return 'Critical';
  }

  // Check high severity keywords
  if (highSeverityKeywords.some(keyword => consequenceLower.includes(keyword))) {
    return 'High';
  }

  // Check low severity keywords
  if (lowSeverityKeywords.some(keyword => consequenceLower.includes(keyword))) {
    return 'Low';
  }

  // Default to medium if no keywords match
  return 'Medium';
}

/**
 * Normalizes model name for better NHTSA API compatibility
 * Removes trim levels and extra details
 */
function normalizeModelName(model: string): string {
  // Handle common model name variations
  const modelMapping: { [key: string]: string } = {
    'golf gti': 'Golf',
    'wrangler': 'Wrangler',
    'f-150': 'F-150',
    'f-250': 'F-250',
    'f-350': 'F-350',
  };

  const modelLower = model.toLowerCase();

  // Check if we have a specific mapping
  for (const [key, value] of Object.entries(modelMapping)) {
    if (modelLower.includes(key)) {
      return value;
    }
  }

  // General normalization - take first word before separators
  const normalized = model.split(/[\s\-\,]/)[0];
  return normalized;
}

/**
 * Fetches vehicle information from NHTSA VIN decoder
 */
async function fetchVehicleInfo(vin: string): Promise<{
  year: number;
  make: string;
  model: string;
  trim?: string;
}> {
  const response = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`,
    {
      headers: {
        'User-Agent': 'CarTalker/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    }
  );

  if (!response.ok) {
    throw new Error(`NHTSA VIN Decoder API returned status ${response.status}`);
  }

  const data: NHTSAVinDecodeResponse = await response.json();

  if (data.Count === 0 || !data.Results || data.Results.length === 0) {
    throw new Error('No vehicle data found for this VIN');
  }

  const result = data.Results[0];

  // Check for NHTSA error codes
  if (result.ErrorCode && result.ErrorCode !== '0') {
    throw new Error(result.ErrorText || 'NHTSA decoder error');
  }

  if (!result.Make || !result.Model || !result.ModelYear) {
    throw new Error('Incomplete vehicle data from NHTSA');
  }

  return {
    year: parseInt(result.ModelYear),
    make: result.Make,
    model: result.Model,
    trim: result.Trim || undefined,
  };
}

/**
 * Fetches recall data from NHTSA Recalls API
 */
async function fetchRecallData(
  make: string,
  model: string,
  year: number
): Promise<NHTSARecall[]> {
  const normalizedModel = normalizeModelName(model);

  const response = await fetch(
    `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(normalizedModel)}&modelYear=${year}`,
    {
      headers: {
        'User-Agent': 'CarTalker/1.0',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    }
  );

  if (!response.ok) {
    throw new Error(`NHTSA Recalls API returned status ${response.status}`);
  }

  const data: NHTSARecallResponse = await response.json();

  // Handle both lowercase and uppercase property names
  const results = data.results || data.Results || [];

  return results;
}

/**
 * Transforms NHTSA recall data into clean RecallInfo format
 */
function transformRecallData(recalls: NHTSARecall[]): RecallInfo[] {
  return recalls.map(recall => ({
    recallId: recall.NHTSACampaignNumber || 'Unknown',
    componentAffected: recall.Component || 'Not specified',
    description: recall.Summary || 'No description available',
    safetyRisk: recall.Consequence || 'No consequence information available',
    severityLevel: determineSeverity(
      recall.Consequence || '',
      recall.parkIt,
      recall.parkOutSide
    ),
    remedyAvailable: recall.Remedy || 'Contact dealer for information',
    dateInitiated: recall.ReportReceivedDate || 'Unknown',
    manufacturer: recall.Manufacturer || 'Unknown',
    parkVehicle: recall.parkIt === 'Y',
    parkOutside: recall.parkOutSide === 'Y',
  }));
}

// ========================================
// API Route Handler
// ========================================

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Extract VIN from query parameters
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get('vin');

    // Validate VIN
    if (!vin) {
      return NextResponse.json<RecallAPIResponse>(
        {
          success: false,
          error: 'VIN parameter is required',
          details: 'Usage: /api/recalls?vin=YOUR_VIN_HERE'
        },
        { status: 400 }
      );
    }

    const validation = validateVIN(vin);
    if (!validation.valid) {
      return NextResponse.json<RecallAPIResponse>(
        {
          success: false,
          error: validation.error,
          details: 'VIN must be 17 characters, alphanumeric (excluding I, O, Q)'
        },
        { status: 400 }
      );
    }

    const normalizedVin = vin.trim().toUpperCase();
    const cacheKey = `recalls:${normalizedVin}`;

    // Check cache first (24-hour TTL)
    const cachedData = cache.get<RecallAPIResponse['data']>(cacheKey);
    if (cachedData) {
      console.log(`[Recalls API] Cache hit for VIN: ${normalizedVin}`);
      return NextResponse.json<RecallAPIResponse>(
        {
          success: true,
          data: {
            ...cachedData,
            cacheStatus: 'hit',
          },
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, max-age=86400', // 24 hours
            'X-Cache-Status': 'HIT',
          }
        }
      );
    }

    console.log(`[Recalls API] Cache miss for VIN: ${normalizedVin}`);

    // Fetch vehicle information from VIN
    const vehicleInfo = await fetchVehicleInfo(normalizedVin);

    // Fetch recall data
    const recallData = await fetchRecallData(
      vehicleInfo.make,
      vehicleInfo.model,
      vehicleInfo.year
    );

    // Transform recall data
    const recalls = transformRecallData(recallData);

    // Sort recalls by severity (Critical > High > Medium > Low) and date
    recalls.sort((a, b) => {
      const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      const severityDiff = severityOrder[b.severityLevel] - severityOrder[a.severityLevel];

      if (severityDiff !== 0) return severityDiff;

      // If same severity, sort by date (newest first)
      return new Date(b.dateInitiated).getTime() - new Date(a.dateInitiated).getTime();
    });

    const responseData: RecallAPIResponse['data'] = {
      vin: normalizedVin,
      vehicle: vehicleInfo,
      recallCount: recalls.length,
      lastChecked: new Date().toISOString(),
      recalls: recalls,
      dataSource: 'NHTSA (National Highway Traffic Safety Administration)',
      cacheStatus: 'miss',
    };

    // Cache for 24 hours
    cache.set(cacheKey, responseData, CACHE_DURATION.TWENTY_FOUR_HOURS);

    const processingTime = Date.now() - startTime;
    console.log(`[Recalls API] Processed VIN ${normalizedVin} in ${processingTime}ms - Found ${recalls.length} recalls`);

    return NextResponse.json<RecallAPIResponse>(
      {
        success: true,
        data: responseData,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=86400', // 24 hours
          'X-Cache-Status': 'MISS',
          'X-Processing-Time': `${processingTime}ms`,
        }
      }
    );

  } catch (error) {
    console.error('[Recalls API] Error:', error);

    // Determine error type and appropriate response
    if (error instanceof Error) {
      // VIN not found / No data
      if (error.message.includes('No vehicle data found') ||
          error.message.includes('Incomplete vehicle data')) {
        return NextResponse.json<RecallAPIResponse>(
          {
            success: false,
            error: 'VIN not found',
            details: 'This VIN was not recognized by NHTSA. Please verify the VIN is correct.',
          },
          { status: 404 }
        );
      }

      // API timeout
      if (error.message.includes('aborted') || error.message.includes('timeout')) {
        return NextResponse.json<RecallAPIResponse>(
          {
            success: false,
            error: 'Request timeout',
            details: 'The NHTSA API is taking too long to respond. Please try again later.',
          },
          { status: 504 }
        );
      }

      // NHTSA API error
      if (error.message.includes('NHTSA')) {
        return NextResponse.json<RecallAPIResponse>(
          {
            success: false,
            error: 'NHTSA API error',
            details: error.message,
          },
          { status: 502 }
        );
      }
    }

    // Generic error
    return NextResponse.json<RecallAPIResponse>(
      {
        success: false,
        error: 'Failed to fetch recall data',
        details: 'An unexpected error occurred. Please try again later.',
      },
      { status: 500 }
    );
  }
}

// Handle invalid HTTP methods
export async function POST() {
  return NextResponse.json<RecallAPIResponse>(
    {
      success: false,
      error: 'Method not allowed',
      details: 'Only GET requests are supported. Use GET /api/recalls?vin=YOUR_VIN'
    },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json<RecallAPIResponse>(
    {
      success: false,
      error: 'Method not allowed',
      details: 'Only GET requests are supported. Use GET /api/recalls?vin=YOUR_VIN'
    },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json<RecallAPIResponse>(
    {
      success: false,
      error: 'Method not allowed',
      details: 'Only GET requests are supported. Use GET /api/recalls?vin=YOUR_VIN'
    },
    { status: 405 }
  );
}
