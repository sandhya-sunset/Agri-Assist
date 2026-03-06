import React, { useState, useEffect } from "react";
import { Lock, Shield, Loader2, ArrowRight } from "lucide-react";
import Navbar from "../components/Navbar";
import api from "../services/api";
import LocationPicker from "../components/LocationPicker";
import { MapPin } from "lucide-react";

const PaymentPage = () => {
  const [loading, setLoading] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [hasSale, setHasSale] = useState(false);
  const [fetchingCart, setFetchingCart] = useState(true);
  const [location, setLocation] = useState(null);

  const ORIGIN_LAT = 26.541;
  const ORIGIN_LNG = 87.2785;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    fetchCartTotal();
  }, []);

  const fetchCartTotal = async () => {
    try {
      const response = await api.get("/cart");
      if (response.data.success) {
        const data = response.data.data;
        setCartTotal(data.totalAmount);
        const hasDiscountItem = data.items.some(
          (item) =>
            item.product && item.product.discount && item.product.discount > 0,
        );
        setHasSale(hasDiscountItem);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setFetchingCart(false);
    }
  };

  useEffect(() => {
    if (location && cartTotal > 0) {
      if (hasSale) {
        setShippingFee(0);
      } else {
        const distance = calculateDistance(
          ORIGIN_LAT,
          ORIGIN_LNG,
          location.lat,
          location.lng,
        );
        let fee = 0;
        if (distance <= 20) {
          fee = 50;
        } else if (distance <= 50) {
          fee = 80;
        } else if (distance <= 150) {
          fee = 100;
        } else if (distance <= 300) {
          fee = 150;
        } else {
          fee = 200;
        }
        setShippingFee(fee);
      }
    } else {
      setShippingFee(0);
    }
  }, [location, hasSale, cartTotal]);

  const totalPayable = cartTotal + shippingFee;

  const handlePayment = async () => {
    try {
      setLoading(true);

      // 1. Create Order (paymentStatus starts as 'Pending')
      const orderPayload = {
        paymentMethod: "Khalti",
        shippingAddress: location.address,
        shippingFee: shippingFee,
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
      };

      const orderRes = await api.post("/orders", orderPayload);

      if (orderRes.data.success) {
        const orderId = orderRes.data.data._id;

        // 2. Initiate Khalti e-Payment via backend
        const initiateRes = await api.post(
          `/orders/${orderId}/payment/khalti/initiate`,
        );

        if (initiateRes.data.success && initiateRes.data.data.payment_url) {
          // 3. Redirect to Khalti hosted payment page
          window.location.href = initiateRes.data.data.payment_url;
        } else {
          alert("Failed to initiate Khalti payment.");
          setLoading(false);
        }
      } else {
        alert(orderRes.data.message || "Failed to place order.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Payment flow error:", error);
      alert(
        error?.response?.data?.message ||
          "Something went wrong during checkout.",
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="p-6 bg-[#5C2D91] text-white flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Lock className="text-white" size={20} />
                Khalti Secure Payment
              </h1>
              <p className="text-white/80 text-sm mt-1">
                Merchant: AgriAssist Nepal
              </p>
            </div>
            <div className="bg-white/20 p-2 rounded-lg text-right">
              <span className="text-xs font-bold block opacity-80">
                TOTAL TO PAY
              </span>
              <span className="text-xl font-bold">
                Rs. {fetchingCart ? "..." : totalPayable.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="p-8 md:p-12 text-center">
            <div
              className="w-32 h-12 bg-contain bg-no-repeat bg-center mx-auto mb-8"
              style={{
                backgroundImage:
                  "url('https://khalti.com/static/khalti-logo.svg')",
              }}
            >
              <span className="sr-only">Khalti</span>
            </div>

            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              You will complete your payment via Khalti securely.
            </p>

            <div className="text-left mb-8">
              <div className="flex items-center gap-2 mb-2 font-bold text-gray-700">
                <MapPin size={20} className="text-purple-600" />
                Confirm Delivery Location
              </div>
              <LocationPicker onLocationSelect={setLocation} />
              {location ? (
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm font-semibold text-gray-800 mb-1">
                    Delivery to:{" "}
                    <span className="text-purple-700">{location.address}</span>
                  </p>
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      Rs. {cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-600">Shipping Fee:</span>
                    {hasSale ? (
                      <span className="font-bold text-purple-600">
                        Free (Sale Applied!)
                      </span>
                    ) : (
                      <span className="font-medium">
                        Rs. {shippingFee.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between text-base font-bold text-gray-900 border-t border-purple-200 mt-2 pt-2">
                    <span>Total Payable:</span>
                    <span>Rs. {totalPayable.toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-red-500 mt-2 font-semibold">
                  * Please pin your delivery location on the map to calculate
                  shipping
                </p>
              )}
            </div>

            <button
              onClick={handlePayment}
              disabled={loading || fetchingCart || !location}
              className="w-full max-w-xs mx-auto py-4 bg-[#5C2D91] hover:bg-[#4a2474] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Shield size={20} />
              )}
              {loading ? "Processing..." : "Pay via Khalti"}
              {!loading && (
                <ArrowRight
                  className="group-hover:translate-x-1 transition-transform"
                  size={18}
                />
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-8 pt-6 border-t border-gray-100">
              <Shield size={12} />
              Secured by Khalti | PCI-DSS Compliant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
