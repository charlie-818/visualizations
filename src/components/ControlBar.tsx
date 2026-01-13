import React from 'react';

interface ControlBarProps {
  isMobileView: boolean;
  onToggle: (isMobile: boolean) => void;
  onCompare: () => void;
  onRefresh: () => void;
  loading: boolean;
  refreshing: boolean;
  disabled: boolean;
  showMetrics?: boolean;
  onToggleMetrics?: () => void;
  hasComparisonData?: boolean;
}

export const ControlBar: React.FC<ControlBarProps> = ({
  isMobileView,
  onToggle,
  onCompare,
  onRefresh,
  loading,
  refreshing,
  disabled,
  showMetrics = true,
  onToggleMetrics,
  hasComparisonData = false
}) => {
  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
      {/* View Mode Toggle */}
      <button
        onClick={() => onToggle(!isMobileView)}
        className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-r-full shadow-lg transition-all duration-300 flex items-center gap-2 group"
        title={isMobileView ? 'Switch to Desktop View' : 'Switch to Mobile View'}
      >
        <div className="flex flex-col items-center gap-1">
          {isMobileView ? (
            // Desktop icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ) : (
            // Mobile icon
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          )}
          <span className="text-xs font-medium">
            {isMobileView ? 'Desktop' : 'Mobile'}
          </span>
        </div>
      </button>

      {/* Compare Button */}
      <button
        onClick={onCompare}
        disabled={disabled || loading || refreshing}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white p-3 rounded-r-full shadow-lg transition-all duration-300 flex items-center gap-2 disabled:cursor-not-allowed group"
        title="Compare"
      >
        <div className="flex flex-col items-center gap-1">
          {loading ? (
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )}
          <span className="text-xs font-medium">
            {loading ? 'Loading' : 'Compare'}
          </span>
        </div>
      </button>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={loading || refreshing}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white p-3 rounded-r-full shadow-lg transition-all duration-300 flex items-center gap-2 disabled:cursor-not-allowed group"
        title="Refresh Data"
      >
        <div className="flex flex-col items-center gap-1">
          {refreshing ? (
            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          <span className="text-xs font-medium">
            {refreshing ? 'Loading' : 'Refresh'}
          </span>
        </div>
      </button>

      {/* Metrics Toggle Button - Only show in mobile view when there's comparison data */}
      {isMobileView && hasComparisonData && onToggleMetrics && (
        <button
          onClick={onToggleMetrics}
          className="bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-r-full shadow-lg transition-all duration-300 flex items-center gap-2 group"
          title={showMetrics ? 'Hide Metrics' : 'Show Metrics'}
        >
          <div className="flex flex-col items-center gap-1">
            <svg
              className={`h-6 w-6 transition-transform duration-300 ${showMetrics ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span className="text-xs font-medium">
              {showMetrics ? 'Hide' : 'Show'}
            </span>
          </div>
        </button>
      )}
    </div>
  );
};
