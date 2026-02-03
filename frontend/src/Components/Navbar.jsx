import React, { useState, useEffect } from 'react';
import { 
  Leaf, ShoppingCart, User, Bell, Search, Menu, X, 
  LogOut, Settings, Package, Heart, LayoutDashboard, MessageSquare, Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { notifications, clearNotifications } = useSocket();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartItemsCount, setCartItemsCount] = useState(0);

  // Fetch cart count on mount
  useEffect(() => {
    if (isAuthenticated) {
        // Simple fetch for badge (could be optimized)
        fetch('http://localhost:5000/api/cart', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                setCartItemsCount(data.data.items.length);
            }
        })
        .catch(err => console.error(err));
    }
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
        navigate(`/products?search=${searchTerm}`);
    }
  };

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
    { name: 'Home', href: isAuthenticated ? '/home' : '/' },
    { name: 'Products', href: '/products' },
    { name: 'Messages', href: '/user-message', icon: MessageSquare },
    { name: 'AI Assistant', href: '/disease-detection', icon: Sparkles },
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
          <Link to={isAuthenticated ? (user?.role === 'seller' ? '/seller-dashboard' : '/home') : '/'} className="flex items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-green-200">
              <Leaf className="text-white" size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent tracking-tight">
                AgriAssist
              </h1>
              <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold -mt-0.5">Smart Farming</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="flex items-center gap-1.5 text-gray-600 hover:text-green-600 font-semibold text-sm transition-all duration-200 relative group py-2"
              >
                {link.icon && <link.icon size={16} className="text-green-500" />}
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search - Hidden on mobile */}
            {/* Search - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-100 rounded-xl transition-all duration-300">
              <Search size={18} className="text-gray-400" />
              <input 
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                className="bg-transparent border-none focus:outline-none text-xs font-medium text-gray-500 w-32" 
              />
            </div>

            {/* Notifications (Only if authenticated) */}
            {isAuthenticated && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                  }}
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
                      <div className="flex gap-2">
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
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((n) => (
                          <div 
                            key={n._id} 
                            onClick={async () => {
                              // Mark as read locally and on server
                              try {
                                await fetch(`http://localhost:5000/api/notifications/${n._id}`, {
                                  method: 'PUT',
                                  headers: { 'Authorization': `Bearer ${token}` }
                                });
                                // Navigation logic
                                if (n.link) navigate(n.link);
                                setShowNotifications(false);
                              } catch (err) {
                                console.error('Error marking notification as read:', err);
                              }
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
                    <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                        <Link 
                            to="/notifications" 
                            onClick={() => setShowNotifications(false)}
                            className="text-xs font-bold text-green-600 hover:text-green-700 hover:underline"
                        >
                            View All Notifications
                        </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart */}
            {/* Cart */}
            <button 
                onClick={() => navigate('/cart')}
                className="relative p-2.5 hover:bg-green-50 rounded-xl transition-all duration-300 group"
            >
              <ShoppingCart size={22} className="text-gray-600 group-hover:text-green-600" />
              {cartItemsCount > 0 && (
                <span className="absolute top-1 right-1 bg-green-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ring-2 ring-white">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Auth Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/my-orders')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300"
                  >
                    <Package size={18} />
                    My Orders
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300"
                  >
                    <User size={18} />
                    Profile
                  </button>
                  <button
                    onClick={() => logout()}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/login')}
                    className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-green-200 hover:shadow-green-300 transform hover:-translate-y-0.5 transition-all duration-300"
                  >
                    Get Started
                  </button>
                </>
              )}
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
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 text-gray-600 hover:bg-green-50 hover:text-green-600 rounded-xl font-semibold transition-all duration-200"
            >
              {link.icon && <link.icon size={20} className="text-green-500" />}
              {link.name}
            </a>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-4 px-2">
            {isAuthenticated ? (
              <>
                  <button
                    onClick={() => { navigate('/my-orders'); setIsMobileMenuOpen(false); }}
                    className="px-4 py-3 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Package size={18} /> My Orders
                  </button>
                  <button
                    onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
                    className="px-4 py-3 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <User size={18} /> Profile
                  </button>
                <button
                  onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                  className="px-4 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-100 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  className="px-4 py-3 text-sm font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }}
                  className="px-4 py-3 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-100 transition-all duration-200"
                >
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;