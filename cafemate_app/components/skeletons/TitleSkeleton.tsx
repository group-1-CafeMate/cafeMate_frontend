import React from 'react';

const TitleSkeleton = () => {
  return (
    <div className="flex items-center justify-center gap-2 animate-pulse">
      <span className="inline-block h-8 w-8 bg-gray-300 rounded"></span>
      <div className="h-8 w-64 bg-gray-300 rounded"></div>
    </div>
  );
};

export default TitleSkeleton;
