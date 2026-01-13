import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ChartDataPoint } from '../types/stock.types';
import { formatCurrency, formatDateCompact, formatMultiple } from '../utils/formatters';
import { mapTokenizedToTraditional } from '../utils/calculations';

interface ComparisonChartProps {
  data: ChartDataPoint[];
  tokenizedSymbol: string;
  currentPrice: number;
  feesClaimed: number;
  investmentAmount: number;
  startPrice: number;
  poolTVL: number;
  volumeForPeriod: number;
  userTVLFraction: number;
  isMobileView?: boolean;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({ 
  data, 
  tokenizedSymbol, 
  currentPrice: _currentPrice,
  feesClaimed: _feesClaimed,
  investmentAmount: _investmentAmount,
  startPrice: _startPrice,
  poolTVL,
  volumeForPeriod,
  userTVLFraction,
  isMobileView = false
}) => {
  const traditionalSymbol = mapTokenizedToTraditional(tokenizedSymbol);

  // Get default values (last data point)
  const lastDataPoint = data && data.length > 0 ? data[data.length - 1] : null;
  const defaultTraditionalValue = lastDataPoint?.traditionalValue ?? 0;
  const defaultTokenizedValue = lastDataPoint?.tokenizedValue ?? 0;

  // State for hovered values
  const [hoveredTraditionalValue, setHoveredTraditionalValue] = useState<number | null>(null);
  const [hoveredTokenizedValue, setHoveredTokenizedValue] = useState<number | null>(null);

  // State for animated display values (for smooth transitions)
  const [animatedTraditionalValue, setAnimatedTraditionalValue] = useState(defaultTraditionalValue);
  const [animatedTokenizedValue, setAnimatedTokenizedValue] = useState(defaultTokenizedValue);

  // Refs for animation frames and current values
  const traditionalAnimationRef = useRef<number | null>(null);
  const tokenizedAnimationRef = useRef<number | null>(null);
  const currentTraditionalRef = useRef(defaultTraditionalValue);
  const currentTokenizedRef = useRef(defaultTokenizedValue);

  // Update refs when animated values change
  useEffect(() => {
    currentTraditionalRef.current = animatedTraditionalValue;
  }, [animatedTraditionalValue]);

  useEffect(() => {
    currentTokenizedRef.current = animatedTokenizedValue;
  }, [animatedTokenizedValue]);

  // Calculate metrics for display
  const volumeTVLMultiple = poolTVL > 0 ? volumeForPeriod / poolTVL : 0;
  const tvlFractionPercentage = userTVLFraction * 100;

  // Determine target values (hovered or default)
  const targetTraditionalValue = hoveredTraditionalValue ?? defaultTraditionalValue;
  const targetTokenizedValue = hoveredTokenizedValue ?? defaultTokenizedValue;

  // Smooth animation effect for traditional value
  useEffect(() => {
    if (traditionalAnimationRef.current) {
      cancelAnimationFrame(traditionalAnimationRef.current);
    }

    const startValue = currentTraditionalRef.current;
    const endValue = targetTraditionalValue;
    const duration = 300; // 300ms animation
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;
      
      setAnimatedTraditionalValue(currentValue);

      if (progress < 1) {
        traditionalAnimationRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedTraditionalValue(endValue);
      }
    };

    traditionalAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (traditionalAnimationRef.current) {
        cancelAnimationFrame(traditionalAnimationRef.current);
      }
    };
  }, [targetTraditionalValue]);

  // Smooth animation effect for tokenized value
  useEffect(() => {
    if (tokenizedAnimationRef.current) {
      cancelAnimationFrame(tokenizedAnimationRef.current);
    }

    const startValue = currentTokenizedRef.current;
    const endValue = targetTokenizedValue;
    const duration = 300; // 300ms animation
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease-out easing function
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeOut;
      
      setAnimatedTokenizedValue(currentValue);

      if (progress < 1) {
        tokenizedAnimationRef.current = requestAnimationFrame(animate);
      } else {
        setAnimatedTokenizedValue(endValue);
      }
    };

    tokenizedAnimationRef.current = requestAnimationFrame(animate);

    return () => {
      if (tokenizedAnimationRef.current) {
        cancelAnimationFrame(tokenizedAnimationRef.current);
      }
    };
  }, [targetTokenizedValue]);

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

  // Calculate appropriate interval for X-axis based on data density
  // Interval controls spacing between ticks: 0 = show all, higher = skip more
  const calculateXAxisInterval = (): number => {
    if (!data || data.length === 0) return 0;

    const firstDate = new Date(data[0].date).getTime();
    const lastDate = new Date(data[data.length - 1].date).getTime();
    const timeRange = lastDate - firstDate;
    
    // Convert to days for calculation
    const days = timeRange / (1000 * 60 * 60 * 24);
    
    // Determine desired tick count based on time range
    let desiredTickCount: number;
    if (days <= 1) {
      desiredTickCount = 6; // 24h or less
    } else if (days <= 7) {
      desiredTickCount = 7; // 7 days
    } else if (days <= 30) {
      desiredTickCount = 6; // 30 days
    } else if (days <= 90) {
      desiredTickCount = 6; // 3 months
    } else if (days <= 180) {
      desiredTickCount = 6; // 6 months
    } else {
      desiredTickCount = 12; // 1 year - ensure full year is visible
    }
    
    // Calculate interval: skip enough data points to show desired tick count
    // interval = Math.floor(data.length / desiredTickCount)
    // Ensure interval is at least 0 (0 = show all ticks)
    const interval = Math.max(0, Math.floor(data.length / desiredTickCount));
    
    return interval;
  };

  const yAxisDomain = calculateYAxisDomain();
  const yAxisTicks = calculateEvenTicks(yAxisDomain, 8).slice(1); // Remove first tick (bottom value)
  
  const xAxisInterval = calculateXAxisInterval();

  // Handle mouse move event
  const handleMouseMove = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const payload = data.activePayload[0].payload as ChartDataPoint;
      setHoveredTraditionalValue(payload.traditionalValue);
      setHoveredTokenizedValue(payload.tokenizedValue);
    }
  };

  // Handle mouse leave event - reset to default values
  const handleMouseLeave = () => {
    setHoveredTraditionalValue(null);
    setHoveredTokenizedValue(null);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md ${isMobileView ? 'p-3' : 'p-6'} relative transition-all duration-300`}>
      <div className={`${isMobileView ? 'flex-col gap-3' : 'flex justify-between items-center'} mb-4`}>
        <div className={`flex ${isMobileView ? 'gap-2 flex-wrap justify-center' : 'gap-2'} items-center`}>
          <div className={`${isMobileView ? 'text-lg' : 'text-2xl'} font-bold text-green-600`}>{tokenizedSymbol}</div>
          <span className={`${isMobileView ? 'text-lg' : 'text-2xl'} font-bold text-gray-600`}>
            {formatCurrency(animatedTokenizedValue)}
          </span>
          <div className={`${isMobileView ? 'text-lg' : 'text-2xl'} font-bold text-blue-600`}>{traditionalSymbol}</div>
          <span className={`${isMobileView ? 'text-lg' : 'text-2xl'} font-bold text-gray-600`}>
            {formatCurrency(animatedTraditionalValue)}
          </span>
        </div>
        
        {/* Metrics display to the right of title */}
        <div className={`flex ${isMobileView ? 'flex-row justify-between gap-1 text-[8px] w-full' : 'gap-4 text-xs'} text-gray-600`}>
          <div className={isMobileView ? 'flex-1 text-center' : ''}>
            <span className="text-gray-500">{isMobileView ? 'Vol/TVL ' : 'Volume/TVL Multiple'}</span>
            <span className={`${isMobileView ? 'ml-0' : 'ml-1'} font-semibold text-gray-800`}>{formatMultiple(volumeTVLMultiple)}</span>
          </div>
          <div className={isMobileView ? 'flex-1 text-center' : ''}>
            <span className="text-gray-500">{isMobileView ? 'TVL ' : 'Total TVL'}</span>
            <span className={`${isMobileView ? 'ml-0' : 'ml-1'} font-semibold text-gray-800`}>
              {new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(poolTVL)}
            </span>
          </div>
          <div className={isMobileView ? 'flex-1 text-center' : ''}>
            <span className="text-gray-500">{isMobileView ? 'Frac ' : 'Fraction of TVL'}</span>
            <span className={`${isMobileView ? 'ml-0' : 'ml-1'} font-semibold text-gray-800`}>{tvlFractionPercentage.toFixed(2)}%</span>
          </div>
        </div>
      </div>
      
      <div className={isMobileView ? 'flex justify-center items-center' : ''}>
        <ResponsiveContainer width="100%" height={isMobileView ? 300 : 400}>
          <LineChart 
            data={data} 
            margin={isMobileView ? { top: 5, right: 5, left: 0, bottom: 5 } : { top: 5, right: 30, left: 20, bottom: 5 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              interval={xAxisInterval}
              tickFormatter={formatDateCompact}
              stroke="#6b7280"
              style={{ fontSize: isMobileView ? '9px' : '12px' }}
            />
            <YAxis
              domain={yAxisDomain}
              ticks={yAxisTicks}
              tickFormatter={formatYAxis}
              stroke="#6b7280"
              style={{ fontSize: isMobileView ? '9px' : '12px' }}
              allowDataOverflow={false}
            />
            <Tooltip
              content={() => null}
              cursor={{ stroke: '#9ca3af', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Line
              type="monotone"
              dataKey="traditionalValue"
              name="Traditional Stock"
              stroke="#3b82f6"
              strokeWidth={isMobileView ? 1.5 : 2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="tokenizedValue"
              name="Tokenized Stock"
              stroke="#10b981"
              strokeWidth={isMobileView ? 1.5 : 2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};




