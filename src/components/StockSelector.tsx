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
    <div className="w-full">
      <label htmlFor="stock-select" className="block text-sm font-medium text-gray-700 mb-2">
        Select Tokenized Stock
      </label>
      <select
        id="stock-select"
        value={selectedSymbol}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <option value="">-- Select a stock --</option>
        {stocks.map((stock) => (
          <option key={stock.symbol} value={stock.symbol}>
            {stock.symbol}
          </option>
        ))}
      </select>
    </div>
  );
};
