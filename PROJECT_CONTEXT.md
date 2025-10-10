# CarTalker Project Context

## Project Overview
**Name**: CarTalker
**Type**: Personal Car Management & AI Assistant
**Started**: September 28, 2025
**Status**: Initial Development
**Purpose**: Fun/Personal Use (not billable)

## Inspiration
Inspired by the NPR radio show "Car Talk" - bringing that same helpful, knowledgeable car advice into a personal AI assistant format.

## Core Problem Being Solved
Car owners need a centralized place to:
- Track their car's history and issues
- Get intelligent answers about their specific vehicle
- Remember maintenance schedules and past repairs
- Have context-aware conversations about car problems

## Key User Stories (Single User - Evan)
1. "I want to ask questions about my car and get answers based on its specific history"
2. "I need to track all maintenance, issues, and repairs in one place"
3. "I want to use voice to quickly log issues while driving"
4. "I need to find nearby mechanics when something goes wrong"
5. "I want to load my VIN and get all available public data"
6. "I want the app to remember our conversation history"

## Technical Requirements

### Must Have (MVP)
- Car profile creation (VIN, make, model, year)
- Issue/maintenance logging system
- Chat interface with memory
- Basic data persistence
- Simple web interface

### Should Have (v1.0)
- Voice-to-text input
- VIN data lookup integration
- Google Maps integration
- Export/import functionality
- Mobile responsive design

### Nice to Have (Future)
- Carfax report integration
- Push notifications for maintenance
- Photo upload for issues
- Cost tracking and estimates
- Mechanic recommendations
- Community features

## Architecture Considerations

### Data Model
- **Car Profile**: VIN, make, model, year, mileage, purchase info
- **Maintenance Records**: Date, type, mileage, cost, mechanic, notes
- **Issues/Problems**: Description, symptoms, date noticed, resolution
- **Chat History**: Conversations with context
- **Documents**: Receipts, reports, photos

### Integration Points
- OpenAI/Claude API for chat intelligence
- VIN decoder API (free options available)
- Google Maps API for location services
- Web Speech API for voice input
- Potential Carfax API (paid)

### Privacy & Security
- All data stored locally initially
- No sharing between users in v1
- Encryption for sensitive data
- API keys secured properly

## Success Metrics
- Can successfully track all car maintenance
- Chat provides useful, contextual responses
- Voice input works reliably
- All car history searchable
- Progress tracked and visible

## Development Phases

### Phase 1: Foundation (Current)
- Project setup
- Basic data models
- Simple UI skeleton
- Local storage

### Phase 2: Core Features
- Chat interface implementation
- Car profile management
- Issue logging
- Basic LLM integration

### Phase 3: Enhancements
- Voice input
- Maps integration
- VIN lookup
- Better UI/UX

### Phase 4: Polish
- Mobile optimization
- Export features
- Advanced chat memory
- Performance optimization

## Notes & Ideas
- Could integrate with OBD-II readers in future
- Potential for predictive maintenance based on patterns
- Share anonymized data to help other users with same car model
- Partnerships with mechanics/shops for referrals
- Educational content about car maintenance basics