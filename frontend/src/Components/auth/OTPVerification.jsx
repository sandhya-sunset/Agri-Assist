import React, { useState, useEffect } from 'react';
import { Shield, Loader } from 'lucide-react';
import Alert from './Alert';

// We need to pass API_BASE_URL or import it. Assuming it's passed or defined here to match Login.jsx style.
// Best practice: Import from config or const file. For now, duplication or props is fine.
const API_BASE_URL = 'http://localhost:5000/api';

function OTPVerification({ email, onVerified, onBack, userRole }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      value = value[0];
    }
    
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    
    const nextIndex = Math.min(pastedData.length, 5);
    document.getElementById(`otp-${nextIndex}`)?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setAlert({ type: 'error', message: 'Please enter complete OTP' });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          otp: otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'Email verified successfully!' });
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
        
        setTimeout(() => {
          onVerified();
        }, 1500);
      } else {
        setAlert({ type: 'error', message: data.message || 'Invalid OTP' });
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: 'success', message: 'OTP sent successfully!' });
        setResendTimer(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
      } else {
        setAlert({ type: 'error', message: data.message || 'Failed to resend OTP' });
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setAlert({ type: 'error', message: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-green-600 mb-6 transition"
      >
        <div className="w-4 h-4" >←</div>
        Back to registration
      </button>

      <div className="text-center mb-8">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to<br />
          <span className="font-semibold text-green-600">{email}</span>
        </p>
      </div>

      {alert && (
        <Alert 
          type={alert.type} 
          message={alert.message} 
          onClose={() => setAlert(null)} 
        />
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
            Enter OTP
          </label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition"
                disabled={loading}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== 6}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify Email'
          )}
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={!canResend || loading}
            className="text-green-600 hover:text-green-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default OTPVerification;
