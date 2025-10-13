/**
 * Crisis Mode API Endpoint
 *
 * Analyzes service recommendations in real-time to help users
 * determine if they're being scammed or if the service is legitimate.
 *
 * Leverages the service intervals database and talking points system.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { checkServiceLegitimacy, CheckServiceInput } from '@/lib/serviceIntervals';
import { generateTalkingPoints, generateConversationScript } from '@/lib/talkingPoints';

/**
 * Natural language to service type mapping
 * Maps common phrases/keywords to standardized service types
 */
const SERVICE_TYPE_MAP: Record<string, string> = {
  // Oil & Engine
  'oil change': 'OIL_CHANGE',
  'oil': 'OIL_CHANGE',
  'oil filter': 'OIL_FILTER',
  'engine air filter': 'ENGINE_AIR_FILTER',
  'air filter': 'ENGINE_AIR_FILTER',
  'cabin air filter': 'CABIN_AIR_FILTER',
  'cabin filter': 'CABIN_AIR_FILTER',
  'fuel filter': 'FUEL_FILTER',
  'spark plug': 'SPARK_PLUGS',
  'spark plugs': 'SPARK_PLUGS',
  'plugs': 'SPARK_PLUGS',

  // Transmission
  'transmission fluid': 'TRANSMISSION_FLUID_CHANGE',
  'transmission service': 'TRANSMISSION_FLUID_CHANGE',
  'transmission flush': 'TRANSMISSION_FLUSH',
  'trans flush': 'TRANSMISSION_FLUSH',
  'differential': 'DIFFERENTIAL_SERVICE',
  'diff service': 'DIFFERENTIAL_SERVICE',

  // Brakes
  'brake pad': 'BRAKE_PADS_FRONT',
  'brake pads': 'BRAKE_PADS_FRONT',
  'front brake': 'BRAKE_PADS_FRONT',
  'front brakes': 'BRAKE_PADS_FRONT',
  'rear brake': 'BRAKE_PADS_REAR',
  'rear brakes': 'BRAKE_PADS_REAR',
  'brake rotor': 'BRAKE_ROTORS',
  'brake rotors': 'BRAKE_ROTORS',
  'rotors': 'BRAKE_ROTORS',
  'brake fluid': 'BRAKE_FLUID_FLUSH',
  'brake flush': 'BRAKE_FLUID_FLUSH',

  // Cooling
  'coolant': 'COOLANT_FLUSH',
  'coolant flush': 'COOLANT_FLUSH',
  'radiator flush': 'RADIATOR_FLUSH',
  'radiator': 'RADIATOR_FLUSH',
  'thermostat': 'THERMOSTAT',

  // Fluids
  'power steering': 'POWER_STEERING_FLUSH',
  'power steering flush': 'POWER_STEERING_FLUSH',

  // Fuel System
  'fuel system cleaning': 'FUEL_SYSTEM_CLEANING',
  'fuel cleaning': 'FUEL_SYSTEM_CLEANING',
  'injector cleaning': 'FUEL_INJECTOR_CLEANING',
  'fuel injector': 'FUEL_INJECTOR_CLEANING',
  'engine flush': 'ENGINE_FLUSH',
  'throttle body': 'THROTTLE_BODY_CLEANING',
  'throttle body cleaning': 'THROTTLE_BODY_CLEANING',

  // Tires
  'tire rotation': 'TIRE_ROTATION',
  'rotation': 'TIRE_ROTATION',
  'wheel alignment': 'WHEEL_ALIGNMENT',
  'alignment': 'WHEEL_ALIGNMENT',
  'tire balance': 'TIRE_BALANCE',
  'balance': 'TIRE_BALANCE',
  'balancing': 'TIRE_BALANCE',

  // Electrical
  'battery': 'BATTERY_REPLACEMENT',
  'alternator': 'ALTERNATOR',
  'starter': 'STARTER',

  // Suspension
  'shock': 'SHOCK_ABSORBERS',
  'shocks': 'SHOCK_ABSORBERS',
  'shock absorber': 'SHOCK_ABSORBERS',
  'strut': 'STRUTS',
  'struts': 'STRUTS',
};

/**
 * Parse natural language service description to service type
 */
function parseServiceType(description: string): string | null {
  const normalized = description.toLowerCase().trim();

  // Try exact match first
  if (SERVICE_TYPE_MAP[normalized]) {
    return SERVICE_TYPE_MAP[normalized];
  }

  // Try partial match (any keyword found)
  for (const [keyword, serviceType] of Object.entries(SERVICE_TYPE_MAP)) {
    if (normalized.includes(keyword)) {
      return serviceType;
    }
  }

  return null;
}

/**
 * Map service interval types to Prisma MaintenanceType enum
 * Some services (like ENGINE_FLUSH) don't exist in the enum, so we return null
 */
