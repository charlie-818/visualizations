import { CalculationResult, ChartDataPoint, StockPriceData, TimePeriod } from '../types/stock.types';
import { TokenizedStock } from '../types/vaulto.types';

/**
 * Maps tokenized stock symbol to traditional stock symbol
 */
export function mapTokenizedToTraditional(symbol: string): string {
  return symbol.replace('on', '');
}

/**
 * Calculates returns and fees for traditional vs tokenized stock comparison
 */
export function calculateReturns(
  investmentAmount: number,
  poolTVL: number,
  totalFees: number,
  traditionalPriceStart: number,
  traditionalPriceEnd: number
): CalculationResult {
  // Traditional return calculation
  const priceChange = (traditionalPriceEnd - traditionalPriceStart) / traditionalPriceStart;
  const traditionalReturn = priceChange * investmentAmount;
  const traditionalReturnPercentage = priceChange * 100;

  // User's fraction of the TVL pool, capped at 1.0 (cannot exceed pool's maximum)
  const userTVLFraction = Math.min(investmentAmount / poolTVL, 1.0);

  // Fees claimable by the user
  const feesClaimed = totalFees * userTVLFraction;

  // Tokenized return (traditional return + fees)
  const tokenizedReturn = traditionalReturn + feesClaimed;
  const tokenizedReturnPercentage = (tokenizedReturn / investmentAmount) * 100;

  // Total tokenized value (investment + tokenized return)
  const totalTokenizedValue = investmentAmount + tokenizedReturn;

  return {
    traditionalReturn,
    traditionalReturnPercentage,
    tokenizedReturn,
    tokenizedReturnPercentage,
    feesClaimed,
    userTVLFraction,
    totalTokenizedValue,
  };
}

/**
 * Generates chart data points for comparison visualization
 */
export function generateChartData(
  priceData: StockPriceData[],
  investmentAmount: number,
  poolTVL: number,
  totalFees: number,
  startPrice: number
): ChartDataPoint[] {
  if (priceData.length === 0) return [];

  // User's fraction of the TVL pool, capped at 1.0 (cannot exceed pool's maximum)
  const userTVLFraction = Math.min(investmentAmount / poolTVL, 1.0);
  const feesPerPoint = totalFees / priceData.length;

  return priceData.map((point, index) => {
    const priceChange = (point.price - startPrice) / startPrice;
    const traditionalValue = investmentAmount + (priceChange * investmentAmount);
    
    // Accumulate fees up to this point
    const accumulatedFees = feesPerPoint * (index + 1) * userTVLFraction;
    const tokenizedValue = traditionalValue + accumulatedFees;

    return {
      date: point.date,
      traditionalValue: Math.max(0, traditionalValue),
      tokenizedValue: Math.max(0, tokenizedValue),
    };
  });
}

/**
 * Gets the appropriate fees for the selected time period
 */
export function getFeesForPeriod(stock: TokenizedStock, period: TimePeriod): number {
  switch (period) {
    case '24h':
      return stock.fees24h;
    case '7d':
      return stock.fees24h * 7;
    case '30d':
      return stock.fees30d;
    case '3m':
      // Estimate 3 months (90 days) based on daily rate
      return (stock.fees30d / 30) * 90;
    case '6m':
      // Estimate 6 months (180 days) based on daily rate
      return (stock.fees30d / 30) * 180;
    case '1y':
      // Estimate 1 year (365 days) based on daily rate
      return (stock.fees30d / 30) * 365;
    default:
      return stock.fees24h;
  }
}

/**
 * Gets the appropriate volume for the selected time period
 */
export function getVolumeForPeriod(stock: TokenizedStock, period: TimePeriod): number {
  switch (period) {
    case '24h':
      return stock.volume24h;
    case '7d':
      return stock.volume24h * 7;
    case '30d':
      return stock.volume30d;
    case '3m':
      // Estimate 3 months (90 days) based on daily rate
      return (stock.volume30d / 30) * 90;
    case '6m':
      // Estimate 6 months (180 days) based on daily rate
      return (stock.volume30d / 30) * 180;
    case '1y':
      // Estimate 1 year (365 days) based on daily rate
      return (stock.volume30d / 30) * 365;
    default:
      return stock.volume24h;
  }
}

/**
 * Gets the number of days for the selected time period
 */
export function getDaysForPeriod(period: TimePeriod): number {
  switch (period) {
    case '24h':
      return 1;
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '3m':
      return 90;
    case '6m':
      return 180;
    case '1y':
      return 365;
    default:
      return 1;
  }
}

/**
 * Calculates the effective APR based on investment amount and pool TVL
 * The APR is proportional to the investment: (investmentAmount / poolTVL) * totalAPR
 * To get the full APR, you need to invest the full TVL
 */
export function calculateEffectiveAPR(
  investmentAmount: number,
  poolTVL: number,
  totalAPR: number | null
): number | null {
  // Return null if totalAPR is null (maintains backward compatibility)
  if (totalAPR === null) {
    return null;
  }

  // Handle edge case: division by zero
  if (poolTVL === 0) {
    return null;
  }

  // Calculate proportional APR, capped at totalAPR (userTVLFraction cannot exceed 1.0)
  const userTVLFraction = Math.min(investmentAmount / poolTVL, 1.0);
  return userTVLFraction * totalAPR;
}
