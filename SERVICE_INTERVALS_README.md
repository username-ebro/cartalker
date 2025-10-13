# Service Interval Database & Legitimacy Scoring Engine

A comprehensive system for determining if automotive service recommendations are legitimate based on vehicle mileage, maintenance history, manufacturer recommendations, and common scam patterns.

## Features

### Service Interval Database (35+ Services)
- **Engine:** Oil change, oil filter, air filter, spark plugs, engine flush, throttle body
- **Transmission:** Fluid change, flush, differential service
- **Brakes:** Front/rear pads, rotors, fluid flush
- **Cooling:** Coolant flush, radiator flush, thermostat
- **Fluids:** Power steering flush
- **Fuel System:** Fuel filter, injector cleaning, fuel system cleaning
- **Filters:** Engine air filter, cabin air filter, fuel filter
- **Tires:** Rotation, alignment, balance
- **Electrical:** Battery, alternator, starter
- **Suspension:** Shocks, struts

### Legitimacy Scoring Engine
- **7 Urgency Levels:** scam, unnecessary, can-wait, soon, overdue, urgent, safety-critical
- **Confidence Scores:** 0-100% confidence in recommendation
- **Scam Likelihood:** 0-100% probability service is oversold
- **Price Analysis:** Compares quoted price to typical market range
- **Condition Detection:** Adjusts intervals for severe driving conditions

### Talking Points Generator
- **5 Conversation Stages:** Opening, clarifying, objecting, negotiating, closing
- **Emergency Exit Scripts:** For high-pressure situations
- **Tone Adaptation:** Polite, firm, skeptical, assertive based on situation
- **Context-Aware:** Generates specific questions based on service type

## Usage Examples

### Basic Service Check
```typescript
import { checkServiceLegitimacy } from '@/lib/serviceIntervals';

const result = checkServiceLegitimacy({
  serviceType: 'Oil Change',
  currentMileage: 45000,
  lastServiceMileage: 43000,
  quotedPrice: 89,
  drivingConditions: 'normal',
});

console.log(result.urgencyLevel); // 'scam'
console.log(result.confidence); // 95
console.log(result.reason); // 'Oil Change was done only 2,000 miles ago...'
console.log(result.scamLikelihood); // 95
```

### Multiple Services Analysis
```typescript
import { analyzeMultipleServices } from '@/lib/serviceIntervals';

const services = [
  { serviceType: 'Oil Change', currentMileage: 45000, lastServiceMileage: 37500, quotedPrice: 85 },
  { serviceType: 'Fuel System Cleaning', currentMileage: 45000, quotedPrice: 200 },
  { serviceType: 'Transmission Flush', currentMileage: 45000, quotedPrice: 300 },
];

const analysis = analyzeMultipleServices(services);

console.log(analysis.overallScamScore); // 32.9%
console.log(analysis.totalPotentialSavings); // $500
console.log(analysis.recommendations.doNow); // ['Oil Change']
console.log(analysis.recommendations.decline); // ['Fuel System Cleaning', 'Transmission Flush']
```

### Talking Points Generation
```typescript
import { generateTalkingPoints, generateConversationScript } from '@/lib/talkingPoints';

const talkingPoints = generateTalkingPoints(result, 'Engine Flush', 150);

console.log(talkingPoints.opening[0].text);
// "Can you explain why Engine Flush is being recommended at this mileage?"

console.log(talkingPoints.objecting[0].text);
// "I'd like to decline Engine Flush for now. It's not in line with my manufacturer's maintenance schedule."

console.log(talkingPoints.emergencyExit[0].text);
// "I need to check with my spouse before approving any additional services."
```

### Full Conversation Script
```typescript
const script = generateConversationScript(result, 'Engine Flush', 150);
console.log(script);
// Returns a formatted markdown conversation guide with all talking points
```

## Real-World Test Cases

### Example 1: Clear Scam (Oil Change After 2k Miles)
- **Input:** Oil change recommended 2,000 miles after last service
- **Output:** Urgency: SCAM, Confidence: 95%, Scam Likelihood: 95%
- **Talking Point:** "This service was just done 2,000 miles ago. Why is it needed again?"

### Example 2: Legitimate Service (Overdue Brakes with Symptoms)
- **Input:** Brake pads 60k miles overdue with squealing and reduced stopping power
- **Output:** Urgency: URGENT, Confidence: 90%, Scam Likelihood: 0%
- **Talking Point:** "I understand this is overdue. Let's get it done."

### Example 3: Price Gouging (Cabin Air Filter $120)
- **Input:** Cabin air filter quoted at $120 (typical: $10-80)
- **Output:** Flags: "Quoted price above typical range"
- **Alternative:** "Very easy DIY job. Parts cost $10-20. YouTube has guides."

### Example 4: Common Scam (Engine Flush)
- **Input:** Engine flush recommended at 60k miles (min interval: 100k)
- **Output:** Urgency: UNNECESSARY, Scam Likelihood: 80%
- **Emergency Exit:** Available due to high scam likelihood

### Example 5: Multiple Services Upsell
- **Input:** 7 services totaling $985
- **Output:** Overall scam score: 32.9%, Potential savings: $165
- **Recommendations:** Do 2, Schedule 1, Decline 4

## Key Features

