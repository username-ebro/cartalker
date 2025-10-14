# CarTalker Changelog

## [2025-10-14] - Production Deployment Session

### Deployed
- **Vercel Production Deployment**
  - Successfully deployed CarTalker to Vercel
  - Live URL: https://cartalker-qovv186am-evan-1154s-projects.vercel.app
  - GitHub repo created: https://github.com/username-ebro/cartalker
  - Automatic deployments on git push enabled

### Fixed
- **Database Configuration**
  - Updated Supabase database password to latest credential
  - Switched from direct connection (port 5432) to connection pooler (port 6543)
  - Added `?pgbouncer=true` parameter for free tier compatibility
  - Updated both `.env` and deployment documentation

- **Next.js 15 Compatibility**
  - Fixed async params in all dynamic API routes (`/api/documents/[id]/*`)
  - Updated vehicle detail page params to Promise type
  - Fixed TypeScript strict mode errors for production build

- **TypeScript Build Errors**
  - Fixed crisis mode service type mapping to allow null values
  - Fixed reports import route enum type casting
  - Fixed vehicle creation route with VIN data spreading
  - Fixed talking points boolean type inference
  - Resolved vehicle detail component type compatibility

### Changed
- Removed database migration from Vercel build step (migration issues)
- Updated `vercel.json` build command to skip migrations during deploy

### Infrastructure
- **Environment Variables** (added to Vercel):
  - `DATABASE_URL` - PostgreSQL connection with pooler
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`
  - `GEMINI_PROJECT_ID`
  - `NODE_ENV=production`

### Technical Details
- **Build Configuration**:
  - Framework: Next.js 15.5.4
  - Build time: ~25s
  - TypeScript compilation: Strict mode enabled
  - All type checks passing

### Git Commits (today)
- `feat: Update Supabase password and connection pooler configuration`
- `fix: Remove database migration from build step - deploy first`
- `fix: Update dynamic route params for Next.js 15 compatibility`
- `fix: Update vehicle page params for Next.js 15`
- `fix: Allow null values in crisis mode service type mapping`
- `fix: Resolve all TypeScript errors for production build`

### Status
- ✅ Application deployed and accessible online
- ✅ All builds passing
- ✅ TypeScript errors resolved
- ⚠️ Database connectivity from Vercel may need verification
- 🚀 Auto-deploy on push enabled

## [2025-09-28] - Major Development Session

### Added
- **Gemini 2.0 Flash OCR Integration**
  - Integrated Google Gemini AI for accurate receipt OCR (95%+ accuracy)
  - Added API key securely to `.env`
  - Created test script for comparing OCR accuracy
  - Gemini 2.0 Flash model (`gemini-2.0-flash-exp`) confirmed as best for receipts

- **Document Processing System**
  - Created `/documents` page for bulk upload and OCR
  - Added Tesseract.js for client-side OCR (backup option)
  - Built smart parser for extracting dates, mileage, costs, service types
  - Support for JPG, PNG, PDF, HEIC formats

- **Enhanced VIN Decoder**
  - Integrated NHTSA Recalls API
  - Integrated NHTSA Complaints API
  - Added market value estimation
  - Added common issues database by make/model
  - NICB VINCheck integration framework

- **Service History Tracking**
  - Comprehensive maintenance record system
  - Quick service entry templates
  - Service analytics and cost tracking
  - Timeline visualization

### Fixed
- Corrected corrupted TypeScript files (QuickServiceEntry.tsx, seed-service-data.ts)
- Fixed Next.js 15 async params compatibility issues
- Fixed Prisma schema type mismatches
- Updated seed file field names (totalCost → cost)

### Changed
- Port changed from 3000 to 4000 to avoid conflicts
- Enhanced data models with Document and ImportedReport schemas

### Technical Details
- **OCR Accuracy Testing Results**:
  - Claude Vision: ~70% accuracy
  - Gemini 2.0 Flash: 95%+ accuracy
  - Decision: Use Gemini 2.0 for production OCR

### Test Data
- Processed Walker Volkswagen receipts:
  - Invoice 43514: 2018-11-12, 18,539 miles, $123.70
  - Invoice 50111: 2019-10-21, 24,661 miles, $399.99

### Dependencies Added
- `@google/generative-ai`: ^0.24.1
- `tesseract.js`: ^6.0.1
- `sharp`: ^0.34.4
- `multer`: ^2.0.2
- `tsx`: ^4.20.6

### Notes
- App running stable at http://localhost:4000
- Ready for bulk document processing (~50 receipts)
- Gemini API key stored securely in `.env`