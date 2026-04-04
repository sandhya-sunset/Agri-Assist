import React, { useState } from "react";
import { Mail, Key, Loader, Shield, Lock } from "lucide-react";
import Alert from "./Alert";

const API_BASE_URL = "http://localhost:5000/api";

function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      setAlert({ type: "error", message: "Please enter your email" });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: "success", message: "OTP sent to your email!" });
        setStep(2);
      } else {
        setAlert({ type: "error", message: data.message || "Failed to send OTP" });
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setAlert({ type: "error", message: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

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
      document.getElementById(`reset-otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`reset-otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(pastedData.length, 5);
    document.getElementById(`reset-otp-${nextIndex}`)?.focus();
  };

  const handleResetPassword = async () => {
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setAlert({ type: "error", message: "Please enter complete OTP" });
      return;
    }
    if (newPassword.length < 6) {
      setAlert({ type: "error", message: "Password must be at least 6 characters" });
      return;
    }

    setLoading(true);
    setAlert(null);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp: otpCode,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ type: "success", message: "Password reset successful! You can now login." });
        setTimeout(() => {
          onBack();
        }, 2000);
      } else {
        setAlert({ type: "error", message: data.message || "Failed to reset password" });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setAlert({ type: "error", message: "Network error. Please try again." });
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
        <div className="w-4 h-4">←</div>
        Back to login
      </button>

      <div className="text-center mb-8">
        <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          {step === 1 ? (
            <Key className="w-8 h-8 text-green-600" />
          ) : (
            <Shield className="w-8 h-8 text-green-600" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {step === 1 ? "Forgot Password" : "Reset Password"}
        </h2>
        <p className="text-gray-600">
          {step === 1
            ? "Enter your email address to receive a secure OTP to reset your password."
            : "Enter the 6-digit code sent to your email and your new password."}
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {step === 1 ? (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>
          </div>

          <button
            onClick={handleSendOtp}
            disabled={loading || !email.trim()}
            className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send Reset OTP"
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Enter OTP
            </label>
            <div className="flex gap-2 justify-center mb-4">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`reset-otp-${index}`}
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

            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative mb-6">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleResetPassword}
              disabled={loading || otp.join("").length !== 6 || !newPassword}
              className="w-full bg-linear-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
            <div className="text-center mt-4">
              <button
                onClick={() => setStep(1)}
                disabled={loading}
                className="text-green-600 hover:text-green-700 font-semibold text-sm disabled:opacity-50 transition"
              >
                Change Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgotPassword;
