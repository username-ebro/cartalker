# CarTalker Testing Checklist

## Purpose
Manual validation steps for each feature and scenario before marking "done"

---

## General Pre-Merge Checklist
- [ ] Code runs locally without errors
- [ ] No console errors in browser
- [ ] Mobile responsive (test on phone or DevTools)
- [ ] Accessibility: Keyboard navigation works
- [ ] Git commit messages are descriptive

---

## Scenario Testing

### Scenario 1: Delta Tire (Price Arbitrage)
- [ ] User can input tire issue via voice
- [ ] System identifies vehicle correctly
- [ ] Price comparison shows 3+ alternatives
- [ ] Money saved calculation is accurate
- [ ] Maps show nearby alternatives
- [ ] User can copy/share comparison

### Scenario 2: Phil (Parts Markup)
- [ ] User can describe part needed
- [ ] System searches online prices
- [ ] Markup % calculates correctly
- [ ] Email template generates properly
- [ ] Email is professional and accurate

### Scenario 3: Warranty Coverage
- [ ] User can upload warranty document
- [ ] OCR extracts coverage details
- [ ] System matches issue to coverage
- [ ] Script/email generated correctly
- [ ] Dates/mileage validate properly

### Scenario 4: Check Engine Light
- [ ] User can input code or symptoms
- [ ] System provides urgency assessment
- [ ] Common causes listed
- [ ] Nearby shops displayed
- [ ] Instructions are clear

### Scenario 5: Recall Notification
- [ ] VIN input works
- [ ] NHTSA API returns correct data
- [ ] Recalls displayed clearly
- [ ] User can take action (book, email)

### Scenario 6: Oil Change Scam Detection
- [ ] User can input service recommendations
- [ ] System checks maintenance history
- [ ] Scam detection flags upsells
- [ ] Savings calculation is accurate
- [ ] DIY alternatives provided

### Scenario 7: Used Car Purchase
- [ ] VIN decoder works
- [ ] Pricing comparison accurate
- [ ] Common issues for model shown
- [ ] Pre-purchase shops recommended

### Scenario 8: Road Trip Prep
- [ ] Maintenance history reviewed
- [ ] Checklist generated
- [ ] Warnings for due services
- [ ] Trip-specific recommendations

### Scenario 9: Family Fleet Management
- [ ] Multiple vehicles can be added
- [ ] Family members can be invited
- [ ] Permissions work correctly
- [ ] Dashboard shows all vehicles
- [ ] Expense aggregation accurate

### Scenario 10: Receipt Organization
- [ ] Receipt upload works
- [ ] OCR extraction accurate
- [ ] "Does this look right?" UI clear
- [ ] User can edit extracted data
- [ ] Document stored properly
- [ ] Reminders calculate correctly

---

## Feature-Specific Testing

### Voice Input
- [ ] Microphone permission requested
- [ ] Recording starts/stops clearly
- [ ] Transcription is accurate (80%+)
- [ ] Works on mobile
- [ ] Works on desktop
- [ ] Error handling for no mic
- [ ] Fallback to text input

### Rating System (Thumbs Up/Down)
- [ ] Buttons display correctly
- [ ] Click registers
- [ ] Selection persists
- [ ] Can change rating
- [ ] Visual feedback on selection

### Maps Integration
- [ ] Location permission requested
- [ ] Map displays correctly
- [ ] Markers show shops
- [ ] Directions work
- [ ] Mobile friendly

### Email Generator
- [ ] Template loads
- [ ] Variables populate correctly
- [ ] Copy to clipboard works
- [ ] Format is professional
- [ ] No typos/errors

### Money Saved Counter
- [ ] Calculates correctly
- [ ] Displays prominently
- [ ] Updates in real-time
- [ ] Historical tracking works

---

## Browser Testing
- [ ] Chrome (desktop)
- [ ] Safari (desktop)
- [ ] Chrome (mobile)
- [ ] Safari (mobile/iOS)

---

## Performance Testing
- [ ] Initial load < 2s
- [ ] API responses < 1s
- [ ] Voice transcription < 3s
- [ ] OCR processing < 5s
- [ ] No memory leaks

---

## Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader friendly
- [ ] Color contrast passes WCAG AA
- [ ] Focus states visible
- [ ] Alt text on images

---

*Update this checklist as new features are added*
