"""
Comprehensive test suite for Vaulto scraper
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from vaulto_scraper import scrape_vaulto_data, parse_currency, parse_percentage
import json

def test_parse_currency():
    """Test currency parsing function"""
    print("\n=== Testing Currency Parsing ===")
    
    test_cases = [
        ("$657.46K", 657460.0),
        ("$3.24M", 3240000.0),
        ("$965.50", 965.50),
        ("$-487.08", -487.08),
        ("$657,460", 657460.0),
        ("$0.00", 0.0),
        ("", 0.0),
        ("$1.5K", 1500.0),
        ("$2.5M", 2500000.0),
    ]
    
    passed = 0
    failed = 0
    
    for input_val, expected in test_cases:
        try:
            result = parse_currency(input_val)
            if abs(result - expected) < 0.01:
                print(f"✓ PASS: '{input_val}' -> {result}")
                passed += 1
            else:
                print(f"✗ FAIL: '{input_val}' -> {result}, expected {expected}")
                failed += 1
        except Exception as e:
            print(f"✗ ERROR: '{input_val}' -> Exception: {e}")
            failed += 1
    
    print(f"\nCurrency Parsing: {passed} passed, {failed} failed")
    return failed == 0

def test_parse_percentage():
    """Test percentage parsing function"""
    print("\n=== Testing Percentage Parsing ===")
    
    test_cases = [
        ("59.11%", 59.11),
        ("48.65%", 48.65),
        ("NA", None),
        ("N/A", None),
        ("", None),
        ("0%", 0.0),
        ("100%", 100.0),
    ]
    
    passed = 0
    failed = 0
    
    for input_val, expected in test_cases:
        try:
            result = parse_percentage(input_val)
            if result == expected or (result is not None and expected is not None and abs(result - expected) < 0.01):
                print(f"✓ PASS: '{input_val}' -> {result}")
                passed += 1
            else:
                print(f"✗ FAIL: '{input_val}' -> {result}, expected {expected}")
                failed += 1
        except Exception as e:
            print(f"✗ ERROR: '{input_val}' -> Exception: {e}")
            failed += 1
    
    print(f"\nPercentage Parsing: {passed} passed, {failed} failed")
    return failed == 0

def test_scrape_vaulto_data():
    """Test actual scraping from website"""
    print("\n=== Testing Website Scraping ===")
    
    try:
        print("Fetching data from stake.vaulto.ai...")
        stocks = scrape_vaulto_data()
        
        if not stocks:
            print("✗ FAIL: No stocks returned from scraper")
            return False
        
        print(f"✓ Successfully scraped {len(stocks)} stocks")
        
        # Validate structure
        required_fields = ['symbol', 'poolTVL', 'fees24h', 'volume24h', 'fees30d', 'volume30d', 'apr']
        validation_errors = []
        
        for i, stock in enumerate(stocks):
            # Check all required fields exist
            for field in required_fields:
                if field not in stock:
                    validation_errors.append(f"Stock {i} missing field: {field}")
            
            # Check symbol is valid
            if not stock.get('symbol') or len(stock.get('symbol', '')) < 2:
                validation_errors.append(f"Stock {i} has invalid symbol: {stock.get('symbol')}")
            
            # Check numeric fields are numbers
            numeric_fields = ['poolTVL', 'fees24h', 'volume24h', 'fees30d', 'volume30d']
            for field in numeric_fields:
                value = stock.get(field)
                if not isinstance(value, (int, float)):
                    validation_errors.append(f"Stock {i} field {field} is not numeric: {value}")
                elif value < 0 and field != 'fees24h':  # fees24h can be negative
                    validation_errors.append(f"Stock {i} field {field} is negative: {value}")
        
        if validation_errors:
            print("\n✗ Validation Errors:")
            for error in validation_errors[:10]:  # Show first 10 errors
                print(f"  - {error}")
            if len(validation_errors) > 10:
                print(f"  ... and {len(validation_errors) - 10} more errors")
            return False
        
        # Print sample data
        print(f"\n✓ Data validation passed for {len(stocks)} stocks")
        print("\nSample stocks:")
        for stock in stocks[:5]:
            print(f"  {stock['symbol']}: TVL=${stock['poolTVL']:,.2f}, Fees24h=${stock['fees24h']:.2f}, Volume24h=${stock['volume24h']:,.2f}, APR={stock['apr']}%")
        
        if len(stocks) > 5:
            print(f"  ... and {len(stocks) - 5} more stocks")
        
        return True
        
    except Exception as e:
        print(f"✗ FAIL: Exception during scraping: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_endpoint():
    """Test the Flask API endpoint"""
    print("\n=== Testing API Endpoint ===")
    
    try:
        import requests
        
        # Note: This test assumes the Flask server is running
        # If not, we'll skip it with a warning
        try:
            response = requests.get('http://localhost:5001/api/vaulto-data', timeout=5)
            
            if response.status_code == 200:
                data = response.json()
                
                if 'stocks' in data and isinstance(data['stocks'], list):
                    print(f"✓ API endpoint returns {len(data['stocks'])} stocks")
                    return True
                else:
                    print(f"✗ FAIL: API response missing 'stocks' field or invalid format")
                    print(f"Response: {json.dumps(data, indent=2)}")
                    return False
            else:
                print(f"✗ FAIL: API returned status code {response.status_code}")
                print(f"Response: {response.text}")
                return False
        except requests.exceptions.ConnectionError:
            print("⚠ SKIP: Flask server not running (expected if backend not started)")
            print("  Start the backend with: cd backend && python app.py")
            return None  # Not a failure, just skipped
        except Exception as e:
            print(f"✗ FAIL: Error calling API: {e}")
            return False
            
    except ImportError:
        print("⚠ SKIP: requests library not available for API testing")
        return None

def main():
    """Run all tests"""
    print("=" * 60)
    print("Vaulto Scraper Test Suite")
    print("=" * 60)
    
    results = []
    
    # Test parsing functions
    results.append(("Currency Parsing", test_parse_currency()))
    results.append(("Percentage Parsing", test_parse_percentage()))
    
    # Test actual scraping
    results.append(("Website Scraping", test_scrape_vaulto_data()))
    
    # Test API endpoint (may be skipped)
    api_result = test_api_endpoint()
    if api_result is not None:
        results.append(("API Endpoint", api_result))
    
    # Summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    passed = sum(1 for _, result in results if result is True)
    failed = sum(1 for _, result in results if result is False)
    skipped = sum(1 for _, result in results if result is None)
    
    for test_name, result in results:
        if result is True:
            status = "✓ PASS"
        elif result is False:
            status = "✗ FAIL"
        else:
            status = "⚠ SKIP"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed} passed, {failed} failed, {skipped} skipped")
    
    if failed > 0:
        print("\n❌ Some tests failed. Please review the output above.")
        sys.exit(1)
    else:
        print("\n✅ All tests passed!")
        sys.exit(0)

if __name__ == '__main__':
    main()
