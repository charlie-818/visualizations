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
  const selectedPeriod = periods.find(p => p.value === value);
  const labelLength = selectedPeriod?.label.length || 7;
  
  return (
    <select
      id="period-select"
      value={value}
      onChange={(e) => onChange(e.target.value as TimePeriod)}
      disabled={disabled}
      className={`${isMobileView ? 'text-base min-w-[70px] max-w-[120px] pl-2 pr-3 py-1 border rounded' : 'text-2xl min-w-[100px] max-w-[180px] pl-4 pr-5 py-2 border-2 rounded-xl'} w-auto font-semibold border-blue-300 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md appearance-none text-center`}
      style={{ width: `${labelLength * (isMobileView ? 9 : 16) + (isMobileView ? 32 : 56)}px` }}
    >
      {periods.map((period) => (
        <option key={period.value} value={period.value}>
          {period.label}
        </option>
      ))}
    </select>
  );
};
