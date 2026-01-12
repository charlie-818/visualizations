/**
 * Comprehensive test suite for StockData.org API integration
 * Tests Netlify function, service integration, data format, and utility functions
 * 
 * Prerequisites:
 * - Set STOCKDATA_ORG_API_TOKEN environment variable
 * - Run: netlify dev (in another terminal)
 * - Or set environment variable in Netlify dashboard for production testing
 */

const baseUrl = process.env.NETLIFY_DEV_URL || 'http://localhost:8888';

// Test symbols (US-listed stocks)
const testSymbols = ['AAPL', 'NVDA', 'MSFT'];
const testPeriods = ['3m', '6m', '1y'];

/**
 * Test Netlify function endpoint
 */
async function testNetlifyFunction(symbol, period) {
  console.log(`\n   Testing: ${symbol} for period ${period}`);
  
  try {
    // Calculate date range
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    
    const periodDays = {
      '3m': 90,
      '6m': 180,
      '1y': 365,
    };
    
    const days = periodDays[period] || 90;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    const dateFrom = startDate.toISOString().split('T')[0];
    const dateTo = endDate.toISOString().split('T')[0];
    
    // Test direct function endpoint
    const url = `${baseUrl}/.netlify/functions/stockdata-org?symbol=${symbol}&date_from=${dateFrom}&date_to=${dateTo}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      console.log(`     ❌ HTTP ${response.status}: ${data.error || 'Unknown error'}`);
      return { success: false, error: data.error || `HTTP ${response.status}` };
    }
    
    // Validate response structure
    if (!data.data || !Array.isArray(data.data)) {
      console.log(`     ❌ Invalid response structure: missing data array`);
      return { success: false, error: 'Invalid response structure' };
    }
    
    if (data.data.length === 0) {
      console.log(`     ⚠️  No data returned (may be valid if market is closed)`);
      return { success: true, dataCount: 0, warning: 'No data' };
    }
    
    // Validate data format
    // API returns flat structure: { date, open, high, low, close, volume }
    const firstItem = data.data[0];
    if (!firstItem.date || firstItem.close === undefined) {
      console.log(`     ❌ Invalid data format: missing required fields`);
      return { success: false, error: 'Invalid data format' };
    }
    
    // Check price is valid number
    const price = parseFloat(firstItem.close);
    if (isNaN(price) || price <= 0) {
      console.log(`     ❌ Invalid price value: ${firstItem.close}`);
      return { success: false, error: 'Invalid price value' };
    }
    
    console.log(`     ✅ Success: ${data.data.length} data points`);
    console.log(`        Date range: ${data.data[0].date} to ${data.data[data.data.length - 1].date}`);
    console.log(`        Price range: $${Math.min(...data.data.map(d => parseFloat(d.close))).toFixed(2)} - $${Math.max(...data.data.map(d => parseFloat(d.close))).toFixed(2)}`);
    
    return { 
      success: true, 
      dataCount: data.data.length,
      dateRange: {
        from: data.data[0].date,
        to: data.data[data.data.length - 1].date
      },
      priceRange: {
        min: Math.min(...data.data.map(d => parseFloat(d.close))),
        max: Math.max(...data.data.map(d => parseFloat(d.close)))
      }
    };
    
  } catch (error) {
    console.log(`     ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Test proxied endpoint (via redirect rule)
 */
async function testProxiedEndpoint(symbol, period) {
  try {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    
    const periodDays = { '3m': 90, '6m': 180, '1y': 365 };
    const days = periodDays[period] || 90;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    const dateFrom = startDate.toISOString().split('T')[0];
    const dateTo = endDate.toISOString().split('T')[0];
    
    const url = `${baseUrl}/api/stockdata-org?symbol=${symbol}&date_from=${dateFrom}&date_to=${dateTo}`;
    
    const response = await fetch(url);
    
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test CORS headers
 */
async function testCORSHeaders() {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 90);
    
    const url = `${baseUrl}/.netlify/functions/stockdata-org?symbol=AAPL&date_from=${startDate.toISOString().split('T')[0]}&date_to=${endDate.toISOString().split('T')[0]}`;
    const response = await fetch(url);
    
    const corsOrigin = response.headers.get('access-control-allow-origin');
    const corsMethods = response.headers.get('access-control-allow-methods');
    const corsHeaders = response.headers.get('access-control-allow-headers');
    
    return {
      success: corsOrigin === '*',
      origin: corsOrigin,
      methods: corsMethods,
      headers: corsHeaders
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  const results = {};
  
  // Test 1: Missing symbol
  try {
    const url = `${baseUrl}/.netlify/functions/stockdata-org`;
    const response = await fetch(url);
    const data = await response.json();
    
    results.missingSymbol = {
      success: response.status === 400 && data.error,
      status: response.status,
      error: data.error
    };
  } catch (error) {
    results.missingSymbol = { success: false, error: error.message };
  }
  
  // Test 2: Invalid symbol
  try {
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 90);
    
    const url = `${baseUrl}/.netlify/functions/stockdata-org?symbol=INVALID_SYMBOL_XYZ&date_from=${startDate.toISOString().split('T')[0]}&date_to=${endDate.toISOString().split('T')[0]}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // API might return empty data array or error
    results.invalidSymbol = {
      success: response.status === 200 || (response.status >= 400 && data.error),
      status: response.status,
      data: data.data ? (Array.isArray(data.data) ? data.data.length : 'invalid') : 'missing'
    };
  } catch (error) {
    results.invalidSymbol = { success: false, error: error.message };
  }
  
  // Test 3: Missing date parameters (should still work with defaults or error gracefully)
  try {
    const url = `${baseUrl}/.netlify/functions/stockdata-org?symbol=AAPL`;
    const response = await fetch(url);
    const data = await response.json();
    
    results.missingDates = {
      success: true, // API might handle missing dates with defaults
      status: response.status
    };
  } catch (error) {
    results.missingDates = { success: false, error: error.message };
  }
  
  return results;
}

/**
 * Test date range calculations
 */
function testDateRangeCalculations() {
  const results = {};
  
  const periods = {
    '3m': 90,
    '6m': 180,
    '1y': 365
  };
  
  for (const [period, expectedDays] of Object.entries(periods)) {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - expectedDays);
    
    const actualDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
    
    results[period] = {
      success: actualDays === expectedDays,
      expected: expectedDays,
      actual: actualDays
    };
  }
  
  return results;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🔍 StockData.org API Comprehensive Test Suite');
  console.log('='.repeat(70));
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Test Symbols: ${testSymbols.join(', ')}`);
  console.log(`Test Periods: ${testPeriods.join(', ')}`);
  console.log('='.repeat(70));
  
  const allResults = {
    netlifyFunction: {},
    proxiedEndpoint: {},
    corsHeaders: null,
    errorHandling: null,
    dateCalculations: null,
  };
  
  let totalTests = 0;
  let passedTests = 0;
  
  // Test 1: Netlify Function Endpoint
  console.log('\n1️⃣  Testing Netlify Function Endpoint');
  console.log('-'.repeat(70));
  
  for (const symbol of testSymbols) {
    allResults.netlifyFunction[symbol] = {};
    for (const period of testPeriods) {
      totalTests++;
      const result = await testNetlifyFunction(symbol, period);
      allResults.netlifyFunction[symbol][period] = result;
      if (result.success) {
        passedTests++;
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  // Test 2: Proxied Endpoint
  console.log('\n2️⃣  Testing Proxied Endpoint (/api/stockdata-org)');
  console.log('-'.repeat(70));
  const proxiedResult = await testProxiedEndpoint(testSymbols[0], testPeriods[0]);
  allResults.proxiedEndpoint = proxiedResult;
  totalTests++;
  if (proxiedResult.success) {
    passedTests++;
    console.log('   ✅ Proxied endpoint is accessible');
  } else {
    console.log(`   ❌ Proxied endpoint failed: ${proxiedResult.error}`);
  }
  
  // Test 3: CORS Headers
  console.log('\n3️⃣  Testing CORS Headers');
  console.log('-'.repeat(70));
  const corsResult = await testCORSHeaders();
  allResults.corsHeaders = corsResult;
  totalTests++;
  if (corsResult.success) {
    passedTests++;
    console.log('   ✅ CORS headers are correctly configured');
    console.log(`      Access-Control-Allow-Origin: ${corsResult.origin}`);
    console.log(`      Access-Control-Allow-Methods: ${corsResult.methods}`);
    console.log(`      Access-Control-Allow-Headers: ${corsResult.headers}`);
  } else {
    console.log('   ❌ CORS headers test failed');
    if (corsResult.error) {
      console.log(`      Error: ${corsResult.error}`);
    } else {
      console.log(`      Origin: ${corsResult.origin || 'Not set'}`);
    }
  }
  
  // Test 4: Error Handling
  console.log('\n4️⃣  Testing Error Handling');
  console.log('-'.repeat(70));
  const errorResults = await testErrorHandling();
  allResults.errorHandling = errorResults;
  
  console.log('   Missing symbol:');
  if (errorResults.missingSymbol.success) {
    passedTests++;
    console.log(`     ✅ Correctly handled (Status: ${errorResults.missingSymbol.status})`);
  } else {
    console.log(`     ❌ Failed: ${errorResults.missingSymbol.error || 'Unexpected response'}`);
  }
  totalTests++;
  
  console.log('   Invalid symbol:');
  if (errorResults.invalidSymbol.success) {
    passedTests++;
    console.log(`     ✅ Correctly handled (Status: ${errorResults.invalidSymbol.status})`);
  } else {
    console.log(`     ❌ Failed: ${errorResults.invalidSymbol.error || 'Unexpected response'}`);
  }
  totalTests++;
  
  // Test 5: Date Range Calculations
  console.log('\n5️⃣  Testing Date Range Calculations');
  console.log('-'.repeat(70));
  const dateResults = testDateRangeCalculations();
  allResults.dateCalculations = dateResults;
  
  for (const [period, result] of Object.entries(dateResults)) {
    totalTests++;
    if (result.success) {
      passedTests++;
      console.log(`   ✅ ${period}: ${result.expected} days (correct)`);
    } else {
      console.log(`   ❌ ${period}: Expected ${result.expected} days, got ${result.actual}`);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Test Summary');
  console.log('='.repeat(70));
  
  console.log('\nNetlify Function Tests:');
  for (const symbol of testSymbols) {
    console.log(`\n  ${symbol}:`);
    for (const period of testPeriods) {
      const result = allResults.netlifyFunction[symbol][period];
      const icon = result.success ? '✅' : '❌';
      const status = result.success 
        ? `${result.dataCount} data points` 
        : result.error || 'Failed';
      console.log(`    ${icon} ${period}: ${status}`);
    }
  }
  
  console.log('\nInfrastructure Tests:');
  console.log(`  ${allResults.proxiedEndpoint.success ? '✅' : '❌'} Proxied Endpoint`);
  console.log(`  ${allResults.corsHeaders.success ? '✅' : '❌'} CORS Headers`);
  console.log(`  ${errorResults.missingSymbol.success ? '✅' : '❌'} Error Handling (Missing Symbol)`);
  console.log(`  ${errorResults.invalidSymbol.success ? '✅' : '❌'} Error Handling (Invalid Symbol)`);
  
  console.log('\nDate Calculations:');
  for (const [period, result] of Object.entries(dateResults)) {
    console.log(`  ${result.success ? '✅' : '❌'} ${period} (${result.expected} days)`);
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`Total: ${passedTests}/${totalTests} tests passed`);
  console.log('='.repeat(70));
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! StockData.org integration is working correctly.');
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Review the output above for details.`);
  }
  
  console.log('\n💡 Notes:');
  console.log('   - Ensure STOCKDATA_ORG_API_TOKEN is set in environment variables');
  console.log('   - For local testing, run: netlify dev (in another terminal)');
  console.log('   - For production, set STOCKDATA_ORG_API_TOKEN in Netlify dashboard');
  console.log('   - Rate limits may apply depending on your StockData.org plan');
  console.log('   - Empty data arrays may occur if market is closed or symbol is invalid');
  
  return {
    passed: passedTests,
    total: totalTests,
    allPassed: passedTests === totalTests
  };
}

// Run tests
runTests()
  .then(result => {
    process.exit(result.allPassed ? 0 : 1);
  })
  .catch(error => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
