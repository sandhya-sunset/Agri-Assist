import React from 'react';
import { User, Mail, Phone, Lock, MapPin, Upload } from 'lucide-react';
import LocationPicker from './LocationPicker';

const RegisterForm = ({ 
  formData, 
  handleChange, 
  loading, 
  handleFileChange, 
  setFormData, 
  userLocation 
}) => {
  return (
    <div className="max-h-[500px] overflow-y-auto pr-2 space-y-5 custom-scrollbar">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="John Doe"
            disabled={loading}
          />
        </div>
      </div>

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
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="+977 9800000000"
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
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
            placeholder="••••••••"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Register As
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
          disabled={loading}
        >
          <option value="user">Buyer</option>
          <option value="seller">Seller</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition resize-none"
            placeholder="Street, City, District"
            rows="2"
            disabled={loading}
          />
        </div>
      </div>

      {formData.role === 'seller' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Citizenship Front Photo
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-500 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'citizenshipFront')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-700">
                    {formData.citizenshipFront 
                      ? formData.citizenshipFront.name 
                      : 'Upload citizenship front'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Citizenship Back Photo
            </label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-4 hover:border-green-500 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'citizenshipBack')}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={loading}
              />
              <div className="flex items-center gap-3">
                <Upload className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-700">
                    {formData.citizenshipBack 
                      ? formData.citizenshipBack.name 
                      : 'Upload citizenship back'}
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pin Your Location {userLocation && <span className="text-green-600 text-xs">(Auto-detected)</span>}
            </label>
            <LocationPicker 
              position={formData.location} 
              setPosition={(pos) => setFormData(prev => ({ ...prev, location: pos }))}
            />
            <p className="text-xs text-gray-500 mt-2">
              Click on the map to set your shop location or we'll use your current location
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default RegisterForm;
