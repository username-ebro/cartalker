/**
 * Comprehensive Service Interval Database & Legitimacy Scoring Engine
 *
 * Determines if service recommendations are legitimate based on:
 * - Vehicle mileage
 * - Last service date
 * - Manufacturer recommendations
 * - Common scam patterns
 * - Real-world automotive best practices
 */

export interface ServiceInterval {
  name: string;
  category: 'ENGINE' | 'TRANSMISSION' | 'BRAKES' | 'FLUIDS' | 'FILTERS' | 'TIRES' | 'ELECTRICAL' | 'FUEL' | 'SUSPENSION' | 'COOLING';
  typicalIntervalMiles: number;
  typicalIntervalMonths: number;
  minIntervalMiles?: number; // earliest it might legitimately be needed
  maxIntervalMiles?: number; // don't go beyond this
  urgencyFactors: string[]; // things that make it more urgent
  scamIndicators: string[]; // red flags that suggest upselling
  description: string;
  typicalCostRange: { min: number; max: number };
  severeDrivingMultiplier?: number; // e.g., 0.75 means service at 75% of normal interval
  isOftenScam?: boolean;
}

export const SERVICE_INTERVALS: Record<string, ServiceInterval> = {
  // ENGINE MAINTENANCE
  OIL_CHANGE: {
    name: 'Oil Change',
    category: 'ENGINE',
    typicalIntervalMiles: 7500,
    typicalIntervalMonths: 6,
    minIntervalMiles: 3000,
    maxIntervalMiles: 10000,
    urgencyFactors: ['severe conditions', 'frequent towing', 'racing', 'dusty environment', 'short trips only'],
    scamIndicators: ['every 3000 miles for synthetic', 'regardless of driving habits', 'oil still clean'],
    description: 'Modern synthetic oil typically lasts 7,500-10,000 miles. Conventional oil 3,000-5,000 miles. Check your owner\'s manual.',
    typicalCostRange: { min: 40, max: 100 },
    severeDrivingMultiplier: 0.75,
  },

  OIL_FILTER: {
    name: 'Oil Filter Replacement',
    category: 'ENGINE',
    typicalIntervalMiles: 7500,
    typicalIntervalMonths: 6,
    minIntervalMiles: 3000,
    urgencyFactors: ['done with every oil change'],
    scamIndicators: ['separate from oil change', 'premium filter upsell without reason'],
    description: 'Always replaced during oil change. No separate service needed.',
    typicalCostRange: { min: 10, max: 30 },
  },

  ENGINE_AIR_FILTER: {
    name: 'Engine Air Filter',
    category: 'FILTERS',
    typicalIntervalMiles: 15000,
    typicalIntervalMonths: 12,
    minIntervalMiles: 10000,
    maxIntervalMiles: 30000,
    urgencyFactors: ['dusty environment', 'dirt roads', 'reduced fuel economy', 'reduced acceleration'],
    scamIndicators: ['every oil change', 'looks slightly dirty', 'preventive replacement under 10k miles'],
    description: 'Easy DIY job. Only replace when visibly dirty/clogged or at manufacturer interval.',
    typicalCostRange: { min: 15, max: 50 },
    severeDrivingMultiplier: 0.67,
  },

  CABIN_AIR_FILTER: {
    name: 'Cabin Air Filter',
    category: 'FILTERS',
    typicalIntervalMiles: 15000,
    typicalIntervalMonths: 12,
    minIntervalMiles: 10000,
    maxIntervalMiles: 30000,
    urgencyFactors: ['reduced HVAC airflow', 'musty smell', 'allergies'],
    scamIndicators: ['every oil change', 'premium filter mandatory', 'no symptoms present'],
    description: 'Very easy DIY job (5-10 minutes). Shop charges $50-80, parts cost $10-20.',
    typicalCostRange: { min: 10, max: 80 },
  },

  FUEL_FILTER: {
    name: 'Fuel Filter',
    category: 'FUEL',
    typicalIntervalMiles: 30000,
    typicalIntervalMonths: 24,
    minIntervalMiles: 20000,
    urgencyFactors: ['engine misfires', 'hard starting', 'stalling', 'poor acceleration'],
    scamIndicators: ['preventive replacement without symptoms', 'recommended at every service'],
    description: 'Modern fuel systems often have lifetime filters. Check manual before replacing.',
    typicalCostRange: { min: 50, max: 150 },
  },

  SPARK_PLUGS: {
    name: 'Spark Plug Replacement',
    category: 'ENGINE',
    typicalIntervalMiles: 60000,
    typicalIntervalMonths: 60,
    minIntervalMiles: 30000,
    maxIntervalMiles: 100000,
    urgencyFactors: ['engine misfires', 'rough idle', 'poor fuel economy', 'hard starting'],
    scamIndicators: ['recommended under 30k miles', 'iridium plugs need replacement at 30k', 'preventive replacement'],
    description: 'Copper plugs: 30k miles. Platinum: 60k miles. Iridium: 100k miles. Only replace early if misfiring.',
    typicalCostRange: { min: 100, max: 400 },
  },

  // TRANSMISSION
  TRANSMISSION_FLUID_CHANGE: {
    name: 'Transmission Fluid Change',
    category: 'TRANSMISSION',
    typicalIntervalMiles: 60000,
    typicalIntervalMonths: 60,
    minIntervalMiles: 30000,
    urgencyFactors: ['severe towing', 'racing', 'mountain driving', 'slipping gears', 'delayed engagement'],
    scamIndicators: ['recommended under 30k miles', 'preventive maintenance on new vehicles', 'flush recommended'],
    description: 'Drain and fill is safer than flush. Many modern transmissions have 100k+ intervals or are "lifetime" (means 150k).',
    typicalCostRange: { min: 150, max: 300 },
    severeDrivingMultiplier: 0.75,
  },

  TRANSMISSION_FLUSH: {
    name: 'Transmission Flush',
    category: 'TRANSMISSION',
    typicalIntervalMiles: 100000,
    typicalIntervalMonths: 120,
    minIntervalMiles: 60000,
    urgencyFactors: ['manufacturer specifically recommends', 'severe discoloration', 'burnt smell'],
    scamIndicators: ['recommended on high-mileage vehicles', 'preventive maintenance', 'recommended at every service'],
    description: 'CONTROVERSIAL. Can dislodge debris and cause failure on high-mileage transmissions. Drain and fill is safer.',
    typicalCostRange: { min: 200, max: 400 },
    isOftenScam: true,
  },

  DIFFERENTIAL_SERVICE: {
    name: 'Differential Fluid Service',
    category: 'TRANSMISSION',
    typicalIntervalMiles: 50000,
    typicalIntervalMonths: 60,
    minIntervalMiles: 30000,
    urgencyFactors: ['towing', 'off-road driving', 'whining noise from rear', '4WD/AWD vehicle'],
    scamIndicators: ['recommended on FWD vehicles', 'preventive maintenance under 30k'],
    description: 'Important for AWD/4WD and trucks. FWD cars often don\'t have separate differential. Check manual.',
    typicalCostRange: { min: 80, max: 150 },
  },

  // BRAKES
  BRAKE_PADS_FRONT: {
    name: 'Front Brake Pads',
    category: 'BRAKES',
    typicalIntervalMiles: 50000,
    typicalIntervalMonths: 60,
    minIntervalMiles: 25000,
    maxIntervalMiles: 70000,
    urgencyFactors: ['squealing', 'grinding', 'pulsing', 'reduced stopping power', 'warning light'],
    scamIndicators: ['preventive replacement with plenty of pad left', 'recommended at every inspection'],
    description: 'Varies widely based on driving style. Should have 3-4mm minimum thickness. Grinding = metal-on-metal damage.',
    typicalCostRange: { min: 150, max: 400 },
  },

  BRAKE_PADS_REAR: {
    name: 'Rear Brake Pads',
    category: 'BRAKES',
    typicalIntervalMiles: 70000,
    typicalIntervalMonths: 72,
    minIntervalMiles: 40000,
    maxIntervalMiles: 100000,
    urgencyFactors: ['squealing from rear', 'reduced braking', 'warning light'],
    scamIndicators: ['always replaced with front pads', 'preventive replacement'],
    description: 'Rear brakes wear slower than front. Don\'t need to be replaced at same time unless low.',
    typicalCostRange: { min: 150, max: 350 },
  },

  BRAKE_ROTORS: {
    name: 'Brake Rotor Replacement',
    category: 'BRAKES',
    typicalIntervalMiles: 70000,
    typicalIntervalMonths: 72,
    minIntervalMiles: 50000,
    urgencyFactors: ['pulsing when braking', 'deep grooves', 'below minimum thickness', 'warped'],
    scamIndicators: ['automatically replaced with pads', 'without measuring thickness', 'preventive replacement'],
    description: 'Only replace if below minimum thickness, severely grooved, or warped. Can often be resurfaced instead.',
    typicalCostRange: { min: 200, max: 600 },
  },

  BRAKE_FLUID_FLUSH: {
    name: 'Brake Fluid Flush',
    category: 'BRAKES',
    typicalIntervalMiles: 30000,
    typicalIntervalMonths: 36,
    minIntervalMiles: 20000,
    urgencyFactors: ['fluid dark/contaminated', 'moisture content high', 'spongy brake pedal', 'mountain driving'],
    scamIndicators: ['recommended at every service', 'preventive maintenance on new vehicles', 'fluid looks fine'],
    description: 'Brake fluid absorbs moisture over time. More important in humid climates. Check condition before replacing.',
    typicalCostRange: { min: 80, max: 150 },
  },

  // COOLING SYSTEM
  COOLANT_FLUSH: {
    name: 'Coolant Flush',
    category: 'COOLING',
    typicalIntervalMiles: 60000,
    typicalIntervalMonths: 60,
    minIntervalMiles: 30000,
    maxIntervalMiles: 100000,
    urgencyFactors: ['overheating', 'coolant rusty/contaminated', 'mixing coolant types'],
    scamIndicators: ['recommended at every service', 'preventive maintenance under 30k miles'],
    description: 'Modern long-life coolant can last 100k+ miles. Check color/condition before replacing.',
    typicalCostRange: { min: 100, max: 200 },
  },

  RADIATOR_FLUSH: {
    name: 'Radiator Flush',
    category: 'COOLING',
    typicalIntervalMiles: 60000,
    typicalIntervalMonths: 60,
    minIntervalMiles: 40000,
    urgencyFactors: ['overheating', 'visible contamination', 'coolant leak repairs'],
    scamIndicators: ['separate from coolant flush', 'recommended at every service'],
    description: 'Usually done as part of coolant service. Not a separate service.',
    typicalCostRange: { min: 100, max: 200 },
  },

  THERMOSTAT: {
    name: 'Thermostat Replacement',
    category: 'COOLING',
    typicalIntervalMiles: 100000,
    typicalIntervalMonths: 120,
    minIntervalMiles: 50000,
    urgencyFactors: ['overheating', 'engine runs cold', 'temperature fluctuations'],
    scamIndicators: ['preventive replacement', 'recommended without symptoms'],
    description: 'Only replace if failing. Symptoms: overheating or engine not reaching operating temperature.',
    typicalCostRange: { min: 150, max: 300 },
  },

  // FLUIDS
  POWER_STEERING_FLUSH: {
    name: 'Power Steering Flush',
    category: 'FLUIDS',
    typicalIntervalMiles: 75000,
    typicalIntervalMonths: 84,
    minIntervalMiles: 50000,
    urgencyFactors: ['whining noise', 'hard steering', 'fluid contaminated'],
    scamIndicators: ['preventive maintenance', 'recommended at every service', 'newer vehicles'],
    description: 'Often unnecessary. Many vehicles never need this. Only if fluid is contaminated or symptoms present.',
    typicalCostRange: { min: 100, max: 180 },
    isOftenScam: true,
  },

  // FUEL SYSTEM
  FUEL_SYSTEM_CLEANING: {
    name: 'Fuel System Cleaning',
    category: 'FUEL',
    typicalIntervalMiles: 60000,
    typicalIntervalMonths: 60,
    minIntervalMiles: 30000,
    urgencyFactors: ['rough idle', 'hesitation', 'poor fuel economy', 'misfires', 'check engine light'],
    scamIndicators: ['preventive maintenance', 'recommended at every service', 'no symptoms present', 'fuel additive upsell'],
    description: 'Often unnecessary. Use top-tier gas instead. Only needed if experiencing performance issues.',
    typicalCostRange: { min: 150, max: 300 },
    isOftenScam: true,
  },

  FUEL_INJECTOR_CLEANING: {
    name: 'Fuel Injector Cleaning',
    category: 'FUEL',
    typicalIntervalMiles: 60000,
    typicalIntervalMonths: 60,
    minIntervalMiles: 30000,
    urgencyFactors: ['rough idle', 'misfires', 'poor fuel economy', 'failed emissions test'],
    scamIndicators: ['preventive maintenance', 'recommended at every service', 'additive instead of service'],
    description: 'Rarely needed on modern engines using top-tier gas. Bottle of cleaner ($10) often as effective as $150 service.',
    typicalCostRange: { min: 150, max: 300 },
    isOftenScam: true,
  },

  ENGINE_FLUSH: {
    name: 'Engine Flush',
    category: 'ENGINE',
    typicalIntervalMiles: 999999, // essentially never
    typicalIntervalMonths: 999,
    minIntervalMiles: 100000,
    urgencyFactors: ['severe sludge buildup', 'neglected oil changes', 'preparing for rebuild'],
    scamIndicators: ['preventive maintenance', 'recommended at oil change', 'engine runs fine'],
    description: 'ALMOST ALWAYS A SCAM. Can dislodge sludge and cause engine damage. Regular oil changes prevent sludge.',
    typicalCostRange: { min: 100, max: 250 },
    isOftenScam: true,
  },

  THROTTLE_BODY_CLEANING: {
    name: 'Throttle Body Cleaning',
    category: 'ENGINE',
    typicalIntervalMiles: 75000,
    typicalIntervalMonths: 84,
    minIntervalMiles: 50000,
    urgencyFactors: ['rough idle', 'stalling', 'poor throttle response', 'check engine light'],
    scamIndicators: ['preventive maintenance', 'recommended without symptoms', 'every service interval'],
    description: 'Legitimate service but often oversold. Only needed if symptoms present. DIY with $10 can of cleaner.',
    typicalCostRange: { min: 80, max: 200 },
    isOftenScam: true,
  },

  // TIRES
  TIRE_ROTATION: {
    name: 'Tire Rotation',
    category: 'TIRES',
    typicalIntervalMiles: 5000,
    typicalIntervalMonths: 6,
    minIntervalMiles: 3000,
    maxIntervalMiles: 8000,
    urgencyFactors: ['uneven wear', 'directional tires', 'AWD vehicle'],
    scamIndicators: ['not needed on same-size tires', 'charged separately when easy to do'],
    description: 'Important for even wear. Should be free or cheap ($20-40) if done with other service.',
    typicalCostRange: { min: 0, max: 50 },
  },

  WHEEL_ALIGNMENT: {
    name: 'Wheel Alignment',
    category: 'TIRES',
    typicalIntervalMiles: 30000,
    typicalIntervalMonths: 36,
    minIntervalMiles: 10000,
    urgencyFactors: ['pulling to one side', 'uneven tire wear', 'after hitting curb/pothole', 'steering wheel off-center'],
    scamIndicators: ['recommended without symptoms', 'preventive maintenance', 'alignment looks fine'],
    description: 'Only needed if symptoms present or after suspension work. Get alignment check (free) before paying for adjustment.',
    typicalCostRange: { min: 75, max: 150 },
  },

  TIRE_BALANCE: {
    name: 'Tire Balance',
    category: 'TIRES',
    typicalIntervalMiles: 15000,
    typicalIntervalMonths: 18,
    minIntervalMiles: 5000,
    urgencyFactors: ['vibration at highway speeds', 'after tire replacement', 'after hitting pothole'],
    scamIndicators: ['recommended without vibration', 'every service interval'],
    description: 'Only needed if vibration present or after tire replacement. Should be $10-15 per tire.',
    typicalCostRange: { min: 40, max: 80 },
  },

  // ELECTRICAL
  BATTERY_REPLACEMENT: {
    name: 'Battery Replacement',
    category: 'ELECTRICAL',
    typicalIntervalMiles: 999999, // age-based, not mileage
    typicalIntervalMonths: 48,
    minIntervalMiles: 0,
    urgencyFactors: ['slow cranking', 'age over 3 years', 'dim lights', 'clicking when starting', 'battery warning light'],
    scamIndicators: ['battery tests good', 'preventive replacement under 3 years', 'premium battery upsell'],
    description: 'Average lifespan 3-5 years. Get free battery test before replacing. Extreme climates reduce life.',
    typicalCostRange: { min: 100, max: 250 },
  },

  ALTERNATOR: {
    name: 'Alternator Replacement',
    category: 'ELECTRICAL',
    typicalIntervalMiles: 150000,
    typicalIntervalMonths: 168,
    minIntervalMiles: 80000,
    urgencyFactors: ['battery warning light', 'dim lights', 'battery repeatedly dying', 'whining noise', 'electrical issues'],
    scamIndicators: ['preventive replacement', 'recommended without symptoms', 'charging system tests good'],
    description: 'Only replace if failing. Symptoms: battery light on, dim lights, battery keeps dying. Can be tested for free.',
    typicalCostRange: { min: 400, max: 800 },
  },

  STARTER: {
    name: 'Starter Replacement',
    category: 'ELECTRICAL',
    typicalIntervalMiles: 150000,
    typicalIntervalMonths: 168,
    minIntervalMiles: 75000,
    urgencyFactors: ['clicking when starting', 'grinding noise', 'no crank', 'intermittent starting'],
    scamIndicators: ['preventive replacement', 'starts fine', 'no symptoms'],
    description: 'Only replace if failing. Symptoms: clicking, grinding, or no crank when turning key.',
    typicalCostRange: { min: 300, max: 600 },
  },

  // SUSPENSION
  SHOCK_ABSORBERS: {
    name: 'Shock Absorber Replacement',
    category: 'SUSPENSION',
    typicalIntervalMiles: 50000,
    typicalIntervalMonths: 60,
    minIntervalMiles: 35000,
    maxIntervalMiles: 100000,
    urgencyFactors: ['bouncy ride', 'nose dives when braking', 'leaking fluid', 'uneven tire wear', 'clunking over bumps'],
    scamIndicators: ['preventive replacement', 'no symptoms present', 'all four at once without cause'],
    description: 'Wear gradually. Only replace if symptoms present or failed bounce test. Fronts wear faster than rears.',
    typicalCostRange: { min: 400, max: 1000 },
  },

  STRUTS: {
    name: 'Strut Replacement',
    category: 'SUSPENSION',
    typicalIntervalMiles: 75000,
    typicalIntervalMonths: 84,
    minIntervalMiles: 50000,
    maxIntervalMiles: 100000,
    urgencyFactors: ['clunking over bumps', 'nose dives when braking', 'uneven tire wear', 'leaking fluid'],
    scamIndicators: ['preventive replacement', 'no symptoms present', 'ride feels fine'],
    description: 'More expensive than shocks. Part of suspension structure. Only replace if symptoms or visible damage.',
    typicalCostRange: { min: 600, max: 1400 },
  },
};