function mapToPrismaMaintenanceType(serviceType: string): string | null {
  const mapping: Record<string, string> = {
    // Direct matches
    'OIL_CHANGE': 'OIL_CHANGE',
    'OIL_FILTER': 'OIL_FILTER',
    'SPARK_PLUGS': 'SPARK_PLUGS',
    'TIRE_ROTATION': 'TIRE_ROTATION',
    'ALTERNATOR': 'ALTERNATOR',
    'STARTER': 'STARTER',
    'BATTERY_REPLACEMENT': 'BATTERY',
    'COOLANT_FLUSH': 'COOLANT_FLUSH',

    // Map to broader categories
    'ENGINE_AIR_FILTER': 'AIR_FILTER',
    'CABIN_AIR_FILTER': 'CABIN_FILTER',
    'FUEL_FILTER': 'FUEL_FILTER',
    'TRANSMISSION_FLUSH': 'TRANSMISSION_SERVICE',
    'TRANSMISSION_FLUID_CHANGE': 'TRANSMISSION_FLUID',
    'DIFFERENTIAL_SERVICE': 'DIFFERENTIAL_SERVICE',
    'BRAKE_PADS_FRONT': 'BRAKE_PADS',
    'BRAKE_PADS_REAR': 'BRAKE_PADS',
    'BRAKE_ROTORS': 'BRAKE_ROTORS',
    'BRAKE_FLUID_FLUSH': 'BRAKE_FLUID',
    'WHEEL_ALIGNMENT': 'WHEEL_ALIGNMENT',
    'TIRE_BALANCE': 'WHEEL_BALANCE',
    'SHOCK_ABSORBERS': 'SHOCKS_STRUTS',
    'STRUTS': 'SHOCKS_STRUTS',

    // Services that don't exist in enum - map to OTHER
    'ENGINE_FLUSH': null, // Known scam, skip history lookup
    'FUEL_SYSTEM_CLEANING': null,
    'FUEL_INJECTOR_CLEANING': null,
    'THROTTLE_BODY_CLEANING': null,
    'POWER_STEERING_FLUSH': 'POWER_STEERING_FLUID',
    'RADIATOR_FLUSH': null,
    'THERMOSTAT': null,
  };

  return mapping[serviceType] || null;
}

/**
 * Get last maintenance record for a specific service type
 */
async function getLastServiceForType(
  vehicleId: string,
  serviceType: string
): Promise<{ mileage: number | null; date: Date | null }> {
  try {
    // Map to Prisma enum - if no match, skip database query
    const prismaType = mapToPrismaMaintenanceType(serviceType);
    if (!prismaType) {
      console.log(`No Prisma enum match for ${serviceType}, skipping history lookup`);
      return { mileage: null, date: null };
    }

    const lastService = await prisma.maintenanceRecord.findFirst({
      where: {
        vehicleId,
        type: prismaType as any, // Prisma enum type
      },
      orderBy: {
        date: 'desc',
      },
      select: {
        mileage: true,
        date: true,
      },
    });

    return {
      mileage: lastService?.mileage || null,
      date: lastService?.date || null,
    };
  } catch (error) {
    console.error('Error fetching last service:', error);
    return { mileage: null, date: null };
  }
}

