import React from 'react';
import { CalculationResult } from '../types/stock.types';
import { formatCurrency, formatPercentage, formatMultiple } from '../utils/formatters';

interface MetricsSummaryProps {
  result: CalculationResult;
  poolTVL: number;
  volumeForPeriod: number;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({ result, poolTVL, volumeForPeriod }) => {
  // Calculate Volume/TVL multiple
  const volumeTVLMultiple = poolTVL > 0 ? volumeForPeriod / poolTVL : 0;
  
  // Convert TVL fraction to percentage
  const tvlFractionPercentage = result.userTVLFraction * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* First row: Two large numbers with fees in the middle */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Tokenized Return */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Tokenized Return</div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {formatCurrency(result.tokenizedReturn)}
          </div>
          <div className="text-sm text-gray-500">
            {formatPercentage(result.tokenizedReturnPercentage)}
          </div>
        </div>
        
        {/* Fees (middle) */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Fees Earned</div>
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {formatCurrency(result.feesClaimed)}
          </div>
        </div>
        
        {/* Traditional Return */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-2">Regular Return</div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {formatCurrency(result.traditionalReturn)}
          </div>
          <div className="text-sm text-gray-500">
            {formatPercentage(result.traditionalReturnPercentage)}
          </div>
        </div>
      </div>

      {/* Second row: Additional metrics */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        {/* Volume/TVL Multiple */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Volume/TVL Multiple</div>
          <div className="text-xl font-semibold text-gray-800">
            {formatMultiple(volumeTVLMultiple)}
          </div>
        </div>
        
        {/* Total TVL */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Total TVL</div>
          <div className="text-xl font-semibold text-gray-800">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            }).format(poolTVL)}
          </div>
        </div>
        
        {/* Fraction of TVL Invested */}
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">Fraction of TVL</div>
          <div className="text-xl font-semibold text-gray-800">
            {`${tvlFractionPercentage.toFixed(2)}%`}
          </div>
        </div>
      </div>
    </div>
  );
};
