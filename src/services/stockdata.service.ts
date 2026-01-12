import { TimePeriod, YFinanceResponse, StockPriceData } from '../types/stock.types';
import { mapTokenizedToTraditional } from '../utils/calculations';

/**
 * Primary service for fetching stock data via StockData.org API
 * 
 * Uses the EOD (End-of-Day) endpoint for historical data
 * Supports all time periods: 7d, 30d, 3m, 6m, 1y
 * Get an API token at: https://www.stockdata.org/
 * Set it as STOCKDATA_ORG_API_TOKEN environment variable in Netlify
 */
export class StockDataService {

  /**
   * Get date range for period
   */
  private static getDateRangeForPeriod(period: TimePeriod): { startDate: Date; endDate: Date; dateFrom: string; dateTo: string } {
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0); // Normalize to midnight
    
    const periodMap: Record<TimePeriod, number> = {
      '24h': 2, // Use 2 days for daily movements
      '7d': 7,
      '30d': 30,
      '3m': 90, // Approximately 3 months
      '6m': 180, // Approximately 6 months
      '1y': 365, // 1 year
    };
    
    const days = periodMap[period] || 30;
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - days);
    
    // Format dates as YYYY-MM-DD for API
    const dateFrom = startDate.toISOString().split('T')[0];
    const dateTo = endDate.toISOString().split('T')[0];
    
    return { startDate, endDate, dateFrom, dateTo };
  }

  /**
   * Fetch historical stock price data from StockData.org API
   */
  static async fetchStockData(
    symbol: string,
    period: TimePeriod
  ): Promise<YFinanceResponse> {
    const traditionalSymbol = mapTokenizedToTraditional(symbol);
    
    try {
      const { dateFrom, dateTo } = this.getDateRangeForPeriod(period);
      
      // Call Netlify function to proxy StockData.org API (avoids CORS issues)
      const url = `/api/stockdata-org?symbol=${encodeURIComponent(traditionalSymbol)}&date_from=${dateFrom}&date_to=${dateTo}`;
      
      const response = await fetch(url);

      const data = await response.json();

      // Check if Netlify function returned an error
      if (!response.ok || data.error) {
        throw new Error(data.error || `Failed to fetch stock data: ${response.statusText}`);
      }

      // Check if data array exists and has items
      if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
        throw new Error(`No data found for symbol ${traditionalSymbol} in the specified period ${period}`);
      }

      // Convert to our format
      // API returns flat structure: { date, open, high, low, close, volume }
      const prices: StockPriceData[] = [];
      for (const item of data.data) {
        if (item.close !== undefined && item.date) {
          const price = parseFloat(item.close);
          if (!isNaN(price) && price > 0) {
            // Convert date to ISO format if needed
            const date = new Date(item.date);
            prices.push({
              date: date.toISOString(),
              price: price,
            });
          }
        }
      }

      if (prices.length === 0) {
        throw new Error(`No valid price data found for symbol ${traditionalSymbol}`);
      }

      // Sort by date (oldest first) - API should return sorted, but ensure it
      prices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Get current price (last close price)
      const currentPrice = prices[prices.length - 1].price;

      return {
        symbol: traditionalSymbol,
        prices: prices,
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
