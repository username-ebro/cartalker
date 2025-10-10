# CarTalker Test Scenarios

## Purpose
These scenarios guide development priorities, testing, and demonstrate real-world value propositions for CarTalker users.

---

## Scenario 1: Delta Tire - Price Arbitrage (The $380 Save)
**Status**: ⭐ Core scenario from Evan

**User Story**: "I'm at Delta Tire. They quoted $1,200 for a tire replacement with plan. I need to decide now."

**Flow**:
1. User opens CarTalker while "calling wife" outside shop
2. Voice input: "Delta Tire quoted me $1,200 for a tire replacement with a warranty plan. Is this a good deal?"
3. CarTalker asks: "What's your car?" (if not in context)
4. User: "2019 Jeep Grand Cherokee"
5. CarTalker:
   - Searches for tire prices at Costco, Discount Tire, Sam's Club
   - Finds Costco: $820 with 5-year prorated warranty
   - **Saves user $380**
6. Provides: "Costco has similar quality tires for $820 with a 5-year warranty. You'd save $380. Want directions to the nearest Costco?"

**Technical Requirements**:
- Voice-to-text input
- Real-time price comparison API or web scraping
- Maps integration for alternative locations
- VIN-based tire size lookup
- Generate comparison report

**Success Metric**: User walks away, drives to Costco, saves money, tells 3 friends

---

## Scenario 2: Phil - Parts Markup Detection (The $600 Save)
**Status**: ⭐ Core scenario from Evan

**User Story**: "Dealership quoted $1,200 for a part plus labor. Seems expensive."

**Flow**:
1. User: "My dealership said I need a new catalytic converter. Part is $1,200 plus labor. They have to order it."
2. CarTalker:
   - Searches RockAuto, AutoZone, O'Reilly's, NAPA
   - Finds OEM part online for $600
   - Detects markup: 100%
3. Suggests: "That same OEM part is $600 online at RockAuto. Since they're ordering it anyway, you could buy it yourself and only pay labor. Want me to draft an email to your service advisor?"
4. User: "Yes"
5. CarTalker generates professional email:
   > "Hi [Service Advisor Name],
   >
   > Thanks for the quote on the catalytic converter replacement. I've sourced the OEM part online for $600 and would like to provide it for the installation. What would your labor-only charge be for this job?
   >
   > Thanks,
   > [User Name]"

**Technical Requirements**:
- Parts database/API integration or web scraping
- Email template generation
- Dealership markup detection logic
- Part number matching

**Success Metric**: User saves $600, refers family members

---

## Scenario 3: Warranty Coverage Check (The Peace of Mind)
**Status**: ⭐ Core scenario from Evan

**User Story**: "My 2-year-old car is making a weird noise. Is this covered under warranty?"

**Flow**:
1. User describes issue: "My transmission is slipping when accelerating"
2. CarTalker:
   - Checks uploaded warranty documents
   - Confirms vehicle is within 3-year/36k powertrain warranty
   - Identifies this is likely covered
3. Prepares user: "This appears to be covered under your powertrain warranty (expires 2026 or 36,000 miles). Here's what to say to the dealership:"
   - Script template provided
   - Email template offered
4. Dealership tries to charge anyway
5. User has documentation and script ready from CarTalker
6. **Dealership repairs for free** (saves $2,000+)

**Technical Requirements**:
- Warranty document OCR and parsing
- Coverage rule matching (powertrain vs bumper-to-bumper)
- Template generation for communications
- Mileage/date tracking vs warranty expiration

**Success Metric**: User avoids $2,000+ charge, shares app with coworkers

---

## Scenario 4: The "Check Engine Light" Panic
**User Story**: "Check engine light came on. I'm freaking out."

**Flow**:
1. User: "My check engine light just came on!"
2. CarTalker: "Is the light solid or flashing?"
3. User: "Solid"
4. CarTalker: "Solid usually means non-urgent. Common causes for [your car model]:
   - Loose gas cap (check this first!)
   - O2 sensor
   - Catalytic converter

   You can drive to a parts store (AutoZone, O'Reilly's) for a free code reading. Want nearby locations?"
