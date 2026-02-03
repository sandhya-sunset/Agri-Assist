import React, { useState } from 'react';
import { Search, Filter, Eye, Package } from 'lucide-react';

const OrdersView = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.buyer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
          <p className="text-gray-500 mt-1">View and manage all platform orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by Order ID or Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Order ID</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Customer</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Amount</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Commission</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="text-left py-4 px-6 text-xs font-bold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-gray-400" />
                        <span className="font-bold text-gray-900">{order.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-semibold text-gray-900">{order.buyer}</p>
                        <p className="text-xs text-gray-500">{order.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900">Rs. {order.amount}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-green-600">Rs. {order.commission}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm text-gray-600">
                        {order.date || new Date().toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === 'completed' ? 'bg-green-100 text-green-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye size={18} className="text-gray-600" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Package size={48} className="text-gray-300" />
                      <p className="text-gray-500 font-semibold">No orders found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === 'completed').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter(o => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold text-gray-900">
            Rs. {orders.reduce((sum, o) => sum + (o.amount || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrdersView;
