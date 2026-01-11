import { TimePeriod, YFinanceResponse, StockPriceData } from '../types/stock.types';
import { mapTokenizedToTraditional } from '../utils/calculations';

/**
 * Service for fetching stock data directly from Alpha Vantage API (no backend required)
 * 
 * Note: Alpha Vantage free tier limitations:
 * - 5 calls per minute
 * - 500 calls per day
 * - No intraday data (24h period uses last 2 days of daily data)
 * 
 * Get a free API key at: https://www.alphavantage.co/support/#api-key
 * Set it as VITE_ALPHA_VANTAGE_API_KEY environment variable
 */
export class YFinanceService {
  private static readonly BASE_URL = 'https://www.alphavantage.co/query';

  /**
   * Get API key from environment variable
   */
  private static getApiKey(): string {
    const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      throw new Error('Alpha Vantage API key is required. Please set VITE_ALPHA_VANTAGE_API_KEY environment variable. Get a free key at https://www.alphavantage.co/support/#api-key');
    }
    return apiKey;
  }

  /**
   * Get date range for period
   */
  private static getDateRangeForPeriod(period: TimePeriod): { startDate: Date; endDate: Date } {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0); // Normalize to midnight
    
    const periodMap: Record<TimePeriod, number> = {
      '24h': 2, // Use 2 days since Alpha Vantage free tier doesn't support intraday
      '7d': 7,
      '30d': 30,
    };
    
    const days = periodMap[period] || 30;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    return { startDate, endDate };
  }

  /**
   * Filter prices by period
   */
  private static filterPricesByPeriod(prices: StockPriceData[], period: TimePeriod): StockPriceData[] {
    const { startDate } = this.getDateRangeForPeriod(period);
    
    return prices.filter(price => {
      const priceDate = new Date(price.date);
      return priceDate >= startDate;
    });
  }

  /**
   * Fetch historical stock price data directly from Alpha Vantage API
   */
  static async fetchStockData(
    symbol: string,
    period: TimePeriod
  ): Promise<YFinanceResponse> {
    const traditionalSymbol = mapTokenizedToTraditional(symbol);
    const apiKey = this.getApiKey();
    
    try {
      // Alpha Vantage free tier doesn't support intraday, so use daily data
      // For 24h, we'll use the last 2 days of daily data
      const functionType = 'TIME_SERIES_DAILY';
      
      // Use 'full' for 30d to get more data, 'compact' for shorter periods
      const outputsize = period === '30d' ? 'full' : 'compact';
      
      const params = new URLSearchParams({
        function: functionType,
        symbol: traditionalSymbol,
        apikey: apiKey,
        outputsize: outputsize,
        datatype: 'json',
      });
      
      const url = `${this.BASE_URL}?${params.toString()}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch stock data: ${response.statusText}`);
      }

      const data = await response.json();

      // Check for API errors first
      if ('Error Message' in data) {
        throw new Error(data['Error Message']);
      }
      if ('Note' in data) {
        throw new Error('API rate limit exceeded. Please try again later. (Alpha Vantage free tier: 5 calls/min, 500/day)');
      }
      
      // Check if response only has Information (rate limit or other info messages)
      const keys = Object.keys(data);
      if (keys.length === 1 && keys[0] === 'Information') {
        const infoMessage = data['Information'] as string;
        if (infoMessage.includes('API call frequency') || infoMessage.includes('rate')) {
          throw new Error('API rate limit exceeded. Please try again later. (Alpha Vantage free tier: 5 calls/min, 500/day)');
        }
        throw new Error(infoMessage || 'Alpha Vantage API returned an informational message. This may indicate rate limiting or API issues.');
      }

      // Parse response - find the Time Series key
      let timeSeriesKey: string | null = null;
      for (const key in data) {
        if (key.includes('Time Series')) {
          timeSeriesKey = key;
          break;
        }
      }

      if (!timeSeriesKey || !data[timeSeriesKey]) {
        // Log the actual response keys for debugging
        const keys = Object.keys(data);
        console.error('Alpha Vantage API response keys:', keys);
        
        // Check for specific error fields
        if ('Error Message' in data) {
          throw new Error(data['Error Message']);
        }
        if ('Note' in data) {
          throw new Error('API rate limit exceeded. Please try again later. (Alpha Vantage free tier: 5 calls/min, 500/day)');
        }
        if ('Information' in data) {
          throw new Error(data['Information']);
        }
        
        throw new Error(`Invalid response structure from Alpha Vantage API. Response keys: ${keys.join(', ')}`);
      }

      const timeSeries = data[timeSeriesKey];

      // Convert to our format
      const prices: StockPriceData[] = [];
      for (const dateStr in timeSeries) {
        const values = timeSeries[dateStr];
        if (values && values['4. close']) {
          const price = parseFloat(values['4. close']);
          if (!isNaN(price)) {
            // Convert date string to ISO format
            const date = new Date(dateStr + 'T00:00:00Z');
            prices.push({
              date: date.toISOString(),
              price: price,
            });
          }
        }
      }

      if (prices.length === 0) {
        throw new Error(`No data found for symbol ${traditionalSymbol}`);
      }

      // Sort by date (oldest first)
      prices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Filter by period
      const filteredPrices = this.filterPricesByPeriod(prices, period);

      if (filteredPrices.length === 0) {
        throw new Error(`No data available for ${traditionalSymbol} in the specified period ${period}`);
      }

      // Get current price (last close price)
      const currentPrice = filteredPrices[filteredPrices.length - 1].price;

      return {
        symbol: traditionalSymbol,
        prices: filteredPrices,
        currentPrice,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to fetch stock data for ${traditionalSymbol}`);
    }
  }
}
