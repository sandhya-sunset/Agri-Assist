import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  Heart,
  Loader2,
  Tag,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import api from "../services/api";
import wishlistService from "../services/wishlistService";
import { useToast } from "../Components/Toast";
import { useNavigate, useSearchParams } from "react-router-dom";

const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const query = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(query);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    setSearchTerm(query);
    fetchProducts();
    fetchWishlistIds();
  }, [query]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProducts(response.data.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlistIds = async () => {
    try {
      const data = await wishlistService.getWishlist();
      if (data.success) {
        setWishlistIds(new Set(data.data.map((p) => p._id)));
      }
    } catch {
      // ignore
    }
  };

  const handleToggleWishlist = async (e, productId) => {
    e.stopPropagation();
    try {
      const data = await wishlistService.toggleWishlist(productId);
      if (data.success) {
        setWishlistIds(new Set(data.data));
        addToast(data.isAdded ? 'Added to wishlist ❤️' : 'Removed from wishlist', data.isAdded ? 'success' : 'info');
      }
    } catch {
      addToast('Failed to update wishlist', 'error');
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation();
    try {
      await api.post("/cart", {
        productId,
        quantity: 1,
      });
      addToast("Product added to cart successfully!", "success");
      navigate("/cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      addToast("Failed to add to cart. Please try again.", "error");
    }
  };

  const categories = [
    "All",
    "Fertilizer",
    "Pesticide",
    "Seeds",
    "Tools",
    "Supplements",
  ];

  const filteredProducts = products.filter((product) => {
    // Search in product name, description, and category
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = product.name.toLowerCase().includes(searchLower);
    const descriptionMatch = product.description?.toLowerCase().includes(searchLower) || false;
    const categoryMatch = product.category.toLowerCase().includes(searchLower);
    
    // Also check if any keyword from searchTerm matches
    const keywords = searchLower.split(" ").filter(k => k.length > 0);
    const keywordMatch = keywords.some(keyword => 
      keyword.length > 2 && (
        product.name.toLowerCase().includes(keyword) ||
        product.description?.toLowerCase().includes(keyword) ||
        product.category.toLowerCase().includes(keyword)
      )
    );
    
    const matchesSearch = nameMatch || descriptionMatch || categoryMatch || keywordMatch;
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Explore Products
            </h1>
            <p className="text-gray-600">
              Find the best agricultural products for your farm
            </p>
          </div>

          <div className="flex gap-4">
            <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
              <Filter size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2.5 rounded-full font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-green-600 text-white shadow-lg shadow-green-200"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-green-600" size={48} />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                onClick={() => navigate(`/product/${product._id}`)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                  <img
                    src={
                      product.image?.startsWith("http")
                        ? product.image
                        : `http://localhost:5000/${product.image?.replace(/\\/g, "/")}`
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => handleToggleWishlist(e, product._id)}
                    className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md transition-all duration-200 hover:scale-110"
                    title={wishlistIds.has(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart
                      size={18}
                      className={wishlistIds.has(product._id) ? 'fill-red-500 text-red-500' : 'text-gray-400 hover:text-red-400'}
                    />
                  </button>
                  <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 pr-2">
                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg">
                      {product.category}
                    </span>
                    {product.discount > 0 && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                        -{product.discount}%
                      </span>
                    )}
                    {product.offerText && (
                      <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Tag size={12} />
                        {product.offerText}
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-green-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-1 mb-3">
                    <Star
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      {product.rating || 4.5}
                    </span>
                    <span className="text-xs text-gray-400">
                      (150+ reviews)
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-col">
                      {product.discount > 0 ? (
                        <>
                          <span className="text-2xl font-bold text-gray-900">
                            Rs.{" "}
                            {(
                              product.price *
                              (1 - product.discount / 100)
                            ).toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            Rs. {Number(product.price).toFixed(2)}
                          </span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold text-gray-900">
                          Rs. {Number(product.price).toFixed(2)}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleAddToCart(e, product._id)}
                      className="p-3 bg-green-50 hover:bg-green-600 hover:text-white text-green-700 rounded-xl transition-all duration-300"
                    >
                      <ShoppingCart size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">
              No products found for your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductListPage;
