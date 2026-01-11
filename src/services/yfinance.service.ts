import { TimePeriod, YFinanceResponse } from '../types/stock.types';
import { mapTokenizedToTraditional } from '../utils/calculations';

const API_BASE_URL = '/api';

/**
 * Service for fetching stock data from yfinance API
 */
export class YFinanceService {
  /**
   * Fetch historical stock price data
   */
  static async fetchStockData(
    symbol: string,
    period: TimePeriod
  ): Promise<YFinanceResponse> {
    const traditionalSymbol = mapTokenizedToTraditional(symbol);
    
    try {
      const response = await fetch(
        `${API_BASE_URL}/stock-data?symbol=${encodeURIComponent(traditionalSymbol)}&period=${period}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch stock data: ${response.statusText}`);
      }

      const data: YFinanceResponse = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch stock data');
    }
  }
}
