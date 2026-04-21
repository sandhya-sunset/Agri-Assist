import React, { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Shield,
  Truck,
  Package,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [cart, setCart] = useState({ items: [], totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await api.get("/cart");
      setCart(response.data.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, newQuantity) => {
    try {
      if (newQuantity < 1) return;
      await api.put(`/cart/${itemId}`, { quantity: newQuantity });
      fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await api.delete(`/cart/${itemId}`);
      fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-24 flex justify-center items-center h-[calc(100vh-6rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <ShoppingBag className="text-green-600" />
          Shopping Cart ({cart.items.length} items)
        </h1>

        {cart.items.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-12 text-center border border-gray-100">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={48} className="text-green-200" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 mb-8">
              Looks like you haven't added anything yet.
            </p>
            <button
              onClick={() => navigate("/products")}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-all duration-300"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item._id}
                  className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-6 transition-all duration-300 hover:shadow-md"
                >
                  <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
                    {item.deal && item.deal.images && item.deal.images.length > 1 ? (
                      <>
                        <div className="absolute z-10 bg-red-600 text-white text-[8px] font-bold px-3 py-0.5 uppercase tracking-wider transform -rotate-6 shadow-sm">
                          Combo
                        </div>
                        <div className="flex items-center justify-center w-full gap-1 p-1">
                          {item.deal.images.slice(0, 2).map((img, i) => (
                            <div 
                              key={i} 
                              className={`w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-md shadow-sm border border-gray-100 p-1 transform ${i === 0 ? '-rotate-6' : 'rotate-6 z-0'}`}
                            >
                              <img
                                  src={img && (img.startsWith("http") || img.startsWith("data:")) ? img : (img ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${img.replace(/\\/g, "/")}` : "https://via.placeholder.com/150?text=Combo")}
                                  alt={`${item.deal.title} item ${i + 1}`}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.src = "https://via.placeholder.com/150?text=Combo";
                                  }}
                              />
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <img
                        src={
                          item.deal 
                            ? ((item.deal.image || (item.deal.images && item.deal.images[0]))?.startsWith("http") || (item.deal.image || (item.deal.images && item.deal.images[0]))?.startsWith("data:")
                              ? (item.deal.image || (item.deal.images && item.deal.images[0])) 
                              : ((item.deal.image || (item.deal.images && item.deal.images[0])) ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${(item.deal.image || (item.deal.images && item.deal.images[0])).replace(/\\/g, "/")}` : "https://via.placeholder.com/150?text=Combo"))
                            : (item.product?.image?.startsWith("http") || item.product?.image?.startsWith("data:")
                              ? item.product.image
                              : (item.product?.image ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${item.product.image.replace(/\\/g, "/")}` : "https://via.placeholder.com/150"))
                        }
                        alt={item.deal ? item.deal.title : item.product?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/150?text=Image";
                        }}
                      />
                    )}
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">
                      {item.deal ? item.deal.title : (item.product?.name || "Product Details Unavailable")}
                    </h3>
                    {item.deal && (
                      <span className="inline-block text-[10px] font-bold text-white bg-red-600 px-2 py-0.5 rounded-full mb-1 uppercase tracking-wider">
                        Combo Deal
                      </span>
                    )}
                    {item.size && (
                      <span className="inline-block text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full mb-1">
                        {item.size}
                      </span>
                    )}
                    <p className="text-green-600 font-bold mb-2">
                      Rs.{" "}
                      {item.deal
                        ? Number(item.deal.price || item.price).toFixed(2) :
                        item.product?.discount > 0
                        ? (
                            item.price *
                            (1 - item.product.discount / 100)
                          ).toFixed(2)
                        : Number(item.price).toFixed(2)}
                    </p>
                    {item.product?.discount > 0 && (
                      <p className="text-xs text-gray-400 line-through">
                        Rs. {Number(item.price).toFixed(2)}
                      </p>
                    )}
                    {item.deal?.originalPrice && (
                      <p className="text-xs text-gray-400 line-through">
                        Rs. {Number(item.deal.originalPrice).toFixed(2)}
                      </p>
                    )}
                    <div className="inline-flex items-center gap-1 bg-gray-50 rounded-lg p-1">
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity - 1)
                        }
                        className="p-1 hover:bg-white rounded-md transition-colors"
                        disabled={item.quantity <= 1}
                      >
                        <Minus size={16} className="text-gray-600" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item._id, item.quantity + 1)
                        }
                        className="p-1 hover:bg-white rounded-md transition-colors"
                      >
                        <Plus size={16} className="text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-lg mb-2">
                      Rs. {((item.deal ? (item.deal.price || item.price) : item.price) * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeItem(item._id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-96">
              <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-bold">Rs. {
                      Math.max(cart.totalAmount || 0, cart.items.reduce((total, item) => {
                        const itemPrice = item.deal 
                          ? (item.deal.price || item.price || 0) 
                          : (item.product?.discount > 0 ? item.price * (1 - item.product.discount / 100) : item.price || 0);
                        return total + (itemPrice * item.quantity);
                      }, 0)).toFixed(2)
                    }</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-gray-500 italic">
                      Calculated at checkout
                    </span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between text-lg font-bold text-gray-900">
                    <span>Total (excluding shipping)</span>
                    <span>Rs. {
                      Math.max(cart.totalAmount || 0, cart.items.reduce((total, item) => {
                        const itemPrice = item.deal 
                          ? (item.deal.price || item.price || 0) 
                          : (item.product?.discount > 0 ? item.price * (1 - item.product.discount / 100) : item.price || 0);
                        return total + (itemPrice * item.quantity);
                      }, 0)).toFixed(2)
                    }</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Shield size={16} className="text-green-500" />
                    <span>Secure Payment</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Truck size={16} className="text-green-500" />
                    <span>Free Shipping on all orders</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <Package size={16} className="text-green-500" />
                    <span>30-Day Return Policy</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/payment")}
                  className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-xl shadow-green-200 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Proceed to Checkout
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
