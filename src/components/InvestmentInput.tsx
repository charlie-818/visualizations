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
    <span className="inline-flex items-center">
      <span className="mr-2 text-3xl font-semibold text-blue-600">$</span>
      <input
        id="investment-input"
        type="number"
        min="1"
        step="0.01"
        value={value === 0 ? '' : value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="0"
        className="text-2xl font-semibold w-36 px-4 py-2 border-2 border-blue-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
      />
      {value > 0 && value < 1 && (
        <span className="ml-3 text-base text-red-600 font-medium">Minimum is $1</span>
      )}
    </span>
  );
};
