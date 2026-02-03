import React, { useState } from 'react';
import { Save, User, Lock, Bell, Globe, Shield, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';

const SettingsView = () => {
  const [settings, setSettings] = useState({
    // Profile Settings
    adminName: 'Admin',
    adminEmail: 'admin@agriassist.com',
    
    // Notification Settings
    emailNotifications: true,
    orderNotifications: true,
    sellerNotifications: true,
    userNotifications: true,
    
    // System Settings
    maintenanceMode: false,
    autoApproveProducts: false,
    requireEmailVerification: true,
    
    // Security Settings
    twoFactorAuth: false,
    sessionTimeout: 30,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = () => {
    // TODO: API call to save settings
    toast.success('Settings saved successfully!');
  };

  const handleChangePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters!');
      return;
    }
    // TODO: API call to change password
    toast.success('Password changed successfully!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        <p className="text-gray-500 mt-1">Manage your admin account and system preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Profile Settings</h3>
                <p className="text-sm text-gray-500">Update your personal information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Name
                </label>
                <input
                  type="text"
                  value={settings.adminName}
                  onChange={(e) => handleSettingChange('adminName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Password Change */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <Lock size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Change Password</h3>
                <p className="text-sm text-gray-500">Update your password regularly for security</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={handleChangePassword}
                className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors"
              >
                Change Password
              </button>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bell size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Notification Preferences</h3>
                <p className="text-sm text-gray-500">Choose what notifications you want to receive</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive notifications via email' },
                { key: 'orderNotifications', label: 'Order Notifications', desc: 'Get notified about new orders' },
                { key: 'sellerNotifications', label: 'Seller Notifications', desc: 'Get notified about seller registrations' },
                { key: 'userNotifications', label: 'User Notifications', desc: 'Get notified about new user registrations' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings[item.key]}
                      onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* System Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Globe size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">System Settings</h3>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Put site in maintenance mode' },
                { key: 'autoApproveProducts', label: 'Auto Approve Products', desc: 'Automatically approve new products' },
                { key: 'requireEmailVerification', label: 'Email Verification', desc: 'Require email verification for users' },
              ].map((item) => (
                <div key={item.key} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-2">
                      <input
                        type="checkbox"
                        checked={settings[item.key]}
                        onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Shield size={24} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Security</h3>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">Two-Factor Authentication</p>
                    <p className="text-xs text-gray-500 mt-1">Add extra security to your account</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={settings.twoFactorAuth}
                      onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Session Timeout (minutes)
                </label>
                <input
                  type="number"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  min="5"
                  max="120"
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveSettings}
            className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
