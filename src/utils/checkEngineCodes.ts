/**
 * OBD-II Check Engine Code Database
 *
 * Provides lookup for common diagnostic trouble codes (DTCs)
 * with urgency classification and recommended actions.
 */

export interface CheckEngineCode {
  code: string;
  description: string;
  system: 'ENGINE' | 'TRANSMISSION' | 'EMISSIONS' | 'SENSORS' | 'FUEL' | 'IGNITION' | 'OTHER';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  symptoms: string[];
  possibleCauses: string[];
  recommendedAction: string;
  driveable: boolean;
  estimatedCost: { min: number; max: number };
}

/**
 * Common check engine codes database
 */
export const CHECK_ENGINE_CODES: Record<string, CheckEngineCode> = {
  // Critical - Stop driving
  'P0171': {
    code: 'P0171',
    description: 'System Too Lean (Bank 1)',
    system: 'FUEL',
    urgency: 'medium',
    symptoms: ['Poor fuel economy', 'Rough idle', 'Lack of power', 'Engine hesitation'],
    possibleCauses: [
      'Vacuum leak',
      'Faulty mass airflow sensor',
      'Weak fuel pump',
      'Dirty fuel injectors',
      'Exhaust leak'
    ],
    recommendedAction: 'Diagnose with smoke test for vacuum leaks. Check MAF sensor and fuel pressure. Driveable but get diagnosed soon.',
    driveable: true,
    estimatedCost: { min: 150, max: 800 }
  },

  'P0300': {
    code: 'P0300',
    description: 'Random/Multiple Cylinder Misfire Detected',
    system: 'IGNITION',
    urgency: 'high',
    symptoms: ['Rough idle', 'Engine shaking', 'Poor acceleration', 'Check engine light flashing'],
    possibleCauses: [
      'Faulty spark plugs',
      'Bad ignition coils',
      'Fuel injector problems',
      'Low compression',
      'Vacuum leaks'
    ],
    recommendedAction: 'If light is FLASHING, stop driving immediately (catalytic converter damage risk). If solid, get diagnosed within 1-2 days.',
    driveable: true, // but not if flashing
    estimatedCost: { min: 100, max: 1000 }
  },

  'P0420': {
    code: 'P0420',
    description: 'Catalyst System Efficiency Below Threshold (Bank 1)',
    system: 'EMISSIONS',
    urgency: 'low',
    symptoms: ['Check engine light', 'Possible smell of sulfur', 'Reduced fuel economy'],
    possibleCauses: [
      'Failing catalytic converter',
      'Oxygen sensor failure',
      'Exhaust leak',
      'Engine running rich/lean'
    ],
    recommendedAction: 'Not urgent for safety, but will cause emissions test failure. Get diagnosed within 1-2 weeks. Often just needs O2 sensor replacement ($200-400) rather than cat ($800-2000).',
    driveable: true,
    estimatedCost: { min: 200, max: 2500 }
  },

  'P0128': {
    code: 'P0128',
    description: 'Coolant Thermostat (Coolant Temperature Below Thermostat Regulating Temperature)',
    system: 'ENGINE',
    urgency: 'low',
    symptoms: ['Poor fuel economy', 'Slow engine warm-up', 'Heater not working well'],
    possibleCauses: [
      'Stuck open thermostat',
      'Faulty coolant temperature sensor',
      'Low coolant level'
    ],
    recommendedAction: 'Not urgent. Replace thermostat when convenient (cheap fix, usually $150-300). Can drive indefinitely but fuel economy will suffer.',
    driveable: true,
    estimatedCost: { min: 150, max: 350 }
  },

  'P0442': {
    code: 'P0442',
    description: 'Evaporative Emission Control System Leak Detected (Small Leak)',
    system: 'EMISSIONS',
    urgency: 'low',
    symptoms: ['Check engine light', 'Possible fuel smell', 'No performance issues'],
    possibleCauses: [
      'Loose or damaged gas cap',
      'Cracked EVAP hose',
      'Faulty purge valve',
      'Leak in fuel tank'
    ],
    recommendedAction: 'FIRST: Try tightening/replacing gas cap ($10). Clear code and see if it returns. If it does, get smoke test ($100-150) to find leak. Usually cheap fix.',
    driveable: true,
    estimatedCost: { min: 10, max: 400 }
  },

  'P0301': {
    code: 'P0301',
    description: 'Cylinder 1 Misfire Detected',
    system: 'IGNITION',
    urgency: 'high',
    symptoms: ['Rough idle', 'Engine shaking', 'Poor acceleration'],
    possibleCauses: [
      'Faulty spark plug',
      'Bad ignition coil',
      'Fuel injector issue',
      'Low compression'
    ],
    recommendedAction: 'Check spark plug and ignition coil for cylinder 1. If flashing light, stop driving. If solid, get diagnosed within 1-2 days.',
    driveable: true,
    estimatedCost: { min: 100, max: 500 }
  },

  'P0455': {
    code: 'P0455',
    description: 'Evaporative Emission Control System Leak Detected (Large Leak)',
    system: 'EMISSIONS',
    urgency: 'low',
    symptoms: ['Check engine light', 'Fuel smell', 'No performance issues'],
    possibleCauses: [
      'Loose or missing gas cap',
      'Cracked EVAP canister',
      'Broken EVAP hose',
      'Fuel tank leak'
    ],
    recommendedAction: 'Check gas cap first. If tight, likely larger EVAP system leak. Get diagnosed but safe to drive.',
    driveable: true,
    estimatedCost: { min: 10, max: 600 }
  },

  'P0401': {
    code: 'P0401',
    description: 'Exhaust Gas Recirculation Flow Insufficient Detected',
    system: 'EMISSIONS',
    urgency: 'low',
    symptoms: ['Rough idle', 'Stalling', 'Check engine light'],
    possibleCauses: [
      'Clogged EGR valve',
      'Faulty EGR valve',
      'Blocked EGR passages',
      'Bad EGR sensor'
    ],
    recommendedAction: 'Not urgent. Clean or replace EGR valve. Safe to drive but may fail emissions test.',
    driveable: true,
    estimatedCost: { min: 150, max: 450 }
  },

  'P0174': {
    code: 'P0174',
    description: 'System Too Lean (Bank 2)',
    system: 'FUEL',
    urgency: 'medium',
    symptoms: ['Poor fuel economy', 'Rough idle', 'Lack of power'],
    possibleCauses: [
      'Vacuum leak',
      'Faulty MAF sensor',
      'Fuel pump issue',
      'Dirty injectors'
    ],
    recommendedAction: 'Similar to P0171. Check for vacuum leaks and MAF sensor issues. Driveable.',
    driveable: true,
    estimatedCost: { min: 150, max: 800 }
  },

  'P0340': {
    code: 'P0340',
    description: 'Camshaft Position Sensor Circuit Malfunction',
    system: 'SENSORS',
    urgency: 'high',
    symptoms: ['Hard starting', 'Stalling', 'Poor performance', 'No start'],
    possibleCauses: [
      'Faulty camshaft sensor',
      'Wiring issues',
      'Timing belt/chain problems'
    ],
    recommendedAction: 'Can cause no-start condition. Get diagnosed and replaced soon (usually 1-2 hours labor).',
    driveable: true,
    estimatedCost: { min: 150, max: 400 }
  },
};

