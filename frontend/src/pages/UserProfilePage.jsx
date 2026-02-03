import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Phone, MapPin, Edit2, Save, X, Camera, 
  ShoppingBag, Heart, MessageSquare, Package, Award, TrendingUp,
  Lock, Bell, CreditCard, LogOut, ChevronRight, Eye, EyeOff, Loader2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const UserProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [originalData, setOriginalData] = useState({});

  const { user, logout } = useAuth();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setLoading(true);
      const response = await api.get('/auth/profile');
      const data = response.data;
      
      if (data.success) {
        const userData = {
          name: data.data.name,
          email: data.data.email,
          phone: data.data.phone,
          address: data.data.address,
          avatar: data.data.name.charAt(0).toUpperCase()
        };
        setProfileData(userData);
        setOriginalData(userData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setLoading(true);
      const response = await api.put('/auth/profile', profileData);
      const data = response.data;
      
      if (data.success) {
        setOriginalData(profileData);
        setIsEditing(false);
        alert('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      setLoading(true);
      setLoading(true);
      const response = await api.put('/auth/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      const data = response.data;
      
      if (data.success) {
        setShowPasswordModal(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        alert('Password changed successfully!');
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { icon: ShoppingBag, label: 'Orders', value: '24', color: 'blue' },
    { icon: Heart, label: 'Wishlist', value: '12', color: 'red' },
    { icon: MessageSquare, label: 'Messages', value: '8', color: 'green' },
    { icon: Award, label: 'Points', value: '1,250', color: 'purple' }
  ];

  const quickActions = [
    { icon: Package, label: 'My Orders', href: '/orders', color: 'blue' },
    { icon: Heart, label: 'Wishlist', href: '/wishlist', color: 'red' },
    { icon: MessageSquare, label: 'Messages', href: '/user-message', color: 'green' },
    { icon: MapPin, label: 'Addresses', href: '/addresses', color: 'orange' }
  ];

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: Lock, label: 'Change Password', action: () => setShowPasswordModal(true) },
        { icon: Bell, label: 'Notifications', href: '/settings/notifications' },
        { icon: CreditCard, label: 'Payment Methods', href: '/settings/payments' }
      ]
    },
    {
      title: 'Actions',
      items: [
        { icon: LogOut, label: 'Logout', action: () => { logout(); window.location.href = '/'; }, danger: true }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 mb-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <span className="text-5xl font-bold text-green-600">{profileData.avatar}</span>
              </div>
              <button className="absolute bottom-0 right-0 p-3 bg-green-500 hover:bg-green-600 rounded-full shadow-lg transition-colors">
                <Camera size={20} className="text-white" />
              </button>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{profileData.name}</h1>
              <p className="text-green-100 mb-4">{profileData.email}</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-semibold flex items-center gap-2">
                  <Award size={16} />
                  Gold Member
                </span>
                <span className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-semibold flex items-center gap-2">
                  <TrendingUp size={16} />
                  1,250 Points
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer">
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                <stat.icon className={`text-${stat.color}-600`} size={24} />
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Details */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'profile' 
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                    activeTab === 'activity' 
                      ? 'text-green-600 border-b-2 border-green-600 bg-green-50' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Recent Activity
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Personal Details</h3>
                      {!isEditing ? (
                        <button
                          onClick={handleEdit}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                        >
                          <Edit2 size={16} />
                          Edit Profile
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
                          >
                            <X size={16} />
                            Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
                          >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Save
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Full Name
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.name}
                            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                            <User size={20} className="text-gray-400" />
                            <span className="text-gray-900">{profileData.name}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                          <Mail size={20} className="text-gray-400" />
                          <span className="text-gray-900">{profileData.email}</span>
                          <span className="ml-auto px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Verified
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Phone Number
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={profileData.phone}
                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                            <Phone size={20} className="text-gray-400" />
                            <span className="text-gray-900">{profileData.phone}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Address
                        </label>
                        {isEditing ? (
                          <textarea
                            value={profileData.address}
                            onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                            rows="3"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        ) : (
                          <div className="flex items-start gap-3 px-4 py-3 bg-gray-50 rounded-xl">
                            <MapPin size={20} className="text-gray-400 mt-0.5" />
                            <span className="text-gray-900">{profileData.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'activity' && (
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                    {[
                      { action: 'Ordered', item: 'Organic Fertilizer 5kg', date: '2 hours ago', color: 'green' },
                      { action: 'Added to wishlist', item: 'Premium Seeds Pack', date: '1 day ago', color: 'red' },
                      { action: 'Messaged', item: 'Seller: GreenFarm Co.', date: '2 days ago', color: 'blue' },
                      { action: 'Reviewed', item: 'NPK Fertilizer', date: '3 days ago', color: 'yellow' }
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <div className={`w-10 h-10 bg-${activity.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                          <Package className={`text-${activity.color}-600`} size={20} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{activity.action}</p>
                          <p className="text-sm text-gray-600">{activity.item}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                  >
                    <div className={`w-10 h-10 bg-${action.color}-100 rounded-lg flex items-center justify-center`}>
                      <action.icon className={`text-${action.color}-600`} size={20} />
                    </div>
                    <span className="flex-1 text-left font-semibold text-gray-700 group-hover:text-gray-900">
                      {action.label}
                    </span>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-600" />
                  </button>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Settings</h3>
              {settingsSections.map((section, idx) => (
                <div key={idx} className="mb-4 last:mb-0">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    {section.title}
                  </p>
                  <div className="space-y-2">
                    {section.items.map((item, itemIdx) => (
                      <button
                        key={itemIdx}
                        onClick={item.action}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors group ${
                          item.danger 
                            ? 'bg-red-50 hover:bg-red-100' 
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon 
                          className={item.danger ? 'text-red-600' : 'text-gray-600'} 
                          size={20} 
                        />
                        <span className={`flex-1 text-left font-semibold ${
                          item.danger ? 'text-red-600' : 'text-gray-700 group-hover:text-gray-900'
                        }`}>
                          {item.label}
                        </span>
                        <ChevronRight size={20} className="text-gray-400 group-hover:text-gray-600" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 pr-12"
                  />
                  <button
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 pr-12"
                  />
                  <button
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Update Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;