import React from 'react';
import { TokenizedStock } from '../types/vaulto.types';

interface StockSelectorProps {
  stocks: TokenizedStock[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  disabled?: boolean;
  isMobileView?: boolean;
}

export const StockSelector: React.FC<StockSelectorProps> = ({
  stocks,
  selectedSymbol,
  onSelect,
  disabled = false,
  isMobileView = false,
}) => {
  return (
    <select
      id="stock-select"
      value={selectedSymbol}
      onChange={(e) => onSelect(e.target.value)}
      disabled={disabled}
      className={`${isMobileView ? 'text-base min-w-[80px] max-w-[140px] pl-2 pr-3 py-1 border rounded' : 'text-2xl min-w-[120px] max-w-[200px] pl-3 pr-4 py-2 border-2 rounded-xl'} w-auto font-semibold border-purple-300 bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md appearance-none text-center`}
      style={{ width: selectedSymbol ? `${selectedSymbol.length * (isMobileView ? 10 : 18) + (isMobileView ? 32 : 48)}px` : isMobileView ? '140px' : '200px' }}
    >
      <option value="">-- Select a stock --</option>
      {stocks.map((stock) => (
        <option key={stock.symbol} value={stock.symbol}>
          {stock.symbol}
        </option>
      ))}
    </select>
  );
};
