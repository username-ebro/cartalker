import { NextRequest, NextResponse } from 'next/server';

export interface VinDecodeResponse {
  success: boolean;
  data?: {
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
    // Theft and salvage data
    theftSalvageStatus?: TheftSalvageInfo;
    priceAnalysis?: PriceAnalysisInfo;
    additionalSources?: AdditionalDataSources;
  };
  error?: string;
}

export interface RecallInfo {
  recallNumber: string;
  component: string;
  summary: string;
  consequence: string;
  remedy: string;
  dateInitiated: string;
  severity: 'Low' | 'Medium' | 'High';
}

export interface ComplaintInfo {
  odometer: number;
  summary: string;
  dateOfIncident: string;
  component: string;
  crashIndicator: boolean;
  fireIndicator: boolean;
}

export interface SafetyRatings {
  overallRating?: number;
  frontCrashRating?: number;
  sideCrashRating?: number;
  rolloverRating?: number;
  investigationCount?: number;
}

export interface FuelEconomyInfo {
  city?: number;
  highway?: number;
  combined?: number;
  fuelType?: string;
  annualFuelCost?: number;
  co2Emissions?: number;
}

export interface MarketValueInfo {
  estimatedValue?: number;
  valueLow?: number;
  valueHigh?: number;
  confidence?: string;
  lastUpdated?: string;
}

export interface VehicleSpecs {
  displacement?: string;
  cylinders?: number;
  horsepower?: number;
  torque?: number;
  compressionRatio?: string;
  standardFeatures?: string[];
  optionalFeatures?: string[];
}

export interface MaintenanceInfo {
  mileage: number;
  description: string;
  category: 'Oil Change' | 'Filter' | 'Fluid' | 'Inspection' | 'Major Service';
  estimatedCost?: number;
}

export interface TheftSalvageInfo {
  theftStatus?: boolean; // true if reported stolen
  salvageStatus?: boolean; // true if reported as salvage/total loss
  lastChecked?: string; // Date of last manual check
  nicbCheckUrl: string; // URL for manual verification
  manualVerificationRequired: boolean; // Always true for NICB data
  sources?: string[]; // Sources of information
  confidence?: 'High' | 'Medium' | 'Low' | 'Manual Verification Required';
}

export interface PriceAnalysisInfo {
  fairMarketValue?: number;
  priceRating?: 'Great Deal' | 'Good Deal' | 'Fair Deal' | 'Overpriced' | 'High Price';
  marketComparison?: string;
  dataSource: string;
  lastUpdated?: string;
  confidence?: string;
}

export interface AdditionalDataSources {
  epaRealWorldFuelEconomy?: {
    city?: number;
    highway?: number;
    combined?: number;
    userReported?: boolean;
    sampleSize?: number;
  };
  stateVehicleLinks?: {
    dmvLookupUrl?: string;
    stateName?: string;
    registrationCheck?: string;
  };
  vehicleHistoryLinks?: {
    freeReportUrl?: string;
    limitedInfoAvailable?: boolean;
  };
}

interface NHTSAVehicleResult {
  ModelYear?: string;
  Make?: string;
  Model?: string;
  Trim?: string;
  EngineModel?: string;
  DisplacementL?: string;
  TransmissionStyle?: string;
  DriveType?: string;
  FuelTypePrimary?: string;
  BodyClass?: string;
  Manufacturer?: string;
  PlantCity?: string;
  PlantState?: string;
  PlantCountry?: string;
  EngineCylinders?: string;
  [key: string]: any; // For other properties we might not have typed
}

interface NHTSAResponse {
  Count: number;
  Message: string;
  SearchCriteria: string;
  Results: NHTSAVehicleResult[];
}

interface NHTSAVariable {
  Variable: string;
  Value: string;
  ValueId: string;
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
}

interface NHTSAComplaintResponse {
  count?: number;
  Count?: number;
  message?: string;
  Message?: string;
  results?: NHTSAComplaint[];
  Results?: NHTSAComplaint[];
}

