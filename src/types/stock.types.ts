export type TimePeriod = '24h' | '7d' | '30d' | '3m' | '6m' | '1y';

export interface StockPriceData {
  date: string;
  price: number;
}

export interface YFinanceResponse {
  symbol: string;
  prices: StockPriceData[];
  currentPrice: number;
}

export interface CalculationResult {
  traditionalReturn: number;
  traditionalReturnPercentage: number;
  tokenizedReturn: number;
  tokenizedReturnPercentage: number;
  feesClaimed: number;
  userTVLFraction: number;
  totalTokenizedValue: number;
}

export interface ChartDataPoint {
  date: string;
  traditionalValue: number;
  tokenizedValue: number;
}

export interface ComparisonData {
  chartData: ChartDataPoint[];
  calculationResult: CalculationResult;
  apr: number | null;
  poolTVL: number;
  volumeForPeriod: number;
  investmentAmount: number;
  currentPrice: number;
  startPrice: number;
}
