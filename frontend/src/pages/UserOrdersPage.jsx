import React, { useState, useEffect } from 'react';
import { Package, Search, Filter, ChevronRight, Calendar, MapPin, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext'; // Assuming you have an AuthContext

const UserOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order._id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-500 mt-1">Track and manage your recent purchases</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search Order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-64"
              />
            </div>
            
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="all">All Orders</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <Package className="text-green-600" size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(order.createdAt).toLocaleDateString()}
                          </span>
                          <span className="hidden sm:inline">•</span>
                          <span>{order.items.length} Items</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between md:justify-end gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-bold text-gray-900">Rs. {order.totalAmount.toFixed(2)}</p>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <Truck size={16} />
                      {order.status === 'Delivered' ? 'Delivered successfully' : 'Estimated delivery: 3-5 business days'}
                    </p>
                    <Link 
                      to={`/order/${order._id}`}
                      className="text-green-600 font-semibold text-sm flex items-center gap-1 hover:text-green-700"
                    >
                      View Details
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 border-dashed">
            <Package size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">No orders found</h3>
            <p className="text-gray-500 mt-1">You haven't placed any orders yet.</p>
            <Link 
              to="/products"
              className="inline-block mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrdersPage;
