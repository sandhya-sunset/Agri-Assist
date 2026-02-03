import React from 'react';

const QuickStat = ({ label, value, total, color }) => {
  const percentage = typeof value === 'string' ? parseFloat(value) : (value / total) * 100;
  
  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-sm font-bold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${colorClasses[color]} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
};

export default QuickStat;