export interface ServiceCheck {
  isLegitimate: boolean;
  urgencyLevel: 'scam' | 'unnecessary' | 'can-wait' | 'soon' | 'overdue' | 'urgent' | 'safety-critical';
  confidence: number; // 0-100
  reason: string;
  nextDueAt?: number; // mileage
  nextDueDate?: Date;
  milesUntilDue?: number;
  monthsUntilDue?: number;
  talkingPoints: string[];
  flags: string[]; // red flags detected
  alternativeAction?: string;
  estimatedFairPrice?: { min: number; max: number };
  scamLikelihood?: number; // 0-100, if service is known to be oversold
}

export interface CheckServiceInput {
  serviceType: string;
  currentMileage: number;
  lastServiceMileage?: number;
  lastServiceDate?: Date;
  symptoms?: string[];
  quotedPrice?: number;
  vehicleAge?: number; // in months
  drivingConditions?: 'normal' | 'severe'; // severe = towing, racing, dusty, extreme temps
}

/**
 * Main function: Check if a service recommendation is legitimate
 */
export function checkServiceLegitimacy(input: CheckServiceInput): ServiceCheck {
  const {
    serviceType,
    currentMileage,
    lastServiceMileage,
    lastServiceDate,
    symptoms = [],
    quotedPrice,
    vehicleAge,
    drivingConditions = 'normal',
  } = input;

  // Find service in database
  const serviceKey = findServiceKey(serviceType);
  const service = serviceKey ? SERVICE_INTERVALS[serviceKey] : null;

  if (!service) {
    return {
      isLegitimate: true, // benefit of doubt
      urgencyLevel: 'can-wait',
      confidence: 30,
      reason: `Service "${serviceType}" not found in database. Consult owner's manual for manufacturer recommendation.`,
      talkingPoints: [
        `What does my owner's manual say about ${serviceType}?`,
        'Can you show me the specific symptom that indicates this service is needed?',
      ],
      flags: ['Service not in database - verify with manual'],
    };
  }

  // Calculate miles since last service
  const milesSinceLastService = lastServiceMileage ? currentMileage - lastServiceMileage : null;

  // Calculate months since last service
  const monthsSinceLastService = lastServiceDate
    ? Math.floor((Date.now() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44))
    : null;

  // Adjust interval based on driving conditions
  const intervalMiles = drivingConditions === 'severe' && service.severeDrivingMultiplier
    ? service.typicalIntervalMiles * service.severeDrivingMultiplier
    : service.typicalIntervalMiles;

  const intervalMonths = service.typicalIntervalMonths;

  // Check for symptoms that justify early service
  const hasJustifyingSymptoms = symptoms.some(symptom =>
    service.urgencyFactors.some(factor =>
      symptom.toLowerCase().includes(factor.toLowerCase())
    )
  );

  // Check for scam indicators
  const scamFlags: string[] = [];
  symptoms.forEach(symptom => {
    service.scamIndicators.forEach(indicator => {
      if (symptom.toLowerCase().includes(indicator.toLowerCase())) {
        scamFlags.push(`Scam indicator: "${symptom}" matches "${indicator}"`);
      }
    });
  });

  // Check if service is commonly oversold
  if (service.isOftenScam) {
    scamFlags.push(`${service.name} is frequently oversold as "preventive maintenance"`);
  }

  // Determine legitimacy and urgency
  const analysis = analyzeServiceNeed({
    service,
    milesSinceLastService,
    monthsSinceLastService,
    intervalMiles,
    intervalMonths,
    hasJustifyingSymptoms,
    scamFlags,
    currentMileage,
    quotedPrice,
    vehicleAge,
  });

  return analysis;
}

