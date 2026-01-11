from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime, timedelta
from typing import Dict, List, Any, Tuple
import traceback
import os
from dotenv import load_dotenv
from stock_data_provider import StockDataProvider, YahooFinanceDirectProvider
from vaulto_scraper import scrape_vaulto_data

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize stock data provider
# Default: Direct Yahoo Finance API (free, no API key required but may have rate limits)
# Optional: Set ALPHA_VANTAGE_API_KEY environment variable to use Alpha Vantage (free tier: 5 calls/min, 500/day)
# Get free API key at: https://www.alphavantage.co/support/#api-key
alpha_vantage_key = os.getenv('ALPHA_VANTAGE_API_KEY')
stock_provider = StockDataProvider(
    use_alpha_vantage=bool(alpha_vantage_key),
    alpha_vantage_key=alpha_vantage_key
)



@app.route('/api/stock-data', methods=['GET'])
def get_stock_data() -> Dict[str, Any]:
    """
    Fetch historical stock price data for a given symbol and time period.
    
    Query Parameters:
        symbol: Stock ticker symbol (e.g., 'NVDA', 'AAPL')
        period: Time period ('24h', '7d', '30d')
    
    Returns:
        JSON response with symbol, prices array, and current price
    """
    symbol = None
    period = None
    
    try:
        symbol = request.args.get('symbol', '').upper()
        period = request.args.get('period', '30d')
        
        if not symbol:
            return jsonify({'error': 'Symbol parameter is required'}), 400
        
        if period not in ['24h', '7d', '30d']:
            return jsonify({
                'error': f'Invalid period: {period}. Must be one of: 24h, 7d, 30d',
                'symbol': symbol
            }), 400
        
        # Fetch stock data using the provider
        hist = stock_provider.fetch_data(symbol, period)
        
        if hist.empty:
            return jsonify({
                'error': f'No data available for symbol {symbol}',
                'symbol': symbol,
                'period': period
            }), 404
        
        # Format price data
        prices = []
        for date, row in hist.iterrows():
            # Use Close price as the price point
            price = float(row['Close'])
            prices.append({
                'date': date.strftime('%Y-%m-%dT%H:%M:%S'),
                'price': price
            })
        
        # Get current price (last close price)
        current_price = float(hist['Close'].iloc[-1])
        
        return jsonify({
            'symbol': symbol,
            'prices': prices,
            'currentPrice': current_price
        })
    
    except ValueError as e:
        # Validation errors
        error_msg = str(e)
        print(f"Validation error for {symbol}: {error_msg}")
        return jsonify({
            'error': error_msg,
            'symbol': symbol or 'unknown',
            'period': period or 'unknown'
        }), 400
    
    except Exception as e:
        error_msg = str(e)
        print(f"Error fetching stock data for {symbol}: {error_msg}")
        print(traceback.format_exc())
        
        # Provide more helpful error message
        if "Yahoo Finance API error" in error_msg:
            user_error = f"Unable to fetch data for {symbol}. This may be due to Yahoo Finance API rate limiting or temporary issues. Please try again in a moment."
        else:
            user_error = f"Failed to fetch stock data for {symbol}: {error_msg}"
        
        return jsonify({
            'error': user_error,
            'symbol': symbol or 'unknown',
            'period': period or 'unknown'
        }), 500

@app.route('/api/vaulto-data', methods=['GET'])
def get_vaulto_data() -> Dict[str, Any]:
    """
    Fetch TVL and volume data from stake.vaulto.ai
    
    Returns:
        JSON response with array of tokenized stocks matching TokenizedStock format
    """
    try:
        stocks = scrape_vaulto_data()
        
        if not stocks:
            return jsonify({
                'error': 'No data could be scraped from stake.vaulto.ai',
                'stocks': []
            }), 404
        
        return jsonify({
            'stocks': stocks,
            'count': len(stocks)
        })
    
    except Exception as e:
        error_msg = str(e)
        print(f"Error scraping Vaulto data: {error_msg}")
        print(traceback.format_exc())
        
        return jsonify({
            'error': f'Failed to fetch data from stake.vaulto.ai: {error_msg}',
            'stocks': []
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check() -> Dict[str, str]:
    """Health check endpoint"""
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')
