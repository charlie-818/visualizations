import { TokenizedStock, vaultoData } from '../types/vaulto.types';

const API_BASE_URL = '/api';

/**
 * Service for Vaulto tokenized stock data
 */
export class VaultoService {
  private static stocks: TokenizedStock[] = vaultoData;

  /**
   * Initialize with default data (fallback to static data)
   */
  static initialize(): void {
    // Service starts with static data as fallback
    VaultoService.stocks = [...vaultoData];
  }

  /**
   * Fetch fresh data from the API
   */
  static async fetchFreshData(): Promise<TokenizedStock[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/vaulto-data`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to fetch Vaulto data: ${response.statusText}`);
      }

      const data: { stocks: TokenizedStock[]; count?: number } = await response.json();
      
      if (data.stocks && data.stocks.length > 0) {
        VaultoService.stocks = data.stocks;
        return data.stocks;
      } else {
        throw new Error('No data received from API');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to fetch Vaulto data');
    }
  }

  /**
   * Get all available tokenized stocks
   */
  static getAllStocks(): TokenizedStock[] {
    return VaultoService.stocks;
  }

  /**
   * Get a specific tokenized stock by symbol
   */
  static getStockBySymbol(symbol: string): TokenizedStock | undefined {
    return VaultoService.stocks.find((stock) => stock.symbol === symbol);
  }

  /**
   * Check if a symbol exists in the tokenized stocks list
   */
  static isValidSymbol(symbol: string): boolean {
    return VaultoService.stocks.some((stock) => stock.symbol === symbol);
  }
}

// Initialize with default data on module load
VaultoService.initialize();
