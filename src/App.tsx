import { useState, useCallback, useEffect, useRef } from 'react';
import { StockSelector } from './components/StockSelector';
import { InvestmentInput } from './components/InvestmentInput';
import { TimePeriodSelector } from './components/TimePeriodSelector';
import { ComparisonChart } from './components/ComparisonChart';
import { MetricsSummary } from './components/MetricsSummary';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ErrorMessage } from './components/ErrorMessage';
import { VaultoService } from './services/vaulto.service';
import { YFinanceService } from './services/yfinance.service';
import { StockDataService } from './services/stockdata.service';
import { calculateReturns, generateChartData, getFeesForPeriod, getVolumeForPeriod, calculateEffectiveAPR } from './utils/calculations';
import { TimePeriod, ComparisonData } from './types/stock.types';
import { TokenizedStock } from './types/vaulto.types';
import vaultoLogo from '../vaulto.png';

function App() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('NVDAon');
  const [investmentAmount, setInvestmentAmount] = useState<number>(1000);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [stocks, setStocks] = useState<TokenizedStock[]>(VaultoService.getAllStocks());
  const hasInitialCalculation = useRef<boolean>(false);
  const prevInputsRef = useRef<{ symbol: string; amount: number; period: TimePeriod } | null>(null);

  const handleCalculate = useCallback(async () => {
    if (!selectedSymbol || investmentAmount < 1) {
      setError('Please select a stock and enter an investment amount of at least $1');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenizedStock = VaultoService.getStockBySymbol(selectedSymbol);
      if (!tokenizedStock) {
        throw new Error('Selected stock not found');
      }

      // Fetch stock price data
      // Use StockDataService for all periods, with YFinanceService as fallback
      let stockData;
      try {
        stockData = await StockDataService.fetchStockData(selectedSymbol, timePeriod);
      } catch (stockDataError) {
        // Fallback to Alpha Vantage if StockData.org fails
        console.warn('StockData.org failed, falling back to Alpha Vantage:', stockDataError);
        try {
          stockData = await YFinanceService.fetchStockData(selectedSymbol, timePeriod);
        } catch (fallbackError) {
          // If both fail, throw the original error
          throw new Error(`Failed to fetch stock data: ${stockDataError instanceof Error ? stockDataError.message : 'Unknown error'}`);
        }
      }

      if (stockData.prices.length === 0) {
        throw new Error('No price data available for the selected period');
      }

      const startPrice = stockData.prices[0].price;
      const endPrice = stockData.prices[stockData.prices.length - 1].price;
      const totalFees = getFeesForPeriod(tokenizedStock, timePeriod);
      const volumeForPeriod = getVolumeForPeriod(tokenizedStock, timePeriod);

      // Calculate returns
      const calculationResult = calculateReturns(
        investmentAmount,
        tokenizedStock.poolTVL,
        totalFees,
        startPrice,
        endPrice
      );

      // Generate chart data
      const chartData = generateChartData(
        stockData.prices,
        investmentAmount,
        tokenizedStock.poolTVL,
        totalFees,
        startPrice
      );

      setComparisonData({
        chartData,
        calculationResult,
        apr: calculateEffectiveAPR(investmentAmount, tokenizedStock.poolTVL, tokenizedStock.apr),
        poolTVL: tokenizedStock.poolTVL,
        volumeForPeriod: volumeForPeriod,
        investmentAmount: investmentAmount,
        currentPrice: endPrice,
        startPrice: startPrice,
      });
      hasInitialCalculation.current = true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
      setComparisonData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedSymbol, investmentAmount, timePeriod]);

  // Auto-update graph when inputs change (only if graph is already displayed)
  // Note: investmentAmount changes do NOT trigger auto-updates - user must click "Compare"
  useEffect(() => {
    // Only auto-update if we have comparison data displayed and inputs have changed
    if (hasInitialCalculation.current) {
      const currentInputs = { symbol: selectedSymbol, amount: investmentAmount, period: timePeriod };
      const prevInputs = prevInputsRef.current;
      
      // Check if inputs have actually changed (excluding amount)
      if (prevInputs && (
        prevInputs.symbol !== currentInputs.symbol ||
        prevInputs.period !== currentInputs.period
      )) {
        // Only update if comparison data exists (graph is displayed) and inputs are valid
        if (comparisonData !== null && !loading && selectedSymbol && investmentAmount >= 1) {
          handleCalculate();
        }
      }
      
      prevInputsRef.current = currentInputs;
    } else if (!prevInputsRef.current) {
      // Initialize the ref on first render
      prevInputsRef.current = { symbol: selectedSymbol, amount: investmentAmount, period: timePeriod };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSymbol, timePeriod]);

  const handleRetry = useCallback(() => {
    handleCalculate();
  }, [handleCalculate]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      const freshStocks = await VaultoService.fetchFreshData();
      setStocks(freshStocks);
      setLastUpdated(new Date());
      
      // If a stock was selected, check if it still exists
      if (selectedSymbol && !freshStocks.find(s => s.symbol === selectedSymbol)) {
        setSelectedSymbol('');
        setComparisonData(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  }, [selectedSymbol]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="container mx-auto px-4 py-8 max-w-7xl w-full">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src={vaultoLogo} 
            alt="Vaulto Logo" 
            className="h-16 w-auto object-contain"
          />
        </div>
        
        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              <p className="text-3xl font-normal text-gray-900 flex flex-wrap items-center gap-3">
                What if I invested{' '}
                <InvestmentInput
                  value={investmentAmount}
                  onChange={setInvestmentAmount}
                  disabled={loading}
                />
                {' '}in{' '}
                <StockSelector
                  stocks={stocks}
                  selectedSymbol={selectedSymbol}
                  onSelect={setSelectedSymbol}
                  disabled={loading || refreshing}
                />
                {' '}
                <TimePeriodSelector
                  value={timePeriod}
                  onChange={setTimePeriod}
                  disabled={loading}
                />
                {' '}ago?
              </p>
            </div>
            <div className="flex gap-3 items-center ml-6">
              <button
                onClick={handleCalculate}
                disabled={loading || refreshing || !selectedSymbol || investmentAmount < 1}
                className="px-6 py-3 text-lg font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Calculating...
                  </>
                ) : (
                  'Compare'
                )}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading || refreshing}
                className="p-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-md hover:shadow-lg"
                title="Refresh Data"
              >
                {refreshing ? (
                  <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={handleRetry} />}

        {/* Loading State */}
        {loading && <LoadingSkeleton />}

        {/* Results Section */}
        {!loading && comparisonData && (
          <div className="space-y-6">
            <ComparisonChart
              data={comparisonData.chartData}
              tokenizedSymbol={selectedSymbol}
              currentPrice={comparisonData.currentPrice}
              feesClaimed={comparisonData.calculationResult.feesClaimed}
              investmentAmount={comparisonData.investmentAmount}
              startPrice={comparisonData.startPrice}
              poolTVL={comparisonData.poolTVL}
              volumeForPeriod={comparisonData.volumeForPeriod}
              userTVLFraction={comparisonData.calculationResult.userTVLFraction}
            />
            <div className="grid grid-cols-1 gap-6">
              <MetricsSummary
                result={comparisonData.calculationResult}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
