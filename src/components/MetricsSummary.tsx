import React from 'react';
import { CalculationResult } from '../types/stock.types';
import { formatCurrency, formatPercentage } from '../utils/formatters';

interface MetricsSummaryProps {
  result: CalculationResult;
  isMobileView?: boolean;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({ result, isMobileView = false }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${isMobileView ? 'p-4' : 'p-6'} transition-all duration-300`}>
      {/* First row: Two large numbers with fees in the middle */}
      <div className={`grid grid-cols-3 ${isMobileView ? 'gap-2' : 'gap-4'}`}>
        {/* Tokenized Return */}
        <div className="text-center">
          <div className={`${isMobileView ? 'text-xs' : 'text-sm'} text-gray-600 mb-2`}>Tokenized Return</div>
          <div className={`${isMobileView ? 'text-lg' : 'text-3xl'} font-bold text-green-600 mb-1`}>
            {formatCurrency(result.tokenizedReturn)}
          </div>
          <div className={`${isMobileView ? 'text-xs' : 'text-sm'} text-gray-500`}>
            {formatPercentage(result.tokenizedReturnPercentage)}
          </div>
        </div>
        
        {/* Fees (middle) */}
        <div className="text-center">
          <div className={`${isMobileView ? 'text-xs' : 'text-sm'} text-gray-600 mb-2`}>Fees Earned</div>
          <div className={`${isMobileView ? 'text-lg' : 'text-3xl'} font-bold text-purple-600 mb-1`}>
            {formatCurrency(result.feesClaimed)}
          </div>
        </div>
        
        {/* Traditional Return */}
        <div className="text-center">
          <div className={`${isMobileView ? 'text-xs' : 'text-sm'} text-gray-600 mb-2`}>Regular Return</div>
          <div className={`${isMobileView ? 'text-lg' : 'text-3xl'} font-bold text-blue-600 mb-1`}>
            {formatCurrency(result.traditionalReturn)}
          </div>
          <div className={`${isMobileView ? 'text-xs' : 'text-sm'} text-gray-500`}>
            {formatPercentage(result.traditionalReturnPercentage)}
          </div>
        </div>
      </div>
    </div>
  );
};
