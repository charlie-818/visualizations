#!/usr/bin/env python3
"""
Test script to validate yfinance data fetching with real stock symbols.
Tests all period/interval combinations and validates the data returned.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app import get_period_interval, fetch_stock_data_with_retry
import yfinance as yf
from datetime import datetime

def test_period_interval_mappings():
    """Test that period mappings are correct"""
    print("Testing period/interval mappings...")
    
    test_cases = [
        ('24h', ('1h', '1d')),
        ('7d', ('1d', '7d')),
        ('30d', ('1d', '1mo')),
        ('1y', ('1d', '1y')),
    ]
    
    for period, expected in test_cases:
        result = get_period_interval(period)
        assert result == expected, f"Period {period}: expected {expected}, got {result}"
        print(f"  ✓ {period} -> {result}")
    
    print("  All period mappings correct!\n")


def test_stock_data_fetch(symbol: str, period: str):
    """Test fetching data for a specific symbol and period"""
    print(f"Testing {symbol} with period {period}...")
    
    try:
        interval, yf_period = get_period_interval(period)
        print(f"  Using interval={interval}, yf_period={yf_period}")
        
        # Import the function
        from app import fetch_stock_data_with_retry
        hist = fetch_stock_data_with_retry(symbol, yf_period, interval, max_retries=3)
        
        if hist.empty:
            print(f"  ✗ No data returned for {symbol}")
            return False
        
        # Validate data
        num_rows = len(hist)
        first_date = hist.index[0]
        last_date = hist.index[-1]
        first_price = float(hist['Close'].iloc[0])
        last_price = float(hist['Close'].iloc[-1])
        
        print(f"  ✓ Got {num_rows} data points")
        print(f"  ✓ Date range: {first_date} to {last_date}")
        print(f"  ✓ Price range: ${first_price:.2f} to ${last_price:.2f}")
        
        # Validate prices are reasonable (positive, not zero)
        if first_price <= 0 or last_price <= 0:
            print(f"  ✗ Invalid prices detected")
            return False
        
        # Validate we have Close column
        if 'Close' not in hist.columns:
            print(f"  ✗ Missing 'Close' column")
            return False
        
        return True
        
    except Exception as e:
        print(f"  ✗ Error: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 60)
    print("yfinance Data Fetching Test Suite")
    print("=" * 60)
    print()
    
    # Test 1: Period mappings
    try:
        test_period_interval_mappings()
    except AssertionError as e:
        print(f"✗ Period mapping test failed: {e}\n")
        return 1
    
    # Test 2: Real stock data fetching
    test_symbols = ['AAPL', 'NVDA', 'TSLA']
    test_periods = ['24h', '7d', '30d', '1y']
    
    print("Testing real stock data fetching...")
    print()
    
    results = {}
    for symbol in test_symbols:
        results[symbol] = {}
        for period in test_periods:
            success = test_stock_data_fetch(symbol, period)
            results[symbol][period] = success
            print()
    
    # Summary
    print("=" * 60)
    print("Test Summary")
    print("=" * 60)
    
    total_tests = 0
    passed_tests = 0
    
    for symbol in test_symbols:
        print(f"\n{symbol}:")
        for period in test_periods:
            total_tests += 1
            status = "✓ PASS" if results[symbol][period] else "✗ FAIL"
            print(f"  {period}: {status}")
            if results[symbol][period]:
                passed_tests += 1
    
    print()
    print(f"Total: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("✓ All tests passed!")
        return 0
    else:
        print("✗ Some tests failed")
        return 1


if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
