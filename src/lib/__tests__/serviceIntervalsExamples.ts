/**
 * Service Interval System Examples & Test Cases
 *
 * Demonstrates the legitimacy scoring engine with real-world scenarios
 */

import {
  checkServiceLegitimacy,
  analyzeMultipleServices,
  CheckServiceInput,
} from '../serviceIntervals';
import { generateTalkingPoints, generateConversationScript } from '../talkingPoints';

// EXAMPLE 1: Clear Scam - Oil Change Too Soon
console.log('='.repeat(80));
console.log('EXAMPLE 1: Oil Change Recommended After 2,000 Miles');
console.log('='.repeat(80));

const scamOilChange = checkServiceLegitimacy({
  serviceType: 'Oil Change',
  currentMileage: 45000,
  lastServiceMileage: 43000,
  quotedPrice: 89,
  drivingConditions: 'normal',
});

console.log('Result:', scamOilChange);
console.log('\nTalking Points:');
const oilChangeTalkingPoints = generateTalkingPoints(scamOilChange, 'Oil Change', 89);
console.log('Opening:', oilChangeTalkingPoints.opening[0].text);
console.log('Objection:', oilChangeTalkingPoints.objecting[0]?.text);
console.log('\n');

// EXAMPLE 2: Legitimate Service - Brake Pads Overdue
console.log('='.repeat(80));
console.log('EXAMPLE 2: Brake Pads Overdue with Symptoms');
console.log('='.repeat(80));

const legitimateBrakes = checkServiceLegitimacy({
  serviceType: 'Front Brake Pads',
  currentMileage: 95000,
  lastServiceMileage: 35000,
  symptoms: ['squealing', 'reduced stopping power'],
  quotedPrice: 280,
});

console.log('Result:', legitimateBrakes);
console.log('\nTalking Points:');
const brakesTalkingPoints = generateTalkingPoints(legitimateBrakes, 'Front Brake Pads', 280);
console.log('Opening:', brakesTalkingPoints.opening[0].text);
console.log('Clarifying:', brakesTalkingPoints.clarifying[0].text);
console.log('\n');

// EXAMPLE 3: Price Gouging - Cabin Air Filter
console.log('='.repeat(80));
console.log('EXAMPLE 3: Cabin Air Filter Overpriced');
console.log('='.repeat(80));

const overPricedFilter = checkServiceLegitimacy({
  serviceType: 'Cabin Air Filter',
  currentMileage: 35000,
  lastServiceMileage: 20000,
  quotedPrice: 120, // Should be $10-80
});

console.log('Result:', overPricedFilter);
console.log('\nAlternative Action:', overPricedFilter.alternativeAction);
console.log('\n');

// EXAMPLE 4: Common Scam - Engine Flush
console.log('='.repeat(80));
console.log('EXAMPLE 4: Engine Flush Recommendation (Almost Always a Scam)');
console.log('='.repeat(80));

const engineFlush = checkServiceLegitimacy({
  serviceType: 'Engine Flush',
  currentMileage: 60000,
  quotedPrice: 150,
  drivingConditions: 'normal',
});

console.log('Result:', engineFlush);
console.log('Scam Likelihood:', engineFlush.scamLikelihood, '%');
console.log('\nEmergency Exit Available:', !!generateTalkingPoints(engineFlush, 'Engine Flush', 150).emergencyExit);
console.log('\n');

// EXAMPLE 5: Transmission Flush on High Mileage (Risky)
console.log('='.repeat(80));
console.log('EXAMPLE 5: Transmission Flush on 140k Mile Vehicle');
console.log('='.repeat(80));

const riskyTransmission = checkServiceLegitimacy({
  serviceType: 'Transmission Flush',
  currentMileage: 140000,
  lastServiceMileage: 60000,
  quotedPrice: 350,
});

console.log('Result:', riskyTransmission);
console.log('Flags:', riskyTransmission.flags);
console.log('\n');

// EXAMPLE 6: Multiple Services Analysis (The Full Inspection Upsell)
console.log('='.repeat(80));
console.log('EXAMPLE 6: Multiple Service Recommendations (Typical Dealership Upsell)');
console.log('='.repeat(80));

const multipleServices: CheckServiceInput[] = [
  {
    serviceType: 'Oil Change',
    currentMileage: 45000,
    lastServiceMileage: 37500,
    quotedPrice: 85,
  },
  {
    serviceType: 'Cabin Air Filter',
    currentMileage: 45000,
    quotedPrice: 80,
  },
  {
    serviceType: 'Engine Air Filter',
    currentMileage: 45000,
    quotedPrice: 50,
  },
  {
    serviceType: 'Fuel System Cleaning',
    currentMileage: 45000,
    quotedPrice: 200,
  },
  {
    serviceType: 'Transmission Flush',
    currentMileage: 45000,
    lastServiceMileage: 0,
    quotedPrice: 300,
  },
  {
    serviceType: 'Coolant Flush',
    currentMileage: 45000,
    quotedPrice: 150,
  },
  {
    serviceType: 'Power Steering Flush',
    currentMileage: 45000,
    quotedPrice: 120,
  },
];

