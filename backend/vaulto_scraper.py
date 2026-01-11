"""
Web scraper for fetching TVL and volume data from stake.vaulto.ai
Uses the API endpoint for reliable data fetching
"""
import requests
import json
from typing import List, Dict, Optional

BASE_URL = "https://stake.vaulto.ai"
API_ENDPOINT = f"{BASE_URL}/api/cache/tokenized-stock-pools"


def _extract_tokenized_symbol(pool: Dict) -> Optional[str]:
    """
    Extract the tokenized stock symbol from a pool.
    The pool has token0 and token1, one is USDC and one is the tokenized stock.
    
    Args:
        pool: Pool dictionary from API response
    
    Returns:
        Symbol of the tokenized stock (e.g., "SLVon") with original case preserved
    """
    token0 = pool.get('token0', {})
    token1 = pool.get('token1', {})
    
    # USDC symbol is "USDC"
    # Find the token that is NOT USDC and preserve original case
    token0_symbol = token0.get('symbol', '')
    token1_symbol = token1.get('symbol', '')
    
    if token0_symbol.upper() != 'USDC':
        return token0_symbol
    elif token1_symbol.upper() != 'USDC':
        return token1_symbol
    
    return None


def parse_currency(currency_str: str) -> float:
    """
    Parse currency string to float value.
    Handles formats like: $657.46K, $3.24M, $965.50, $-487.08
    
    Args:
        currency_str: Currency string (e.g., "$657.46K", "$3.24M")
    
    Returns:
        Float value of the currency
    """
    if not currency_str or currency_str.strip() == '':
        return 0.0
    
    # Remove dollar sign and whitespace
    text = currency_str.strip().replace('$', '').replace(',', '').strip()
    
    # Handle empty string
    if not text:
        return 0.0
    
    # Check for negative sign
    is_negative = text.startswith('-')
    if is_negative:
        text = text[1:]
    
    # Determine multiplier based on suffix
    multiplier = 1.0
    if text.endswith('K'):
        multiplier = 1000.0
        text = text[:-1]
    elif text.endswith('M'):
        multiplier = 1000000.0
        text = text[:-1]
    elif text.endswith('B'):
        multiplier = 1000000000.0
        text = text[:-1]
    
    try:
        value = float(text) * multiplier
        return -value if is_negative else value
    except ValueError:
        return 0.0


def parse_percentage(percentage_str: str) -> Optional[float]:
    """
    Parse percentage string to float value.
    Handles formats like: "59.11%", "NA", ""
    
    Args:
        percentage_str: Percentage string (e.g., "59.11%", "NA")
    
    Returns:
        Float value of percentage or None if "NA" or invalid
    """
    if not percentage_str:
        return None
    
    text = percentage_str.strip().upper()
    
    # Handle "NA" or empty strings
    if text == 'NA' or text == '' or text == 'N/A':
        return None
    
    # Remove percentage sign
    text = text.replace('%', '').strip()
    
    try:
        return float(text)
    except ValueError:
        return None


def scrape_vaulto_data() -> List[Dict[str, any]]:
    """
    Fetch TVL and volume data from stake.vaulto.ai API endpoint
    
    Returns:
        List of dictionaries matching TokenizedStock format:
        {
            'symbol': str,
            'poolTVL': float,
            'fees24h': float,
            'volume24h': float,
            'fees30d': float,
            'volume30d': float,
            'apr': Optional[float]
        }
    
    Raises:
        Exception: If fetching fails
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'application/json'
        }
        
        print(f"Fetching data from {API_ENDPOINT}...")
        response = requests.get(API_ENDPOINT, headers=headers, timeout=15)
        response.raise_for_status()
        
        # Parse JSON response
        data = response.json()
        
        if 'pools' not in data:
            raise Exception("API response missing 'pools' field")
        
        pools = data['pools']
        if not pools:
            raise Exception("API returned empty pools array")
        
        print(f"Found {len(pools)} pools in API response")
        
        stocks = []
        
        for pool in pools:
            try:
                # Extract tokenized stock symbol
                symbol = _extract_tokenized_symbol(pool)
                
                if not symbol:
                    print(f"Warning: Could not extract symbol from pool {pool.get('hash', 'unknown')}")
                    continue
                
                # Extract data from pool
                pool_tvl = float(pool.get('tvl', 0))
                fees24h = float(pool.get('fees24h', 0))
                volume24h = float(pool.get('volume24h', 0))
                fees30d = float(pool.get('fees30d', 0))
                volume30d = float(pool.get('volume30d', 0))
                apr = pool.get('apr')
                
                # Convert APR to float or None
                apr_float = float(apr) if apr is not None else None
                
                stocks.append({
                    'symbol': symbol,
                    'poolTVL': pool_tvl,
                    'fees24h': fees24h,
                    'volume24h': volume24h,
                    'fees30d': fees30d,
                    'volume30d': volume30d,
                    'apr': apr_float
                })
                
                print(f"Parsed stock {len(stocks)}: {symbol} - TVL=${pool_tvl:,.2f}, APR={apr_float}%")
                
            except (ValueError, KeyError, TypeError) as e:
                print(f"Warning: Failed to parse pool {pool.get('hash', 'unknown')}: {e}")
                continue
        
        if not stocks:
            raise Exception("No valid stocks could be extracted from API response")
        
        print(f"Successfully parsed {len(stocks)} stocks")
        return stocks
    
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch data from API: {str(e)}")
    except json.JSONDecodeError as e:
        raise Exception(f"Failed to parse JSON response: {str(e)}")
    except Exception as e:
        raise Exception(f"Failed to process data: {str(e)}")
