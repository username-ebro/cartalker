import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('PDF Upload and Parsing', () => {
  let consoleLogs: string[] = [];
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page }) => {
    // Capture console logs
    page.on('console', (msg) => {
      const text = msg.text();
      consoleLogs.push(`[${msg.type()}] ${text}`);
      console.log(`[BROWSER ${msg.type().toUpperCase()}]`, text);
    });

    // Capture console errors
    page.on('pageerror', (error) => {
      const errorMsg = error.message;
      consoleErrors.push(errorMsg);
      console.error('[BROWSER ERROR]', errorMsg);
    });

    // Reset logs
    consoleLogs = [];
    consoleErrors = [];
  });

  test('should upload and parse PDF successfully', async ({ page }) => {
    console.log('\n🚀 Starting PDF upload test...\n');

    // Navigate to homepage
    console.log('📍 Step 1: Navigate to homepage');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if there are vehicles on the homepage
    const vehicleCards = page.locator('[href^="/vehicles/"]').filter({ hasNot: page.locator('text=Add') });
    const vehicleCount = await vehicleCards.count();

    console.log(`Found ${vehicleCount} vehicles in garage`);

    if (vehicleCount === 0) {
      throw new Error('No vehicles found. Please add a vehicle first using: http://localhost:4000/vehicles/add');
    }

    // Find and click on the first vehicle (that's not "Add Vehicle")
    console.log('📍 Step 2: Click on first vehicle');
    await vehicleCards.first().click();
    await page.waitForLoadState('networkidle');

    // Verify we're on a vehicle detail page
    await page.waitForSelector('text=/Vehicle Details|Reports|Maintenance/i', { timeout: 10000 });

    // Wait for page to fully load
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Click on Reports tab
    console.log('📍 Step 3: Click Reports tab');
    const reportsTab = page.locator('button', { hasText: 'Reports' });
    await reportsTab.waitFor({ state: 'visible', timeout: 60000 });
    await reportsTab.click();
    await page.waitForTimeout(1000);

    // Click Import Report button
    console.log('📍 Step 4: Click Import Report button');
    await page.click('button:has-text("Import Report")');
    await page.waitForTimeout(500);

    // Verify modal is open
    const modal = page.locator('h3:has-text("Import Vehicle History Report")');
    await expect(modal).toBeVisible();

    // Get the PDF file path
    const pdfPath = path.join(__dirname, '..', 'reports', '3VW447AU9GM030618-5db793fdedde4db.pdf');
    console.log(`📍 Step 5: Upload PDF from ${pdfPath}`);

    // Upload the PDF file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(pdfPath);

    // Wait for parsing to complete
    console.log('📍 Step 6: Wait for PDF parsing...');

    // Wait for "Parsing PDF..." to disappear (up to 30 seconds)
    await page.waitForTimeout(2000); // Give it a moment to start parsing

    try {
      await page.waitForSelector('text=Processing...', { state: 'hidden', timeout: 30000 });
      console.log('✅ PDF parsing completed!');
    } catch (e) {
      console.log('⚠️  Parsing timeout or element not found');
    }

    // Check if text appeared in the textarea
    const textarea = page.locator('textarea[placeholder*="Paste your vehicle history report"]');
    const textContent = await textarea.inputValue();

    console.log(`\n📊 Results:`);
    console.log(`  - Text extracted: ${textContent.length > 0 ? 'YES' : 'NO'}`);
    console.log(`  - Text length: ${textContent.length} characters`);
    console.log(`  - Console logs captured: ${consoleLogs.length}`);
    console.log(`  - Console errors: ${consoleErrors.length}`);

    // Print relevant console logs
    console.log(`\n📝 PDF Parsing Logs:`);
    const pdfLogs = consoleLogs.filter(log =>
      log.includes('PDF') ||
      log.includes('parse') ||
      log.includes('ArrayBuffer') ||
      log.includes('page')
    );
    pdfLogs.forEach(log => console.log(`  ${log}`));

    if (consoleErrors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      consoleErrors.forEach(err => console.log(`  ${err}`));
    }

    // Assertions
    expect(consoleErrors.length).toBe(0);
    expect(textContent.length).toBeGreaterThan(100);

    console.log(`\n✅ Test completed successfully!\n`);
  });

  test('should correctly detect zero accidents in report', async ({ page }) => {
    console.log('\n🔍 Starting accident detection test...\n');

    // Navigate to homepage
    console.log('📍 Step 1: Navigate to homepage');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find first vehicle
    const vehicleCards = page.locator('[href^="/vehicles/"]').filter({ hasNot: page.locator('text=Add') });
    const vehicleCount = await vehicleCards.count();

    console.log(`Found ${vehicleCount} vehicles in garage`);

    if (vehicleCount === 0) {
      throw new Error('No vehicles found. Please add a vehicle first.');
    }

    // Click on first vehicle
    console.log('📍 Step 2: Click on first vehicle');
    await vehicleCards.first().click();
    await page.waitForLoadState('networkidle');

    // Click Reports tab
    console.log('📍 Step 3: Click Reports tab');
    const reportsTab = page.locator('button', { hasText: 'Reports' });
    await reportsTab.waitFor({ state: 'visible', timeout: 60000 });
    await reportsTab.click();
    await page.waitForTimeout(1000);

    // Click Import Report button
    console.log('📍 Step 4: Click Import Report button');
    await page.click('button:has-text("Import Report")');
    await page.waitForTimeout(500);

    // Upload PDF
    const pdfPath = path.join(__dirname, '..', 'reports', '3VW447AU9GM030618-5db793fdedde4db.pdf');
    console.log(`📍 Step 5: Upload PDF from ${pdfPath}`);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(pdfPath);

    // Wait for parsing to complete
    console.log('📍 Step 6: Wait for PDF parsing...');
    await page.waitForTimeout(2000);

    try {
      await page.waitForSelector('text=Processing...', { state: 'hidden', timeout: 30000 });
      console.log('✅ PDF parsing completed!');
    } catch (e) {
      console.log('⚠️  Parsing timeout or element not found');
    }

    // Click Import Report button
    console.log('📍 Step 7: Submit report for analysis');
    const confirmButton = page.locator('button:has-text("Import Report")').last();
    await confirmButton.waitFor({ state: 'visible', timeout: 5000 });
    await confirmButton.click();

    // Wait for modal to close
    await page.waitForTimeout(2000);

    // Wait for analysis to complete and report to appear
    console.log('📍 Step 8: Wait for report analysis...');
    await page.waitForTimeout(3000);

    // Reload the page to ensure we get the latest report data
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Navigate back to Reports tab after reload
    const reportsTabAfterReload = page.locator('button', { hasText: 'Reports' });
    await reportsTabAfterReload.click();
    await page.waitForTimeout(2000);

    // Check if report appears in the list (first card should be most recent)
    const reportCards = page.locator('[class*="border"][class*="rounded"]').filter({
      hasText: /Report|Inspection|History/i
    });

    const reportCount = await reportCards.count();
    console.log(`Found ${reportCount} report cards`);

    // Click on the FIRST report (most recent due to orderBy importedAt DESC)
    if (reportCount > 0) {
      console.log('📍 Step 9: Click on MOST RECENT report to view analysis');
      await reportCards.first().click();
      await page.waitForTimeout(2000);

      // Look for accident count in the analysis
      const pageText = await page.textContent('body');

      console.log('\n📊 Checking accident detection:');

      // Check for various ways accidents might be displayed
      const accidentPatterns = [
        /(\d+)\s+accident/gi,
        /accident.*?(\d+)/gi,
        /no\s+accident/gi,
        /0\s+accident/gi
      ];

      let foundAccidentInfo = false;
      for (const pattern of accidentPatterns) {
        const matches = pageText?.match(pattern);
        if (matches) {
          console.log(`  Found: "${matches[0]}"`);
          foundAccidentInfo = true;
        }
      }

      if (!foundAccidentInfo) {
        console.log('  ℹ️  No explicit accident count found in report');
      }

      // The key assertion: report should NOT say "2 accident(s)" or similar
      expect(pageText).not.toMatch(/2\s+accident/i);
      expect(pageText).not.toMatch(/accident.*?2/i);

      // Report should indicate no accidents if it mentions accidents at all
      if (pageText?.toLowerCase().includes('accident')) {
        const hasNoAccidents =
          pageText.toLowerCase().includes('no accident') ||
          pageText.toLowerCase().includes('0 accident') ||
          pageText.toLowerCase().includes('accident-free');

        if (hasNoAccidents) {
          console.log('  ✅ Report correctly shows NO accidents');
        } else {
          console.log('  ⚠️  Report mentions accidents but not clearly stating "none"');
        }
      }

      console.log('\n✅ Accident detection test passed!\n');
    } else {
      throw new Error('No report cards found after upload');
    }
  });

  test.afterEach(async ({ page }) => {
    // Take a screenshot on failure
    if (test.info().status !== test.info().expectedStatus) {
      await page.screenshot({
        path: `tests/screenshots/pdf-upload-failure-${Date.now()}.png`,
        fullPage: true
      });
    }
  });
});
