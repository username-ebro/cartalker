/**
 * Service Recommendations & Scam Detection Engine
 *
 * Analyzes service recommendations from mechanics/dealers to detect:
 * - Unnecessary upsells
 * - Premature service recommendations
 * - Price gouging
 * - Common scams
 *
 * Based on manufacturer maintenance schedules and industry standards.
 */

export interface ServiceRecommendation {
  service: string;
  recommendedPrice: number;
  urgency: 'immediate' | 'soon' | 'not-urgent' | 'unnecessary';
  reasoning: string;
  isLikelyUpsell?: boolean;
  alternativeAction?: string;
}

export interface MaintenanceHistory {
  service: string;
  date: string;
  mileage: number;
  cost: number;
}

export interface VehicleInfo {
  make: string;
  model: string;
  year: number;
  currentMileage: number;
  maintenanceHistory: MaintenanceHistory[];
}

/**
 * Standard maintenance intervals by service type (miles)
 */
const MAINTENANCE_INTERVALS: Record<string, number> = {
  'oil change': 5000,
  'tire rotation': 5000,
  'air filter': 15000,
  'cabin air filter': 15000,
  'brake fluid': 30000,
  'transmission fluid': 60000,
  'coolant flush': 60000,
  'spark plugs': 60000,
  'brake pads': 50000, // varies widely
  'timing belt': 100000,
};

/**
 * Common upsell services (often unnecessary or premature)
 */
const COMMON_UPSELLS = [
  'engine flush',
  'fuel injector cleaning',
  'transmission flush', // unless specific symptoms
  'differential flush', // unless specific symptoms
  'power steering flush',
  'throttle body cleaning',
  'brake fluid exchange', // unless contaminated
];

/**
 * DIY-friendly services (can save money doing yourself)
 */
const DIY_SERVICES: Record<string, { difficulty: 'easy' | 'medium' | 'hard'; savingsPercent: number }> = {
  'cabin air filter': { difficulty: 'easy', savingsPercent: 80 },
  'air filter': { difficulty: 'easy', savingsPercent: 75 },
  'wiper blades': { difficulty: 'easy', savingsPercent: 70 },
  'battery replacement': { difficulty: 'medium', savingsPercent: 50 },
  'headlight bulb': { difficulty: 'medium', savingsPercent: 60 },
};

/**
 * Analyze service recommendations from a mechanic/dealer
 */
export function analyzeServiceRecommendations(
  recommendations: Array<{ service: string; price: number }>,
  vehicleInfo: VehicleInfo
): ServiceRecommendation[] {
  return recommendations.map(rec => {
    const normalizedService = rec.service.toLowerCase();
    const analysis = analyzeIndividualService(normalizedService, rec.price, vehicleInfo);
    return analysis;
  });
}

/**
 * Analyze a single service recommendation
 */
function analyzeIndividualService(
  service: string,
  price: number,
  vehicleInfo: VehicleInfo
): ServiceRecommendation {
  // Check if it's a common upsell
  const isUpsell = COMMON_UPSELLS.some(upsell => service.includes(upsell));

  // Check maintenance history
  const lastService = findLastService(service, vehicleInfo.maintenanceHistory);
  const milesSinceLastService = lastService
    ? vehicleInfo.currentMileage - lastService.mileage
    : Infinity;

  // Get standard interval
  const standardInterval = getStandardInterval(service);

  // Determine urgency
  let urgency: 'immediate' | 'soon' | 'not-urgent' | 'unnecessary' = 'not-urgent';
  let reasoning = '';

  if (isUpsell) {
    urgency = 'unnecessary';
    reasoning = `${service} is often an unnecessary upsell. Only needed if you're experiencing specific symptoms.`;
  } else if (milesSinceLastService < standardInterval * 0.5) {
    urgency = 'unnecessary';
    reasoning = `${service} was done ${milesSinceLastService.toLocaleString()} miles ago. Standard interval is ${standardInterval.toLocaleString()} miles. This is premature.`;
  } else if (milesSinceLastService >= standardInterval * 1.2) {
    urgency = 'immediate';
    reasoning = `${service} is overdue. Last done ${milesSinceLastService.toLocaleString()} miles ago.`;
  } else if (milesSinceLastService >= standardInterval * 0.9) {
    urgency = 'soon';
    reasoning = `${service} is approaching the recommended interval of ${standardInterval.toLocaleString()} miles.`;
  } else {
    urgency = 'not-urgent';
    reasoning = `${service} is not urgently needed. ${(standardInterval - milesSinceLastService).toLocaleString()} miles remaining.`;
  }

  // Check if DIY-friendly
  const diyInfo = DIY_SERVICES[service];
  const alternativeAction = diyInfo
    ? `You can do this yourself (${diyInfo.difficulty} difficulty) and save ~${diyInfo.savingsPercent}%. Part costs ~$${(price * (1 - diyInfo.savingsPercent / 100)).toFixed(2)}.`
    : undefined;

  return {
    service,
    recommendedPrice: price,
    urgency,
    reasoning,
    isLikelyUpsell: isUpsell,
    alternativeAction,
  };
}

