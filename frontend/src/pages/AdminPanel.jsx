import React, { useState, useEffect } from 'react';
import { 
  Leaf, Users, Store, Package, DollarSign, 
  Settings, Menu, Bell, BarChart3, LogOut
} from 'lucide-react';
import DashboardView from '../components/admin/DashboardView';
import UsersView from '../components/admin/UsersView';
import SellersView from '../components/admin/SellersView';
import CommissionView from '../components/admin/CommissionView';
import OrdersView from '../components/admin/OrdersView';
import SettingsView from '../components/admin/SettingsView';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';
import { toast } from 'react-hot-toast';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    commissionEarned: 0,
    totalOrders: 0,
    activeUsers: 0,
    activeSellers: 0,
    pendingSellers: 0,
    totalProducts: 0,
    monthlyGrowth: 0
  });

  const [users, setUsers] = useState([]);

  // Fetch notifications
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.data.slice(0, 5)); // Get latest 5
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
      fetchOrders();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'sellers') {
      fetchSellers();
    } else if (activeTab === 'commission') {
      fetchCommissionSettings();
    } else if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const [sellers, setSellers] = useState([]);

  const fetchSellers = async () => {
    try {
      const response = await api.get('/users/sellers');
      if (response.data.success) {
        setSellers(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sellers:', error);
      toast.error('Failed to load sellers');
    }
  };

  const [orders, setOrders] = useState([]);

  const [commissionSettings, setCommissionSettings] = useState({
    defaultRate: 15,
    fertilizers: 12,
    pesticides: 18,
    seeds: 10,
    equipment: 20
  });

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'sellers', label: 'Sellers', icon: Store },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'commission', label: 'Commission', icon: DollarSign },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleUserAction = async (userId, action) => {
    try {
      if (action === 'block' || action === 'activate') {
        const status = action === 'block' ? 'blocked' : 'active';
        const response = await api.put(`/users/${userId}/status`, { status });
        
        if (response.data.success) {
          setUsers(users.map(user => 
            user.id === userId 
              ? { ...user, status: status }
              : user
          ));
          toast.success(`User ${status} successfully`);
        }
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleSellerAction = async (sellerId, action) => {
    try {
      // action can be 'active' (approve) or 'rejected'
      const response = await api.put(`/users/sellers/${sellerId}/status`, { status: action });
      
      if (response.data.success) {
        setSellers(sellers.map(seller => 
          seller.id === sellerId 
            ? { ...seller, status: response.data.data.status }
            : seller
        ));
        toast.success(`Seller ${action === 'active' ? 'approved' : 'rejected'} successfully`);
      }
    } catch (error) {
      console.error('Error updating seller status:', error);
      toast.error('Failed to update seller status');
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/admin/orders?limit=10');
      if (response.data.success) {
        setOrders(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    }
  };

  const fetchCommissionSettings = async () => {
    try {
      const response = await api.get('/admin/commission');
      if (response.data.success) {
        setCommissionSettings(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching commission settings:', error);
      toast.error('Failed to load commission settings');
    }
  };

  const updateCommissionRate = async (category, rate) => {
    const updatedSettings = {
      ...commissionSettings,
      [category]: parseFloat(rate)
    };
    
    setCommissionSettings(updatedSettings);
    
    try {
      const response = await api.put('/admin/commission', updatedSettings);
      if (response.data.success) {
        toast.success('Commission rate updated successfully');
      }
    } catch (error) {
      console.error('Error updating commission rate:', error);
      toast.error('Failed to update commission rate');
      // Revert on error
      fetchCommissionSettings();
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center">
                <Leaf className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
                  AgriAssist Admin
                </h1>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative p-2 hover:bg-gray-100 rounded-lg"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {isNotificationOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  
                  {notifications.length > 0 ? (
                    <>
                      {notifications.map((notification) => (
                        <div 
                          key={notification._id}
                          className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 ${
                            !notification.isRead ? 'bg-green-50' : ''
                          }`}
                          onClick={() => {
                            setIsNotificationOpen(false);
                            if (notification.link) {
                              navigate(notification.link);
                            }
                          }}
                        >
                          <div className="flex items-start gap-2">
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => {
                          setIsNotificationOpen(false);
                          navigate('/notifications');
                        }}
                        className="w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 font-semibold"
                      >
                        View All Notifications
                      </button>
                    </>
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-400">
                      <Bell size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No notifications</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <div 
                className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  A
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-gray-900">Admin</p>
                  <p className="text-xs text-gray-500">Super Admin</p>
                </div>
              </div>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                   <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      window.location.href = '/login';
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium flex items-center gap-2"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 transition-transform duration-300 z-40 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeTab === item.id
                  ? 'bg-green-600 text-white shadow-lg shadow-green-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 transition-all duration-300 lg:pl-64`}>
        <div className="p-4 lg:p-8">
          {activeTab === 'dashboard' && <DashboardView stats={stats} orders={orders} />}
          {activeTab === 'users' && (
            <UsersView 
              users={users} 
              searchTerm={searchTerm} 
              setSearchTerm={setSearchTerm} 
              filterStatus={filterStatus} 
              setFilterStatus={setFilterStatus} 
              handleUserAction={handleUserAction} 
            />
          )}
          {activeTab === 'sellers' && (
            <SellersView 
              sellers={sellers} 
              filterStatus={filterStatus} 
              setFilterStatus={setFilterStatus} 
              handleSellerAction={handleSellerAction} 
            />
          )}
          {activeTab === 'orders' && <OrdersView orders={orders} />}
          {activeTab === 'commission' && (
            <CommissionView 
              commissionSettings={commissionSettings} 
              updateCommissionRate={updateCommissionRate} 
              stats={stats} 
              orders={orders} 
            />
          )}
          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminPanel;