/**
 * Direct API test for StockData.org integration
 * Tests the API directly without requiring Netlify dev server
 * Tests all periods: 3m, 6m, 1y
 */

const API_TOKEN = process.env.STOCKDATA_ORG_API_TOKEN || 'qlrkDMzhLXDSHQQAZaVn9QAODHdGa6kDeAXYacul';

const testSymbols = ['AAPL', 'NVDA', 'MSFT'];
const testPeriods = ['3m', '6m', '1y'];

/**
 * Calculate date range for a period
 */
function getDateRange(period) {
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
  
  return { dateFrom, dateTo, days };
}

/**
 * Test StockData.org API directly
 */
async function testStockDataAPI(symbol, period) {
  try {
    const { dateFrom, dateTo, days } = getDateRange(period);
    
    const url = new URL('https://api.stockdata.org/v1/data/eod');
    url.searchParams.set('api_token', API_TOKEN);
    url.searchParams.set('symbols', symbol);
    url.searchParams.set('interval', 'day');
    url.searchParams.set('sort', 'asc');
    url.searchParams.set('date_from', dateFrom);
    url.searchParams.set('date_to', dateTo);
    
    console.log(`\n   Testing ${symbol} for ${period} (${days} days):`);
    console.log(`   URL: ${url.toString().replace(API_TOKEN, '***')}`);
    console.log(`   Date range: ${dateFrom} to ${dateTo}`);
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    if (!response.ok) {
      console.log(`   ❌ HTTP ${response.status}: ${data.error || response.statusText}`);
      return { success: false, error: data.error || `HTTP ${response.status}` };
    }
    
    // Check for API errors
    if (data.error) {
      console.log(`   ❌ API Error: ${data.error}`);
      return { success: false, error: data.error };
    }
    
    // Validate response structure
    if (!data.data || !Array.isArray(data.data)) {
      console.log(`   ❌ Invalid response structure: missing data array`);
      return { success: false, error: 'Invalid response structure' };
    }
    
    if (data.data.length === 0) {
      console.log(`   ⚠️  No data returned (empty array)`);
      return { success: true, dataCount: 0, warning: 'No data' };
    }
    
    // Validate data format
    // API returns flat structure: { date, open, high, low, close, volume }
    const firstItem = data.data[0];
    if (!firstItem.date || firstItem.close === undefined) {
      console.log(`   ❌ Invalid data format: missing required fields`);
      console.log(`   Sample item: ${JSON.stringify(firstItem).substring(0, 200)}`);
      return { success: false, error: 'Invalid data format' };
    }
    
    // Extract prices (flat structure, not nested)
    const prices = data.data.map(item => parseFloat(item.close)).filter(p => !isNaN(p) && p > 0);
    const dates = data.data.map(item => item.date);
    
    if (prices.length === 0) {
      console.log(`   ❌ No valid prices found`);
      return { success: false, error: 'No valid prices' };
    }
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    
    console.log(`   ✅ Success!`);
    console.log(`      Data points: ${data.data.length}`);
    console.log(`      Valid prices: ${prices.length}`);
    console.log(`      Date range: ${dates[0]} to ${dates[dates.length - 1]}`);
    console.log(`      Price range: $${minPrice.toFixed(2)} - $${maxPrice.toFixed(2)}`);
    console.log(`      First price: $${firstPrice.toFixed(2)}`);
    console.log(`      Last price: $${lastPrice.toFixed(2)}`);
    console.log(`      Price change: ${((lastPrice - firstPrice) / firstPrice * 100).toFixed(2)}%`);
    
    return {
      success: true,
      dataCount: data.data.length,
      priceCount: prices.length,
      dateRange: { from: dates[0], to: dates[dates.length - 1] },
      priceRange: { min: minPrice, max: maxPrice, first: firstPrice, last: lastPrice },
      priceChange: ((lastPrice - firstPrice) / firstPrice * 100)
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('🧪 StockData.org API Direct Test');
  console.log('='.repeat(70));
  console.log(`API Token: ${API_TOKEN.substring(0, 8)}...${API_TOKEN.substring(API_TOKEN.length - 4)}`);
  console.log(`Test Symbols: ${testSymbols.join(', ')}`);
  console.log(`Test Periods: ${testPeriods.join(', ')}`);
  console.log('='.repeat(70));
  
  const results = {};
  let totalTests = 0;
  let passedTests = 0;
  
  for (const symbol of testSymbols) {
    results[symbol] = {};
    console.log(`\n📊 Testing ${symbol}:`);
    console.log('-'.repeat(70));
    
    for (const period of testPeriods) {
      totalTests++;
      const result = await testStockDataAPI(symbol, period);
      results[symbol][period] = result;
      
      if (result.success) {
        passedTests++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 Test Summary');
  console.log('='.repeat(70));
  
  for (const symbol of testSymbols) {
    console.log(`\n${symbol}:`);
    for (const period of testPeriods) {
      const result = results[symbol][period];
      const icon = result.success ? '✅' : '❌';
      const status = result.success
        ? `${result.dataCount || result.priceCount || 0} data points`
        : result.error || 'Failed';
      console.log(`  ${icon} ${period}: ${status}`);
      
      if (result.success && result.priceRange) {
        console.log(`     Price: $${result.priceRange.first.toFixed(2)} → $${result.priceRange.last.toFixed(2)} (${result.priceChange.toFixed(2)}%)`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(70));
  console.log(`Total: ${passedTests}/${totalTests} tests passed`);
  console.log('='.repeat(70));
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! StockData.org API is working correctly for all periods.');
    console.log('\n💡 The API successfully fetched stock prices for:');
    console.log(`   - 3 months (90 days)`);
    console.log(`   - 6 months (180 days)`);
    console.log(`   - 1 year (365 days)`);
    return { allPassed: true, passed: passedTests, total: totalTests };
  } else {
    console.log(`\n⚠️  ${totalTests - passedTests} test(s) failed. Review the output above.`);
    return { allPassed: false, passed: passedTests, total: totalTests };
  }
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
