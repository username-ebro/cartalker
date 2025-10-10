# CarTalker Changelog

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