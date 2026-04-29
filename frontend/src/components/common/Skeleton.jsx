import React from 'react';

const Skeleton = ({ className, height, width, circle }) => {
  return (
    <div 
      className={`bg-white/5 animate-pulse rounded-lg ${className}`} 
      style={{ 
        height: height || '1rem', 
        width: width || '100%',
        borderRadius: circle ? '9999px' : '0.75rem'
      }} 
    />
  );
};

export const CardSkeleton = () => (
  <div className="glass-panel p-6 space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-2 w-full">
        <Skeleton width="40%" height="0.75rem opacity-40" />
        <Skeleton width="60%" height="2rem" />
      </div>
      <Skeleton width="3rem" height="3rem" className="rounded-xl" />
    </div>
    <Skeleton width="80%" height="0.5rem" className="mt-4 opacity-30" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass-panel p-6 h-96 flex flex-col">
    <div className="flex items-center gap-2 mb-8">
      <Skeleton width="0.75rem" height="0.75rem" circle />
      <Skeleton width="40%" height="1rem" />
    </div>
    <div className="flex-1 flex items-end gap-4 px-4 pb-4">
      <Skeleton height="40%" className="opacity-20" />
      <Skeleton height="70%" className="opacity-30" />
      <Skeleton height="50%" className="opacity-20" />
      <Skeleton height="90%" className="opacity-40" />
      <Skeleton height="60%" className="opacity-20" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5 }) => (
  <div className="glass-panel p-6 space-y-4">
    <div className="flex justify-between mb-6">
      <Skeleton width="30%" height="1.5rem" />
      <Skeleton width="15%" height="1.5rem" />
    </div>
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <Skeleton key={i} height="3rem" className="opacity-40" />
      ))}
    </div>
  </div>
);

export default Skeleton;
