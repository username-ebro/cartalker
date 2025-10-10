/**
 * Quick test script for the Recall API
 * Run with: node test-recalls-api.js
 *
 * Make sure the dev server is running: npm run dev
 */

const API_BASE = 'http://localhost:4000';

// Test VINs (examples - may or may not have recalls)
const TEST_VINS = [
  '1VWBN7A39CC012345', // VW Golf GTI 2012
  '1C4RJFBG3EC123456', // Jeep Wrangler 2014
  '3VW447AU9GM030618', // VW (from your project files)
];

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, ...args) {
  console.log(color, ...args, colors.reset);
}

async function testRecallAPI(vin) {
  log(colors.cyan, `\n${'='.repeat(60)}`);
  log(colors.cyan, `Testing VIN: ${vin}`);
  log(colors.cyan, '='.repeat(60));

  try {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE}/api/recalls?vin=${vin}`);
    const duration = Date.now() - startTime;

    const cacheStatus = response.headers.get('X-Cache-Status');
    const contentType = response.headers.get('Content-Type');

    log(colors.blue, `Status: ${response.status} ${response.statusText}`);
    log(colors.blue, `Duration: ${duration}ms`);
    log(colors.blue, `Cache Status: ${cacheStatus || 'N/A'}`);
    log(colors.blue, `Content-Type: ${contentType}`);

    const data = await response.json();

    if (data.success) {
      log(colors.green, '✓ SUCCESS');
      console.log('\nVehicle:', data.data.vehicle);
      console.log('Recall Count:', data.data.recallCount);
      console.log('Last Checked:', data.data.lastChecked);
      console.log('Cache Status:', data.data.cacheStatus);

      if (data.data.recallCount > 0) {
        log(colors.yellow, `\n⚠️  Found ${data.data.recallCount} recall(s):`);
        data.data.recalls.forEach((recall, index) => {
          console.log(`\n${index + 1}. ${recall.recallId} - ${recall.severityLevel} Severity`);
          console.log(`   Component: ${recall.componentAffected}`);
          console.log(`   Description: ${recall.description.substring(0, 100)}...`);
          console.log(`   Safety Risk: ${recall.safetyRisk.substring(0, 100)}...`);
          console.log(`   Date: ${recall.dateInitiated}`);
          if (recall.parkVehicle) {
            log(colors.red, '   ⚠️  DO NOT DRIVE - PARK VEHICLE');
          }
          if (recall.parkOutside) {
            log(colors.red, '   ⚠️  PARK OUTSIDE - FIRE RISK');
          }
        });
      } else {
        log(colors.green, '\n✓ No recalls found for this vehicle');
      }
    } else {
      log(colors.red, '✗ ERROR');
      console.log('Error:', data.error);
      console.log('Details:', data.details);
    }

  } catch (error) {
    log(colors.red, '✗ REQUEST FAILED');
    console.error('Error:', error.message);
  }
}

async function testInvalidCases() {
  log(colors.cyan, '\n' + '='.repeat(60));
  log(colors.cyan, 'Testing Invalid Cases');
  log(colors.cyan, '='.repeat(60));

  const invalidTests = [
    { vin: '', name: 'Empty VIN' },
    { vin: '1234', name: 'Too short' },
    { vin: '1VWBN7A39CCOI2345', name: 'Contains I/O/Q' },
    { vin: '11111111111111111', name: 'Invalid VIN' },
  ];

  for (const test of invalidTests) {
    console.log(`\n${test.name}: ${test.vin || '(empty)'}`);
    try {
      const response = await fetch(`${API_BASE}/api/recalls?vin=${test.vin}`);
      const data = await response.json();

      if (!data.success) {
        log(colors.green, `✓ Correctly rejected: ${data.error}`);
      } else {
        log(colors.red, '✗ Should have been rejected');
      }
    } catch (error) {
      log(colors.red, `✗ Request failed: ${error.message}`);
    }
  }
}

async function testCache() {
  log(colors.cyan, '\n' + '='.repeat(60));
  log(colors.cyan, 'Testing Cache Behavior');
  log(colors.cyan, '='.repeat(60));

  const testVin = TEST_VINS[0];

  console.log('\nFirst request (should be MISS):');
  const start1 = Date.now();
  const response1 = await fetch(`${API_BASE}/api/recalls?vin=${testVin}`);
  const duration1 = Date.now() - start1;
  const data1 = await response1.json();
  const cacheStatus1 = response1.headers.get('X-Cache-Status');

  log(colors.blue, `Duration: ${duration1}ms, Cache: ${cacheStatus1}, Status in body: ${data1.data?.cacheStatus}`);

  console.log('\nSecond request (should be HIT):');
  const start2 = Date.now();
  const response2 = await fetch(`${API_BASE}/api/recalls?vin=${testVin}`);
  const duration2 = Date.now() - start2;
  const data2 = await response2.json();
  const cacheStatus2 = response2.headers.get('X-Cache-Status');

  log(colors.blue, `Duration: ${duration2}ms, Cache: ${cacheStatus2}, Status in body: ${data2.data?.cacheStatus}`);

  if (cacheStatus1 === 'MISS' && cacheStatus2 === 'HIT') {
    log(colors.green, `✓ Cache working correctly! ${duration1}ms → ${duration2}ms (${Math.round(duration1/duration2)}x faster)`);
  } else {
    log(colors.yellow, `⚠️  Cache status unexpected: ${cacheStatus1} → ${cacheStatus2}`);
  }
}

async function runAllTests() {
  console.clear();
  log(colors.cyan, '╔═══════════════════════════════════════════════════════════╗');
  log(colors.cyan, '║         NHTSA Recall API Integration Test Suite         ║');
  log(colors.cyan, '╚═══════════════════════════════════════════════════════════╝');

  // Test valid VINs
  for (const vin of TEST_VINS) {
    await testRecallAPI(vin);
  }

  // Test invalid cases
  await testInvalidCases();

  // Test caching
  await testCache();

  log(colors.cyan, '\n' + '='.repeat(60));
  log(colors.green, '✓ All tests completed!');
  log(colors.cyan, '='.repeat(60));
}

// Run tests
runAllTests().catch(error => {
  log(colors.red, '\n✗ Test suite failed:', error.message);
  process.exit(1);
});
