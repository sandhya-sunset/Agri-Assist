import React, { useState, useEffect } from 'react';
import { Save, Upload, Bell, Lock, CreditCard, Store, Check, AlertCircle } from 'lucide-react';
import axios from 'axios';

const SettingsSection = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load profile');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (updatedData) => {
    try {
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('token');
      
      // If we are uploading a file (storeImage), we might need FormData, but for now assuming JSON for text fields first
      // Or if updatedData is FormData, use it directly
      
      let config = {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (updatedData instanceof FormData) {
        config.headers['Content-Type'] = 'multipart/form-data';
      }

      const res = await axios.put('http://localhost:5000/api/auth/profile', updatedData, config);
      setUser(res.data.data);
      setSuccess('Settings saved successfully!');
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update settings');
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: Store },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'payment', label: 'Payment', icon: CreditCard }
  ];

  if (loading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center gap-2">
          <Check size={20} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center gap-2">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-semibold transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && <ProfileSettings user={user} onUpdate={handleUpdateProfile} />}
          {activeTab === 'notifications' && <NotificationSettings user={user} onUpdate={handleUpdateProfile} />}
          {activeTab === 'security' && <SecuritySettings />}
          {activeTab === 'payment' && <PaymentSettings user={user} onUpdate={handleUpdateProfile} />}
        </div>
      </div>
    </div>
  );
};

const ProfileSettings = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: user.address || '',
    businessType: user.businessType || 'Retailer',
    storeDescription: user.storeDescription || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    onUpdate(formData); // Send plain object, controller handles it
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Store Information</h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-green-100 rounded-lg flex items-center justify-center overflow-hidden">
             {user.storeImage ? (
                <img src={`http://localhost:5000/${user.storeImage}`} alt="Store" className="w-full h-full object-cover" />
             ) : (
                <Store size={40} className="text-green-600" />
             )}
            </div>
            {/* <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Upload size={20} />
              Upload Logo
            </button> */}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">My Name / Store Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Business Type</label>
              <select 
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Distributor</option>
                <option value="Retailer">Retailer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Store Description</label>
            <textarea
              rows="4"
              name="storeDescription"
              value={formData.storeDescription}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          <Save size={20} />
          Save Changes
        </button>
      </div>
    </div>
  );
};

const NotificationSettings = ({ user, onUpdate }) => {
  const [settings, setSettings] = useState(user.notificationPreferences || {
    orderNotifications: true,
    messageNotifications: true,
    reviewNotifications: true,
    inventoryAlerts: true,
    marketingEmails: false,
    weeklyReports: true
  });

  const handleToggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    onUpdate({ notificationPreferences: settings });
  };

  const notificationOptions = [
    { key: 'orderNotifications', label: 'New Orders', description: 'Get notified when you receive new orders' },
    { key: 'messageNotifications', label: 'Customer Messages', description: 'Get notified about new messages from customers' },
    { key: 'reviewNotifications', label: 'Product Reviews', description: 'Get notified when customers leave reviews' },
    { key: 'inventoryAlerts', label: 'Low Stock Alerts', description: 'Get notified when products are running low' },
    { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive tips and promotional content' },
    { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly sales and analytics reports' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-800">{option.label}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              <button
                onClick={() => handleToggle(option.key)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  settings[option.key] ? 'bg-green-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute w-5 h-5 bg-white rounded-full transition-transform top-0.5 ${
                    settings[option.key] ? 'right-0.5' : 'left-0.5'
                  }`}
                ></span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          <Save size={20} />
          Save Preferences
        </button>
      </div>
    </div>
  );
};

const SecuritySettings = () => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [msg, setMsg] = useState('');

    const handleChange = (e) => {
        setPasswords({...passwords, [e.target.name]: e.target.value});
    }

    const handleUpdate = async () => {
        if(passwords.newPassword !== passwords.confirmPassword) {
            setMsg('New passwords do not match');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            await axios.put('http://localhost:5000/api/auth/update-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMsg('Password updated successfully');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: ''});
        } catch (err) {
            setMsg(err.response?.data?.message || 'Failed to update password');
        }
    }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        {msg && <p className={`mb-4 ${msg.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{msg}</p>}
        
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={passwords.currentPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={passwords.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
            <input
               type="password"
              name="confirmPassword"
              value={passwords.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button 
            onClick={handleUpdate}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Update Password
          </button>
        </div>
      </div>

    </div>
  );
};

const PaymentSettings = ({ user, onUpdate }) => {
    const [payment, setPayment] = useState(user.paymentDetails || {
        accountName: '',
        bankName: '',
        accountNumber: '',
        routingNumber: '',
        payoutSchedule: 'Weekly'
    });

    const handleChange = (e) => {
        setPayment({ ...payment, [e.target.name]: e.target.value });
    }

    const handleSave = () => {
        onUpdate({ paymentDetails: payment });
    }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Bank Account Details</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Holder Name</label>
              <input
                type="text"
                name="accountName"
                value={payment.accountName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                name="bankName"
                value={payment.bankName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={payment.accountNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Routing Number</label>
              <input
                type="text"
                name="routingNumber"
                value={payment.routingNumber}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Payout Schedule</h3>
        <div className="max-w-md">
          <select 
            name="payoutSchedule"
            value={payment.payoutSchedule}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <p className="text-sm text-gray-500 mt-2">Choose how frequently you want to receive payouts</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
           onClick={handleSave}
           className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
        >
          <Save size={20} />
          Save Payment Details
        </button>
      </div>
    </div>
  );
};

export default SettingsSection;