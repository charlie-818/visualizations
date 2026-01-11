import React from 'react';
import { TimePeriod } from '../types/stock.types';

interface TimePeriodSelectorProps {
  value: TimePeriod;
  onChange: (period: TimePeriod) => void;
  disabled?: boolean;
}

const periods: { value: TimePeriod; label: string }[] = [
  { value: '24h', label: '24 Hours' },
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
];

export const TimePeriodSelector: React.FC<TimePeriodSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  return (
    <div className="w-full">
      <label htmlFor="period-select" className="block text-sm font-medium text-gray-700 mb-2">
        Time Period
      </label>
      <select
        id="period-select"
        value={value}
        onChange={(e) => onChange(e.target.value as TimePeriod)}
        disabled={disabled}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {periods.map((period) => (
          <option key={period.value} value={period.value}>
            {period.label}
          </option>
        ))}
      </select>
    </div>
  );
};
