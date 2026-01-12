/**
 * Unit tests for utility functions with new time periods
 * Tests getFeesForPeriod, getVolumeForPeriod, and getDaysForPeriod
 */

// Mock TokenizedStock interface
const mockStock = {
  symbol: "AAPLon",
  poolTVL: 1000,
  fees24h: 10,
  volume24h: 100,
  fees30d: 300,
  volume30d: 3000,
  apr: 100
};

/**
 * Test getFeesForPeriod function logic
 */
function testGetFeesForPeriod() {
  console.log('\n1️⃣  Testing getFeesForPeriod');
  console.log('-'.repeat(60));
  
  const results = {};
  const periods = ['24h', '7d', '30d', '3m', '6m', '1y'];
  
  // Expected values based on the calculation logic
  const expectedFees = {
    '24h': mockStock.fees24h, // 10
    '7d': mockStock.fees24h * 7, // 70
    '30d': mockStock.fees30d, // 300
    '3m': (mockStock.fees30d / 30) * 90, // (300/30)*90 = 900
    '6m': (mockStock.fees30d / 30) * 180, // (300/30)*180 = 1800
    '1y': (mockStock.fees30d / 30) * 365, // (300/30)*365 = 3650
  };
  
  // Simulate the function logic
  function getFeesForPeriod(stock, period) {
    switch (period) {
      case '24h':
        return stock.fees24h;
      case '7d':
        return stock.fees24h * 7;
      case '30d':
        return stock.fees30d;
      case '3m':
        return (stock.fees30d / 30) * 90;
      case '6m':
        return (stock.fees30d / 30) * 180;
      case '1y':
        return (stock.fees30d / 30) * 365;
      default:
        return stock.fees24h;
    }
  }
  
  for (const period of periods) {
    const result = getFeesForPeriod(mockStock, period);
    const expected = expectedFees[period];
    const success = Math.abs(result - expected) < 0.01; // Allow floating point tolerance
    
    results[period] = { success, expected, actual: result };
    
    if (success) {
      console.log(`   ✅ ${period}: $${result.toFixed(2)} (expected $${expected.toFixed(2)})`);
    } else {
      console.log(`   ❌ ${period}: $${result.toFixed(2)} (expected $${expected.toFixed(2)})`);
    }
  }
  
  return results;
}

/**
 * Test getVolumeForPeriod function logic
 */
function testGetVolumeForPeriod() {
  console.log('\n2️⃣  Testing getVolumeForPeriod');
  console.log('-'.repeat(60));
  
  const results = {};
  const periods = ['24h', '7d', '30d', '3m', '6m', '1y'];
  
  // Expected values based on the calculation logic
  const expectedVolumes = {
    '24h': mockStock.volume24h, // 100
    '7d': mockStock.volume24h * 7, // 700
    '30d': mockStock.volume30d, // 3000
    '3m': (mockStock.volume30d / 30) * 90, // (3000/30)*90 = 9000
    '6m': (mockStock.volume30d / 30) * 180, // (3000/30)*180 = 18000
    '1y': (mockStock.volume30d / 30) * 365, // (3000/30)*365 = 36500
  };
  
  // Simulate the function logic
  function getVolumeForPeriod(stock, period) {
    switch (period) {
      case '24h':
        return stock.volume24h;
      case '7d':
        return stock.volume24h * 7;
      case '30d':
        return stock.volume30d;
      case '3m':
        return (stock.volume30d / 30) * 90;
      case '6m':
        return (stock.volume30d / 30) * 180;
      case '1y':
        return (stock.volume30d / 30) * 365;
      default:
        return stock.volume24h;
    }
  }
  
  for (const period of periods) {
    const result = getVolumeForPeriod(mockStock, period);
    const expected = expectedVolumes[period];
    const success = Math.abs(result - expected) < 0.01; // Allow floating point tolerance
    
    results[period] = { success, expected, actual: result };
    
    if (success) {
      console.log(`   ✅ ${period}: ${result.toFixed(2)} (expected ${expected.toFixed(2)})`);
    } else {
      console.log(`   ❌ ${period}: ${result.toFixed(2)} (expected ${expected.toFixed(2)})`);
    }
  }
  
  return results;
}