/**
 * Find the last time a service was performed
 */
function findLastService(
  service: string,
  history: MaintenanceHistory[]
): MaintenanceHistory | null {
  const normalizedService = service.toLowerCase();

  return history
    .filter(h => h.service.toLowerCase().includes(normalizedService))
    .sort((a, b) => b.mileage - a.mileage)[0] || null;
}

/**
 * Get standard maintenance interval for a service
 */
function getStandardInterval(service: string): number {
  const normalizedService = service.toLowerCase();

  for (const [key, interval] of Object.entries(MAINTENANCE_INTERVALS)) {
    if (normalizedService.includes(key)) {
      return interval;
    }
  }

  // Default interval if not found
  return 15000;
}

/**
 * Calculate total potential savings from avoiding unnecessary services
 */
export function calculateSavings(
  analysis: ServiceRecommendation[]
): { totalSavings: number; avoidableServices: string[] } {
  const avoidable = analysis.filter(
    a => a.urgency === 'unnecessary' || a.urgency === 'not-urgent'
  );

  const totalSavings = avoidable.reduce((sum, a) => sum + a.recommendedPrice, 0);
  const avoidableServices = avoidable.map(a => a.service);

  return { totalSavings, avoidableServices };
}

/**
 * Generate user-friendly summary
 */
export function generateRecommendationSummary(
  analysis: ServiceRecommendation[]
): string {
  const immediate = analysis.filter(a => a.urgency === 'immediate');
  const soon = analysis.filter(a => a.urgency === 'soon');
  const unnecessary = analysis.filter(a => a.urgency === 'unnecessary');

  let summary = '';

  if (immediate.length > 0) {
    summary += `🚨 **Do Now**: ${immediate.map(a => a.service).join(', ')}\n\n`;
  }

  if (soon.length > 0) {
    summary += `⏰ **Schedule Soon**: ${soon.map(a => a.service).join(', ')}\n\n`;
  }

  if (unnecessary.length > 0) {
    const savings = unnecessary.reduce((sum, a) => sum + a.recommendedPrice, 0);
    summary += `💰 **Skip These & Save $${savings.toFixed(2)}**: ${unnecessary.map(a => a.service).join(', ')}\n\n`;
  }

  return summary.trim();
}

/**
 * Detect common scam patterns
 */
export function detectScamPatterns(
  recommendations: Array<{ service: string; price: number }>
): { isLikelyScam: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Pattern 1: Too many flushes at once
  const flushes = recommendations.filter(r => r.service.toLowerCase().includes('flush'));
  if (flushes.length >= 3) {
    warnings.push('⚠️ Multiple fluid flushes recommended at once - often unnecessary');
  }

  // Pattern 2: Engine/transmission flush on newer vehicles
  const engineFlush = recommendations.some(r => r.service.toLowerCase().includes('engine flush'));
  const transFlush = recommendations.some(r => r.service.toLowerCase().includes('transmission flush'));
  if (engineFlush) {
    warnings.push('⚠️ Engine flush is rarely needed and can damage seals');
  }
  if (transFlush) {
    warnings.push('⚠️ Transmission flush controversial - check your manual first');
  }

  // Pattern 3: Expensive "preventative" services
  const expensive = recommendations.filter(r => r.price > 200);
  const preventative = expensive.filter(r =>
    r.service.toLowerCase().includes('prevent') ||
    r.service.toLowerCase().includes('clean') ||
    r.service.toLowerCase().includes('treatment')
  );
  if (preventative.length > 0) {
    warnings.push('⚠️ Expensive "preventative" services often provide minimal benefit');
  }

  return {
    isLikelyScam: warnings.length >= 2,
    warnings,
  };
}