### Scam Detection Patterns
1. **Too Soon:** Services recommended well before interval (< 50%)
2. **Multiple Flushes:** 3+ fluid flushes at once
3. **Engine Flush:** Almost always unnecessary, can damage seals
4. **Transmission Flush:** Risky on high-mileage vehicles
5. **Price Gouging:** Quotes 30%+ above typical range
6. **No Symptoms:** "Preventive" services without justification

### Edge Cases Handled
- Services done too recently (scam detection)
- Severely overdue services (safety warnings)
- Price analysis and gouging detection
- Commonly oversold services flagged
- Severe driving condition adjustments (0.67x - 0.75x intervals)
- Symptoms that justify early service
- Unknown services (graceful handling)
- Age-based vs mileage-based services (battery)
- DIY alternatives with cost savings

### Driving Conditions
- **Normal:** Standard maintenance intervals
- **Severe:** Reduced intervals (towing, racing, dusty, extreme temps, short trips)
  - Oil change: 7,500 → 5,625 miles
  - Transmission: 60,000 → 45,000 miles
  - Air filter: 15,000 → 10,000 miles

## Database Statistics

- **Total Services:** 35
- **Categories:** 10 (ENGINE, TRANSMISSION, BRAKES, FLUIDS, FILTERS, TIRES, ELECTRICAL, FUEL, SUSPENSION, COOLING)
- **Scam-Prone Services:** 5 (Engine flush, transmission flush, fuel system cleaning, power steering flush, throttle body cleaning)
- **DIY-Friendly:** 4 (Air filters, wiper blades, battery)
- **Safety-Critical:** 8 (Brakes, tires, suspension components)

## Integration Points

### With VehicleDetail Component
```typescript
// When displaying service recommendations
import { checkServiceLegitimacy } from '@/lib/serviceIntervals';

const recommendation = checkServiceLegitimacy({
  serviceType: service.name,
  currentMileage: vehicle.mileage,
  lastServiceMileage: lastService?.mileage,
  lastServiceDate: lastService?.date,
  quotedPrice: service.estimatedCost,
});

// Display urgency badge, scam warnings, talking points
```

### With Maintenance Records
```typescript
// After importing service report
import { analyzeMultipleServices } from '@/lib/serviceIntervals';

const services = parsedRecommendations.map(rec => ({
  serviceType: rec.service,
  currentMileage: vehicle.mileage,
  quotedPrice: rec.price,
}));

const analysis = analyzeMultipleServices(services);
// Show overall scam score, potential savings, categorized recommendations
```

### With Scam Detection Feature
```typescript
// Scam detection page
import { SERVICE_INTERVALS } from '@/lib/serviceIntervals';
import { QUICK_RESPONSES } from '@/lib/talkingPoints';

// Display database of common scams
// Generate instant responses for user
```

## File Structure

```
src/lib/
├── serviceIntervals.ts          # Main legitimacy scoring engine
│   ├── SERVICE_INTERVALS        # Database of 35+ services
│   ├── checkServiceLegitimacy() # Single service analysis
│   └── analyzeMultipleServices()# Batch analysis
│
├── talkingPoints.ts             # Talking points generator
│   ├── generateTalkingPoints()  # Context-aware scripts
│   ├── generateConversationScript() # Full markdown guide
│   ├── generateSituationPoints() # Scenario-specific
│   └── QUICK_RESPONSES          # Instant one-liners
│
└── __tests__/
    └── serviceIntervalsExamples.ts # 12 real-world test cases
```

## Talking Points Strategy

### Tone Levels
1. **Polite:** Default, maintains relationship
2. **Firm:** Sets boundaries without hostility
3. **Skeptical:** Questions recommendation with evidence
4. **Assertive:** Clear refusal when needed
5. **Educational:** Asks to learn, shows engagement

### Conversation Flow
1. **Opening:** Set tone, ask initial questions
2. **Clarifying:** Understand the recommendation
3. **Objecting:** Challenge if illegitimate
4. **Negotiating:** Work on price if legitimate
5. **Closing:** Finalize decision
6. **Emergency Exit:** Escape high-pressure tactics

## Quick Responses

Common situations covered:
- Too expensive
- Need second opinion
- Not in manual
- Just done recently
- Feeling pressured
- Only essentials
- Show me proof
- DIY option
- Bundle discount
- Decline politely

## Next Steps

1. **UI Integration:** Create scam detection page in app
2. **API Endpoint:** `/api/services/check-legitimacy`
3. **User Dashboard:** Show potential savings from declining scams
4. **Education Mode:** Teach users about each service
5. **Price Database:** Add regional pricing data
6. **Mobile Integration:** Quick check at mechanic shop
7. **Receipt Scanning:** Parse service recommendations from photos

## License

Part of the CarTalker application. Proprietary.

## Contributing

To add a new service to the database:

1. Add entry to `SERVICE_INTERVALS` in `serviceIntervals.ts`
2. Include all required fields
3. Add scam indicators if commonly oversold
4. Set `isOftenScam: true` if frequently upsold
5. Add test case to `serviceIntervalsExamples.ts`

## Changelog

### v1.0.0 (2025-10-12)
- Initial implementation
- 35 services in database
- Legitimacy scoring engine
- Talking points generator
- 12 real-world test cases
- Full conversation script generation
