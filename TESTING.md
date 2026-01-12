# Testing Guide for StockData.org Integration

This document explains how to run the comprehensive tests for the StockData.org API integration.

## Prerequisites

1. **API Token**: Set `STOCKDATA_ORG_API_TOKEN` environment variable
   - For local testing: Export in your terminal: `export STOCKDATA_ORG_API_TOKEN=your_token`
   - For production: Set in Netlify dashboard (Site settings → Environment variables)

2. **Netlify Dev Server** (for integration tests):
   ```bash
   npm run netlify:dev
   ```
   Keep this running in a separate terminal window.

## Available Tests

### 1. Utility Functions Test (`test-stockdata-utils.js`)

Tests the calculation functions for all time periods (24h, 7d, 30d, 3m, 6m, 1y):
- `getFeesForPeriod()` - Fee calculations
- `getVolumeForPeriod()` - Volume calculations  
- `getDaysForPeriod()` - Day count calculations

**Run:**
```bash
npm run test:utils
# or
node test-stockdata-utils.js
```

**Expected Output:**
- All 18 tests should pass (6 periods × 3 functions)
- No API calls required (unit tests only)

### 2. StockData.org API Comprehensive Test (`test-stockdata-org-comprehensive.js`)

Tests the full integration with StockData.org API:
- Netlify function endpoint
- Proxied endpoint (via redirect rule)
- CORS headers
- Error handling
- Data format validation
- All time periods (3m, 6m, 1y)
- Multiple stock symbols (AAPL, NVDA, MSFT)

**Prerequisites:**
- Netlify dev server must be running (`npm run netlify:dev`)
- API token must be set

**Run:**
```bash
npm run test:stockdata
# or
node test-stockdata-org-comprehensive.js
```

**Expected Output:**
- Tests Netlify function for each symbol/period combination
- Validates response structure and data format
- Checks CORS headers
- Tests error handling
- Tests date range calculations

## Test Coverage

### Utility Functions (`test-stockdata-utils.js`)
- ✅ `getFeesForPeriod()` - All 6 periods
- ✅ `getVolumeForPeriod()` - All 6 periods
- ✅ `getDaysForPeriod()` - All 6 periods

### API Integration (`test-stockdata-org-comprehensive.js`)
- ✅ Netlify function endpoint (direct)
- ✅ Proxied endpoint (/api/stockdata-org)
- ✅ CORS headers configuration
- ✅ Error handling (missing symbol, invalid symbol)
- ✅ Data format validation
- ✅ Date range calculations
- ✅ Multiple symbols and periods

## Troubleshooting

### Tests Fail with "API token not configured"
- Make sure `STOCKDATA_ORG_API_TOKEN` is set in your environment
- For Netlify functions, set it in Netlify dashboard (without VITE_ prefix)

### Tests Fail with Connection Errors
- Ensure Netlify dev server is running (`npm run netlify:dev`)
- Check that the server is running on the expected port (default: 8888)
- Verify the base URL matches your setup

### Rate Limit Errors
- StockData.org API has rate limits based on your plan
- Tests include delays between requests to minimize rate limiting
- If you hit rate limits, wait a few minutes and try again

### Empty Data Arrays
- Some symbols may not have data for certain date ranges
- Market may be closed (no data on weekends/holidays)
- Invalid symbols will return empty arrays (expected behavior)

## Test Results

Both test suites provide detailed output including:
- ✅/❌ status for each test
- Detailed error messages
- Test summaries with pass/fail counts
- Helpful notes and troubleshooting tips

## Continuous Integration

These tests can be integrated into CI/CD pipelines:
- Unit tests (`test-stockdata-utils.js`) can run without API access
- Integration tests (`test-stockdata-org-comprehensive.js`) require:
  - API token in environment variables
  - Netlify dev server (or deployed Netlify functions)
