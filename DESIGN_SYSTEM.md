# CarTalker Design System
**Brand**: Playful, Trustworthy, Millennial-Friendly
**Vibe**: Composition notebook meets helpful friend

---

## Visual Identity

### Brand Personality
- **Playful**: Not corporate, not sterile - fun and approachable
- **Nostalgic**: Composition notebook, spiral bound, school vibes
- **Trustworthy**: Your car-savvy friend who actually knows their stuff
- **Helpful**: Like having a mechanic buddy on speed dial

### Inspiration
- Composition notebook (black/white marbled cover)
- Spiral bound notebooks
- Martie.com (millennial-friendly e-commerce)
- Classic "Car Talk" radio show vibe

---

## Mascot: "Tireman" 🛞

### Character Concept
- **Design**: Anthropomorphic tire with eyes and arms
- **Personality**: Like Clippy, but actually helpful (and a tire)
- **Style**: Simple, friendly, slightly goofy
- **Uses**:
  - Welcome screen
  - Empty states
  - Tips and advice bubbles
  - Loading states ("Tireman is thinking...")
  - Success states ("Tireman saved you $380!")

### Generation Prompt (NanoBanana)
```
A friendly cartoon tire character mascot with expressive eyes and simple arms.
Playful and helpful personality, like Microsoft's Clippy but redesigned as a
tire. Simple line art style, suitable for a car maintenance app. Black and
white with optional color accents. Character should look trustworthy and
knowledgeable but not corporate.
```

---

## Color Palette

### Primary Colors
- **Notebook Black**: `#1a1a1a` - Main text, headers
- **Notebook White**: `#f8f8f6` - Backgrounds, off-white paper
- **Marble Gray**: `#6b6b6b` - Secondary text, borders

### Accent Colors (Highlights/Actions)
- **Savings Green**: `#10b981` - Money saved, positive actions
- **Warning Amber**: `#f59e0b` - Alerts, overdue maintenance
- **Danger Red**: `#ef4444` - Critical issues, safety recalls
- **Info Blue**: `#3b82f6` - Tips, helpful info
- **Tire Black**: `#262626` - Mascot, key UI elements

### Notebook Theme Colors
- **Ruled Line Blue**: `#a3c9f5` - Subtle notebook lines background
- **Margin Red**: `#dc2626` - Left margin line accent
- **Yellow Highlight**: `#fef08a` - Highlighted important info

---

## Typography

### Font Families
- **Headings**: 'Courier Prime' or 'Courier New' (monospace, notebook feel)
  - Alternative: 'Space Mono', 'Roboto Mono'
- **Body**: 'Inter', 'System UI' (clean, readable)
- **Handwriting accents**: 'Caveat' or 'Patrick Hand' (for tips/notes)

### Type Scale
- **H1**: 2.5rem (40px), bold, Courier
- **H2**: 2rem (32px), bold, Courier
- **H3**: 1.5rem (24px), semi-bold, Courier
- **Body**: 1rem (16px), normal, Inter
- **Small**: 0.875rem (14px), normal, Inter
- **Tiny**: 0.75rem (12px), normal, Inter

---

## Components

### Button Styles

#### Primary (CTA)
```css
background: #262626 (Tire Black)
color: #f8f8f6 (White)
border: 2px solid #1a1a1a
border-radius: 8px
padding: 12px 24px
font-weight: 600
hover: slight shadow, subtle lift
```

#### Secondary
```css
background: transparent
color: #1a1a1a
border: 2px solid #1a1a1a
border-radius: 8px
padding: 12px 24px
hover: background #f8f8f6
```

#### Success (Money Saved)
```css
background: #10b981
color: white
border: none
border-radius: 8px
padding: 12px 24px
icon: 💰 or checkmark
```

### Card Style (Notebook Page)
```css
background: #f8f8f6
border: 1px solid #6b6b6b
border-radius: 4px (subtle)
box-shadow: 0 2px 4px rgba(0,0,0,0.1)
padding: 24px

/* Optional: Ruled lines background */
background-image: repeating-linear-gradient(
  transparent,
  transparent 31px,
  #a3c9f5 31px,
  #a3c9f5 32px
)

/* Optional: Left margin */
border-left: 3px solid #dc2626
padding-left: 32px
```

### Input Fields
```css
background: white
border: 2px solid #6b6b6b
border-radius: 6px
padding: 10px 14px
font-family: Inter

focus: border-color #3b82f6
placeholder: #9ca3af
```