5. User gets code P0420
6. Sends to CarTalker via voice/photo
7. CarTalker: "Code P0420: Catalytic converter efficiency below threshold. Usually NOT urgent. Get 2-3 quotes. Here are recommended shops nearby."

**Technical Requirements**:
- OBD code database
- Urgency classification
- Maps integration for parts stores and mechanics
- Model-specific common issues database

**Success Metric**: User stays calm, makes informed decision, avoids overpriced dealership visit

---

## Scenario 5: Recall & TSB Notification
**User Story**: "Is my car affected by any recalls I don't know about?"

**Flow**:
1. User adds vehicle to CarTalker (VIN-based)
2. CarTalker automatically checks NHTSA recall database
3. Finds 2 open recalls:
   - Airbag inflator (safety)
   - Software update (minor)
4. Notifies user: "⚠️ Your vehicle has 2 open recalls. One is safety-critical."
5. Provides:
   - Recall descriptions
   - Nearest dealerships
   - Booking assistance
   - "Generate email to schedule" button

**Technical Requirements**:
- NHTSA API integration
- VIN decoder
- Recall status tracking
- TSB (Technical Service Bulletin) lookup

**Success Metric**: User avoids potential safety issue, feels protected

---

## Scenario 6: Oil Change Scam Detection
**User Story**: "Quick lube place is recommending a bunch of services. Are these legit?"

**Flow**:
1. User at Jiffy Lube, gets service recommendations:
   - Transmission flush ($180)
   - Engine flush ($120)
   - Cabin air filter ($45)
   - Fuel injector cleaning ($150)
2. User photographs/voice inputs the list
3. CarTalker checks maintenance history:
   - Transmission flush: Last done 8k miles ago (unnecessary)
   - Engine flush: Not recommended by manufacturer
   - Cabin air filter: $10 on Amazon, 2-minute DIY
   - Fuel injector: Not needed unless symptoms present
4. **Saves user $495 in upsells**
5. Provides: "Here's what you actually need today: Oil change only. You can replace the cabin filter yourself for $10."

**Technical Requirements**:
- Maintenance schedule by make/model
- Service interval logic
- Scam/upsell detection patterns
- DIY vs professional recommendations

**Success Metric**: User only pays for oil change, buys filter on Amazon, tells friends

---

## Scenario 7: Used Car Purchase Assistance
**User Story**: "I'm looking at a used car. Should I buy it?"

**Flow**:
1. User considering 2018 Honda Accord, 62k miles, $18,500
2. Takes VIN photo or inputs manually
3. CarTalker:
   - Pulls Carfax-style history (if integrated)
   - Checks KBB/Edmunds value: Fair market is $17,200
   - Flags: "Overpriced by ~$1,300"
   - Common issues for 2018 Accord: CVT transmission (check for recalls/TSBs)
   - Recommends pre-purchase inspection shops nearby
4. User negotiates down to $17,000
5. **Saves $1,500**

**Technical Requirements**:
- VIN decoder
- Vehicle history integration (Carfax API or alternative)
- KBB/Edmunds pricing API
- Model-year common issues database
- Pre-purchase inspection shop recommendations

**Success Metric**: User makes informed purchase, avoids lemon, negotiates better price

---

## Scenario 8: Road Trip Emergency Preparedness
**User Story**: "I'm about to drive 500 miles. Is my car ready?"

**Flow**:
1. User: "Road trip to Colorado tomorrow. What should I check?"
2. CarTalker reviews:
   - Last oil change: 3k miles ago ✅
   - Tires: 4/32" tread depth ⚠️ (recommend replacement)
   - Coolant: Due for flush (45k miles, last done at 15k)
   - Brakes: Recent service ✅
3. Provides checklist:
   - [ ] Check tire pressure (recommended PSI: 35)
   - [ ] Top off washer fluid
   - [ ] Inspect wipers
   - [ ] Consider new tires before trip
