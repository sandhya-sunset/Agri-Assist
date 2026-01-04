import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { Leaf, Mail, Lock, User, Phone, MapPin, Upload, Building2, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in react-leaflet
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

function LocationPicker({ position, setPosition }) {
  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  return (
    <div className="h-64 w-full rounded-lg overflow-hidden border-2 border-green-200 relative">
      <MapContainer
        center={position}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <MapEvents />
        {position && <Marker position={position} />}
      </MapContainer>
      <div className="absolute top-2 left-2 bg-white px-3 py-1 rounded-lg shadow-md z-[1000] text-xs">
        <span className="text-gray-600">Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}</span>
      </div>
    </div>
  );
}

function Alert({ type, message, onClose }) {
  const isError = type === 'error';
  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl mb-4 ${
      isError ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
    }`}>
      {isError ? (
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className={`text-sm font-medium ${isError ? 'text-red-800' : 'text-green-800'}`}>
          {message}
        </p>
      </div>
      <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
        ×
      </button>
    </div>
  );
}

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    address: '',
    phone: '',
    location: [27.7172, 85.3240], // Default: Kathmandu
    citizenshipFront: null,
    citizenshipBack: null,
  });

  // Get user's real-time location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = [position.coords.latitude, position.coords.longitude];
          setUserLocation(userLoc);
          setFormData(prev => ({ ...prev, location: userLoc }));
        },
        (error) => {
          console.log('Location access denied or unavailable:', error);
          // Keep default location if user denies
        }
      );
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setAlert({ type: 'error', message: 'File size must be less than 5MB' });
        return;
      }
      setFormData(prev => ({ ...prev, [field]: file }));
    }
  };

  const validateForm = () => {
    if (!isLogin) {
      if (!formData.name.trim()) {
        setAlert({ type: 'error', message: 'Name is required' });
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setAlert({ type: 'error', message: 'Passwords do not match' });
        return false;
      }
      if (formData.password.length < 6) {
        setAlert({ type: 'error', message: 'Password must be at least 6 characters' });
        return false;
      }
      if (!formData.phone.trim()) {
        setAlert({ type: 'error', message: 'Phone number is required' });
        return false;
      }
      if (!formData.address.trim()) {
        setAlert({ type: 'error', message: 'Address is required' });
        return false;
      }
      if (formData.role === 'seller') {
        if (!formData.citizenshipFront || !formData.citizenshipBack) {
          setAlert({ type: 'error', message: 'Both citizenship photos are required for sellers' });
          return false;
        }
      }
    }
    
    if (!formData.email.trim()) {
      setAlert({ type: 'error', message: 'Email is required' });
      return false;
    }
    if (!formData.password.trim()) {
      setAlert({ type: 'error', message: 'Password is required' });
      return false;
    }
    
    return true;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Login successful!' });
        // Store token in localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Redirect after 1.5 seconds
        setTimeout(() => {
          console.log('Redirecting to dashboard...');
          // window.location.href = '/dashboard';
        }, 1500);
      } else {
        setAlert({ type: 'error', message: data.message || 'Login failed' });
      }
    } catch (error) {
      console.error('Login error:', error);
      setAlert({ type: 'error', message: 'Network error. Please check if the server is running.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setAlert(null);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('confirmPassword', formData.confirmPassword);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('address', formData.address);
      formDataToSend.append('role', formData.role);

      if (formData.role === 'seller') {
        formDataToSend.append('citizenshipFront', formData.citizenshipFront);
        formDataToSend.append('citizenshipBack', formData.citizenshipBack);
        // Convert [lat, lng] to [lng, lat] for MongoDB
        formDataToSend.append('location[coordinates][0]', formData.location[1].toString());
        formDataToSend.append('location[coordinates][1]', formData.location[0].toString());
      }

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Registration successful! Please login.' });
        // Store token
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        // Switch to login after 2 seconds
        setTimeout(() => {
          setIsLogin(true);
          // Reset form
          setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: 'user',
            address: '',
            phone: '',
            location: userLocation || [27.7172, 85.3240],
            citizenshipFront: null,
            citizenshipBack: null,
          });
        }, 2000);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setAlert({ type: 'error', message: data.errors.map(e => e.message).join(', ') });
        } else {
          setAlert({ type: 'error', message: data.message || 'Registration failed' });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      setAlert({ type: 'error', message: 'Network error. Please check if the server is running.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="bg-green-600 p-3 rounded-2xl shadow-lg">
              <Leaf className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-green-800">AgriAssist</h1>
          </div>
          <p className="text-gray-600">Smart Fertilizer Marketplace with AI-Powered Plant Care</p>
        </div>

        {/* Auth Container */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="grid md:grid-cols-5">
            {/* Side Panel */}
            <div className="md:col-span-2 bg-gradient-to-br from-green-600 to-emerald-700 p-8 text-white flex flex-col justify-center">
              <h2 className="text-3xl font-bold mb-4">
                {isLogin ? 'Welcome Back!' : 'Join AgriAssist'}
              </h2>
              <p className="text-green-100 mb-8">
                {isLogin 
                  ? 'Access your account to manage orders, analyze plant diseases, and buy quality fertilizers.'
                  : 'Create an account to start selling or buying fertilizers, and use our AI-powered plant disease detection.'}
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 p-2 rounded-lg mt-1">
                    <Leaf className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">AI Disease Detection</h3>
                    <p className="text-sm text-green-100">Upload plant photos for instant diagnosis</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 p-2 rounded-lg mt-1">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Multi-Vendor Marketplace</h3>
                    <p className="text-sm text-green-100">Buy from trusted sellers nationwide</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Panel */}
            <div className="md:col-span-3 p-8">
              {/* Toggle Buttons */}
              <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setAlert(null);
                  }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    isLogin 
                      ? 'bg-white text-green-600 shadow-md' 
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setAlert(null);
                  }}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    !isLogin 
                      ? 'bg-white text-green-600 shadow-md' 
                      : 'text-gray-600 hover:text-green-600'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Alert Messages */}
              {alert && (
                <Alert 
                  type={alert.type} 
                  message={alert.message} 
                  onClose={() => setAlert(null)} 
                />
              )}

              <div className="space-y-5">
                {/* Login Form */}
                {isLogin ? (
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
                ) : (
                  /* Register Form */
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
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      {isLogin ? 'Logging in...' : 'Creating Account...'}
                    </>
                  ) : (
                    <>{isLogin ? 'Login to AgriAssist' : 'Create Account'}</>
                  )}
                </button>
              </div>

              <p className="text-center text-sm text-gray-600 mt-6">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setAlert(null);
                  }}
                  className="text-green-600 hover:text-green-700 font-semibold"
                  disabled={loading}
                >
                  {isLogin ? 'Register now' : 'Login here'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #10b981;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #059669;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}