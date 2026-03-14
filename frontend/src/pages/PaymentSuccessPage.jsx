import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { CheckCircle, Loader2 } from "lucide-react";

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("verifying");
  const navigate = useNavigate();

  useEffect(() => {
    // Khalti payment verification to be implemented by user
    // For now, simulate success
    const timer = setTimeout(() => {
      setStatus("success");
      setTimeout(() => navigate("/home"), 3000);
    }, 0);
    return () => clearTimeout(timer);
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center h-[calc(100vh-80px)]">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
          {status === "verifying" && (
            <>
              <Loader2
                className="animate-spin text-purple-600 mx-auto mb-4"
                size={48}
              />
              <h2 className="text-xl font-bold text-gray-900">
                Verifying Payment...
              </h2>
              <p className="text-gray-500 mt-2">
                Please wait while we confirm your transaction.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
                <CheckCircle size={32} />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                Payment Successful!
              </h2>
              <p className="text-gray-500 mt-2">
                Your order has been placed successfully.
              </p>
              <p className="text-sm text-gray-400 mt-4">
                Redirecting to Home...
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
