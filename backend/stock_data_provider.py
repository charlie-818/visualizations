"""
Stock data provider module with multiple data source implementations.
Supports direct Yahoo Finance API and Alpha Vantage as fallback.
"""

import requests
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple, Optional
import time
import os
import yfinance as yf


class YahooFinanceDirectProvider:
    """Direct Yahoo Finance API provider (no API key required)"""
    
    BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart"
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
    
    def get_interval_for_period(self, period: str) -> str:
        """Map period to interval"""
        interval_map = {
            '24h': '1h',
            '7d': '1d',
            '30d': '1d',
            '1y': '1d',
        }
        return interval_map.get(period, '1d')
    
    def get_timestamps_for_period(self, period: str) -> Tuple[int, int]:
        """Get start and end timestamps for period"""
        end_date = datetime.now()
        
        period_map = {
            '24h': timedelta(days=1),
            '7d': timedelta(days=7),
            '30d': timedelta(days=30),
            '1y': timedelta(days=365),
        }
        
        start_date = end_date - period_map.get(period, timedelta(days=30))
        period1 = int(start_date.timestamp())
        period2 = int(end_date.timestamp())
        
        return period1, period2
    
    def fetch_data(self, symbol: str, period: str, max_retries: int = 3) -> pd.DataFrame:
        """Fetch stock data using direct Yahoo Finance API, Alpha Vantage for 1y, or yfinance as fallback"""
        # Use Alpha Vantage for 1y period if API key is available (more reliable for longer time ranges)
        if period == '1y':
            alpha_vantage_key = os.getenv('ALPHA_VANTAGE_API_KEY')
            if alpha_vantage_key:
                try:
                    # Use Alpha Vantage for 1y period
                    av_provider = AlphaVantageProvider(alpha_vantage_key)
                    return av_provider.fetch_data(symbol, period, max_retries)
                except Exception as e:
                    print(f"Alpha Vantage failed for 1y, falling back to yfinance: {e}")
                    # Fall through to yfinance fallback
            
            # Fallback to yfinance if Alpha Vantage is not available or failed
            for attempt in range(max_retries):
                try:
                    ticker = yf.Ticker(symbol)
                    hist = ticker.history(period="1y", interval="1d")
                    
                    if hist.empty:
                        raise Exception(f"No data found for symbol {symbol}")
                    
                    # yfinance returns DataFrame with Date as index and Close as a column
                    # Select only the Close column and ensure proper format
                    df = hist[['Close']].copy()
                    df.columns = ['Close']  # Ensure column name is 'Close'
                    df.sort_index(inplace=True)
                    
                    # Remove any None/null values
                    df = df.dropna()
                    
                    if df.empty:
                        raise Exception("No valid data points found after filtering")
                    
                    return df
                    
                except Exception as e:
                    if attempt < max_retries - 1:
                        wait_time = 2 ** attempt
                        print(f"Error fetching {symbol} with yfinance (attempt {attempt + 1}/{max_retries}): {e}")
                        print(f"Retrying in {wait_time}s...")
                        time.sleep(wait_time)
                    else:
                        raise Exception(f"Failed to fetch 1y data for {symbol}: {str(e)}")
            
            raise Exception(f"Failed to fetch 1y data for {symbol} after {max_retries} attempts")
        
        # Use direct Yahoo Finance API for other periods (24h, 7d, 30d)
        interval = self.get_interval_for_period(period)
        period1, period2 = self.get_timestamps_for_period(period)
        
        url = f"{self.BASE_URL}/{symbol}?period1={period1}&period2={period2}&interval={interval}&events=history"
        
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=self.headers, timeout=10)
                
                if response.status_code != 200:
                    if attempt < max_retries - 1:
                        time.sleep(2 ** attempt)
                        continue
                    raise Exception(f"HTTP {response.status_code}: {response.text[:200]}")
                
                data = response.json()
                
                # Parse Yahoo Finance response
                if 'chart' not in data or 'result' not in data['chart']:
                    raise Exception("Invalid response structure from Yahoo Finance")
                
                if not data['chart']['result'] or len(data['chart']['result']) == 0:
                    raise Exception(f"No data found for symbol {symbol}")
                
                result = data['chart']['result'][0]
                
                if 'timestamp' not in result or 'indicators' not in result:
                    raise Exception("Missing timestamp or indicators in response")
                
                timestamps = result['timestamp']
                quotes = result['indicators']['quote'][0]
                closes = quotes['close']
                
                if not timestamps or not closes:
                    raise Exception("Empty timestamp or close data")
                
                # Create DataFrame
                df_data = []
                for i, timestamp in enumerate(timestamps):
                    if closes[i] is not None:  # Skip None values
                        df_data.append({
                            'Date': datetime.fromtimestamp(timestamp),
                            'Close': closes[i]
                        })
                
                if not df_data:
                    raise Exception("No valid data points found")
                
                df = pd.DataFrame(df_data)
                df.set_index('Date', inplace=True)
                df.sort_index(inplace=True)
                
                return df
                
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    print(f"Error fetching {symbol} (attempt {attempt + 1}/{max_retries}): {e}")
                    print(f"Retrying in {wait_time}s...")
                    time.sleep(wait_time)
                else:
                    raise Exception(f"Failed to fetch data for {symbol}: {str(e)}")
        
        raise Exception(f"Failed to fetch data for {symbol} after {max_retries} attempts")


