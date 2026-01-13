import React from 'react';

interface InvestmentInputProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  isMobileView?: boolean;
}

export const InvestmentInput: React.FC<InvestmentInputProps> = ({
  value,
  onChange,
  disabled = false,
  isMobileView = false,
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
      <span className={`${isMobileView ? 'text-base mr-1' : 'text-3xl mr-2'} font-semibold text-green-600`}>$</span>
      <input
        id="investment-input"
        type="number"
        min="1"
        step="0.01"
        value={value === 0 ? '' : value}
        onChange={handleChange}
        disabled={disabled}
        placeholder="0"
        className={`${isMobileView ? 'text-base w-20 px-2 py-1 border rounded' : 'text-2xl w-36 px-4 py-2 border-2 rounded-xl'} font-semibold border-green-300 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md text-center`}
      />
      {value > 0 && value < 1 && (
        <span className={`ml-3 ${isMobileView ? 'text-xs' : 'text-base'} text-red-600 font-medium`}>Minimum is $1</span>
      )}
    </span>
  );
};
