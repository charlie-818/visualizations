import React from 'react';

interface InvestmentInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export const InvestmentInput: React.FC<InvestmentInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    if (inputValue === '') {
      onChange(0);
      return;
    }
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue) && numValue >= 0) {
      onChange(numValue);
    }
  };

  return (
    <div className="w-full">
      <label htmlFor="investment-input" className="block text-sm font-medium text-gray-700 mb-2">
        Investment Amount ($)
      </label>
      <input
        id="investment-input"
        type="number"
        min="1"
        step="0.01"
        value={value === 0 ? '' : value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="Enter amount"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      />
      {value > 0 && value < 1 && (
        <p className="mt-1 text-sm text-red-600">Minimum investment is $1</p>
      )}
    </div>
  );
};
