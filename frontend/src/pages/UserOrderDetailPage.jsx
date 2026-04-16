import React, { useState, useEffect } from "react";
import {
  Package,
  Truck,
  Calendar,
  MapPin,
  ChevronLeft,
  CreditCard,
  User,
  Mail,
  Phone,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../Components/Navbar";
import api from "../services/api";
import { useToast } from "../components/Toast";

const UserOrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [initiatingPayment, setInitiatingPayment] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchOrderDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      if (response.data.success) {
        setOrder(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      addToast("Failed to load order details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    try {
      setCancelling(true);
      const response = await api.put(`/orders/${id}/cancel`, {
        reason: "User requested cancellation",
      });
      if (response.data.success) {
        setOrder(response.data.data);
        addToast("Order cancelled successfully", "success");
        setShowCancelConfirm(false);
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      addToast(
        error.response?.data?.message || "Failed to cancel order",
        "error",
      );
    } finally {
      setCancelling(false);
    }
  };

  const handleRetryPayment = async () => {
    try {
      setInitiatingPayment(true);
      const initiateRes = await api.post(`/orders/${id}/payment/khalti/initiate`);
      
      if (initiateRes.data.success && initiateRes.data.data.payment_url) {
        window.location.href = initiateRes.data.data.payment_url;
      } else {
        addToast("Failed to initiate payment. Please check your config.", "error");
      }
    } catch (error) {
      console.error("Payment retry error:", error);
      addToast(error.response?.data?.message || "Payment service unavailable.", "error");
    } finally {
      setInitiatingPayment(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700 border-green-200";
      case "Processing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Shipped":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  const getStepStatus = (step) => {
    if (!order) return "gray";
    const statusOrder = ["Processing", "Shipped", "Delivered"];
    const currentStatusIndex = statusOrder.indexOf(order.status);
    const stepIndex = statusOrder.indexOf(step);

    if (order.status === "Cancelled") return "red";
    if (currentStatusIndex >= stepIndex) return "green";
    return "gray";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <Package size={64} className="text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Order Not Found
        </h2>
        <p className="text-gray-500 mb-6">
          The order you're looking for doesn't exist or you don't have
          permission to view it.
        </p>
        <Link
          to="/my-orders"
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/my-orders"
          className="inline-flex items-center text-gray-500 hover:text-green-600 mb-6 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back to My Orders</span>
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Order #{order._id.slice(-8).toUpperCase()}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}
                >
                  {order.status}
                </span>
              </div>
              <p className="text-gray-500 flex items-center gap-2">
                <Calendar size={16} />
                Placed on {new Date(
                  order.createdAt,
                ).toLocaleDateString()} at{" "}
                {new Date(order.createdAt).toLocaleTimeString()}
              </p>
            </div>

            {/* Progress Bar (Simple Visual) */}
            {order.status !== "Cancelled" && (
              <div className="flex items-center gap-2 text-sm">
                {["Processing", "Shipped", "Delivered"].map((step, idx) => (
                  <React.Fragment key={step}>
                    <div
                      className={`flex flex-col items-center gap-1 ${getStepStatus(step) === "green" ? "text-green-600" : "text-gray-400"}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${getStepStatus(step) === "green" ? "border-green-600 bg-green-50" : "border-gray-300 bg-white"}`}
                      >
                        {idx + 1}
                      </div>
                      <span className="font-medium">{step}</span>
                    </div>
                    {idx < 2 && (
                      <div
                        className={`w-12 h-0.5 ${getStepStatus(step) === "green" && getStepStatus(["Processing", "Shipped", "Delivered"][idx + 1]) === "green" ? "bg-green-600" : "bg-gray-300"} -mt-5`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {order.paymentMethod === "Khalti" && order.paymentStatus === "Pending" && order.status !== "Cancelled" && (
                <button
                  onClick={handleRetryPayment}
                  disabled={initiatingPayment}
                  className="px-4 py-2 bg-[#5C2D91] text-white rounded-lg hover:bg-[#4a2474] font-medium transition-colors flex items-center gap-2"
                >
                  {initiatingPayment && <Loader2 size={16} className="animate-spin" />}
                  Pay via Khalti
                </button>
              )}
              
              {(order.status === "Processing" || order.status === "Pending") && (
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50 p-4 w-full h-full"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Cancel Order?
              </h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to cancel this order? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  No, Keep it
                </button>
                <button
                  onClick={handleCancelOrder}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2"
                  disabled={cancelling}
                >
                  {cancelling && <Loader2 size={16} className="animate-spin" />}
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingBag size={18} />
                  Items ({order.items.length})
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {order.items.map((item) => (
                  <div key={item._id} className="p-4 flex gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center relative border border-gray-200">
                      {item.deal && item.deal.images && item.deal.images.length > 1 ? (
                        <>
                          <div className="absolute z-10 bg-red-600 text-white text-[6px] font-bold px-2 py-0.5 uppercase tracking-wider transform -rotate-6 shadow-sm">
                            Combo
                          </div>
                          <div className="flex items-center justify-center w-full gap-1 p-1">
                            {item.deal.images.slice(0, 2).map((img, i) => (
                              <div 
                                key={i} 
                                className={`w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-md shadow-sm border border-gray-100 p-0.5 transform ${i === 0 ? '-rotate-6' : 'rotate-6 z-0'}`}
                              >
                                <img
                                  src={img.startsWith("http") ? img : `http://localhost:5000/${img.replace(/\\/g, "/")}`}
                                  alt={`${item.deal.title} item ${i + 1}`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <img
                          src={
                            item.deal 
                            ? (item.deal.image || item.deal.images?.[0] || "").startsWith("http") 
                              ? (item.deal.image || item.deal.images?.[0] || "") 
                              : `http://localhost:5000/${(item.deal.image || item.deal.images?.[0] || "").replace(/\\/g, "/")}`
                            : (item.product?.image || "").startsWith("http")
                              ? (item.product?.image || "")
                              : `http://localhost:5000/${(item.product?.image || "").replace(/\\/g, "/")}`
                          }
                          alt={item.deal ? item.deal.title : item.product?.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/150";
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {item.deal ? item.deal.title : item.product?.name}
                        {item.deal && <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">Combo Offer</span>}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-green-600 font-semibold mt-1">
                        Rs. {item.price.toFixed(2)}
                      </p>
                    </div>
                    {order.status === "Delivered" && !item.deal && item.product && (
                      <div className="flex items-center">
                        <Link 
                           to={`/product/${item.product._id}`}
                           className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg text-sm font-semibold transition-colors border border-green-200"
                        >
                          Write a Review
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard size={18} />
                  Payment Details
                </h3>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Method</span>
                  <span className="font-medium text-gray-900">
                    {order.paymentMethod}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Payment Status</span>
                  <span
                    className={`font-medium ${order.paymentStatus === "Completed" ? "text-green-600" : "text-yellow-600"}`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium text-gray-900">
                    Rs.{" "}
                    {(order.totalAmount - (order.shippingFee || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping Fee</span>
                  <span className="font-medium text-gray-900">
                    {order.shippingFee === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      `Rs. ${order.shippingFee.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    Total Amount
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    Rs. {order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Info Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Truck size={18} />
                  Shipping Details
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Shipping Address
                  </p>
                  <p className="text-gray-900 text-sm">
                    {order.shippingAddress || "Kathmandu, Nepal"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Customer
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <User size={14} className="text-gray-400" />
                    {order.user.name}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-900 mt-1">
                    <Mail size={14} className="text-gray-400" />
                    {order.user.email}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOrderDetailPage;
