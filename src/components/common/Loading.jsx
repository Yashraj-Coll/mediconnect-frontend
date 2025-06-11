// components/common/Loading.jsx
import React from 'react';

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