class AlphaVantageProvider:
    """Alpha Vantage API provider (requires API key)"""
    
    BASE_URL = "https://www.alphavantage.co/query"
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv('ALPHA_VANTAGE_API_KEY')
        if not self.api_key:
            raise ValueError("Alpha Vantage API key is required. Set ALPHA_VANTAGE_API_KEY environment variable.")
    
    def fetch_data(self, symbol: str, period: str, max_retries: int = 3) -> pd.DataFrame:
        """Fetch stock data using Alpha Vantage API
        
        Note: Alpha Vantage free tier limitations:
        - No intraday data (24h period uses last 2 days of daily data)
        - TIME_SERIES_DAILY supports 'compact' (100 data points) and 'full' (20+ years)
        """
        # Alpha Vantage free tier doesn't support intraday, so use daily data for 24h
        # For 24h, we'll use the last 2 days of daily data
        function = 'TIME_SERIES_DAILY'
        
        # Use 'full' for 1y to get more historical data, 'compact' for shorter periods
        outputsize = 'full' if period in ['1y'] else 'compact'
        
        params = {
            'function': function,
            'symbol': symbol,
            'apikey': self.api_key,
            'outputsize': outputsize,
            'datatype': 'json'
        }
        
        for attempt in range(max_retries):
            try:
                response = requests.get(self.BASE_URL, params=params, timeout=10)
                
                if response.status_code != 200:
                    if attempt < max_retries - 1:
                        time.sleep(2 ** attempt)
                        continue
                    raise Exception(f"HTTP {response.status_code}")
                
                data = response.json()
                
                # Check for API errors
                if 'Error Message' in data:
                    raise Exception(data['Error Message'])
                if 'Note' in data:
                    raise Exception("API rate limit exceeded. Please try again later.")
                
                # Parse response
                time_series_key = None
                for key in data.keys():
                    if 'Time Series' in key:
                        time_series_key = key
                        break
                
                if not time_series_key:
                    raise Exception("Invalid response structure from Alpha Vantage")
                
                time_series = data[time_series_key]
                
                # Convert to DataFrame
                df_data = []
                for date_str, values in time_series.items():
                    df_data.append({
                        'Date': pd.to_datetime(date_str),
                        'Close': float(values['4. close'])
                    })
                
                df = pd.DataFrame(df_data)
                df.set_index('Date', inplace=True)
                df.sort_index(inplace=True)
                
                # Filter by period
                # Normalize end_date to midnight for proper date comparison
                end_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
                if period == '24h':
                    # For 24h, use last 2 days (since we can't get intraday with free tier)
                    start_date = end_date - timedelta(days=2)
                    df = df[df.index >= start_date]
                elif period == '7d':
                    start_date = end_date - timedelta(days=7)
                    df = df[df.index >= start_date]
                elif period == '30d':
                    start_date = end_date - timedelta(days=30)
                    df = df[df.index >= start_date]
                elif period == '1y':
                    start_date = end_date - timedelta(days=365)
                    df = df[df.index >= start_date]
                
                # Ensure DataFrame is not empty after filtering
                if df.empty:
                    raise Exception(f"No data available for {symbol} in the specified period {period}")
                
                # Sort by date (ascending - oldest first)
                df.sort_index(inplace=True)
                
                return df
                
            except Exception as e:
                if attempt < max_retries - 1:
                    wait_time = 2 ** attempt
                    print(f"Error fetching {symbol} from Alpha Vantage (attempt {attempt + 1}/{max_retries}): {e}")
                    time.sleep(wait_time)
                else:
                    raise
        
        raise Exception(f"Failed to fetch data for {symbol} after {max_retries} attempts")


class StockDataProvider:
    """Main stock data provider with fallback support"""
    
    def __init__(self, use_alpha_vantage: bool = False, alpha_vantage_key: Optional[str] = None):
        self.primary_provider = AlphaVantageProvider(alpha_vantage_key) if use_alpha_vantage and alpha_vantage_key else YahooFinanceDirectProvider()
        self.fallback_provider = YahooFinanceDirectProvider() if use_alpha_vantage else None
    
    def fetch_data(self, symbol: str, period: str, max_retries: int = 3) -> pd.DataFrame:
        """Fetch stock data with automatic fallback"""
        try:
            return self.primary_provider.fetch_data(symbol, period, max_retries)
        except Exception as e:
            if self.fallback_provider:
                print(f"Primary provider failed, trying fallback: {e}")
                return self.fallback_provider.fetch_data(symbol, period, max_retries)
            raise
