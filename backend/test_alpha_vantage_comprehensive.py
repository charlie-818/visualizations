#!/usr/bin/env python3
"""
Comprehensive test suite for Alpha Vantage stock data provider.
Tests all periods and multiple symbols to ensure reliability.
"""

import sys
import os
import time
sys.path.insert(0, os.path.dirname(__file__))

from stock_data_provider import AlphaVantageProvider

def test_alpha_vantage():
    """Comprehensive test of Alpha Vantage provider"""
    print("=" * 70)
    print("Alpha Vantage Comprehensive Test Suite")
    print("=" * 70)
    print()
    
    # Get API key from environment or use provided one
    api_key = os.getenv('ALPHA_VANTAGE_API_KEY')
    if not api_key:
        print("❌ ALPHA_VANTAGE_API_KEY environment variable not set")
        print("   Set it with: export ALPHA_VANTAGE_API_KEY=your_key")
        return 1
    
    print(f"✓ API Key loaded: {api_key[:8]}...")
    print()
    
    try:
        provider = AlphaVantageProvider(api_key)
        print("✓ Provider initialized successfully")
        print()
    except Exception as e:
        print(f"❌ Failed to initialize provider: {e}")
        return 1
    
    # Test symbols and periods
    test_symbols = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'GOOGL']
    test_periods = ['24h', '7d', '30d', '1y']
    
    results = {}
    total_tests = 0
    passed_tests = 0
    
    print("Testing stock data retrieval...")
    print("-" * 70)
    
    for symbol in test_symbols:
        results[symbol] = {}
        print(f"\n{symbol}:")
        
        for period in test_periods:
            total_tests += 1
            try:
                print(f"  {period:4s}... ", end='', flush=True)
                df = provider.fetch_data(symbol, period)
                
                if df.empty:
                    results[symbol][period] = False
                    print("❌ FAIL (empty data)")
                else:
                    num_rows = len(df)
                    last_price = df['Close'].iloc[-1]
                    date_range = f"{df.index[0].strftime('%Y-%m-%d')} to {df.index[-1].strftime('%Y-%m-%d')}"
                    
                    results[symbol][period] = True
                    passed_tests += 1
                    print(f"✓ PASS ({num_rows:3d} rows, ${last_price:7.2f}, {date_range})")
                
                # Rate limit: Free tier allows 5 calls per minute
                time.sleep(13)  # Wait 13 seconds between requests to stay under limit
                
            except Exception as e:
                results[symbol][period] = False
                error_msg = str(e)[:60]
                print(f"❌ FAIL: {error_msg}")
                time.sleep(13)  # Wait even on error
    
    # Summary
    print()
    print("=" * 70)
    print("Test Summary")
    print("=" * 70)
    print()
    
    for symbol in test_symbols:
        for period in test_periods:
            status = "✓" if results[symbol][period] else "✗"
            print(f"{status} {symbol:6s} - {period:4s}")
    
    print()
    print(f"Total: {passed_tests}/{total_tests} tests passed ({passed_tests*100//total_tests}%)")
    print()
    
    if passed_tests == total_tests:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {total_tests - passed_tests} test(s) failed")
        return 1

if __name__ == '__main__':
    exit_code = test_alpha_vantage()
    sys.exit(exit_code)
