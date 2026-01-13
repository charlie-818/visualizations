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
      className={`${isMobileView ? 'text-base pl-2 pr-3 py-1 w-[100px]' : 'text-2xl pl-3 pr-4 py-2 w-[150px]'} font-semibold border-2 border-purple-300 rounded-xl bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md appearance-none`}
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
