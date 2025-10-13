# Crisis Mode API Documentation

The Crisis Mode API endpoint analyzes service recommendations in real-time to help users determine if they're being scammed or if the service is legitimate.

## Endpoint

```
POST /api/crisis/analyze
GET /api/crisis/analyze (list supported services)
```

## Features

- Analyzes 35+ common automotive services
- Checks service legitimacy based on mileage, time intervals, and symptoms
- Detects common scam patterns and upselling tactics
- Generates context-aware talking points for negotiation
- Provides price analysis against fair market rates
- Returns urgency levels from "scam" to "safety-critical"
- Generates conversation scripts with opening, clarifying, objecting, and negotiating phases

## POST Request

### Request Body

```typescript
{
  vehicleId: string;           // Required: Vehicle ID from database
  serviceDescription: string;  // Required: Natural language service description
  quotedPrice?: number;        // Optional: Mechanic's quoted price
  symptoms?: string[];         // Optional: Symptoms or mechanic's justification
  urgency?: string;            // Optional: Urgency level mentioned
}
```

### Example Request

```bash
curl -X POST http://localhost:4000/api/crisis/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "cmgok385z0004n854jv5xftx1",
    "serviceDescription": "transmission flush",
    "quotedPrice": 350,
    "symptoms": ["mechanic says its preventive maintenance"]
  }'
```

### Natural Language Service Parsing

The API understands natural language descriptions. You can say:
- "oil change"
- "brake pads"
- "transmission flush"
- "engine air filter"
- "tire rotation"
- And 50+ more common phrases

## Response Structure

```typescript
{
  success: boolean;
  analysis: {
    serviceType: string;              // Standardized service type
    serviceDescription: string;       // Original description
    vehicleInfo: {
      make: string;
      model: string;
      year: number;
      currentMileage: number;
    };
    legitimacy: {
      isLegitimate: boolean;
      urgencyLevel: 'scam' | 'unnecessary' | 'can-wait' | 'soon' | 'overdue' | 'urgent' | 'safety-critical';
      confidence: number;             // 0-100
      scamLikelihood: number;         // 0-100
      reason: string;
      nextDueAt?: number;             // Mileage when actually due
      nextDueDate?: Date;
      milesUntilDue?: number;
      monthsUntilDue?: number;
      talkingPoints: string[];        // Quick talking points
      flags: string[];                // Red flags detected
      alternativeAction?: string;
      estimatedFairPrice: {
        min: number;
        max: number;
      };
    };
    talkingPoints: TalkingPoint[];    // Flattened list
    talkingPointsByStage: {           // Organized by conversation stage
      opening: TalkingPoint[];
      clarifying: TalkingPoint[];
      objecting: TalkingPoint[];
      negotiating: TalkingPoint[];
      closing: TalkingPoint[];
      emergencyExit?: TalkingPoint[];
    };
    recommendations: string[];        // Action recommendations
    conversationScript: string;       // Full markdown conversation guide
  }
}
```

### TalkingPoint Structure

```typescript
{
  type: 'question' | 'statement' | 'objection' | 'negotiation' | 'education';
  text: string;
  tone: 'polite' | 'firm' | 'skeptical' | 'assertive' | 'educational';
  context?: string;
  priority: 'primary' | 'secondary' | 'backup';
}
```

## Example Responses

### 1. Scam Service (Engine Flush on healthy engine)

```json
{
  "urgencyLevel": "can-wait",
  "scamLikelihood": 70,
  "reason": "Engine Flush is not yet due. 879,999 miles remaining until recommended interval.",
  "flags": ["Engine Flush is frequently oversold as 'preventive maintenance'"],
  "recommendations": [
    "This service can be delayed safely",
    "Consider getting a second opinion. Engine Flush is frequently oversold."
  ]
}
```

### 2. Legitimate Service (Overdue Transmission Flush)

```json
{
  "urgencyLevel": "overdue",
  "scamLikelihood": 0,
  "reason": "Transmission Flush appears overdue. Current mileage: 120,000, typical interval: 100,000 miles.",
  "recommendations": [
    "This service appears to be legitimately needed",
    "Proceed with the service to avoid further damage"
  ]
}
```

### 3. Unnecessary Early Service (Brake Pads at 10k miles)

```json
{
  "urgencyLevel": "unnecessary",
  "scamLikelihood": 80,
  "reason": "Brake Pads is being recommended too early. Current mileage: 10,000, minimum interval: 25,000 miles.",
  "flags": ["Recommended well before minimum interval"],
  "talkingPoints": [
    "Why is this needed before the minimum interval of 25,000 miles?",
    "My owner's manual shows a different interval. Can you explain?",
    "I'll decline this service for now and reconsider at the proper interval."
  ]
}
```

## Urgency Levels Explained

| Level | Meaning | Action |
|-------|---------|--------|
| `scam` | Service recommended way too early (< 50% of interval) | Decline firmly |
| `unnecessary` | Service recommended early (< 75% of interval) | Decline politely |
| `can-wait` | Service approaching but not urgent (75-90% of interval) | Schedule for later |
| `soon` | Service is due now (90-110% of interval) | Reasonable to approve |
| `overdue` | Service is past due (110-130% of interval) | Should do soon |
| `urgent` | Service has symptoms or significantly overdue | Do immediately |
| `safety-critical` | Service way overdue (> 130% of interval) | Safety risk |