/**
 * POST /api/crisis/analyze
 *
 * Analyzes a service recommendation and returns talking points
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      vehicleId,
      serviceDescription,
      quotedPrice,
      symptoms = [],
      urgency,
    } = body;

    // Validation
    if (!vehicleId) {
      return NextResponse.json(
        { success: false, error: 'Vehicle ID is required' },
        { status: 400 }
      );
    }

    if (!serviceDescription) {
      return NextResponse.json(
        { success: false, error: 'Service description is required' },
        { status: 400 }
      );
    }

    // Get vehicle data
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: {
        id: true,
        vin: true,
        year: true,
        make: true,
        model: true,
        mileage: true,
        createdAt: true,
      },
    });

    if (!vehicle) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    // Parse service type from description
    const serviceType = parseServiceType(serviceDescription);

    if (!serviceType) {
      // Unknown service - return generic advice
      return NextResponse.json({
        success: true,
        analysis: {
          serviceType: serviceDescription,
          legitimacy: {
            isLegitimate: true,
            urgencyLevel: 'can-wait',
            confidence: 30,
            reason: `Service "${serviceDescription}" is not in our database. This doesn't mean it's a scam - it might be a specialized or newer service.`,
            talkingPoints: [
              `What does my owner's manual say about ${serviceDescription}?`,
              'Can you show me the specific symptom or measurement that indicates this service is needed?',
              'Is this a manufacturer-recommended service at my mileage?',
              'What happens if I delay this service?',
            ],
            flags: ['Service not in database - verify with owner\'s manual'],
            scamLikelihood: 0,
          },
          talkingPoints: [
            {
              type: 'question',
              text: `What does my owner's manual say about ${serviceDescription}?`,
              tone: 'polite',
              priority: 'primary',
            },
            {
              type: 'question',
              text: 'Can you show me why this service is needed right now?',
              tone: 'polite',
              priority: 'primary',
            },
            {
              type: 'statement',
              text: 'I\'d like to research this service before committing. Can I get back to you?',
              tone: 'firm',
              priority: 'primary',
            },
          ],
          recommendations: [
            'Check your owner\'s manual for this service',
            'Ask for specific measurements or symptoms that justify the service',
            'Get a second opinion if the price seems high',
            'Research this service online before committing',
          ],
        },
      });
    }

    // Get last service history for this type
    const lastService = await getLastServiceForType(vehicleId, serviceType);

    // Calculate vehicle age in months
    const vehicleAgeMonths = Math.floor(
      (Date.now() - new Date(vehicle.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    );

    // Build input for legitimacy check
    const checkInput: CheckServiceInput = {
      serviceType,
      currentMileage: vehicle.mileage || 0,
      lastServiceMileage: lastService.mileage || undefined,
      lastServiceDate: lastService.date || undefined,
      symptoms,
      quotedPrice: quotedPrice ? parseFloat(quotedPrice) : undefined,
      vehicleAge: vehicleAgeMonths,
      drivingConditions: 'normal', // Could be enhanced with user preferences
    };

    // Run legitimacy check
    const serviceCheck = checkServiceLegitimacy(checkInput);

    // Generate talking points
    const vehicleInfo = {
      make: vehicle.make || '',
      model: vehicle.model || '',
      year: vehicle.year || 0,
      mileage: vehicle.mileage || 0,
    };

    const talkingPointsSet = generateTalkingPoints(
      serviceCheck,
      serviceType,
      quotedPrice ? parseFloat(quotedPrice) : undefined,
      vehicleInfo
    );

    // Flatten talking points for easier frontend consumption
    const allTalkingPoints = [
      ...talkingPointsSet.opening,
      ...talkingPointsSet.clarifying.slice(0, 3),
      ...talkingPointsSet.objecting.slice(0, 2),
      ...talkingPointsSet.negotiating.slice(0, 2),
      ...talkingPointsSet.closing.slice(0, 2),
    ];

    // Generate recommendations based on urgency
    const recommendations: string[] = [];

    switch (serviceCheck.urgencyLevel) {
      case 'scam':
      case 'unnecessary':
        recommendations.push('Decline this service politely but firmly');
        recommendations.push('Reference your maintenance records if available');
        recommendations.push('Consider getting a second opinion');
        break;

      case 'can-wait':
        recommendations.push('This service can be delayed safely');
        recommendations.push('Schedule it for your next visit if convenient');
        recommendations.push('Ask about the grace period for this service');
        break;

      case 'soon':
        recommendations.push('Service is due - reasonable to approve');
        recommendations.push('Ask to see the condition of the old part/fluid');
        recommendations.push('Negotiate price if it seems high');
        break;

      case 'overdue':
      case 'urgent':
      case 'safety-critical':
        recommendations.push('This service appears to be legitimately needed');
        recommendations.push('Proceed with the service to avoid further damage');
        recommendations.push('Still verify the price is reasonable');
        break;
    }

    // Add alternative action if available
    if (serviceCheck.alternativeAction) {
      recommendations.push(serviceCheck.alternativeAction);
    }

    // Generate conversation script
    const conversationScript = generateConversationScript(
      serviceCheck,
      serviceType,
      quotedPrice ? parseFloat(quotedPrice) : undefined
    );

    return NextResponse.json({
      success: true,
      analysis: {
        serviceType,
        serviceDescription,
        vehicleInfo: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          currentMileage: vehicle.mileage,
        },
        legitimacy: serviceCheck,
        talkingPoints: allTalkingPoints,
        talkingPointsByStage: talkingPointsSet,
        recommendations,
        conversationScript,
      },
    });
  } catch (error) {
    console.error('Error analyzing service:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze service',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/crisis/analyze
 *
 * Returns available service types for reference
 */
export async function GET(request: NextRequest) {
  try {
    // Return list of supported service types
    const supportedServices = Object.keys(SERVICE_TYPE_MAP).sort();

    return NextResponse.json({
      success: true,
      data: {
        supportedServices,
        totalServices: supportedServices.length,
        message: 'Use POST to analyze a specific service recommendation',
      },
    });
  } catch (error) {
    console.error('Error in GET /api/crisis/analyze:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch supported services' },
      { status: 500 }
    );
  }
}