interface AnalyzeServiceNeedInput {
  service: ServiceInterval;
  milesSinceLastService: number | null;
  monthsSinceLastService: number | null;
  intervalMiles: number;
  intervalMonths: number;
  hasJustifyingSymptoms: boolean;
  scamFlags: string[];
  currentMileage: number;
  quotedPrice?: number;
  vehicleAge?: number;
}

function analyzeServiceNeed(input: AnalyzeServiceNeedInput): ServiceCheck {
  const {
    service,
    milesSinceLastService,
    monthsSinceLastService,
    intervalMiles,
    intervalMonths,
    hasJustifyingSymptoms,
    scamFlags,
    currentMileage,
    quotedPrice,
    vehicleAge,
  } = input;

  const flags: string[] = [...scamFlags];
  const talkingPoints: string[] = [];
  let urgencyLevel: ServiceCheck['urgencyLevel'] = 'can-wait';
  let confidence = 80;
  let reason = '';
  let isLegitimate = true;
  let scamLikelihood = service.isOftenScam ? 70 : 0;

  // Calculate miles/months until due
  const milesUntilDue = milesSinceLastService !== null
    ? intervalMiles - milesSinceLastService
    : intervalMiles - currentMileage;

  const monthsUntilDue = monthsSinceLastService !== null
    ? intervalMonths - monthsSinceLastService
    : null;

  // CASE 1: Service has justifying symptoms
  if (hasJustifyingSymptoms) {
    urgencyLevel = 'urgent';
    confidence = 90;
    reason = `${service.name} is justified due to symptoms: ${input.hasJustifyingSymptoms}`;
    isLegitimate = true;
    scamLikelihood = 0;

    talkingPoints.push(
      `I'm experiencing symptoms that justify this service.`,
      `Can you show me the specific component that needs attention?`,
      `What happens if I delay this service?`
    );
  }
  // CASE 2: No service history (new vehicle or first time)
  else if (milesSinceLastService === null && monthsSinceLastService === null) {
    if (currentMileage >= intervalMiles * 1.2 || (vehicleAge && vehicleAge >= intervalMonths * 1.2)) {
      urgencyLevel = 'overdue';
      confidence = 85;
      reason = `${service.name} appears overdue. Current mileage: ${currentMileage.toLocaleString()}, typical interval: ${intervalMiles.toLocaleString()} miles.`;
      isLegitimate = true;

      talkingPoints.push(
        `What does my service history show for this?`,
        `Is this service documented in my owner's manual at this interval?`
      );
    } else if (currentMileage >= intervalMiles * 0.9 || (vehicleAge && vehicleAge >= intervalMonths * 0.9)) {
      urgencyLevel = 'soon';
      confidence = 75;
      reason = `${service.name} is approaching recommended interval. Currently at ${currentMileage.toLocaleString()} miles, interval is ${intervalMiles.toLocaleString()} miles.`;
      isLegitimate = true;

      talkingPoints.push(
        `Can we schedule this for my next visit?`,
        `What's the grace period on this service?`
      );
    } else if (currentMileage < service.minIntervalMiles!) {
      urgencyLevel = 'unnecessary';
      confidence = 90;
      reason = `${service.name} is being recommended too early. Current mileage: ${currentMileage.toLocaleString()}, minimum interval: ${service.minIntervalMiles?.toLocaleString()} miles.`;
      isLegitimate = false;
      scamLikelihood = 80;
      flags.push('Recommended well before minimum interval');

      talkingPoints.push(
        `Why is this needed before the minimum interval of ${service.minIntervalMiles?.toLocaleString()} miles?`,
        `My owner's manual shows a different interval. Can you explain?`,
        `I'll decline this service for now and reconsider at the proper interval.`
      );
    } else {
      urgencyLevel = 'can-wait';
      confidence = 70;
      reason = `${service.name} is not yet due. ${milesUntilDue.toLocaleString()} miles remaining until recommended interval.`;
      isLegitimate = false;

      talkingPoints.push(
        `Can we wait until the manufacturer recommended interval?`,
        `What specific problem am I preventing by doing this early?`
      );
    }
  }
  // CASE 3: Service history available
  else {
    const mileageRatio = milesSinceLastService! / intervalMiles;
    const monthsRatio = monthsSinceLastService ? monthsSinceLastService / intervalMonths : 0;
    const maxRatio = Math.max(mileageRatio, monthsRatio);

    if (maxRatio < 0.5) {
      // Way too early
      urgencyLevel = 'scam';
      confidence = 95;
      reason = `${service.name} was done only ${milesSinceLastService?.toLocaleString()} miles ago (${monthsSinceLastService} months). Typical interval is ${intervalMiles.toLocaleString()} miles (${intervalMonths} months). This is a clear upsell.`;
      isLegitimate = false;
      scamLikelihood = 95;
      flags.push('Service recommended at less than 50% of normal interval');

      talkingPoints.push(
        `This service was just done ${milesSinceLastService?.toLocaleString()} miles ago. Why is it needed again?`,
        `Are you looking at the correct service history?`,
        `I'm not comfortable with this recommendation. Let me get a second opinion.`
      );
    } else if (maxRatio < 0.75) {
      // Too early
      urgencyLevel = 'unnecessary';
      confidence = 85;
      reason = `${service.name} is being recommended early. Last done ${milesSinceLastService?.toLocaleString()} miles ago, standard interval is ${intervalMiles.toLocaleString()} miles. Still ${Math.abs(milesUntilDue).toLocaleString()} miles to go.`;
      isLegitimate = false;
      scamLikelihood = 70;
      flags.push('Recommended before 75% of interval reached');

      talkingPoints.push(
        `Can we wait until closer to the ${intervalMiles.toLocaleString()} mile interval?`,
        `What will happen if I wait another ${Math.abs(milesUntilDue).toLocaleString()} miles?`,
        `I'd prefer to stick to the manufacturer schedule.`
      );
    } else if (maxRatio < 0.9) {
      // Getting close, but not urgent
      urgencyLevel = 'can-wait';
      confidence = 75;
      reason = `${service.name} is approaching recommended interval. Last done ${milesSinceLastService?.toLocaleString()} miles ago. About ${Math.abs(milesUntilDue).toLocaleString()} miles remaining.`;
      isLegitimate = true;

      talkingPoints.push(
        `Can we schedule this for my next visit?`,
        `How many miles can I safely go before this becomes urgent?`
      );
    } else if (maxRatio < 1.1) {
      // Due now
      urgencyLevel = 'soon';
      confidence = 90;
      reason = `${service.name} is due. Last done ${milesSinceLastService?.toLocaleString()} miles ago (${monthsSinceLastService} months). Recommended interval: ${intervalMiles.toLocaleString()} miles.`;
      isLegitimate = true;

      talkingPoints.push(
        `Let's go ahead with this service.`,
        `Can you show me the old [fluid/filter/part] condition?`
      );
    } else if (maxRatio < 1.3) {
      // Overdue
      urgencyLevel = 'overdue';
      confidence = 90;
      reason = `${service.name} is overdue. Last done ${milesSinceLastService?.toLocaleString()} miles ago (${monthsSinceLastService} months). Should have been done at ${intervalMiles.toLocaleString()} miles.`;
      isLegitimate = true;

      talkingPoints.push(
        `I understand this is overdue. Let's get it done.`,
        `What's the risk if I delay this further?`
      );
    } else {
      // Significantly overdue
      urgencyLevel = 'safety-critical';
      confidence = 95;
      reason = `${service.name} is significantly overdue! Last done ${milesSinceLastService?.toLocaleString()} miles ago. This should be addressed immediately to avoid damage.`;
      isLegitimate = true;

      talkingPoints.push(
        `I understand this needs immediate attention.`,
        `What kind of damage am I risking by delaying?`
      );
    }
  }

  // Price analysis
  if (quotedPrice) {
    const { min, max } = service.typicalCostRange;
    if (quotedPrice > max * 1.5) {
      flags.push(`Quoted price ($${quotedPrice}) is significantly above typical range ($${min}-$${max})`);
      scamLikelihood = Math.min(scamLikelihood + 20, 100);
      talkingPoints.push(
        `This price seems high. Can you break down the cost?`,
        `I've seen quotes of $${min}-$${max} for this service elsewhere.`
      );
    } else if (quotedPrice > max * 1.2) {
      flags.push(`Quoted price ($${quotedPrice}) is above typical range ($${min}-$${max})`);
      talkingPoints.push(`Can you explain why the price is higher than the typical $${min}-$${max} range?`);
    }
  }

  // Generate alternative actions
  let alternativeAction: string | undefined;
  if (urgencyLevel === 'unnecessary' || urgencyLevel === 'can-wait') {
    if (service.name.includes('Filter') && !service.name.includes('Fuel')) {
      alternativeAction = `${service.name} is an easy DIY job. Parts cost $${service.typicalCostRange.min}-${service.typicalCostRange.min * 2}. YouTube has guides.`;
    } else if (service.isOftenScam) {
      alternativeAction = `Consider getting a second opinion. ${service.name} is frequently oversold.`;
    } else {
      alternativeAction = `Schedule this for your next regular maintenance visit to save time and money.`;
    }
  }

  return {
    isLegitimate,
    urgencyLevel,
    confidence,
    reason,
    nextDueAt: milesSinceLastService !== null ? currentMileage + milesUntilDue : undefined,
    nextDueDate: monthsUntilDue !== null && monthsUntilDue > 0
      ? new Date(Date.now() + monthsUntilDue * 30.44 * 24 * 60 * 60 * 1000)
      : undefined,
    milesUntilDue: milesUntilDue > 0 ? milesUntilDue : undefined,
    monthsUntilDue: monthsUntilDue !== null && monthsUntilDue > 0 ? monthsUntilDue : undefined,
    talkingPoints,
    flags,
    alternativeAction,
    estimatedFairPrice: service.typicalCostRange,
    scamLikelihood,
  };
}

