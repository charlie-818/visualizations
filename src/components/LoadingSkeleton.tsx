import React from 'react';

interface LoadingSkeletonProps {
  isMobileView?: boolean;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ isMobileView = false }) => {
  return (
    <div className="animate-pulse space-y-4">
      <div className={`${isMobileView ? 'h-6' : 'h-8'} bg-gray-200 rounded w-1/4`}></div>
      <div className={`${isMobileView ? 'h-48' : 'h-64'} bg-gray-200 rounded`}></div>
      <div className={`${isMobileView ? 'h-24' : 'h-32'} bg-gray-200 rounded`}></div>
    </div>
  );
};