const multiAnalysis = analyzeMultipleServices(multipleServices);

console.log('Overall Scam Score:', multiAnalysis.overallScamScore.toFixed(1), '%');
console.log('Total Quoted:', multipleServices.reduce((sum, s) => sum + (s.quotedPrice || 0), 0));
console.log('Potential Savings:', '$' + multiAnalysis.totalPotentialSavings.toFixed(2));
console.log('\nRecommendations:');
console.log('- Do Now:', multiAnalysis.recommendations.doNow.join(', ') || 'None');
console.log('- Schedule Soon:', multiAnalysis.recommendations.scheduleSoon.join(', ') || 'None');
console.log('- DECLINE:', multiAnalysis.recommendations.decline.join(', '));
console.log('\n');

// EXAMPLE 7: Service Due Soon (Proper Timing)
console.log('='.repeat(80));
console.log('EXAMPLE 7: Spark Plugs Approaching Interval');
console.log('='.repeat(80));

const sparkPlugsSoon = checkServiceLegitimacy({
  serviceType: 'Spark Plugs',
  currentMileage: 58000,
  lastServiceMileage: 0,
  quotedPrice: 250,
});

console.log('Result:', sparkPlugsSoon);
console.log('Miles Until Due:', sparkPlugsSoon.milesUntilDue);
console.log('\n');

// EXAMPLE 8: Severe Driving Conditions
console.log('='.repeat(80));
console.log('EXAMPLE 8: Oil Change with Severe Driving (Towing/Racing)');
console.log('='.repeat(80));

const severeOilChange = checkServiceLegitimacy({
  serviceType: 'Oil Change',
  currentMileage: 42000,
  lastServiceMileage: 37000, // 5k miles ago
  drivingConditions: 'severe',
  symptoms: ['frequent towing'],
  quotedPrice: 75,
});

console.log('Result:', severeOilChange);
console.log('Reason:', severeOilChange.reason);
console.log('\n');

// EXAMPLE 9: Unknown Service (Not in Database)
console.log('='.repeat(80));
console.log('EXAMPLE 9: Service Not in Database');
console.log('='.repeat(80));

const unknownService = checkServiceLegitimacy({
  serviceType: 'Flux Capacitor Realignment',
  currentMileage: 88000,
  quotedPrice: 1210,
});

console.log('Result:', unknownService);
console.log('\n');

// EXAMPLE 10: Conversation Script Generation
console.log('='.repeat(80));
console.log('EXAMPLE 10: Full Conversation Script for Engine Flush Scam');
console.log('='.repeat(80));

const script = generateConversationScript(engineFlush, 'Engine Flush', 150);
console.log(script);

// EXAMPLE 11: Safety Critical - Severely Overdue Brakes
console.log('='.repeat(80));
console.log('EXAMPLE 11: Safety Critical - Brake Pads Severely Overdue');
console.log('='.repeat(80));

const criticalBrakes = checkServiceLegitimacy({
  serviceType: 'Front Brake Pads',
  currentMileage: 110000,
  lastServiceMileage: 35000, // 75k miles ago!
  symptoms: ['grinding noise'],
  quotedPrice: 450,
});

console.log('Result:', criticalBrakes);
console.log('Urgency:', criticalBrakes.urgencyLevel);
console.log('\n');

// EXAMPLE 12: Battery Replacement (Age-Based, Not Mileage)
console.log('='.repeat(80));
console.log('EXAMPLE 12: Battery Replacement Based on Age');
console.log('='.repeat(80));

const batteryOld = checkServiceLegitimacy({
  serviceType: 'Battery Replacement',
  currentMileage: 45000,
  vehicleAge: 60, // 5 years old
  symptoms: ['slow cranking'],
  quotedPrice: 180,
});

console.log('Result:', batteryOld);
console.log('\n');

// SUMMARY STATISTICS
console.log('='.repeat(80));
console.log('SYSTEM SUMMARY');
console.log('='.repeat(80));
console.log('Total Services in Database: 35');
console.log('Categories: ENGINE, TRANSMISSION, BRAKES, FLUIDS, FILTERS, TIRES, ELECTRICAL, FUEL, SUSPENSION, COOLING');
console.log('Urgency Levels: scam, unnecessary, can-wait, soon, overdue, urgent, safety-critical');
console.log('Edge Cases Handled:');
console.log('  - Services done too recently (scam detection)');
console.log('  - Severely overdue services (safety warnings)');
console.log('  - Price gouging detection');
console.log('  - Commonly oversold services (engine flush, transmission flush, etc.)');
console.log('  - Severe driving conditions (interval adjustments)');
console.log('  - Symptoms that justify early service');
console.log('  - Unknown services (graceful handling)');
console.log('  - Age-based vs mileage-based services');
console.log('  - Multi-service analysis with scam scoring');
console.log('  - DIY alternatives and cost savings');
console.log('\n');

export {};
