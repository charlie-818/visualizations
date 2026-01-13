import React from 'react';

interface ViewModeToggleProps {
  isMobileView: boolean;
  onToggle: (isMobile: boolean) => void;
}

export const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ isMobileView, onToggle }) => {
  return (
    <div className="fixed left-0 top-1/2 -translate-y-1/2 z-50">
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
    </div>
  );
};
