import React from 'react';
import { Mail, Lock } from 'lucide-react';

const LoginForm = ({ formData, handleChange, loading, handleSubmit }) => {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="your@email.com"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="••••••••"
            disabled={loading}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 text-green-600 rounded" />
          <span className="text-gray-600">Remember me</span>
        </label>
        <a href="#" className="text-green-600 hover:text-green-700 font-medium">
          Forgot password?
        </a>
      </div>
    </>
  );
};

export default LoginForm;
