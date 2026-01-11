import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ChartDataPoint } from '../types/stock.types';
import { formatCurrency, formatDateCompact } from '../utils/formatters';
import { mapTokenizedToTraditional } from '../utils/calculations';

interface ComparisonChartProps {
  data: ChartDataPoint[];
  tokenizedSymbol: string;
  currentPrice: number;
  feesClaimed: number;
  investmentAmount: number;
  startPrice: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-300 rounded-lg shadow-lg">
        <p className="text-sm text-gray-600 mb-2">
          {payload[0]?.payload?.date ? formatDateCompact(payload[0].payload.date) : ''}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color }} className="text-sm font-medium">
            {`${entry.name}: ${formatCurrency(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ 
  data, 
  tokenizedSymbol, 
  currentPrice: _currentPrice,
  feesClaimed: _feesClaimed,
  investmentAmount,
  startPrice: _startPrice
}) => {
  const traditionalSymbol = mapTokenizedToTraditional(tokenizedSymbol);
  
  // Get final values from the last data point (end of period)
  // These represent the total value of the investment at the end
  const lastDataPoint = data && data.length > 0 ? data[data.length - 1] : null;
  const traditionalFinalValue = lastDataPoint?.traditionalValue || investmentAmount;
  const tokenizedFinalValue = lastDataPoint?.tokenizedValue || investmentAmount;

  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(2)}k`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Calculate min and max values from data with padding
  const calculateYAxisDomain = (): [number, number] => {
    if (!data || data.length === 0) return [0, 1000];

    const allValues = data.flatMap(point => [
      point.traditionalValue,
      point.tokenizedValue,
    ]);
    
    const minValue = Math.min(...allValues);
    const maxValue = Math.max(...allValues);
    const range = maxValue - minValue;
    
    // Add 5% padding to top and bottom
    const padding = range * 0.05;
    const paddedMin = minValue - padding;
    const paddedMax = maxValue + padding;
    
    return [paddedMin, paddedMax];
  };

  // Calculate evenly spaced ticks
  const calculateEvenTicks = (domain: [number, number], tickCount: number = 8): number[] => {
    const [min, max] = domain;
    const range = max - min;
    const step = range / (tickCount - 1);
    const ticks: number[] = [];
    
    for (let i = 0; i < tickCount; i++) {
      ticks.push(min + (step * i));
    }
    
    return ticks;
  };

  const yAxisDomain = calculateYAxisDomain();
  const yAxisTicks = calculateEvenTicks(yAxisDomain, 8).slice(1); // Remove first tick (bottom value)

  return (
    <div className="bg-white rounded-lg shadow-md p-6 relative">
      <div className="flex gap-2 items-center mb-4">
        <div className="text-2xl font-bold text-green-600">{tokenizedSymbol}</div>
        <span className="text-2xl font-bold text-black">Token</span>
        <div className="text-2xl font-bold text-blue-600">{traditionalSymbol}</div>
        <span className="text-2xl font-bold text-black">Stock</span>
      </div>
      
      {/* Final value display in top right */}
      <div className="absolute top-6 right-6 bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm z-10">
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-green-600">{tokenizedSymbol}</span>
            <span className="text-gray-700">{formatCurrency(tokenizedFinalValue)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-600">{traditionalSymbol}</span>
            <span className="text-gray-700">{formatCurrency(traditionalFinalValue)}</span>
          </div>
        </div>
      </div>
      
      <div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDateCompact}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              domain={yAxisDomain}
              ticks={yAxisTicks}
              tickFormatter={formatYAxis}
              stroke="#6b7280"
              style={{ fontSize: '12px' }}
              allowDataOverflow={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="traditionalValue"
              name="Traditional Stock"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="tokenizedValue"
              name="Tokenized Stock"
              stroke="#10b981"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};




