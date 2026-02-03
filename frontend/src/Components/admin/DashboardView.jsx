import React from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';
import StatCard from './StatCard';
import QuickStat from './QuickStat';

const DashboardView = ({ stats, orders }) => {
  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
          icon={TrendingUp}
          color="blue"
          growth="+12.5%"
        />
        <StatCard 
          title="Commission Earned" 
          value={`Rs. ${stats.commissionEarned.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          growth="+18.2%"
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders}
          icon={ShoppingCart}
          color="purple"
          growth="+8.3%"
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers}
          icon={Users}
          color="orange"
          growth="+15.7%"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue Overview</h3>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg hover:from-green-600 hover:to-green-500 transition-all cursor-pointer" 
                     style={{height: `${height}%`}}>
                </div>
                <span className="text-xs text-gray-500 font-medium">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Stats</h3>
          <div className="space-y-4">
            <QuickStat label="Active Sellers" value={stats.activeSellers} total={stats.activeSellers + stats.pendingSellers} color="green" />
            <QuickStat label="Pending Approvals" value={stats.pendingSellers} total={stats.activeSellers + stats.pendingSellers} color="yellow" />
            <QuickStat label="Total Products" value={stats.totalProducts} total={500} color="blue" />
            <QuickStat label="Monthly Growth" value={`${stats.monthlyGrowth}%`} total={100} color="purple" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Orders</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Customer</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Commission</th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-bold text-gray-900">{order.id}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{order.buyer}</td>
                  <td className="py-3 px-4 text-sm font-bold text-gray-900">Rs. {order.amount}</td>
                  <td className="py-3 px-4 text-sm font-bold text-green-600">Rs. {order.commission}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
