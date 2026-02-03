import React, { useState, useEffect } from 'react';
import { Sparkles, Scan, TrendingUp, Shield, Star, ShoppingCart, Eye, Leaf, Zap, Award, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // Add to cart logic will be implemented later
    console.log('Adding product to cart:', productId);
  };

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'Organic', name: 'Organic' },
    { id: 'NPK', name: 'NPK Mix' },
    { id: 'Specialty', name: 'Specialty' }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const aiFeatures = [
    {
      icon: Scan,
      title: 'Disease Detection',
      description: 'AI-powered image analysis to identify plant diseases instantly',
      color: 'blue'
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'Get personalized fertilizer suggestions based on your crops',
      color: 'purple'
    },
    {
      icon: TrendingUp,
      title: 'Growth Tracking',
      description: 'Monitor plant health and optimize fertilizer usage',
      color: 'green'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Navbar />
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-blue-50 opacity-60"></div>
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
                <Sparkles size={16} className="text-green-600" />
                <span className="text-sm font-semibold text-green-700">AI-Powered Smart Farming</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Grow Smarter with
                <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> AgriAssist</span>
              </h1>
              
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Premium fertilizers backed by AI technology. Detect diseases, get personalized recommendations, and achieve healthier crops with our intelligent farming solutions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate(isAuthenticated ? '/home' : '/login')}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                >
                  <Sparkles size={20} />
                  Try AI Assistant
                </button>
                <button 
                   onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-xl font-semibold transition-all duration-200"
                >
                  Shop Products
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                  <Award className="text-green-600" size={24} />
                  <div>
                    <p className="font-bold text-gray-900">10,000+</p>
                    <p className="text-sm text-gray-600">Happy Farmers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-500" size={24} />
                  <div>
                    <p className="font-bold text-gray-900">4.8/5.0</p>
                    <p className="text-sm text-gray-600">Customer Rating</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="relative w-full h-[500px] rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&h=800&fit=crop" 
                  alt="Smart Farming"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Leaf className="text-green-600" size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">AI Detection</p>
                    <p className="text-sm text-gray-600">99% Accuracy</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 bg-white" id="ai-features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
              <Zap size={16} className="text-purple-600" />
              <span className="text-sm font-semibold text-purple-700">Powered by AI</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Intelligent Farming Assistant
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Leverage cutting-edge AI technology to optimize your farming practices and maximize yields
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aiFeatures.map((feature, idx) => (
              <div key={idx} className="group p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300">
                <div className={`w-14 h-14 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`text-${feature.color}-600`} size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Fertilizers Section */}
      <section className="py-16" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Premium Fertilizers
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked by experts and trusted by thousands of farmers
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedCategory === cat.id
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-green-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-green-600 animate-spin mb-4" />
              <p className="text-gray-600 font-medium">Loading amazing products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-600 mb-4">{error}</p>
              <button 
                onClick={fetchProducts}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product._id} className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div className="relative h-48 overflow-hidden bg-gray-100">
                    <img 
                      src={`http://localhost:5000/${product.image}`} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {product.badge && (
                      <div className="absolute top-3 right-3 px-3 py-1 bg-green-600 text-white text-xs font-semibold rounded-full shadow-lg">
                        {product.badge}
                      </div>
                    )}
                    <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm text-green-600 text-xs font-semibold rounded-full">
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star size={14} className="fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold text-gray-900">4.8</span>
                      </div>
                      <span className="text-sm text-gray-500">(120)</span>
                    </div>

                    <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-end gap-2 mb-4">
                      <span className="text-2xl font-bold text-gray-900">Rs. {product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-400 line-through mb-1">Rs. {product.originalPrice}</span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleAddToCart(product._id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200"
                      >
                        <ShoppingCart size={16} />
                        Add to Cart
                      </button>
                      <button className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
                        <Eye size={18} className="text-gray-700" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 to-green-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Farming?
            </h2>
            <p className="text-lg text-green-100 mb-8">
              Join thousands of farmers using AI-powered solutions to grow healthier, more productive crops
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                 onClick={() => navigate('/login')}
                className="px-8 py-4 bg-white hover:bg-gray-100 text-green-700 rounded-xl font-semibold shadow-xl transition-all duration-200"
              >
                Get Started Free
              </button>
              <button className="px-8 py-4 bg-green-700 hover:bg-green-800 text-white border-2 border-white rounded-xl font-semibold transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;