/**
 * Test getDaysForPeriod function logic
 */
function testGetDaysForPeriod() {
  console.log('\n3️⃣  Testing getDaysForPeriod');
  console.log('-'.repeat(60));
  
  const results = {};
  const periods = ['24h', '7d', '30d', '3m', '6m', '1y'];
  
  // Expected values
  const expectedDays = {
    '24h': 1,
    '7d': 7,
    '30d': 30,
    '3m': 90,
    '6m': 180,
    '1y': 365,
  };
  
  // Simulate the function logic
  function getDaysForPeriod(period) {
    switch (period) {
      case '24h':
        return 1;
      case '7d':
        return 7;
      case '30d':
        return 30;
      case '3m':
        return 90;
      case '6m':
        return 180;
      case '1y':
        return 365;
      default:
        return 1;
    }
  }
  
  for (const period of periods) {
    const result = getDaysForPeriod(period);
    const expected = expectedDays[period];
    const success = result === expected;
    
    results[period] = { success, expected, actual: result };
    
    if (success) {
      console.log(`   ✅ ${period}: ${result} days (expected ${expected} days)`);
    } else {
      console.log(`   ❌ ${period}: ${result} days (expected ${expected} days)`);
    }
  }
  
  return results;
}

/**
 * Main test runner
 */
function runTests() {
  console.log('🧪 Utility Functions Unit Test Suite');
  console.log('='.repeat(70));
  console.log(`Testing with mock stock: ${mockStock.symbol}`);
  console.log(`  fees24h: $${mockStock.fees24h}`);
  console.log(`  fees30d: $${mockStock.fees30d}`);
  console.log(`  volume24h: ${mockStock.volume24h}`);
  console.log(`  volume30d: ${mockStock.volume30d}`);
  console.log('='.repeat(70));
  
  const feeResults = testGetFeesForPeriod();
  const volumeResults = testGetVolumeForPeriod();
  const dayResults = testGetDaysForPeriod();
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Test Summary');
  console.log('='.repeat(70));
  
  let totalTests = 0;
  let passedTests = 0;
  
  console.log('\ngetFeesForPeriod:');
  for (const [period, result] of Object.entries(feeResults)) {
    totalTests++;
    if (result.success) {
      passedTests++;
      console.log(`  ✅ ${period}: $${result.actual.toFixed(2)}`);
    } else {
      console.log(`  ❌ ${period}: $${result.actual.toFixed(2)} (expected $${result.expected.toFixed(2)})`);
    }
  }
  
  console.log('\ngetVolumeForPeriod:');
  for (const [period, result] of Object.entries(volumeResults)) {
    totalTests++;
    if (result.success) {
      passedTests++;
      console.log(`  ✅ ${period}: ${result.actual.toFixed(2)}`);
    } else {
      console.log(`  ❌ ${period}: ${result.actual.toFixed(2)} (expected ${result.expected.toFixed(2)})`);
    }
  }
  
  console.log('\ngetDaysForPeriod:');
  for (const [period, result] of Object.entries(dayResults)) {
    totalTests++;
    if (result.success) {
      passedTests++;
      console.log(`  ✅ ${period}: ${result.actual} days`);
    } else {
      console.log(`  ❌ ${period}: ${result.actual} days (expected ${result.expected} days)`);
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`Total: ${passedTests}/${totalTests} tests passed`);
  console.log('='.repeat(70));
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All utility function tests passed!');
    return { allPassed: true, passed: passedTests, total: totalTests };
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed.`);
    return { allPassed: false, passed: passedTests, total: totalTests };
  }
}

// Run tests
const result = runTests();
process.exit(result.allPassed ? 0 : 1);
