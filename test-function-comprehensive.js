/**
 * Comprehensive test for Netlify Functions integration
 * Tests all aspects of the function including CORS, error handling, and routing
 */

const testComprehensive = async () => {
  const baseUrl = 'http://localhost:8888';
  const testSymbol = 'AAPL';

  console.log('🔍 Comprehensive Netlify Functions Test\n');
  console.log('='.repeat(60));

  const results = {
    directEndpoint: false,
    proxiedEndpoint: false,
    corsHeaders: false,
    errorHandling: false,
    routing: false,
  };

  // Test 1: Direct function endpoint
  console.log('\n1️⃣  Testing Direct Function Endpoint');
  console.log('-'.repeat(60));
  try {
    const url = `${baseUrl}/.netlify/functions/alpha-vantage?symbol=${testSymbol}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   CORS Origin: ${response.headers.get('access-control-allow-origin')}`);

    if (response.ok && !data.error) {
      results.directEndpoint = true;
      console.log('   ✅ Direct endpoint works correctly');
    } else {
      console.log('   ❌ Direct endpoint failed');
      console.log(`   Error: ${JSON.stringify(data).substring(0, 150)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 2: Proxied endpoint (via redirect rule)
  console.log('\n2️⃣  Testing Proxied Endpoint (/api/alpha-vantage)');
  console.log('-'.repeat(60));
  try {
    const url = `${baseUrl}/api/alpha-vantage?symbol=${testSymbol}`;
    const response = await fetch(url);
    const data = await response.json();

    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);

    // Check if it's a rate limit (which means function is working)
    if (data.Information && data.Information.includes('rate')) {
      results.proxiedEndpoint = true;
      console.log('   ✅ Proxied endpoint works (rate limited = function is working)');
      console.log('   ⚠️  Alpha Vantage API rate limit hit (expected with free tier)');
    } else if (response.ok && !data.error) {
      results.proxiedEndpoint = true;
      console.log('   ✅ Proxied endpoint works correctly');
    } else {
      console.log('   ❌ Proxied endpoint failed');
      console.log(`   Error: ${JSON.stringify(data).substring(0, 150)}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 3: CORS headers
  console.log('\n3️⃣  Testing CORS Headers');
  console.log('-'.repeat(60));
  try {
    const url = `${baseUrl}/.netlify/functions/alpha-vantage?symbol=${testSymbol}`;
    const response = await fetch(url);
    
    const corsOrigin = response.headers.get('access-control-allow-origin');
    const corsMethods = response.headers.get('access-control-allow-methods');
    const corsHeaders = response.headers.get('access-control-allow-headers');

    console.log(`   Access-Control-Allow-Origin: ${corsOrigin || 'Not set'}`);
    console.log(`   Access-Control-Allow-Methods: ${corsMethods || 'Not set'}`);
    console.log(`   Access-Control-Allow-Headers: ${corsHeaders || 'Not set'}`);

    if (corsOrigin === '*') {
      results.corsHeaders = true;
      console.log('   ✅ CORS headers are correctly configured');
    } else {
      console.log('   ⚠️  CORS headers may not be configured correctly');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 4: Error handling
  console.log('\n4️⃣  Testing Error Handling');
  console.log('-'.repeat(60));
  try {
    // Missing symbol
    const url1 = `${baseUrl}/.netlify/functions/alpha-vantage`;
    const response1 = await fetch(url1);
    const data1 = await response1.json();

    console.log(`   Missing symbol - Status: ${response1.status}`);
    if (response1.status === 400 && data1.error) {
      results.errorHandling = true;
      console.log('   ✅ Error handling works correctly');
      console.log(`   Error message: ${data1.error}`);
    } else {
      console.log('   ❌ Error handling failed');
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Test 5: Routing (ensure redirect rule works)
  console.log('\n5️⃣  Testing Routing Configuration');
  console.log('-'.repeat(60));
  try {
    const proxiedUrl = `${baseUrl}/api/alpha-vantage?symbol=${testSymbol}`;
    const directUrl = `${baseUrl}/.netlify/functions/alpha-vantage?symbol=${testSymbol}`;

    const proxiedResponse = await fetch(proxiedUrl);
    const directResponse = await fetch(directUrl);

    const proxiedData = await proxiedResponse.json();
    const directData = await directResponse.json();

    // Both should return 200 (or rate limit, which is fine)
    if (proxiedResponse.status === 200 && directResponse.status === 200) {
      results.routing = true;
      console.log('   ✅ Routing configuration works correctly');
      console.log('   ✅ Both endpoints are accessible');
    } else {
      console.log('   ❌ Routing configuration has issues');
      console.log(`   Proxied status: ${proxiedResponse.status}`);
      console.log(`   Direct status: ${directResponse.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  
  const allTests = [
    { name: 'Direct Function Endpoint', result: results.directEndpoint },
    { name: 'Proxied Endpoint (Redirect Rule)', result: results.proxiedEndpoint },
    { name: 'CORS Headers', result: results.corsHeaders },
    { name: 'Error Handling', result: results.errorHandling },
    { name: 'Routing Configuration', result: results.routing },
  ];

  allTests.forEach(test => {
    const icon = test.result ? '✅' : '❌';
    console.log(`   ${icon} ${test.name}`);
  });

  const passedCount = Object.values(results).filter(r => r).length;
  const totalCount = Object.keys(results).length;

  console.log(`\n   Passed: ${passedCount}/${totalCount}`);

  if (passedCount === totalCount) {
    console.log('\n   🎉 All tests passed! Your Netlify Functions are working correctly.');
  } else {
    console.log('\n   ⚠️  Some tests failed. Review the output above for details.');
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 Notes:');
  console.log('   - Rate limit messages from Alpha Vantage API indicate the function is working');
  console.log('   - For production, set ALPHA_VANTAGE_API_KEY (without VITE_ prefix) in Netlify');
  console.log('   - Functions cannot access VITE_ prefixed variables at runtime');
};

testComprehensive().catch(console.error);
