import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import { CheckCircle, XCircle, Loader2, ShoppingBag } from "lucide-react";
import api from "../Services/api";

/**
 * This page is the return_url target after Khalti e-Payment.
 * Khalti redirects here with query params:
 *   ?pidx=...&status=Completed&transaction_id=...&amount=...&purchase_order_id=...
 */
const KhaltiPaymentCallbackPage = () => {
  const { id } = useParams(); // orderId from the URL
  const [searchParams] = useSearchParams(); // Khalti callback params
  const navigate = useNavigate();

  const [state, setState] = useState("verifying"); // 'verifying' | 'success' | 'failed'
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const confirmPayment = async () => {
      const pidx = searchParams.get("pidx");
      const status = searchParams.get("status");

      if (!pidx) {
        setState("failed");
        setErrorMsg("No payment identifier received from Khalti.");
        return;
      }

      if (status && status !== "Completed") {
        setState("failed");
        setErrorMsg(`Payment was not completed. Status: ${status}`);
        return;
      }

      try {
        await api.put(`/orders/${id}/payment/khalti/confirm`, { pidx });
        setState("success");

        // Redirect to the order detail page after 3 seconds
        setTimeout(() => navigate(`/order/${id}`), 3000);
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          "Payment confirmation failed. Please contact support.";
        setErrorMsg(msg);
        setState("failed");
      }
    };

    confirmPayment();
  }, [id, searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 sm:px-6 lg:px-8 py-8 text-sm sm:text-base">
        <div className="bg-white p-6 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-xl max-w-[90%] sm:max-w-md w-full text-center">
          {/* Verifying */}
          {state === "verifying" && (
            <>
              <div className="flex items-center justify-center mb-4 sm:mb-5">
                <Loader2 className="animate-spin text-purple-600" size={48} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Verifying Payment
              </h2>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                Please wait while we confirm your Khalti transaction...
              </p>
            </>
          )}

          {/* Success */}
          {state === "success" && (
            <>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <CheckCircle className="text-green-600 w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Payment Successful!
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mb-1">
                Your order has been confirmed.
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-3 sm:mt-4">
                Redirecting to your order details...
              </p>

              <button
                onClick={() => navigate(`/order/${id}`)}
                className="mt-5 sm:mt-6 w-full py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg sm:rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <ShoppingBag size={18} className="sm:w-5 sm:h-5" />
                View Order
              </button>
            </>
          )}

          {/* Failed */}
          {state === "failed" && (
            <>
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-5">
                <XCircle className="text-red-600 w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Payment Failed
              </h2>
              <p className="text-sm sm:text-base text-gray-500 mb-4 leading-relaxed px-2">
                {errorMsg || "Your Khalti payment could not be completed."}
              </p>

              <div className="space-y-2.5 sm:space-y-3 mt-3 sm:mt-4">
                <button
                  onClick={() => navigate("/my-orders")}
                  className="w-full py-2.5 sm:py-3 bg-red-600 text-white rounded-lg sm:rounded-xl font-bold hover:bg-red-700 transition-all active:scale-[0.98]"
                >
                  View My Orders
                </button>
                <button
                  onClick={() => navigate("/cart")}
                  className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-lg sm:rounded-xl font-bold hover:bg-gray-200 transition-all active:scale-[0.98]"
                >
                  Return to Cart &amp; Try Again
                </button>
              </div>

              <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-gray-100">
                <p className="text-xs sm:text-sm text-gray-400">
                  Need help?{" "}
                  <a
                    href="mailto:support@agriassist.com"
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    Contact Support
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default KhaltiPaymentCallbackPage;
