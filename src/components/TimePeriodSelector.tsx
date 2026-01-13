import React from 'react';
import { TimePeriod } from '../types/stock.types';

interface TimePeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
  disabled?: boolean;
  isMobileView?: boolean;
}

const periods: { value: TimePeriod; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '3m', label: '3 months' },
  { value: '6m', label: '6 months' },
];

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  isMobileView = false,
}) => {
  return (
    <select
      id="period-select"
      value={value}
      onChange={(e) => onChange(e.target.value as TimePeriod)}
      disabled={disabled}
      className={`${isMobileView ? 'text-[10px] pl-1 pr-2 py-0.5 border rounded' : 'text-2xl pl-4 pr-5 py-2 border-2 rounded-xl'} font-semibold border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md appearance-none`}
    >
      {periods.map((period) => (
        <option key={period.value} value={period.value}>
          {period.label}
        </option>
      ))}
    </select>
  );
};
