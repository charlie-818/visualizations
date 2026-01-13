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
        className={`${isMobileView ? 'text-base min-w-[60px] max-w-[100px] px-2 py-1 border rounded ml-1' : 'text-2xl min-w-[80px] max-w-[160px] px-4 py-2 border-2 rounded-xl ml-2'} w-auto font-semibold border-green-300 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md text-center`}
        style={{ width: `${Math.max(isMobileView ? 60 : 80, String(value || '0').length * (isMobileView ? 12 : 20) + (isMobileView ? 24 : 32))}px` }}
      />
      {value > 0 && value < 1 && (
        <span className={`ml-3 ${isMobileView ? 'text-xs' : 'text-base'} text-red-600 font-medium`}>Minimum is $1</span>
      )}
    </span>
  );
};