interface NHTSAComplaint {
  ODI_NUMBER: string;
  DATEA: string;
  VEH_SPEED: string;
  SUMMARY: string;
  COMPDESC: string;
  CRASH: string;
  FIRE: string;
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

interface FuelEconomyResponse {
  city08?: number;
  highway08?: number;
  comb08?: number;
  fuelType1?: string;
  fuelCost08?: number;
  co2TailpipeGpm?: number;
}

// Helper function to normalize model names for NHTSA API calls
function normalizeModelName(model: string): string {
  // Remove trim information and extra details for NHTSA API compatibility
  if (model.includes('Golf GTI')) return 'Golf';
  if (model.includes('Wrangler')) return 'Wrangler';

  // General normalization - take the first word before common separators
  const normalized = model.split(/[\s\-\,]/)[0];
  return normalized;
}

// Helper functions for NICB and additional data sources
function generateNICBStatus(vin: string): TheftSalvageInfo {
  return {
    theftStatus: undefined, // Requires manual verification
    salvageStatus: undefined, // Requires manual verification
    lastChecked: undefined,
    nicbCheckUrl: `https://www.nicb.org/vincheck`,
    manualVerificationRequired: true,
    sources: ['NICB VINCheck (Manual Verification Required)'],
    confidence: 'Manual Verification Required'
  };
}

async function checkAlternativePricingSources(make: string, model: string, year: number): Promise<PriceAnalysisInfo> {
  // Since iSeeCars doesn't have a public API, provide guidance for multiple sources
  const makeModel = `${year} ${make} ${model}`;

  return {
    fairMarketValue: undefined,
    priceRating: undefined,
    marketComparison: [
      'Manual price check recommended from multiple sources:',
      '• iSeeCars.com - Best deals analysis and price ratings',
      '• KBB.com - Kelley Blue Book values',
      '• Edmunds.com - True Market Value (TMV)',
      '• Cars.com - Market analysis',
      '• AutoTrader.com - Listing price comparisons'
    ].join('\n'),
    dataSource: 'Multiple Sources (Manual Verification)',
    lastUpdated: new Date().toISOString().split('T')[0],
    confidence: 'Manual verification required - check 3+ sources for accurate pricing'
  };
}

async function fetchEPARealWorldData(make: string, model: string, year: number): Promise<AdditionalDataSources['epaRealWorldFuelEconomy']> {
  try {
    // Try to get EPA fuel economy data with real-world information
    // EPA's fueleconomy.gov API can provide both EPA estimates and real-world data
    const baseUrl = 'https://www.fueleconomy.gov/ws/rest/vehicle/menu/options';
    const response = await fetch(
      `${baseUrl}?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
      {
        headers: { 'User-Agent': 'CarTalker/1.0' },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.menuItem && data.menuItem.length > 0) {
        const vehicleData = data.menuItem[0];
        return {
          city: vehicleData.city08,
          highway: vehicleData.highway08,
          combined: vehicleData.comb08,
          userReported: false,
          sampleSize: undefined // EPA doesn't provide sample size for their estimates
        };
      }
    }
  } catch (error) {
    console.log('EPA API not available, providing manual check instructions');
  }

  // Return manual check instructions if API fails
  return {
    city: undefined,
    highway: undefined,
    combined: undefined,
    userReported: true,
    sampleSize: undefined
  };
}

function generateAdditionalDataSources(vin: string, make: string, model: string, year: number, state?: string): AdditionalDataSources {
  return {
    epaRealWorldFuelEconomy: {
      city: undefined,
      highway: undefined,
      combined: undefined,
      userReported: true,
      sampleSize: undefined
    },
    stateVehicleLinks: {
      dmvLookupUrl: state ? getStateDMVUrl(state) : undefined,
      stateName: state,
      registrationCheck: 'Contact local DMV for registration verification'
    },
    vehicleHistoryLinks: {
      freeReportUrl: 'https://www.vehiclehistory.com/free-vin-check',
      limitedInfoAvailable: true
    }
  };
}

function getStateDMVUrl(state: string): string {
  const dmvUrls: { [key: string]: string } = {
    'CA': 'https://www.dmv.ca.gov/portal/vehicle-registration/',
    'TX': 'https://www.txdmv.gov/motorists/register-your-vehicle',
    'FL': 'https://www.flhsmv.gov/motor-vehicles-tags-titles/',
    'NY': 'https://dmv.ny.gov/registration/register-vehicle',
    'PA': 'https://www.dmv.pa.gov/VEHICLE-SERVICES/Registration/Pages/default.aspx',
    // Add more states as needed
  };

  return dmvUrls[state.toUpperCase()] || 'https://www.dmv.org/';
}

// Enhanced market value function with additional price analysis
function enhancedMarketValueEstimation(make: string, model: string, year: number, mileage?: number): {
  marketValue: MarketValueInfo;
  priceAnalysis: PriceAnalysisInfo;
} {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  const estimatedMileage = mileage || (age * 12000);

  // Base values by make (very simplified)
  const baseValues: { [key: string]: number } = {
    'VOLKSWAGEN': 25000,
    'JEEP': 30000,
    'FORD': 28000,
    'CHEVROLET': 26000,
    'TOYOTA': 30000,
    'HONDA': 28000,
  };

  const baseValue = baseValues[make.toUpperCase()] || 25000;

  // Depreciation calculation (simplified)
  const ageDepreciation = Math.pow(0.85, age); // 15% per year
  const mileageDepreciation = Math.max(0.5, 1 - (estimatedMileage - 12000 * age) / 200000);

  const estimatedValue = Math.round(baseValue * ageDepreciation * mileageDepreciation);
  const valueLow = Math.round(estimatedValue * 0.85);
  const valueHigh = Math.round(estimatedValue * 1.15);

  const marketValue: MarketValueInfo = {
    estimatedValue,
    valueLow,
    valueHigh,
    confidence: age <= 5 ? 'High' : age <= 10 ? 'Medium' : 'Low',
    lastUpdated: new Date().toISOString().split('T')[0],
  };

  const priceAnalysis: PriceAnalysisInfo = {
    fairMarketValue: estimatedValue,
    priceRating: undefined, // Would need actual listing price to compare
    marketComparison: `Estimated range: $${valueLow.toLocaleString()} - $${valueHigh.toLocaleString()}`,
    dataSource: 'CarTalker Estimation Algorithm + Manual Price Check Recommended',
    lastUpdated: new Date().toISOString().split('T')[0],
    confidence: age <= 5 ? 'Medium' : 'Low - Manual verification recommended'
  };

  return { marketValue, priceAnalysis };
}

// Helper functions for data fetching
async function fetchNHTSAVehicleData(vin: string) {
  const response = await fetch(
    `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`,
    {
      headers: { 'User-Agent': 'CarTalker/1.0' },
    }
  );

  if (!response.ok) {
    throw new Error(`NHTSA Vehicle API error: ${response.status}`);
  }

  return await response.json() as NHTSAResponse;
}

async function fetchNHTSARecalls(make: string, model: string, year: number): Promise<RecallInfo[]> {
  try {
    const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`;
    const response = await fetch(url,
      {
        headers: { 'User-Agent': 'CarTalker/1.0' },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      }
    );

    if (!response.ok) return [];

    const data: NHTSARecallResponse = await response.json();
    const results = data.results || data.Results || [];

    return results.slice(0, 10).map(recall => ({
      recallNumber: recall.NHTSACampaignNumber || '',
      component: recall.Component || '',
      summary: recall.Summary || '',
      consequence: recall.Consequence || '',
      remedy: recall.Remedy || '',
      dateInitiated: recall.ReportReceivedDate || '',
      severity: determineSeverity(recall.Consequence),
    })) || [];
  } catch (error) {
    console.error('NHTSA Recalls API error:', error);
    return [];
  }
}

async function fetchNHTSAComplaints(make: string, model: string, year: number): Promise<ComplaintInfo[]> {
  try {
    const response = await fetch(
      `https://api.nhtsa.gov/complaints/complaintsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${year}`,
      {
        headers: { 'User-Agent': 'CarTalker/1.0' },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) return [];

    const data: NHTSAComplaintResponse = await response.json();
    const results = data.results || data.Results || [];

    return results.slice(0, 20).map(complaint => ({
      odometer: parseInt(complaint.VEH_SPEED) || 0,
      summary: complaint.SUMMARY || '',
      dateOfIncident: complaint.DATEA || '',
      component: complaint.COMPDESC || '',
      crashIndicator: complaint.CRASH === 'Y',
      fireIndicator: complaint.FIRE === 'Y',
    })) || [];
  } catch (error) {
    console.error('NHTSA Complaints API error:', error);
    return [];
  }
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

async function fetchFuelEconomy(make: string, model: string, year: number): Promise<FuelEconomyInfo | undefined> {
  try {
    // FuelEconomy.gov API endpoint
    const response = await fetch(
      `https://www.fueleconomy.gov/ws/rest/vehicle/menu/options?year=${year}&make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`,
      {
        headers: { 'User-Agent': 'CarTalker/1.0' },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!response.ok) return undefined;

    const data = await response.json();

    // This is a simplified example - the actual FuelEconomy.gov API has a more complex structure
    if (data && data.menuItem && data.menuItem.length > 0) {
      const fuelData = data.menuItem[0];
      return {
        city: fuelData.city08,
        highway: fuelData.highway08,
        combined: fuelData.comb08,
        fuelType: fuelData.fuelType1,
        annualFuelCost: fuelData.fuelCost08,
        co2Emissions: fuelData.co2TailpipeGpm,
      };
    }

    return undefined;
  } catch (error) {
    console.error('FuelEconomy.gov API error:', error);
    return undefined;
  }
}

function determineSeverity(consequence: string): 'Low' | 'Medium' | 'High' {
  const lowSeverityKeywords = ['warning', 'light', 'noise', 'vibration', 'minor'];
  const highSeverityKeywords = ['crash', 'fire', 'death', 'injury', 'brake', 'steering', 'airbag'];

  const consequenceLower = consequence.toLowerCase();

  if (highSeverityKeywords.some(keyword => consequenceLower.includes(keyword))) {
    return 'High';
  }

  if (lowSeverityKeywords.some(keyword => consequenceLower.includes(keyword))) {
    return 'Low';
  }

  return 'Medium';
}

function generateMaintenanceSchedule(year: number, mileage?: number): MaintenanceInfo[] {
  const currentYear = new Date().getFullYear();
  const vehicleAge = currentYear - year;
  const estimatedMileage = mileage || (vehicleAge * 12000); // Assume 12k miles/year if not provided

  const schedule: MaintenanceInfo[] = [
    { mileage: 5000, description: 'Oil and Filter Change', category: 'Oil Change', estimatedCost: 50 },
    { mileage: 10000, description: 'Cabin Air Filter Replacement', category: 'Filter', estimatedCost: 25 },
    { mileage: 15000, description: 'Engine Air Filter Replacement', category: 'Filter', estimatedCost: 30 },
    { mileage: 30000, description: 'Transmission Fluid Service', category: 'Fluid', estimatedCost: 150 },
    { mileage: 60000, description: 'Brake Fluid Replacement', category: 'Fluid', estimatedCost: 100 },
    { mileage: 100000, description: 'Timing Belt Replacement', category: 'Major Service', estimatedCost: 800 },
  ];

  // Return upcoming maintenance items based on current mileage
  return schedule.filter(item => item.mileage > estimatedMileage).slice(0, 5);
}

function getCommonIssues(make: string, model: string, year: number): string[] {
  // This is a simplified example - in a real implementation, this would come from a database
  const commonIssuesByMake: { [key: string]: string[] } = {
    'VOLKSWAGEN': [
      'Carbon buildup in direct injection engines',
      'Water pump failure around 80,000 miles',
      'Timing chain tensioner issues',
      'Ignition coil failures',
    ],
    'JEEP': [
      'Electronic throttle control issues',
      'TIPM (Totally Integrated Power Module) failures',
      'Death wobble in front suspension',
      'Transmission shifting problems',
    ],
    'FORD': [
      'Transmission issues in certain model years',
      'Coolant leaks from water pumps',
      'Ignition coil failures',
    ],
    'CHEVROLET': [
      'Intake manifold gasket leaks',
      'Fuel pump failures',
      'Transmission problems',
    ],
  };

  return commonIssuesByMake[make.toUpperCase()] || [
    'Check manufacturer recalls and service bulletins',
    'Follow recommended maintenance schedule',
    'Monitor fluid levels regularly',
  ];
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

  // Validate VIN format (17 characters, alphanumeric except I, O, Q)
  const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
  if (!vinRegex.test(vin)) {
    return NextResponse.json(
      { success: false, error: 'Invalid VIN format' },
      { status: 400 }
    );
  }

  try {
    // Fetch basic vehicle data from NHTSA
    const data = await fetchNHTSAVehicleData(vin);

    if (data.Count === 0 || !data.Results || data.Results.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No data found for this VIN' },
        { status: 404 }
      );
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

    // Fetch enhanced data in parallel (if we have make, model, year)
    let enhancedData = {};

    if (make && model && year) {
      try {
        // Normalize model name for NHTSA API calls
        const normalizedModel = normalizeModelName(model);

        const [recalls, complaints, safetyRatings, fuelEconomy, epaRealWorldData, priceAnalysisData] = await Promise.allSettled([
          fetchNHTSARecalls(make, normalizedModel, year),
          fetchNHTSAComplaints(make, normalizedModel, year),
          fetchNHTSASafetyRatings(make, normalizedModel, year),
          fetchFuelEconomy(make, normalizedModel, year),
          fetchEPARealWorldData(make, normalizedModel, year),
          checkAlternativePricingSources(make, normalizedModel, year),
        ]);

        const recallsData = recalls.status === 'fulfilled' ? recalls.value : [];
        const complaintsData = complaints.status === 'fulfilled' ? complaints.value : [];

        // Enhanced market value and price analysis
        const { marketValue, priceAnalysis: estimatedPriceAnalysis } = enhancedMarketValueEstimation(make, model, year);
        const plantState = result.PlantState || vehicleData.plantState;

        // Get additional data sources with EPA real-world data
        const additionalSources = generateAdditionalDataSources(vin, make, model, year, plantState);
        if (epaRealWorldData.status === 'fulfilled') {
          additionalSources.epaRealWorldFuelEconomy = epaRealWorldData.value;
        }

        // Combine estimated price analysis with manual verification guidance
        const combinedPriceAnalysis = priceAnalysisData.status === 'fulfilled' ? {
          ...estimatedPriceAnalysis,
          marketComparison: [
            estimatedPriceAnalysis.marketComparison,
            '',
            priceAnalysisData.value.marketComparison
          ].join('\n')
        } : estimatedPriceAnalysis;

        enhancedData = {
          recalls: recallsData,
          complaints: complaintsData,
          safetyRatings: safetyRatings.status === 'fulfilled' ? safetyRatings.value : undefined,
          fuelEconomy: fuelEconomy.status === 'fulfilled' ? fuelEconomy.value : undefined,
          marketValue,
          priceAnalysis: combinedPriceAnalysis,
          theftSalvageStatus: generateNICBStatus(vin),
          additionalSources,
          specifications: {
            displacement: result.DisplacementL ? `${result.DisplacementL}L` : undefined,
            cylinders: result.EngineCylinders ? parseInt(result.EngineCylinders) : undefined,
            standardFeatures: [], // Would come from a more comprehensive database
            optionalFeatures: [], // Would come from a more comprehensive database
          },
          maintenanceSchedule: generateMaintenanceSchedule(year),
          commonIssues: getCommonIssues(make, model, year),
        };
      } catch (error) {
        console.error('Error fetching enhanced data:', error);
        // Continue with basic data even if enhanced data fails
      }
    }

    // Combine basic and enhanced data
    const combinedData = { ...vehicleData, ...enhancedData };

    // Filter out undefined values but keep empty arrays for recalls/complaints
    const cleanedData = Object.fromEntries(
      Object.entries(combinedData).filter(([key, value]) => {
        // Always keep recalls and complaints even if empty
        if (key === 'recalls' || key === 'complaints') {
          return value !== undefined && value !== null;
        }
        // For other fields, filter out undefined, null, and empty arrays
        return value !== undefined && value !== null &&
               !(Array.isArray(value) && value.length === 0);
      })
    );

    return NextResponse.json({
      success: true,
      data: cleanedData,
    });

  } catch (error) {
    console.error('VIN decode error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to decode VIN. Please try again later.'
      },
      { status: 500 }
    );
  }
}

// Handle invalid methods
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Method not allowed' },
    { status: 405 }
  );
}