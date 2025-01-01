import React from 'react';

const CafeSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((index) => (
        <div 
          key={index}
          className="bg-white text-[#563517] p-6 rounded-lg shadow-md animate-pulse"
        >
          {/* Image skeleton */}
          <div className="w-full h-64 bg-gray-200 rounded-lg mb-4" />
          
          {/* Content skeleton */}
          <div className="mb-4">
            <div className="flex justify-between items-center">
              {/* Title skeleton */}
              <div className="h-6 bg-gray-200 rounded w-2/3" />
              {/* Status tag skeleton */}
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
            
            {/* Rating skeleton */}
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="w-4 h-4 bg-gray-200 rounded" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CafeSkeleton;