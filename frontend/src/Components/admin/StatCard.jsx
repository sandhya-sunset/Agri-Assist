import React from 'react';

const StatCard = ({ title, value, icon: Icon, color, growth }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
        {growth && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
            {growth}
          </span>
        )}
      </div>
      <h3 className="text-sm text-gray-500 font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

export default StatCard;
