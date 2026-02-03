import React from 'react';

const CommissionView = ({ commissionSettings, updateCommissionRate, stats, orders }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Commission Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Configure commission rates for different product categories</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Category Commission Rates</h3>
          <div className="space-y-4">
            {Object.entries(commissionSettings).map(([category, rate]) => (
              <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-bold text-gray-900 capitalize">{category.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-xs text-gray-500">Current rate: {rate}%</p>
                </div>
                <div className="flex items-center gap-3">
                  <input 
                    type="number"
                    value={rate}
                    onChange={(e) => updateCommissionRate(category, e.target.value)}
                    className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm font-bold text-center"
                    min="0"
                    max="100"
                  />
                  <span className="text-sm font-bold text-gray-600">%</span>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors">
            Save Changes
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Commission Overview</h3>
          <div className="space-y-4">
            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <p className="text-sm text-green-700 font-medium mb-1">Total Commission Earned</p>
              <p className="text-3xl font-bold text-green-900">₹{stats.commissionEarned.toLocaleString()}</p>
              <p className="text-xs text-green-600 mt-2">+18.2% from last month</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
              <p className="text-sm text-blue-700 font-medium mb-1">This Month</p>
              <p className="text-2xl font-bold text-blue-900">₹{(stats.commissionEarned * 0.3).toFixed(0).toLocaleString()}</p>
              <p className="text-xs text-blue-600 mt-2">From {orders.length} orders</p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <p className="text-sm text-purple-700 font-medium mb-1">Average Commission Rate</p>
              <p className="text-2xl font-bold text-purple-900">
                {(Object.values(commissionSettings).reduce((a, b) => a + b, 0) / Object.values(commissionSettings).length).toFixed(1)}%
              </p>
              <p className="text-xs text-purple-600 mt-2">Across all categories</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommissionView;
