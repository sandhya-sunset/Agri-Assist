import React, { useState, useEffect } from 'react';
import { Eye, Package, Truck, CheckCircle, XCircle, Search, Download, Filter, Calendar, Loader2, Users } from 'lucide-react';
import api from '../services/api';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';

const OrdersSection = ({ searchQuery }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  // const [searchQuery, setSearchQuery] = useState(''); // REPLACED BY PROP for global search
  
  const { token } = useAuth();
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/seller/orders');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const response = await api.put(`/seller/orders/${orderId}/status`, { status: newStatus });
      if (response.data.success) {
        const updatedOrder = response.data.data;
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
        // Also update selected order if it's open
        if (selectedOrder && selectedOrder.id === orderId) {
            setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
        addToast(`Order status updated to ${newStatus}`, 'success');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      addToast('Failed to update order status', 'error');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const orderStats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle size={14} />;
      case 'Processing': return <Package size={14} />;
      case 'Shipped': return <Truck size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      default: return <Loader2 size={14} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Orders Management</h2>
          <p className="text-gray-500 mt-1">Track and manage all your customer orders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <Download size={20} />
          Export Orders
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total', value: orderStats.total, color: 'gray', icon: Package },
          { label: 'Pending', value: orderStats.pending, color: 'yellow', icon: Package },
          { label: 'Processing', value: orderStats.processing, color: 'blue', icon: Package },
          { label: 'Shipped', value: orderStats.shipped, color: 'purple', icon: Truck },
          { label: 'Delivered', value: orderStats.delivered, color: 'green', icon: CheckCircle },
          { label: 'Cancelled', value: orderStats.cancelled, color: 'red', icon: XCircle }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 bg-${stat.color}-100 rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`text-${stat.color}-600`} size={20} />
            </div>
            <p className="text-gray-500 text-xs mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
             {/* Global search is now in the header. Local search removed.
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by Order ID, Customer, or Email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
             */}
             <p className="text-sm text-gray-500 py-2">Use the top bar to search orders.</p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Calendar size={20} />
              <span className="hidden sm:inline">Date Range</span>
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={20} />
              <span className="hidden sm:inline">More Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Order ID</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Customer</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Items</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-800">{order.customer}</p>
                        <p className="text-sm text-gray-500">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{order.products} item{order.products > 1 ? 's' : ''}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">Rs. {order.total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">{order.date}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-semibold mb-1">No orders found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredOrders.length} of {orders.length} orders
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Previous</button>
              <button className="px-3 py-1 bg-green-600 text-white rounded">1</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">2</button>
              <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto w-full h-full" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-xl max-w-3xl w-full my-8 relative">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Order Details</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(selectedOrder.status)}`}>
                  {getStatusIcon(selectedOrder.status)}
                  {selectedOrder.status}
                </span>
                {selectedOrder.trackingNumber && (
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Tracking Number</p>
                    <p className="font-semibold text-gray-800">{selectedOrder.trackingNumber}</p>
                  </div>
                )}
              </div>

              {/* Customer & Order Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Users size={18} />
                    Customer Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Name</p>
                      <p className="font-medium text-gray-800">{selectedOrder.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="font-medium text-gray-800">{selectedOrder.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="font-medium text-gray-800">{selectedOrder.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Package size={18} />
                    Order Information
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500">Order Date</p>
                      <p className="font-medium text-gray-800">{selectedOrder.date}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Method</p>
                      <p className="font-medium text-gray-800">{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Shipping Method</p>
                      <p className="font-medium text-gray-800">{selectedOrder.shippingMethod}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <Truck size={18} />
                  Shipping Address
                </h4>
                <p className="text-gray-700">{selectedOrder.address}</p>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-500">Quantity: {item.qty}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-800">Rs. {(item.price * item.qty).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Rs. {item.price} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>Rs. {selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>Rs. 0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-800 pt-2 border-t">
                    <span>Total</span>
                    <span>Rs. {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Update Order Status
                </label>
                <select 
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Additional Notes */}
              {selectedOrder.status === 'cancelled' && selectedOrder.cancelledReason && (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-red-700 mb-1">Cancellation Reason:</p>
                  <p className="text-sm text-red-600">{selectedOrder.cancelledReason}</p>
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                <Download size={18} />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersSection;