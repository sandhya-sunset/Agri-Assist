import React, { useState, useEffect } from 'react';
import { Leaf, Shield, Loader, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/auth/Alert';
import OTPVerification from '../components/auth/OTPVerification';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import 'leaflet/dist/leaflet.css';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [registeredRole, setRegisteredRole] = useState('');
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

  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

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
        authLogin(data.data, data.data.token);
        
        // Redirect based on role
        setTimeout(() => {
          if (data.data.role === 'admin') {
            navigate('/admin');
          } else if (data.data.role === 'seller') {
            navigate('/seller-dashboard');
          } else {
            navigate('/home');
          }
        }, 1500);
      } else {
        if (data.requiresVerification) {
          setAlert({ type: 'error', message: data.message });
          if (data.message.includes('verify your email')) {
            setRegisteredEmail(formData.email);
            setTimeout(() => {
              setShowOtpVerification(true);
              setAlert(null);
            }, 2000);
          }
        } else {
          setAlert({ type: 'error', message: data.message || 'Login failed' });
        }
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
        if (data.data.requiresOTP) {
          // Regular user - needs OTP verification
          setAlert({ type: 'success', message: 'Registration successful! Please check your email for OTP.' });
          setRegisteredEmail(formData.email);
          setRegisteredRole(formData.role);
          
          setTimeout(() => {
            setShowOtpVerification(true);
            setAlert(null);
          }, 2000);
        } else {
          // Seller - pending admin verification
          setAlert({ type: 'success', message: 'Registration successful! Your account is pending admin verification.' });
          
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
          }, 3000);
        }
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

  const handleOtpVerified = () => {
    setShowOtpVerification(false);
    setIsLogin(true);
    setAlert({ type: 'success', message: 'Email verified! You can now login.' });
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
  };

  const handleSubmit = () => {
    if (isLogin) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  if (showOtpVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8">
          <OTPVerification 
            email={registeredEmail}
            userRole={registeredRole}
            onVerified={handleOtpVerified}
            onBack={() => {
              setShowOtpVerification(false);
              setAlert(null);
            }}
          />
        </div>
      </div>
    );
  }

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
                {/* Fixed Shield Icon */}
                <div className="flex items-start gap-3">
                  <div className="bg-green-500 p-2 rounded-lg mt-1">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Secure Verification</h3>
                    <p className="text-sm text-green-100">Email OTP & admin-verified sellers</p>
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
                  <LoginForm 
                    formData={formData}
                    handleChange={handleChange}
                    loading={loading}
                    handleSubmit={handleSubmit}
                  />
                ) : (
                  /* Register Form */
                  <RegisterForm 
                    formData={formData}
                    handleChange={handleChange}
                    loading={loading}
                    handleFileChange={handleFileChange}
                    setFormData={setFormData}
                    userLocation={userLocation}
                  />
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