### Rating Component (Thumbs Up/Down)
```css
Button style, icon-only
size: 40px x 40px
border-radius: 50%
background: transparent
hover: background #f3f4f6

active (selected):
  thumbs-up: background #10b981, color white
  thumbs-down: background #ef4444, color white
```

---

## Layout Patterns

### Header/Navigation
- Sticky top bar
- Notebook white background
- Black border bottom (2px solid)
- Logo/mascot on left
- Main nav center
- User profile right

### Main Content
- Max width: 1200px
- Center aligned
- Padding: 24px mobile, 48px desktop
- Background: subtle notebook texture

### Sidebar (if needed)
- Composition notebook cover pattern
- Width: 280px
- Sticky position

---

## Iconography

### Style
- Lucide React (already in dependencies)
- Stroke width: 2px
- Size: 20px default, 24px large, 16px small
- Color: Match text or accent colors

### Key Icons
- 🚗 Car profile
- 🔧 Maintenance
- 💬 Chat/advice
- 📄 Documents/receipts
- 🔔 Notifications/recalls
- 💰 Money saved
- 📍 Maps/location
- 👍 Thumbs up
- 👎 Thumbs down
- 🎤 Voice input

---

## Voice & Tone (Copy)

### Voice Characteristics
- **Friendly**: "Hey! Let's figure this out together"
- **Knowledgeable**: "Based on your 2019 Jeep's warranty..."
- **Reassuring**: "Don't worry, this is usually not urgent"
- **Honest**: "That price seems high. Here's why..."
- **Money-conscious**: "You could save $380 by..."

### Example Messages
- ❌ "Service record successfully saved to database"
- ✅ "Got it! Oil change logged for your Jeep 🚗"

- ❌ "Error: Invalid VIN format"
- ✅ "Hmm, that VIN doesn't look right. Mind double-checking?"

- ❌ "Warranty coverage confirmed"
- ✅ "Good news! This should be covered under your warranty 🛡️"

---

## Responsive Behavior

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile-First Priorities
1. Voice input (big, accessible)
2. Quick photo capture (receipts)
3. Clear CTA buttons
4. Easy navigation
5. Readable text (16px minimum)

### Desktop Enhancements
- Side-by-side comparisons (price comparison)
- Multi-column layouts
- Hover states
- Keyboard shortcuts

---

## Accessibility

### Requirements
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader friendly
- Color contrast ratios:
  - Text: 4.5:1 minimum
  - Large text: 3:1 minimum
  - Interactive: 3:1 minimum

### Focus States
- Visible outline on all interactive elements
- Color: #3b82f6 (Info Blue)
- Width: 2px
- Offset: 2px

---

## Animation & Transitions

### Principles
- **Subtle**: Not distracting
- **Fast**: 150-300ms
- **Purposeful**: Guides user attention

### Standard Transitions
```css
transition: all 0.2s ease-in-out

/* Hover lift */
hover: transform translateY(-2px)

/* Button press */
active: transform scale(0.98)

/* Fade in */
opacity: 0 → 1 (200ms)
```

---

## Special States

### Empty States
- Show Tireman mascot
- Friendly message
- Clear CTA

Example:
```
[Tireman character]
"No vehicles yet! Add your first car to get started."
[+ Add Vehicle button]
```

### Loading States
```
[Animated Tireman or spinner]
"Tireman is checking prices..."
"Searching for nearby mechanics..."
"Analyzing your warranty..."
```

### Success States
```
✅ "Saved! Your receipt is in the file cabinet."
💰 "You could save $380 at Costco!"
🛡️ "This is covered under warranty!"
```

### Error States
```
⚠️ "Couldn't find that VIN. Want to try again?"
❌ "Oops! Something went wrong. Let's give it another shot."
```

---

## Implementation Checklist

### Phase 1: Core Design System
- [ ] Set up TailwindCSS custom theme
- [ ] Generate Tireman mascot with NanoBanana
- [ ] Create base components (Button, Card, Input)
- [ ] Implement notebook texture background
- [ ] Add Lucide icons

### Phase 2: Layout
- [ ] Navigation component
- [ ] Page layout wrapper
- [ ] Responsive grid system
- [ ] Mobile navigation

### Phase 3: Specialized Components
- [ ] Rating component (thumbs up/down)
- [ ] Voice input button
- [ ] Price comparison cards
- [ ] Money saved counter
- [ ] Receipt validation UI

### Phase 4: Polish
- [ ] Animations/transitions
- [ ] Loading states
- [ ] Empty states
- [ ] Accessibility audit
- [ ] Mobile optimization

---

*Living document - evolve as design takes shape*

**Created**: Oct 9, 2025
**Status**: Ready for implementation
