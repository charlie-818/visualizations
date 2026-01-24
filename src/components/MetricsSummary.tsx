import React from 'react';
import { CalculationResult } from '../types/stock.types';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface MetricsSummaryProps {
  result: CalculationResult;
  isMobileView?: boolean;
}

export const MetricsSummary: React.FC<MetricsSummaryProps> = ({ result, isMobileView = false }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${isMobileView ? 'p-4' : 'p-6'} transition-all duration-300`}>
      {/* Performance metrics */}
      <div className={`grid ${isMobileView ? 'grid-cols-2 gap-3' : 'grid-cols-4 gap-4'}`}>
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

        {/* Impermanent Loss */}
        <div className="text-center relative group">
          <div className={`${isMobileView ? 'text-xs' : 'text-sm'} text-gray-600 mb-2 cursor-help`}>
            Impermanent Loss
          </div>
          <div className={`${isMobileView ? 'text-lg' : 'text-3xl'} font-bold text-red-600 mb-1`}>
            {formatCurrency(result.impermanentLoss)}
          </div>
          <div className={`${isMobileView ? 'text-xs' : 'text-sm'} text-gray-500`}>
            {formatPercentage(result.impermanentLossPercentage)}
          </div>
          
          {/* Tooltip with formula */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-6 py-4 bg-gray-900 text-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none" style={{ minWidth: '320px' }}>
            <div className="text-center">
              <div className="font-semibold mb-3 text-base">Impermanent Loss Formula</div>
              <div className="bg-gray-800 px-4 py-3 rounded text-lg">
                <InlineMath math="\text{IL} = \frac{2\sqrt{r}}{1 + r} - 1" />
              </div>
              <div className="text-sm mt-3 text-gray-300">
                <InlineMath math="\text{where } r = \frac{\text{Price}_{\text{end}}}{\text{Price}_{\text{start}}}" />
              </div>
            </div>
            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
              <div className="border-8 border-transparent border-t-gray-900"></div>
            </div>
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
