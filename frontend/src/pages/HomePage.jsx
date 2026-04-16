import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Scan,
  TrendingUp,
  Star,
  ShoppingCart,
  Eye,
  Leaf,
  Zap,
  Award,
  ChevronRight,
  Truck,
  Shield,
  HeadphonesIcon,
  Clock,
  ArrowRight,
  CheckCircle,
  Users,
  Package,
  BarChart3,
  PlayCircle,
  Quote,
  ChevronLeft,
  Heart,
  Search,
  Filter,
  Gift,
  Percent,
  MessageSquare,
  Loader2,
  ListTodo,
  Plus,
  Trash2,
  Calendar,
  Check,
  Cloud,
  Sun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  MapPin,
  Thermometer,
  Droplets,
  Tag,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import productService from "../services/productService";
import wishlistService from "../services/wishlistService";
import api from "../services/api";
import { API_BASE_URL } from "../config";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "../Components/Toast";
import ChatWindow from "../components/ChatWindow";

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());

  // Dynamic data state
  const [stats, setStats] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [, setLoadingDynamic] = useState(true);

  // Farmer To-Do list state
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    scheduledDate: "",
    scheduledTime: "",
  });
  const [addingTask, setAddingTask] = useState(false);
  const [testReminderLoading, setTestReminderLoading] = useState(false);
  const shownNotificationIds = useRef(new Set());

  // Weather state
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState(null);
  const [locationName, setLocationName] = useState("Local Area");

  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleAddDealToCart = async (e, deal) => {
    e.stopPropagation();
    try {
      await api.post("/cart", { dealId: deal._id, quantity: 1 });
      addToast("Combo deal added to cart successfully!", "success");
      navigate("/cart");
    } catch (error) {
      addToast("Failed to add combo to cart", "error");
    }
  };

  // Auto-rotate hero carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    fetchTasks();
    fetchWeather();
    fetchWishlistIds();
  }, []);

  const fetchWishlistIds = async () => {
    try {
      const data = await wishlistService.getWishlist();
      if (data.success) {
        setWishlistIds(new Set(data.data.map((p) => p._id)));
      }
    } catch {
      // ignore - user might not be logged in
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

  // Weather fetching logic using Open-Meteo (Free, no API key needed)
  const fetchWeather = () => {
    setWeatherLoading(true);
    if (!navigator.geolocation) {
      setWeatherError("Geolocation not supported");
      setWeatherLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          // Reverse geocoding for City using Open-Meteo Geocoding
          try {
            const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${latitude}&longitude=${longitude}&format=json`);
            if (geoRes.ok) {
              const geoData = await geoRes.json();
              if (geoData.results && geoData.results.length > 0) {
                // Determine best location name (City or state)
                setLocationName(geoData.results[0].name || geoData.results[0].admin1 || "Local Area");
              }
            }
          } catch (e) {
            console.warn("Reverse geocode failed", e);
          }

          // Fetch Weather
          const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&timezone=auto`;
          const res = await fetch(weatherUrl);

          if (!res.ok) throw new Error("Weather fetch failed");

          const data = await res.json();
          setWeather(data.current);
          setWeatherError(null);
        } catch (err) {
          console.error("Error fetching weather:", err);
          setWeatherError("Failed to fetch weather data");
        } finally {
          setWeatherLoading(false);
        }
      },
      (err) => {
        console.warn("Geolocation blocked or failed:", err.message);
        setWeatherError("Location access denied");
        setWeatherLoading(false);
      },
      { timeout: 10000 }
    );
  };

  // Polling fallback: check for new task reminders every 20s (works even if socket doesn't deliver)
  useEffect(() => {
    if (!addToast) return;
    const poll = async () => {
      try {
        const res = await api.get("/notifications");
        if (!res.data.success || !res.data.data) return;
        const notifications = res.data.data;
        const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
        for (const n of notifications) {
          if (n.title !== "Task reminder") continue;
          const created = new Date(n.createdAt).getTime();
          if (created < twoMinutesAgo) continue;
          if (shownNotificationIds.current.has(n._id)) continue;
          shownNotificationIds.current.add(n._id);
          addToast(n.message || n.title, "info", 6000);
        }
      } catch {
        // ignore
      }
    };
    poll();
    const interval = setInterval(poll, 20000);
    return () => clearInterval(interval);
  }, [addToast]);

  const handleTestReminder = async () => {
    try {
      setTestReminderLoading(true);
      await api.post("/tasks/test-reminder");
      addToast(
        "Test reminder sent – check top-right and bell icon",
        "success",
        5000,
      );
    } catch (err) {
      console.error(err);
      addToast(
        "Backend may be offline or on another port. Start backend on port 5000.",
        "error",
        6000,
      );
    } finally {
      setTestReminderLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setTasksLoading(true);
      const res = await api.get("/tasks");
      if (res.data.success) setTasks(res.data.data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !taskForm.scheduledDate) return;
    try {
      setAddingTask(true);
      await api.post("/tasks", {
        title: taskForm.title.trim(),
        scheduledDate: taskForm.scheduledDate,
        scheduledTime: taskForm.scheduledTime.trim() || undefined,
      });
      setTaskForm({ title: "", scheduledDate: "", scheduledTime: "" });
      await fetchTasks();
    } catch (err) {
      console.error("Error adding task:", err);
      alert("Failed to add task. Please try again.");
    } finally {
      setAddingTask(false);
    }
  };

  const handleToggleTask = async (taskId, isCompleted) => {
    try {
      await api.put(`/tasks/${taskId}`, { isCompleted: !isCompleted });
      setTasks((prev) =>
        prev.map((t) =>
          t._id === taskId ? { ...t, isCompleted: !isCompleted } : t,
        ),
      );
    } catch (err) {
      console.error("Error updating task:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts();
      setProducts(data.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  const fetchHomePageData = async () => {
    try {
      setLoadingDynamic(true);
      const [statsRes, testimonialsRes, blogRes, dealsRes] = await Promise.all([
        api.get("/stats/homepage"),
        api.get("/testimonials"),
        api.get("/blog/posts?limit=3"),
        api.get("/deals/active"),
      ]);

      setStats(statsRes.data.data);
      setTestimonials(testimonialsRes.data.data);
      setBlogPosts(blogRes.data.data);
      setDeals(dealsRes.data.data);
    } catch (error) {
      console.error("Error fetching homepage data:", error);
    } finally {
      setLoadingDynamic(false);
    }
  };

  const heroSlides = [
    {
      title: `Welcome back, ${user?.name || "Farmer"}!`,
      subtitle:
        "Get instant diagnosis and treatment recommendations with our AI",
      image:
        "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=1200&h=600&fit=crop",
      cta: "Open AI Assistant",
      badge: "New Feature",
    },
    {
      title: "Premium Organic Fertilizers",
      subtitle: "Boost your crop yield by up to 40% naturally",
      image:
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&h=600&fit=crop",
      cta: "Shop Now",
      badge: "Best Sellers",
    },
    {
      title: "Smart Farming Solutions",
      subtitle: "Join 10,000+ farmers growing smarter",
      image:
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&h=600&fit=crop",
      cta: "Get Started",
      badge: "Trending",
    },
  ];

  const categories = [
    { id: "all", name: "All Products", icon: Package },
    { id: "Fertilizer", name: "Fertilizer", icon: Leaf },
    { id: "Pesticide", name: "Pesticide", icon: Shield },
    { id: "Seeds", name: "Seeds", icon: Zap },
    { id: "Tools", name: "Tools", icon: Award },
    { id: "Supplements", name: "Supplements", icon: Sparkles },
    { id: "Disease Treatment", name: "Disease Treatment", icon: Zap },
    { id: "Other", name: "Other", icon: Package },
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category === selectedCategory);

  const aiFeatures = [
    {
      icon: Scan,
      title: "Disease Detection",
      description:
        "Upload plant images for instant AI diagnosis with 99% accuracy",
      color: "blue",
      stats: "50K+ Scans",
    },
    {
      icon: Sparkles,
      title: "Smart Recommendations",
      description:
        "Get personalized fertilizer plans based on soil and crop type",
      color: "purple",
      stats: "15K+ Users",
    },
    {
      icon: TrendingUp,
      title: "Growth Analytics",
      description:
        "Track plant health metrics and optimize nutrition schedules",
      color: "green",
      stats: "40% Yield ↑",
    },
  ];

  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On orders above Rs. 999",
      color: "green",
    },
    {
      icon: Shield,
      title: "100% Authentic",
      description: "Certified organic products",
      color: "blue",
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Support",
      description: "Expert farming assistance",
      color: "purple",
    },
    {
      icon: Clock,
      title: "Fast Delivery",
      description: "Delivered in 2-3 days",
      color: "orange",
    },
  ];

  const staticTestimonials = [
    {
      name: "Rajesh Kumar",
      role: "Wheat Farmer, Punjab",
      image:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop",
      rating: 5,
      text: "The AI disease detection saved my entire crop! Detected fungal infection early and recommended the perfect treatment. My yield increased by 35% this season.",
      product: "Bio Growth Enhancer Pro",
    },
  ];

  const staticStats = [
    { icon: Users, value: "10,000+", label: "Happy Farmers" },
    { icon: Package, value: "50,000+", label: "Orders Delivered" },
    { icon: Award, value: "4.8/5", label: "Customer Rating" },
    { icon: BarChart3, value: "40%", label: "Avg. Yield Increase" },
  ];

  const staticDeals = [
    {
      title: "Flash Sale",
      subtitle: "Up to 30% OFF",
      image:
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop",
      badge: "Limited Time",
      color: "from-red-500 to-orange-600",
      link: "/products?sale=flash",
    },
    {
      title: "Combo Packs",
      subtitle: "Save Rs. 500+ on bundles",
      image:
        "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&h=400&fit=crop",
      badge: "Best Value",
      color: "from-blue-500 to-purple-600",
      link: "/combo-packs",
    },
  ];

  const staticBlogPosts = [
    {
      title: "How to Optimize NPK Ratios for Wheat",
      category: "Nutrition",
      createdAt: "Mar 12, 2026",
      readTime: "5 min read",
      image:
        "https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop",
    },
    {
      title: "Identifying Early Signs of Fungal Disease",
      category: "Disease Control",
      createdAt: "Mar 10, 2026",
      readTime: "8 min read",
      image:
        "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&h=250&fit=crop",
    },
    {
      title: "Organic vs Chemical: What Your Soil Needs",
      category: "Organic Farming",
      createdAt: "Mar 08, 2026",
      readTime: "6 min read",
      image:
        "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=250&fit=crop",
    },
  ];

  // Use dynamic data if available, fallback to static
  const displayStats = stats
    ? [
      { icon: Users, value: stats.totalUsers, label: "Happy Farmers" },
      { icon: Package, value: stats.totalOrders, label: "Orders Delivered" },
      { icon: Award, value: stats.avgRating, label: "Customer Rating" },
      {
        icon: BarChart3,
        value: stats.yieldIncrease,
        label: "Avg. Yield Increase",
      },
    ]
    : staticStats;

  const displayTestimonials =
    testimonials.length > 0 ? testimonials : staticTestimonials;
  const displayDeals = deals.length > 0 ? deals : staticDeals;
  const displayBlogPosts = blogPosts.length > 0 ? blogPosts : staticBlogPosts;

  // Helper function to map Open-Meteo WMO weather codes to generic icons and descriptions
  const getWeatherDetails = (code, isDay) => {
    if (code === undefined) return { icon: Cloud, description: "Unknown" };
    // Map WMO codes: https://open-meteo.com/en/docs
    if (code === 0) return { icon: isDay ? Sun : Cloud, description: "Clear sky" };
    if ([1, 2, 3].includes(code)) return { icon: isDay ? Sun : Cloud, description: "Partly cloudy" };
    if ([45, 48].includes(code)) return { icon: Cloud, description: "Foggy" };
    if ([51, 53, 55, 56, 57].includes(code)) return { icon: CloudRain, description: "Drizzle" };
    if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { icon: CloudRain, description: "Rain" };
    if ([71, 73, 75, 77, 85, 86].includes(code)) return { icon: CloudSnow, description: "Snow" };
    if ([95, 96, 99].includes(code)) return { icon: CloudLightning, description: "Thunderstorm" };

    return { icon: Cloud, description: "Cloudy" };
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Carousel */}
      <section className="relative pt-16 md:pt-20">
        <div className="relative h-125 md:h-150 overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? "opacity-100" : "opacity-0"
                }`}
            >
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-black/70 via-black/50 to-transparent"></div>
              </div>

              <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-full mb-6">
                    <Sparkles size={16} className="text-green-300" />
                    <span className="text-sm font-semibold text-green-100">
                      {slide.badge}
                    </span>
                  </div>

                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    {slide.title}
                  </h1>

                  <p className="text-xl md:text-2xl text-gray-200 mb-8">
                    {slide.subtitle}
                  </p>

                  <button
                    onClick={() => {
                      if (currentSlide === 0) {
                        navigate("/disease-detection");
                      } else {
                        navigate("/products");
                      }
                    }}
                    className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-2"
                  >
                    {slide.cta}
                    <ArrowRight size={20} />
                  </button>

                  {/* Weather Widget */}
                  <div className="mt-8 pt-6 border-t border-white/20 w-full max-w-sm">
                    {weatherLoading ? (
                      <div className="flex items-center gap-3 text-white/80 animate-pulse">
                        <Loader2 className="animate-spin" size={20} />
                        <span className="text-sm">Fetching local weather...</span>
                      </div>
                    ) : weatherError ? (
                      <div className="flex items-center gap-2 text-white/80 bg-black/20 px-4 py-2 rounded-lg w-fit backdrop-blur-md border border-white/10">
                        <Cloud className="text-gray-300" size={20} />
                        <span className="text-sm font-medium">{weatherError}</span>
                      </div>
                    ) : weather && (
                      <div className="bg-black/30 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-white shadow-xl hover:bg-black/40 transition-colors cursor-default">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="text-green-400" size={18} />
                            <span className="font-semibold">{locationName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full">
                            {React.createElement(getWeatherDetails(weather.weather_code, weather.is_day === 1).icon, { size: 14, className: "text-blue-300" })}
                            <span className="text-xs font-medium">
                              {getWeatherDetails(weather.weather_code, weather.is_day === 1).description}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-end gap-4">
                          <div className="flex items-start gap-1">
                            <span className="text-5xl font-bold tracking-tighter">
                              {Math.round(weather.temperature_2m)}
                            </span>
                            <span className="text-2xl text-white/70 mt-1">°C</span>
                          </div>

                          <div className="h-10 w-px bg-white/20 mx-2"></div>

                          <div className="flex flex-col gap-1.5 pb-1 flex-1">
                            <div className="flex justify-between items-center w-full">
                              <div className="flex items-center gap-1.5 text-white/80">
                                <Droplets size={14} className="text-blue-400" />
                                <span className="text-xs">Humidity</span>
                              </div>
                              <span className="text-sm font-semibold">{weather.relative_humidity_2m}%</span>
                            </div>

                            <div className="flex justify-between items-center w-full">
                              <div className="flex items-center gap-1.5 text-white/80">
                                <Wind size={14} className="text-gray-300" />
                                <span className="text-xs">Wind</span>
                              </div>
                              <span className="text-sm font-semibold">{weather.wind_speed_10m} <span className="text-[10px] text-white/60">km/h</span></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
                className={`h-2 rounded-full transition-all duration-300 ${currentSlide === index
                  ? "w-12 bg-green-500"
                  : "w-2 bg-white/50"
                  }`}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() =>
              setCurrentSlide(
                (prev) => (prev - 1 + heroSlides.length) % heroSlides.length,
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-all duration-300"
          >
            <ChevronLeft className="text-white" size={24} />
          </button>
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full transition-all duration-300"
          >
            <ChevronRight className="text-white" size={24} />
          </button>
        </div>
      </section>

      {/* Features Bar */}
      <section className="py-8 bg-linear-to-r from-green-50 to-blue-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 bg-white/60 backdrop-blur-sm p-4 rounded-xl"
              >
                <div
                  className={`w-12 h-12 bg-${feature.color}-100 rounded-lg flex items-center justify-center shrink-0`}
                >
                  <feature.icon
                    className={`text-${feature.color}-600`}
                    size={24}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Expert Application Banner */}
      {user?.role === 'user' && user?.expertApplicationStatus !== 'approved' && (
        <section className="bg-green-600 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2"><Award /> Are you an Agriculture Expert?</h2>
              <p className="text-green-100 text-lg">Help farmers by sharing your knowledge in our community forum. Apply now to get your expert badge!</p>
            </div>
            <button 
              onClick={() => navigate('/apply-expert')}
              className="bg-white text-green-600 font-bold px-8 py-3 rounded-lg hover:bg-green-50 shadow-lg transition-colors whitespace-nowrap"
            >
              {user?.expertApplicationStatus === 'pending' ? 'View Setup Status' : 'Apply Now'}
            </button>
          </div>
        </section>
      )}

      {/* Farmer To-Do List */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <ListTodo className="text-green-600" size={22} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                My Farm To-Do
              </h2>
              <p className="text-sm text-gray-600">
                Add daily or future tasks and track them here
              </p>
              <p className="text-xs text-green-600 mt-1">
                Reminders: popup (top-right) and bell icon. Keep this tab open;
                backend must be running.
              </p>
              <button
                type="button"
                onClick={handleTestReminder}
                disabled={testReminderLoading}
                className="mt-2 px-3 py-1.5 bg-green-100 hover:bg-green-200 text-green-800 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
              >
                {testReminderLoading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <Check size={14} />
                )}
                Test reminder
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <form
                onSubmit={handleAddTask}
                className="bg-gray-50 rounded-2xl p-5 border border-gray-200"
              >
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Plus size={18} />
                  Add task
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="e.g. Apply fertilizer on field A"
                    value={taskForm.title}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, title: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-300 rounded-xl">
                      <Calendar
                        size={16}
                        className="text-gray-500 shrink-0"
                      />
                      <input
                        type="date"
                        value={taskForm.scheduledDate}
                        onChange={(e) =>
                          setTaskForm({
                            ...taskForm,
                            scheduledDate: e.target.value,
                          })
                        }
                        className="w-full focus:outline-none text-sm bg-transparent"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Time (e.g. 6 AM)"
                      value={taskForm.scheduledTime}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          scheduledTime: e.target.value,
                        })
                      }
                      className="w-28 px-3 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={
                      addingTask ||
                      !taskForm.title.trim() ||
                      !taskForm.scheduledDate
                    }
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {addingTask ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Plus size={18} />
                    )}
                    Add task
                  </button>
                </div>
              </form>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Your tasks</h3>
                  {tasksLoading && (
                    <Loader2
                      className="animate-spin text-green-600"
                      size={20}
                    />
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {!tasksLoading && tasks.length === 0 && (
                    <div className="p-8 text-center text-gray-500 text-sm">
                      No tasks yet. Add one using the form on the left.
                    </div>
                  )}
                  {tasks.map((task) => (
                    <div
                      key={task._id}
                      className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors ${task.isCompleted ? "bg-green-50/50" : ""
                        }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleTask(task._id, task.isCompleted)
                        }
                        className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.isCompleted
                          ? "bg-green-600 border-green-600 text-white"
                          : "border-gray-300 hover:border-green-500"
                          }`}
                      >
                        {task.isCompleted && (
                          <Check size={14} strokeWidth={3} />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-medium text-gray-900 truncate ${task.isCompleted ? "line-through text-gray-500" : ""
                            }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Calendar size={12} />
                          {new Date(task.scheduledDate).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                          {task.scheduledTime && ` · ${task.scheduledTime}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task._id)}
                        className="shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Special Deals */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6">
            {displayDeals.map((deal, idx) => {
              const isCombo = deal.images && deal.images.length > 1;

              if (isCombo) {
                return (
                  <div
                    key={idx}
                    className="relative group bg-white border border-gray-200 overflow-hidden rounded-2xl h-80 md:h-64 cursor-pointer hover:border-red-300 hover:shadow-xl transition-all flex flex-col md:flex-row"
                    onClick={() => navigate(deal.link && deal.link.trim() !== "" ? deal.link : `/products?search=${encodeURIComponent(deal.title)}`)}
                  >
                    {/* Image Area - Combo Display */}
                    <div className="relative w-full md:w-1/2 h-40 md:h-full bg-gray-50 flex items-center justify-center p-4">
                      {/* Ribbon */}
                      <div className="absolute z-30 bg-red-600 text-white text-xs font-bold px-6 py-1.5 uppercase tracking-wider transform -rotate-6 top-[40%] md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 shadow-lg">
                        Combo Offer
                      </div>

                      {/* Side-by-side products */}
                      <div className="flex items-center justify-center w-full z-10 gap-2">
                        {deal.images.slice(0, 2).map((img, i) => (
                          <div 
                            key={i} 
                            className={`w-28 h-28 md:w-32 md:h-32 bg-white rounded-xl shadow-sm border border-gray-100 p-2 transform transition-transform duration-500 group-hover:scale-105 z-20 ${i === 0 ? '-rotate-3' : 'rotate-3'}`}
                          >
                            <img
                              src={img}
                              alt={`${deal.title} product ${i + 1}`}
                              className="w-full h-full object-contain drop-shadow-sm"
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Badge if available */}
                      {deal.badge && (
                        <div className="absolute top-3 left-3 z-30 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                          {deal.badge}
                        </div>
                      )}
                    </div>

                    {/* Text Area */}
                    <div className="w-full md:w-1/2 p-6 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-100">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 line-clamp-2">
                        {deal.title}
                      </h3>
                      <p className="text-gray-600 text-sm md:text-base mb-4 line-clamp-3">
                        {deal.subtitle}
                      </p>
                      
                      {deal.price && (
                        <div className="flex items-end gap-3 mb-4">
                           <span className="text-2xl font-bold text-green-600">Rs. {deal.price}</span>
                           {deal.originalPrice && <span className="text-gray-400 line-through text-sm mb-1">Rs. {deal.originalPrice}</span>}
                        </div>
                      )}
                      
                      <div className="mt-auto">
                        <button 
                          onClick={(e) => {
                            if (!deal.link || deal.link.trim() === "" || deal.link === "/products") {
                              handleAddDealToCart(e, deal);
                            } else {
                              navigate(deal.link);
                            }
                          }}
                          className="w-full px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 rounded-lg font-bold transition-colors duration-200 inline-flex items-center justify-center gap-2"
                        >
                          {(!deal.link || deal.link.trim() === "" || deal.link === "/products") ? 'Add Combo to Cart' : 'Get Combo Deal'} <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }

              // Standard full-background Deal Banner
              return (
                <div
                  key={idx}
                  className="relative group overflow-hidden rounded-2xl h-64 cursor-pointer"
                  onClick={() => navigate(deal.link && deal.link.trim() !== "" ? deal.link : `/products?search=${encodeURIComponent(deal.title)}`)}
                >
                  <img
                    src={deal.image || (deal.images && deal.images[0])}
                    alt={deal.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div
                    className={`absolute inset-0 bg-linear-to-r ${deal.color || 'from-green-500 to-emerald-700'} opacity-80`}
                  ></div>
                  <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full self-start">
                      <Gift size={16} className="text-white" />
                      <span className="text-sm font-bold text-white">
                        {deal.badge}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        {deal.title}
                      </h3>
                      <p className="text-xl text-white/90 mb-4">
                        {deal.subtitle}
                      </p>
                      <button 
                        className="px-6 py-3 bg-white text-gray-900 rounded-lg font-bold hover:bg-gray-100 transition-colors duration-200 inline-flex items-center gap-2"
                      >
                        Shop Now <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section className="py-16 bg-linear-to-br from-purple-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 rounded-full mb-4">
              <Zap size={16} className="text-purple-600" />
              <span className="text-sm font-bold text-purple-700">
                AI-Powered Technology
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              Your Intelligent Farming Assistant
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Harness the power of artificial intelligence to grow healthier
              crops and maximize yields
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {aiFeatures.map((feature, idx) => (
              <div key={idx} className="group relative">
                <div className="absolute -inset-1 bg-linear-to-r from-green-400 to-blue-500 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500"></div>
                <div className="relative p-8 bg-white rounded-2xl border-2 border-gray-100 hover:border-transparent transition-all duration-300">
                  <div
                    className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon
                      className={`text-${feature.color}-600`}
                      size={32}
                    />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">
                      {feature.title}
                    </h3>
                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                      {feature.stats}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {feature.description}
                  </p>
                  <button className="text-green-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                    Learn More <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button onClick={() => navigate("/disease-detection")} className="px-8 py-4 bg-linear-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-bold shadow-2xl hover:shadow-green-500/50 transform hover:-translate-y-1 transition-all duration-300 inline-flex items-center gap-2">
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
              onClick={() => navigate("/products")}
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
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${selectedCategory === cat.id
                  ? "bg-green-600 text-white shadow-lg shadow-green-200 scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
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
                <div
                  key={product._id}
                  className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="relative h-56 overflow-hidden bg-gray-50 cursor-pointer"
                  >
                    <img
                      src={
                        product.image.startsWith("http")
                          ? product.image
                          : `${API_BASE_URL}/${product.image.replace(/\\/g, "/")}`
                      }
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 right-12 flex flex-col items-start gap-2 max-h-full overflow-hidden">
                      {product.discount > 0 && (
                        <div className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          <Percent size={12} />
                          {product.discount}% OFF
                        </div>
                      )}
                      {product.offerText && (
                        <div className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          <Tag size={12} />
                          {product.offerText}
                        </div>
                      )}
                      <div className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg shrink-0">
                        {product.category}
                      </div>
                    </div>

                    {/* Wishlist Button */}
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

                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-sm text-green-600 text-xs font-bold rounded-full border border-green-200">
                      {product.stock > 0 ? "In Stock" : "Out of Stock"}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors min-h-12 cursor-pointer"
                    >
                      {product.name}
                    </h3>

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={`${i < Math.floor(product.rating || 4.5) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-sm font-bold text-gray-900 ml-1">
                          {product.rating || 4.5}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-gray-900">
                            Rs. {product.price}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setActiveChat({
                            id: product.seller,
                            name: "Seller",
                            productId: product._id,
                            productName: product.name,
                          })
                        }
                        className="p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200"
                        title="Chat with Seller"
                      >
                        <MessageSquare size={18} className="text-green-600" />
                      </button>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await api.post("/cart", {
                            productId: product._id,
                            quantity: 1,
                          });
                          alert("Added to cart!");
                          navigate("/cart");
                        } catch (e) {
                          console.error(e);
                          alert("Failed to add to cart");
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
      <section className="py-16 bg-linear-to-br from-green-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {displayStats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                  <stat.icon className="text-white" size={32} />
                </div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </div>
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
                  className={`transition-opacity duration-500 ${currentTestimonial === index
                    ? "opacity-100"
                    : "opacity-0 absolute inset-0"
                    }`}
                >
                  <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
                    <Quote className="text-green-200 mb-6" size={48} />

                    <div className="flex items-center gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          size={20}
                          className="fill-yellow-400 text-yellow-400"
                        />
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
                        <div className="font-bold text-gray-900 text-lg">
                          {testimonial.name}
                        </div>
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
                  className={`h-2 rounded-full transition-all duration-300 ${currentTestimonial === index
                    ? "w-12 bg-green-600"
                    : "w-2 bg-gray-300"
                    }`}
                />
              ))}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={() =>
                setCurrentTestimonial(
                  (prev) =>
                    (prev - 1 + displayTestimonials.length) %
                    displayTestimonials.length,
                )
              }
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 p-3 bg-white hover:bg-gray-50 rounded-full shadow-lg transition-all duration-300"
            >
              <ChevronLeft className="text-gray-700" size={24} />
            </button>
            <button
              onClick={() =>
                setCurrentTestimonial(
                  (prev) => (prev + 1) % displayTestimonials.length,
                )
              }
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
            <button 
              onClick={() => navigate('/blog')}
              className="mt-4 md:mt-0 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors duration-200 inline-flex items-center gap-2"
            >
              View All Articles <ArrowRight size={18} />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts.map((post, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/blog/${post._id}`)}
                className="group bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer"
              >
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
                    <span>
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-xl mb-4 line-clamp-2 group-hover:text-green-600 transition-colors">
                    {post.title}
                  </h3>
                  <button 
                    onClick={() => navigate(`/blog/${post._id}`)}
                    className="text-green-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all duration-300"
                  >
                    Read More <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
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
                Empowering farmers with AI-powered solutions and premium organic
                products.
              </p>
              <div className="flex gap-3">{/* Social icons placeholder */}</div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Products</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Organic Fertilizers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    NPK Solutions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Specialty Products
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Combo Packs
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Careers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Shipping Info
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Returns
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-green-400 transition-colors"
                  >
                    Track Order
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
            <p className="text-gray-400">
              © 2026 AgriAssist. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-green-400 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-green-400 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-green-400 transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
