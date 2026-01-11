import { TokenizedStock, vaultoData } from '../types/vaulto.types';

/**
 * Service for Vaulto tokenized stock data
 * Uses static data (no backend required)
 */
export class VaultoService {
  private static stocks: TokenizedStock[] = vaultoData;

  /**
   * Initialize with default static data
   */
  static initialize(): void {
    VaultoService.stocks = [...vaultoData];
  }

  /**
   * Fetch fresh data - returns static data (no API call needed)
   * This method exists for compatibility but just returns the static data
   */
  static async fetchFreshData(): Promise<TokenizedStock[]> {
    // Just return the static data (no backend needed)
    // In the future, if Vaulto exposes a public API, this can be updated
    return [...vaultoData];
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
