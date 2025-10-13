# Automated PDF Upload Testing

This directory contains Playwright automated tests for the CarTalker application.

## Setup

Already done! Playwright and browsers are installed.

## Running Tests

### Run all tests (headless)
```bash
npm test
```

### Run tests with UI (see the browser)
```bash
npm run test:ui
```

### Run tests in debug mode (step through)
```bash
npm run test:debug
```

## What the PDF Upload Test Does

The `pdf-upload.spec.ts` test automates the following:

1. ✅ Opens your app at `http://localhost:4000`
2. ✅ Clicks on the first vehicle in your garage
3. ✅ Navigates to the "Reports" tab
4. ✅ Clicks "Import Report" button
5. ✅ Uploads the PDF file (`3VW447AU9GM030618-5db793fdedde4db.pdf`)
6. ✅ **Captures ALL browser console logs** (including PDF parsing logs!)
7. ✅ **Captures ALL JavaScript errors**
8. ✅ Waits for PDF parsing to complete
9. ✅ Verifies text was extracted
10. ✅ Takes screenshots on failure

## Console Output

When you run the test, you'll see:

```
🚀 Starting PDF upload test...

📍 Step 1: Navigate to homepage
📍 Step 2: Click on first vehicle
📍 Step 3: Click Reports tab
[BROWSER LOG] Starting PDF parse for: 3VW447AU9GM030618-5db793fdedde4db.pdf
[BROWSER LOG] ArrayBuffer loaded, size: 179131
[BROWSER LOG] Importing PDF.js...
[BROWSER LOG] PDF.js version: 5.4.149
[BROWSER LOG] Worker path: https://...
[BROWSER LOG] Loading PDF document...
[BROWSER LOG] PDF loaded, pages: 3
[BROWSER LOG] Processing page 1/3...
[BROWSER LOG] Processing page 2/3...
[BROWSER LOG] Processing page 3/3...
[BROWSER LOG] PDF parsing complete, text length: 5432

📊 Results:
  - Text extracted: YES
  - Text length: 5432 characters
  - Console logs captured: 25
  - Console errors: 0

✅ Test completed successfully!
```

## Troubleshooting

### PDF file not found
Make sure `3VW447AU9GM030618-5db793fdedde4db.pdf` exists in the project root. Or update the path in `tests/pdf-upload.spec.ts` line 68.

### Test timeouts
- Tests have 2 minutes to complete
- Each action has 30 seconds
- If your server is slow, increase these in `playwright.config.ts`

### Screenshots
Failed test screenshots are saved to:
- `test-results/` - Playwright automatic screenshots
- `tests/screenshots/` - Custom failure screenshots

## Updating the Test

Edit `tests/pdf-upload.spec.ts` to:
- Change the PDF file path
- Add more assertions
- Test different scenarios
- Capture more console logs

The test is fully commented and easy to modify!
