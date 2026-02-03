import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, ShoppingCart, MessageSquare, BarChart3, Settings, Plus, Bell, Search, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import ProductsSection from '../components/ProductsSection';
import OrdersSection from '../components/OrdersSection';
import MessagesSection from '../components/MessagesSection';
import AnalyticsSection from '../components/AnalyticsSection';
import SettingsSection from '../components/SettingsSection';
import SellerNavbar from '../components/SellerNavbar'; // Import the new Navbar

import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const SellerDashboard = () => {
  const { user } = useAuth();
  const { notifications, clearNotifications } = useSocket();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  // Removed sidebar state
  // const [showNotifications, setShowNotifications] = useState(false); // Managed in Navbar now
  const [searchQuery, setSearchQuery] = useState('');
  
  const [sellerData, setSellerData] = useState({
    name: user?.name || "Seller",
    revenue: "Rs. 0",
    orders: 0,
    products: 0,
    messages: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/seller/stats');
        if (response.data.success) {
          const stats = response.data.data;
          setSellerData({
            name: user?.name || "Seller",
            revenue: `Rs. ${stats.revenue.toFixed(2)}`,
            orders: stats.orders,
            products: stats.products,
            messages: 0, // Pending backend endpoint for message count
            pendingOrders: stats.pendingOrders
          });
        }
      } catch (error) {
        console.error('Error fetching seller stats:', error);
      }
    };
    fetchStats();
  }, [user]);

  const [showAddProductModal, setShowAddProductModal] = useState(false);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setShowAddProductModal(false);
  };

  const handleAddProductClick = () => {
    setActiveTab('products');
    setShowAddProductModal(true);
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'products':
        return <ProductsSection initialShowAddModal={showAddProductModal} searchQuery={searchQuery} />;
      case 'orders':
        return <OrdersSection searchQuery={searchQuery} />;
      case 'messages':
        return <MessagesSection />;
      case 'analytics':
        return <AnalyticsSection />;
      case 'settings':
        return <SettingsSection />;
      // Removed specific notifications tab case if it was just for the dropdown
      default:
        return <OverviewSection sellerData={sellerData} onAddProduct={handleAddProductClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       {/* Use the new SellerNavbar */}
      <SellerNavbar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col pt-20"> {/* Added padding-top for fixed navbar */}
        
        {/* Content Area */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
           {/* Optional: Keep a local search if needed for specific tabs like products/orders, 
               or rely on the Navbar search if implemented globally. 
               For now, keeping a context-specific header for current tab actions if any. 
           */}
           
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// Overview Section Component
const OverviewSection = ({ sellerData, onAddProduct }) => {
  const stats = [
    { label: 'Total Revenue', value: sellerData.revenue, change: '+12.5%', color: 'green' },
    { label: 'Total Orders', value: sellerData.orders, change: '+8.2%', color: 'blue' },
    { label: 'Products', value: sellerData.products, change: '+3', color: 'purple' },
    { label: 'Pending Messages', value: sellerData.messages, change: '2 new', color: 'orange' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
            <p className="text-gray-500 text-sm">Welcome back, here's what's happening today.</p>
        </div>
        <button 
          onClick={onAddProduct}
          className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg shadow-green-200 hover:shadow-green-300 transform hover:-translate-y-0.5 font-bold"
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <p className="text-gray-500 text-sm font-medium mb-2">{stat.label}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
            <p className={`text-xs font-bold px-2 py-1 rounded-full w-fit ${
                stat.color === 'green' ? 'bg-green-50 text-green-600' :
                stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                'bg-orange-50 text-orange-600'
            }`}>
                {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
            <button className="text-green-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">
                        #{10 + item}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">Order #ORD-{1000 + item}</p>
                        <p className="text-xs text-gray-500 font-medium">2 items • Rs 450.00</p>
                    </div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Completed</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Products</h3>
            <button className="text-green-600 text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {['Organic NPK Mix', 'Plant Growth Booster', 'Root Enhancer'].map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                        <Package size={20} />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{product}</p>
                        <p className="text-xs text-gray-500 font-medium">{45 - idx * 5} sales this month</p>
                    </div>
                </div>
                <span className="text-gray-900 font-bold">Rs {(299.00 - idx * 20).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;