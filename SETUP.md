# CarTalker Setup Guide

CarTalker is a comprehensive vehicle tracking and maintenance application built with Next.js, TypeScript, Prisma, and SQLite.

## Features

✅ **Vehicle Management**
- Add vehicles by VIN with automatic data lookup via NHTSA API
- Track vehicle details, mileage, and value
- Support for multiple vehicles per user

✅ **Maintenance Tracking**
- Log maintenance records with costs and mileage
- View maintenance history across all vehicles
- Track service providers and dates

✅ **Issue Management**
- Report and track vehicle issues
- Categorize by severity (Low, Medium, High, Critical)
- Track issue status and resolution costs

✅ **AI Chat Assistant**
- Get maintenance advice and troubleshooting help
- Ask questions about specific vehicle models
- Quick access to common automotive knowledge

✅ **Data Visualization**
- Vehicle overview with key statistics
- Maintenance cost tracking and summaries
- Issue status dashboards

## Prerequisites

- Node.js 18+
- npm or yarn
- Git

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cartalker
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Seed the database with test data**
   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   Navigate to http://localhost:3000

## Test Data

The application comes with pre-populated test data:

### Test Vehicles
- **Evan's GTI**: 2016 Volkswagen Golf GTI (VIN: 3VW447AU9GM030618)
- **Bond's Wrangler**: 2012 Jeep Wrangler (VIN: 1C4GJWAG9CL102751)

### Sample Data Includes
- Maintenance records (oil changes, brake service, inspections)
- Vehicle issues (check engine light, squeaky brakes)
- Cost tracking and mileage logs

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Icons**: Lucide React
- **API**: NHTSA VIN Decoder (free, no API key required)
- **Charts**: Recharts (for future data visualization)

### Key Components

#### Database Models
- `User` - User accounts
- `Vehicle` - Vehicle information and VIN data
- `MaintenanceRecord` - Maintenance logs with costs and dates
- `Issue` - Vehicle issues and repairs
- `ChatConversation` & `ChatMessage` - AI chat history

#### API Routes
- `/api/vin` - VIN decoding via NHTSA API
- `/api/vehicles` - Vehicle CRUD operations
- `/api/maintenance` - Maintenance record management
- `/api/issues` - Issue tracking

#### Pages
- `/` - Vehicle dashboard
- `/vehicles/add` - Add new vehicle with VIN lookup
- `/vehicles/[id]` - Vehicle detail view
- `/maintenance` - Maintenance records across all vehicles
- `/issues` - Issue tracking dashboard
- `/chat` - AI assistant interface

## Development Features

### VIN Decoder Integration
The app integrates with NHTSA's free VIN decoder API to automatically populate vehicle data:
- Make, model, year, trim
- Engine, transmission, drive type
- Manufacturing location
- Body style and fuel type

### Responsive Design
- Mobile-first design with Tailwind CSS
- Adaptive navigation for different screen sizes
- Touch-friendly interface elements

### Error Handling
- Comprehensive error handling for API calls
- Loading states and user feedback
- Graceful fallbacks for missing data

## Production Considerations

### Environment Variables
```env
# Database
DATABASE_URL="file:./dev.db"

# OpenAI API (for production chat)
OPENAI_API_KEY="your_openai_api_key_here"

# Next.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret_here"
```

### Future Enhancements
- OpenAI integration for smarter chat responses
- User authentication with NextAuth.js
- Photo uploads for vehicles and maintenance
- Maintenance scheduling and reminders
- Export functionality for records
- Multi-user support with proper authorization

## Database Management

### Resetting the Database
```bash
rm prisma/dev.db
npx prisma migrate dev --name init
npx tsx prisma/seed.ts
```

### Viewing Database Contents
```bash
npx prisma studio
```

### Adding New Migrations
```bash
npx prisma migrate dev --name description_of_changes
```

## Testing the Application

### Manual Testing Checklist
1. ✅ Visit homepage - should show test vehicles
2. ✅ Click "Add Vehicle" - VIN lookup should work
3. ✅ Test VINs: 3VW447AU9GM030618, 1C4GJWAG9CL102751
4. ✅ View vehicle details - should show maintenance/issues
5. ✅ Navigate to Maintenance page - should show all records
6. ✅ Navigate to Issues page - should show tracked issues
7. ✅ Use Chat interface - should respond to questions

### API Testing
```bash
# Test VIN decoder
curl "http://localhost:3000/api/vin?vin=3VW447AU9GM030618"

# Test vehicles endpoint
curl "http://localhost:3000/api/vehicles"

# Test maintenance endpoint
curl "http://localhost:3000/api/maintenance"

# Test issues endpoint
curl "http://localhost:3000/api/issues"
```

## File Structure

```
cartalker/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.ts               # Test data seeding
│   └── migrations/           # Database migrations
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   ├── vehicles/        # Vehicle pages
│   │   ├── maintenance/     # Maintenance pages
│   │   ├── issues/          # Issues pages
│   │   └── chat/            # Chat interface
│   ├── components/          # React components
│   └── lib/                 # Utilities and DB client
├── public/                  # Static assets
├── .env.example            # Environment template
└── SETUP.md               # This file
```

## Support

For issues or questions:
1. Check the browser console for errors
2. Verify the development server is running
3. Ensure the database has been properly seeded
4. Check that all dependencies are installed

## Contributing

1. Follow the existing code style and structure
2. Test new features with the provided VIN test data
3. Update this documentation for any new features
4. Ensure responsive design works on mobile devices

---

**CarTalker** - Track your cars, maintain your peace of mind! 🚗