/**
 * Lookup a check engine code
 */
export function lookupCode(code: string): CheckEngineCode | null {
  const normalizedCode = code.toUpperCase().trim();
  return CHECK_ENGINE_CODES[normalizedCode] || null;
}

/**
 * Get urgency level description
 */
export function getUrgencyDescription(urgency: CheckEngineCode['urgency']): string {
  switch (urgency) {
    case 'critical':
      return '🚨 STOP DRIVING - Critical safety issue';
    case 'high':
      return '⚠️ HIGH - Get diagnosed within 1-2 days';
    case 'medium':
      return '⏰ MEDIUM - Schedule appointment within 1-2 weeks';
    case 'low':
      return 'ℹ️ LOW - Address when convenient, no rush';
  }
}

/**
 * Detect if light is likely flashing (critical misfire)
 */
export function isMisfireCode(code: string): boolean {
  const normalizedCode = code.toUpperCase().trim();
  return normalizedCode.startsWith('P03'); // P0300-P0312 are misfire codes
}

/**
 * Get system-specific advice
 */
export function getSystemAdvice(system: CheckEngineCode['system']): string {
  switch (system) {
    case 'EMISSIONS':
      return 'Emissions codes typically don\'t affect drivability but will cause inspection failure. Often cheaper to fix than expected.';
    case 'FUEL':
      return 'Fuel system issues can cause poor performance and fuel economy. Check fuel pressure and injectors.';
    case 'IGNITION':
      return 'Ignition issues can cause misfires. Check spark plugs, coils, and wires. Don\'t ignore misfires - they damage catalytic converters.';
    case 'ENGINE':
      return 'Engine codes range from minor (thermostat) to serious (compression). Get proper diagnosis before expensive repairs.';
    case 'TRANSMISSION':
      return 'Transmission codes need immediate attention. Check fluid level first, then get diagnosed.';
    case 'SENSORS':
      return 'Sensor failures are usually straightforward and affordable to fix. Replace faulty sensors promptly.';
    default:
      return 'Get a proper diagnosis before authorizing expensive repairs.';
  }
}

/**
 * Generate user-friendly summary
 */
export function generateCodeSummary(code: string): string {
  const codeInfo = lookupCode(code);

  if (!codeInfo) {
    return `Code ${code} not in database. Get it diagnosed at a shop or search online for details.`;
  }

  const urgency = getUrgencyDescription(codeInfo.urgency);
  const driveable = codeInfo.driveable ? '✅ Safe to drive' : '⛔ Do not drive';
  const cost = `$${codeInfo.estimatedCost.min}-$${codeInfo.estimatedCost.max}`;

  return `
**${codeInfo.code}: ${codeInfo.description}**

${urgency}
${driveable}

**Estimated Repair Cost**: ${cost}

**What's Happening**: ${codeInfo.possibleCauses[0]}

**Next Steps**: ${codeInfo.recommendedAction}

**System**: ${codeInfo.system} | ${getSystemAdvice(codeInfo.system)}
  `.trim();
}
