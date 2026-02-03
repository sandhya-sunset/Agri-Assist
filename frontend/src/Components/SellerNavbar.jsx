import React, { useState, useEffect } from 'react';
import { 
  Leaf, ShoppingCart, User, Bell, Search, Menu, X, 
  LogOut, Settings, Package, LayoutDashboard, MessageSquare, BarChart3, Store
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const SellerNavbar = ({ activeTab, onTabChange }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, clearNotifications } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'messages', name: 'Messages', icon: MessageSquare },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-100'
        : 'bg-white/60 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/seller-dashboard" className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-green-200">
              <Store className="text-white" size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent tracking-tight">
                Seller Hub
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold -mt-0.5">AgriAssist</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onTabChange(link.id)}
                className={`flex items-center gap-1.5 font-semibold text-sm transition-all duration-200 relative group py-2 ${
                  activeTab === link.id ? 'text-green-600' : 'text-gray-600 hover:text-green-600'
                }`}
              >
                {link.icon && <link.icon size={16} className={activeTab === link.id ? 'text-green-600' : 'text-gray-400 group-hover:text-green-500'} />}
                {link.name}
                <span className={`absolute bottom-0 left-0 h-0.5 bg-green-600 transition-all duration-300 rounded-full ${activeTab === link.id ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </button>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 hover:bg-green-50 rounded-xl transition-all duration-300 relative group"
              >
                <Bell size={22} className="text-gray-600 group-hover:text-green-600" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white font-bold">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <div>
                      <h4 className="font-bold text-gray-900">Notifications</h4>
                      <p className="text-[10px] text-gray-500 font-medium">{notifications.filter(n => !n.isRead).length} Unread</p>
                    </div>
                    <button 
                      onClick={(e) => {
                          e.stopPropagation();
                          clearNotifications();
                      }}
                      className="text-xs text-red-600 hover:text-red-700 font-bold transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n._id} 
                          onClick={() => {
                            // Handle click (similar to Navbar logic)
                            setShowNotifications(false);
                            onTabChange(n.type === 'message' ? 'messages' : 'orders');
                          }}
                          className={`p-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 cursor-pointer ${!n.isRead ? 'bg-green-50/30' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-lg h-fit ${n.type === 'message' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                              {n.type === 'message' ? <MessageSquare size={16} /> : <Bell size={16} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-900 line-clamp-1">{n.title}</p>
                              <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            {!n.isRead && <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-400">
                        <Bell size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No new notifications</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-3">
                    <div className="text-right hidden lg:block">
                        <p className="text-sm font-bold text-gray-900">{user?.name || 'Seller'}</p>
                        <p className="text-xs text-gray-500">Verified Seller</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-bold">
                        {user?.name?.charAt(0).toUpperCase() || 'S'}
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all duration-300"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 hover:bg-gray-100 rounded-xl transition-all duration-300"
            >
              {isMobileMenuOpen ? <X size={24} className="text-gray-600" /> : <Menu size={24} className="text-gray-600" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
        isMobileMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="px-4 pt-2 pb-6 bg-white border-t border-gray-100 space-y-2 shadow-2xl">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onTabChange(link.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 ${
                 activeTab === link.id ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.icon && <link.icon size={20} className={activeTab === link.id ? 'text-green-500' : 'text-gray-400'} />}
              {link.name}
            </button>
          ))}
          <div className="border-t border-gray-100 mt-4 pt-4">
             <div className="flex items-center gap-3 px-4 mb-4">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-700 font-bold">
                    {user?.name?.charAt(0).toUpperCase() || 'S'}
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">{user?.name || 'Seller'}</p>
                    <p className="text-xs text-gray-500">Verified Seller</p>
                </div>
             </div>
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="w-full px-4 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-100 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default SellerNavbar;