/**
 * Find service key by fuzzy matching service name
 */
function findServiceKey(serviceType: string): string | null {
  const normalized = serviceType.toLowerCase().trim();

  // Exact key match
  const exactKey = Object.keys(SERVICE_INTERVALS).find(
    key => key.toLowerCase() === normalized.replace(/\s+/g, '_')
  );
  if (exactKey) return exactKey;

  // Fuzzy match on service names
  const fuzzyMatch = Object.entries(SERVICE_INTERVALS).find(([key, service]) =>
    service.name.toLowerCase().includes(normalized) ||
    normalized.includes(service.name.toLowerCase())
  );
  if (fuzzyMatch) return fuzzyMatch[0];

  // Partial word matching
  const words = normalized.split(' ');
  const partialMatch = Object.entries(SERVICE_INTERVALS).find(([key, service]) =>
    words.some(word =>
      word.length > 3 && service.name.toLowerCase().includes(word)
    )
  );

  return partialMatch ? partialMatch[0] : null;
}

/**
 * Batch analyze multiple service recommendations
 */
export function analyzeMultipleServices(
  services: Array<CheckServiceInput>
): {
  checks: ServiceCheck[];
  overallScamScore: number;
  totalPotentialSavings: number;
  recommendations: {
    doNow: string[];
    scheduleSoon: string[];
    decline: string[];
  };
} {
  const checks = services.map(checkServiceLegitimacy);

  const scamScores = checks.map(c => c.scamLikelihood || 0);
  const overallScamScore = scamScores.reduce((a, b) => a + b, 0) / scamScores.length;

  const unnecessaryServices = checks.filter(
    c => c.urgencyLevel === 'unnecessary' || c.urgencyLevel === 'scam'
  );

  const totalPotentialSavings = unnecessaryServices.reduce((sum, check, index) => {
    const quotedPrice = services[index].quotedPrice || check.estimatedFairPrice?.max || 0;
    return sum + quotedPrice;
  }, 0);

  const doNow = services
    .filter((_, i) => ['urgent', 'overdue', 'safety-critical'].includes(checks[i].urgencyLevel))
    .map(s => s.serviceType);

  const scheduleSoon = services
    .filter((_, i) => checks[i].urgencyLevel === 'soon')
    .map(s => s.serviceType);

  const decline = services
    .filter((_, i) => ['unnecessary', 'scam', 'can-wait'].includes(checks[i].urgencyLevel))
    .map(s => s.serviceType);

  return {
    checks,
    overallScamScore,
    totalPotentialSavings,
    recommendations: {
      doNow,
      scheduleSoon,
      decline,
    },
  };
}