## Conversation Script

The API generates a full conversation script in markdown format that users can follow:

```markdown
## Conversation Guide: TRANSMISSION_FLUSH

**Urgency Level:** OVERDUE
**Confidence:** 85%
**Scam Likelihood:** 70%

### Analysis
Transmission Flush appears overdue. Current mileage: 120,000, typical interval: 100,000 miles.

### Red Flags
- Scam indicator: "mechanic says its preventive maintenance" matches "preventive maintenance"
- Transmission Flush is frequently oversold as "preventive maintenance"

### Opening (Start here)
- **[statement]** I understand this is due. I'd like to proceed.
- **[question]** Can you show me the condition of the fluid?

### Clarifying Questions
- **[question]** What specific problem am I preventing?
- **[question]** What happens if I wait another [X] miles?

### If You're Not Convinced
- **[objection]** I'd like to decline for now.
- **[objection]** I'm not comfortable with this recommendation.

### Price Negotiation
- **[negotiation]** The price seems high. Can you break down the cost?

### Closing
- **[statement]** Let's proceed. Thanks for the explanation.
- **[question]** Can I get a detailed invoice?

### Emergency Exit (If Feeling Pressured)
- I need to check with [my spouse/partner] before approving.
- I appreciate the recommendations, but I need to review my budget.
```

## Supported Services (57 total)

### Engine & Maintenance
- Oil change
- Oil filter
- Engine air filter
- Cabin air filter
- Fuel filter
- Spark plugs
- Engine flush
- Throttle body cleaning

### Transmission
- Transmission fluid change
- Transmission flush
- Differential service

### Brakes
- Front brake pads
- Rear brake pads
- Brake rotors
- Brake fluid flush

### Cooling System
- Coolant flush
- Radiator flush
- Thermostat

### Fluids
- Power steering flush

### Fuel System
- Fuel system cleaning
- Fuel injector cleaning

### Tires
- Tire rotation
- Wheel alignment
- Tire balance

### Electrical
- Battery replacement
- Alternator
- Starter

### Suspension
- Shock absorbers
- Struts

## GET Request (List Services)

```bash
curl http://localhost:4000/api/crisis/analyze
```

Returns:
```json
{
  "success": true,
  "data": {
    "supportedServices": ["oil change", "brake pads", ...],
    "totalServices": 57,
    "message": "Use POST to analyze a specific service recommendation"
  }
}
```

## Error Responses

### Vehicle Not Found
```json
{
  "success": false,
  "error": "Vehicle not found"
}
```

### Missing Required Fields
```json
{
  "success": false,
  "error": "Vehicle ID is required"
}
```

### Unknown Service
Returns generic advice with confidence level 30%:
```json
{
  "analysis": {
    "legitimacy": {
      "confidence": 30,
      "reason": "Service not in our database. Consult owner's manual.",
      "talkingPoints": [
        "What does my owner's manual say about this?",
        "Can you show me why this is needed?"
      ]
    }
  }
}
```

## Integration Example

### React Component

```typescript
async function analyzeService(vehicleId: string, service: string, price?: number) {
  const response = await fetch('/api/crisis/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vehicleId,
      serviceDescription: service,
      quotedPrice: price,
      symptoms: []
    })
  });

  const data = await response.json();

  if (data.success) {
    const { legitimacy, talkingPoints, recommendations } = data.analysis;

    // Display urgency level
    console.log(`Urgency: ${legitimacy.urgencyLevel}`);
    console.log(`Scam Likelihood: ${legitimacy.scamLikelihood}%`);

    // Show talking points
    talkingPoints.forEach(point => {
      console.log(`[${point.type}] ${point.text}`);
    });

    // Display recommendations
    recommendations.forEach(rec => {
      console.log(`- ${rec}`);
    });
  }
}
```

## Database Integration

The API automatically:
1. Fetches vehicle data (mileage, make, model, year)
2. Queries maintenance history for the service type
3. Calculates time since last service
4. Determines vehicle age
5. Factors all data into legitimacy analysis

## Scam Detection Patterns

The API detects:
- Services recommended way before interval
- "Preventive maintenance" on services that don't need it
- Engine flushes (almost always scams)
- Multiple flushes at once
- Premium filter upsells
- Brake rotors without measurement
- Transmission flushes on high-mileage vehicles (dangerous)
- All fluids at once (cost padding)

## Price Analysis

If `quotedPrice` is provided:
- Compares to fair market range (min/max)
- Flags prices > 150% of typical max
- Generates negotiation talking points
- Suggests aftermarket alternatives
- Identifies bundle discount opportunities

## Future Enhancements

- [ ] Vehicle-specific intervals (luxury vs economy)
- [ ] Regional pricing adjustments
- [ ] Shop reputation integration
- [ ] Multi-service bundle analysis
- [ ] User driving conditions (severe vs normal)
- [ ] Historical price tracking
- [ ] Mechanic shop database
- [ ] Mobile app push notifications

## File Locations

- **API Route**: `/src/app/api/crisis/analyze/route.ts`
- **Service Database**: `/src/lib/serviceIntervals.ts`
- **Talking Points Engine**: `/src/lib/talkingPoints.ts`
