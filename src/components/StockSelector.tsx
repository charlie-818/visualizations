import React from 'react';
import { TokenizedStock } from '../types/vaulto.types';

interface StockSelectorProps {
  stocks: TokenizedStock[];
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
  disabled?: boolean;
}

export const StockSelector: React.FC<StockSelectorProps> = ({
  stocks,
  selectedSymbol,
  onSelect,
  disabled = false,
}) => {
  return (
    <select
      id="stock-select"
      value={selectedSymbol}
      onChange={(e) => onSelect(e.target.value)}
      disabled={disabled}
      className="text-2xl font-semibold px-3 py-2 w-[150px] border-2 border-blue-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
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
