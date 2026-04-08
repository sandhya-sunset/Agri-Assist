import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart, Trash2, Loader2, ArrowRight } from "lucide-react";
import Navbar from "../Components/Navbar";
import wishlistService from "../services/wishlistService";
import api from "../services/api";
import { useToast } from "../Components/Toast";

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      if (data.success) {
        setWishlistItems(data.data);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      addToast("Failed to load wishlist", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      const data = await wishlistService.toggleWishlist(productId);
      if (data.success) {
        setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
        addToast("Removed from wishlist", "success");
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      addToast("Failed to remove item", "error");
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await api.post("/cart", { productId, quantity: 1 });
      addToast("Added to cart successfully!", "success");
      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      addToast("Failed to add to cart.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <Heart className="text-red-500 fill-red-500" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500">Products you've saved for later</p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven't saved any products yet. Browse our store and tap the heart icon to save items.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors"
            >
              Start Shopping <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div
                  className="relative h-56 bg-gray-100 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <img
                    src={
                      product.image?.startsWith("http")
                        ? product.image
                        : `http://localhost:5000/${product.image?.replace(/\\/g, "/")}`
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(product._id);
                      }}
                      className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-sm"
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  {product.discount > 0 && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                      -{product.discount}%
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <h3
                    className="font-bold text-gray-900 mb-1 line-clamp-1 cursor-pointer hover:text-green-600 transition-colors"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-1">
                    {product.category}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-xl font-bold text-gray-900">
                            Rs.{" "}
                            {(
                              product.price *
                              (1 - product.discount / 100)
                            ).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            Rs. {product.price.toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xl font-bold text-gray-900">
                          Rs. {product.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddToCart(product._id)}
                      className="p-3 bg-green-50 hover:bg-green-600 hover:text-white text-green-700 rounded-xl transition-all duration-300 shadow-sm"
                      title="Add to Cart"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
