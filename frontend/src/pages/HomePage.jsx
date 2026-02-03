import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Scan, TrendingUp, Star, ShoppingCart, Eye, Leaf, Zap, Award, ChevronRight,
  Truck, Shield, HeadphonesIcon, Clock, ArrowRight, CheckCircle, Users, Package,
  BarChart3, PlayCircle, Quote, ChevronLeft, Heart, Search, Filter, Gift, Percent, MessageSquare, Loader2
} from 'lucide-react';
import Navbar from '../components/Navbar';
import productService from '../services/productService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  
  // Dynamic data state
  const [stats, setStats] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loadingDynamic, setLoadingDynamic] = useState(true);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  // Auto-rotate hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (testimonials.length > 0) {
      const timer = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [testimonials]);

  useEffect(() => {
    fetchProducts();
    fetchHomePageData();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  const fetchHomePageData = async () => {
    try {
      setLoadingDynamic(true);
      const [statsRes, testimonialsRes, blogRes, dealsRes] = await Promise.all([
        api.get('/stats/homepage'),
        api.get('/testimonials'),
        api.get('/blog/posts?limit=3'),
        api.get('/deals/active')
      ]);
      
      setStats(statsRes.data.data);
      setTestimonials(testimonialsRes.data.data);
      setBlogPosts(blogRes.data.data);
      setDeals(dealsRes.data.data);
    } catch (error) {
      console.error('Error fetching homepage data:', error);
    } finally {
      setLoadingDynamic(false);
    }
  };

  const heroSlides = [
    {
      title: `Welcome back, ${user?.name || 'Farmer'}!`,
      subtitle: 'Get instant diagnosis and treatment recommendations with our AI',
      image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&h=600&fit=crop',
      cta: 'Open AI Assistant',
      badge: 'New Feature'
    },
    {
      title: 'Premium Organic Fertilizers',
      subtitle: 'Boost your crop yield by up to 40% naturally',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=600&fit=crop',
      cta: 'Shop Now',
      badge: 'Best Sellers'
    },
    {
      title: 'Smart Farming Solutions',
      subtitle: 'Join 10,000+ farmers growing smarter',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop',
      cta: 'Get Started',
      badge: 'Trending'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', icon: Package },
    { id: 'Fertilizer', name: 'Fertilizer', icon: Leaf },
    { id: 'Pesticide', name: 'Pesticide', icon: Shield },
    { id: 'Seeds', name: 'Seeds', icon: Zap },
    { id: 'Tools', name: 'Tools', icon: Award },
    { id: 'Supplements', name: 'Supplements', icon: Sparkles },
    { id: 'Disease Treatment', name: 'Disease Treatment', icon: Zap },
    { id: 'Other', name: 'Other', icon: Package }
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  const aiFeatures = [
    {
      icon: Scan,
      title: 'Disease Detection',
      description: 'Upload plant images for instant AI diagnosis with 99% accuracy',
      color: 'blue',
      stats: '50K+ Scans'
    },
    {
      icon: Sparkles,
      title: 'Smart Recommendations',
      description: 'Get personalized fertilizer plans based on soil and crop type',
      color: 'purple',
      stats: '15K+ Users'
    },
    {
      icon: TrendingUp,
      title: 'Growth Analytics',
      description: 'Track plant health metrics and optimize nutrition schedules',
      color: 'green',
      stats: '40% Yield ↑'
    }
  ];

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders above Rs. 999',
      color: 'green'
    },
    {
      icon: Shield,
      title: '100% Authentic',
      description: 'Certified organic products',
      color: 'blue'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Expert farming assistance',
      color: 'purple'
    },
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Delivered in 2-3 days',
      color: 'orange'
    }
  ];

  const staticTestimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Wheat Farmer, Punjab',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
      rating: 5,
      text: 'The AI disease detection saved my entire crop! Detected fungal infection early and recommended the perfect treatment. My yield increased by 35% this season.',
      product: 'Bio Growth Enhancer Pro'
    }
  ];

  const staticStats = [
    { icon: Users, value: '10,000+', label: 'Happy Farmers' },
    { icon: Package, value: '50,000+', label: 'Orders Delivered' },
    { icon: Award, value: '4.8/5', label: 'Customer Rating' },
    { icon: BarChart3, value: '40%', label: 'Avg. Yield Increase' }
  ];

  const staticDeals = [
    {
      title: 'Flash Sale',
      subtitle: 'Up to 30% OFF',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop',
      badge: 'Limited Time',
      color: 'from-red-500 to-orange-600'
    },
    {
      title: 'Combo Packs',
      subtitle: 'Save Rs. 500+ on bundles',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&h=400&fit=crop',
      badge: 'Best Value',
      color: 'from-blue-500 to-purple-600'
    }
  ];

  const staticBlogPosts = [
    {
      title: 'How to Optimize NPK Ratios for Wheat',
      category: 'Nutrition',
      createdAt: 'Mar 12, 2026',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop'
    },
    {
      title: 'Identifying Early Signs of Fungal Disease',
      category: 'Disease Control',
      createdAt: 'Mar 10, 2026',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&h=250&fit=crop'
    },
    {
      title: 'Organic vs Chemical: What Your Soil Needs',
      category: 'Organic Farming',
      createdAt: 'Mar 08, 2026',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=250&fit=crop'
    }
  ];

  // Use dynamic data if available, fallback to static
  const displayStats = stats ? [
    { icon: Users, value: stats.totalUsers, label: 'Happy Farmers' },
    { icon: Package, value: stats.totalOrders, label: 'Orders Delivered' },
    { icon: Award, value: stats.avgRating, label: 'Customer Rating' },
    { icon: BarChart3, value: stats.yieldIncrease, label: 'Avg. Yield Increase' }
  ] : staticStats;

  const displayTestimonials = testimonials.length > 0 ? testimonials : staticTestimonials;
  const displayDeals = deals.length > 0 ? deals : staticDeals;
  const displayBlogPosts = blogPosts.length > 0 ? blogPosts : staticBlogPosts;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Carousel */}
      <section className="relative pt-16 md:pt-20">
        <div className="relative h-[500px] md:h-[600px] overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                currentSlide === index ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0">
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
              </div>
              
              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full mb-6">
                    <Sparkles size={16} className="text-green-300" />
                    <span className="text-sm font-semibold text-green-100">{slide.badge}</span>
                  </div>
                  
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    {slide.title}
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-200 mb-8">
                    {slide.subtitle}
                  </p>
                  
                  <button 
                    onClick={() => {
                      if (slide.cta === 'Open AI Assistant') {
                        navigate('/detection');
                      } else if (slide.cta === 'Shop Now') {
                        navigate('/products');
                      } else {
                        navigate('/products');
                      }
                    }}
                    className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                  >
                    {slide.cta}
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Carousel Indicators */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'w-12 bg-green-500' : 'w-2 bg-white/50'
                }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button 
            onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-all duration-300"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
          <button 
            onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-all duration-300"
          >
            <ChevronRight className="text-white" size={24} />
          </button>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-8 bg-gradient-to-r from-green-50 to-blue-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl">
                <div className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <feature.icon className={`text-${feature.color}-600`} size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">{feature.title}</h3>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Deals */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {displayDeals.map((deal, idx) => (
              <div key={idx} className="relative group overflow-hidden rounded-2xl h-64 cursor-pointer">
                <img 
                  src={deal.image} 
                  alt={deal.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-r ${deal.color} opacity-80`}></div>
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full self-start">
                    <Gift size={16} className="text-white" />
                    <span className="text-sm font-bold text-white">{deal.badge}</span>
                  </div>
                  <div>
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">{deal.title}</h3>
                    <p className="text-xl text-white/90 mb-4">{deal.subtitle}</p>
                    <button className="px-6 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center gap-2">
                      Shop Now <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
              <Zap size={16} className="text-purple-600" />
              <span className="text-sm font-bold text-purple-700">AI-Powered Technology</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Intelligent Farming Assistant
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Harness the power of artificial intelligence to grow healthier crops and maximize yields
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aiFeatures.map((feature, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
                <div className="relative p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-transparent transition-all duration-300">
                  <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className={`text-${feature.color}-600`} size={32} />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                      {feature.stats}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                  <button className="text-green-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                    Learn More <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-2xl hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2">
              <Sparkles size={20} />
              Try AI Assistant Free
            </button>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white" id="products">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                Featured Products
              </h2>
              <p className="text-lg text-gray-600">
                Premium fertilizers trusted by thousands of farmers
              </p>
            </div>
            <button 
                onClick={() => navigate('/products')}
                className="mt-4 md:mt-0 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2"
            >
              View All Products <ArrowRight size={18} />
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  selectedCategory === cat.id
                    ? 'bg-green-600 text-white shadow-lg shadow-green-200 scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <cat.icon size={18} />
                {cat.name}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-green-600" size={48} />
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <div key={product._id} className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <div 
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="relative h-56 overflow-hidden bg-gray-50 cursor-pointer"
                  >
                    <img 
                      src={product.image.startsWith('http') ? product.image : `http://localhost:5000/${product.image.replace(/\\/g, '/')}`} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {product.discount > 0 && (
                        <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          <Percent size={12} />
                          {product.discount}% OFF
                        </div>
                      )}
                      <div className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg">
                        {product.category}
                      </div>
                    </div>

                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-sm text-green-600 text-xs font-bold rounded-full border border-green-200">
                      {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors min-h-[3rem] cursor-pointer"
                    >
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            className={`${i < Math.floor(product.rating || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-sm font-bold text-gray-900 ml-1">{product.rating || 4.5}</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">Rs. {product.price}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveChat({
                          id: product.seller,
                          name: 'Seller',
                          productId: product._id,
                          productName: product.name
                        })}
                        className="p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
                        title="Chat with Seller"
                      >
                        <MessageSquare size={18} className="text-green-600" />
                      </button>
                    </div>

                    <button 
                        onClick={async () => {
                            try {
                                await api.post('/cart', { productId: product._id, quantity: 1 });
                                alert('Added to cart!');
                            } catch (e) {
                                console.error(e);
                                alert('Failed to add to cart');
                            }
                        }}
                        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart size={18} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Chat Window */}
      {activeChat && (
        <ChatWindow 
          receiverId={activeChat.id}
          receiverName={activeChat.name}
          productId={activeChat.productId}
          productName={activeChat.productName}
          onClose={() => setActiveChat(null)}
        />
      )}

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-br from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                  <stat.icon className="text-white" size={32} />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-green-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              What Farmers Say
            </h2>
            <p className="text-lg text-gray-600">
              Join thousands of satisfied farmers growing better crops
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden">
              {displayTestimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`transition-opacity duration-500 ${
                    currentTestimonial === index ? 'opacity-100' : 'opacity-0 absolute inset-0'
                  }`}
                >
                  <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                    <Quote className="text-green-200 mb-6" size={48} />
                    
                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} size={20} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    <p className="text-xl md:text-2xl text-gray-700 mb-8 leading-relaxed italic">
                      "{testimonial.text}"
                    </p>

                    <div className="flex items-center gap-4">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-16 h-16 rounded-full object-cover border-4 border-green-100"
                      />
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{testimonial.name}</div>
                        <div className="text-gray-600">{testimonial.role}</div>
                        <div className="text-sm text-green-600 font-semibold mt-1">
                          Used: {testimonial.product}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Testimonial Indicators */}
            <div className="flex justify-center gap-3 mt-8">
              {displayTestimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentTestimonial === index ? 'w-12 bg-green-600' : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <button 
              onClick={() => setCurrentTestimonial((prev) => (prev - 1 + displayTestimonials.length) % displayTestimonials.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 p-3 bg-white hover:bg-gray-50 rounded-full shadow-lg transition-all duration-300"
            >
              <ChevronLeft className="text-gray-700" size={24} />
            </button>
            <button 
              onClick={() => setCurrentTestimonial((prev) => (prev + 1) % displayTestimonials.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 p-3 bg-white hover:bg-gray-50 rounded-full shadow-lg transition-all duration-300"
            >
              <ChevronRight className="text-gray-700" size={24} />
            </button>
          </div>
        </div>
      </section>

      {/* Blog/Resources */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
                Farming Resources
              </h2>
              <p className="text-lg text-gray-600">
                Expert tips and guides to help you grow better
              </p>
            </div>
            <button className="mt-4 md:mt-0 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2">
              View All Articles <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post, idx) => (
              <div key={idx} className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img 
                    src={post.image} 
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                    {post.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-xl mb-4 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {post.title}
                  </h3>
                  <button className="text-green-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                    Read More <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-green-700 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Sparkles size={16} className="text-white" />
            <span className="text-sm font-bold text-white">Get Started Today</span>
          </div>
          
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Ready to Transform Your Farming?
          </h2>
          
          <p className="text-xl text-green-50 mb-10 max-w-2xl mx-auto">
            Join 10,000+ farmers who are growing smarter with AgriAssist. Get AI-powered insights and premium products delivered to your farm.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-green-700 rounded-xl font-bold text-lg shadow-2xl hover:bg-gray-50 transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center gap-2">
              <PlayCircle size={20} />
              Watch Demo
            </button>
            <button className="px-8 py-4 bg-green-500 hover:bg-green-400 text-white rounded-xl font-bold text-lg shadow-2xl transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center justify-center gap-2">
              Start Free Trial
              <ArrowRight size={20} />
            </button>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 flex-wrap text-white">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-300" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-300" />
              <span>Free shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-300" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Leaf className="text-green-500" size={28} />
                <span className="text-xl font-bold text-white">AgriAssist</span>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Empowering farmers with AI-powered solutions and premium organic products.
              </p>
              <div className="flex gap-3">
                {/* Social icons placeholder */}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-400 transition-colors">Organic Fertilizers</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">NPK Solutions</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Specialty Products</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Combo Packs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-green-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-green-400 transition-colors">Track Order</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-400">© 2026 AgriAssist. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-green-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-green-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-green-400 transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;