4. Adds to trip: "Emergency contacts along route in case of breakdown"

**Technical Requirements**:
- Maintenance history analysis
- Service interval predictions
- Trip preparation checklists
- Roadside assistance integration (optional)

**Success Metric**: User has safe trip, feels prepared, avoids breakdown

---

## Scenario 9: Family Fleet Management
**User Story**: "I manage cars for me, my wife, and my two kids in college. It's chaos."

**Flow**:
1. User creates family account
2. Adds 4 vehicles:
   - Dad's truck
   - Mom's SUV
   - Kid 1's sedan
   - Kid 2's hatchback
3. Dashboard shows:
   - Kid 1's car: Oil change overdue by 1,200 miles ⚠️
   - Mom's SUV: Inspection expires in 12 days ⚠️
   - Kid 2's car: Recall open (airbag)
   - Dad's truck: All good ✅
4. Sends reminders to each family member
5. Tracks all expenses: "$4,200 spent on car maintenance this year across 4 vehicles"

**Technical Requirements**:
- Multi-vehicle per account
- Family sharing/invites
- Maintenance scheduling & reminders
- Expense aggregation
- Role-based permissions

**Success Metric**: Family avoids missed maintenance, tracks spending, stays organized

---

## Scenario 10: Receipt & Document Organization
**User Story**: "I just got service done. I need to keep track of this stuff."

**Flow**:
1. User gets oil change receipt
2. Takes photo in CarTalker
3. OCR extracts:
   - Date: 10/09/2025
   - Service: Oil change, tire rotation
   - Mileage: 45,234
   - Cost: $75
   - Shop: Delta Tire
4. CarTalker asks: "Does this look right?"
5. User confirms or corrects
6. Data saved, receipt stored
7. Next oil change reminder auto-calculated: "Due at 50,234 miles or 01/09/2026"

**Technical Requirements**:
- OCR for receipts (already exists in CarTalker)
- Data extraction & validation
- Confirmation UI ("Does this look right?")
- Automatic reminder calculation
- Document storage (PDFs, images)

**Success Metric**: User has complete digital filing cabinet, never loses a receipt

---

## Summary Matrix

| Scenario | Savings Potential | Urgency | Technical Complexity | User Delight |
|----------|------------------|---------|---------------------|--------------|
| 1. Delta Tire | $380 | High | Medium | ⭐⭐⭐⭐⭐ |
| 2. Phil Parts | $600 | Medium | Medium | ⭐⭐⭐⭐⭐ |
| 3. Warranty | $2,000+ | High | High | ⭐⭐⭐⭐⭐ |
| 4. Check Engine | Varies | High | Medium | ⭐⭐⭐⭐ |
| 5. Recall | Safety | Medium | Low | ⭐⭐⭐⭐ |
| 6. Oil Change Scam | $495 | Medium | Medium | ⭐⭐⭐⭐⭐ |
| 7. Used Car | $1,500 | Medium | High | ⭐⭐⭐⭐ |
| 8. Road Trip | Prevention | Medium | Low | ⭐⭐⭐ |
| 9. Family Fleet | Organization | Low | Medium | ⭐⭐⭐⭐ |
| 10. Receipt Org | Peace of Mind | Low | Low | ⭐⭐⭐ |

---

## Implementation Priority

### Phase 1 (Week 1): Quick Wins
- Scenario 10: Receipt organization (already 80% built)
- Scenario 5: Recall checking (simple API)
- Scenario 4: Check engine light lookup (database)

### Phase 2 (Week 2): High Value
- Scenario 1: Price comparison (Delta Tire scenario)
- Scenario 6: Service scam detection
- Voice-to-text input

### Phase 3 (Week 3): Complex Features
- Scenario 2: Parts markup + email generation
- Scenario 3: Warranty coverage
- Maps integration

### Phase 4 (Week 4): Premium Features
- Scenario 7: Used car valuation
- Scenario 9: Family fleet management
- Scenario 8: Trip preparation

---

*Living document - will evolve as we build and test*
