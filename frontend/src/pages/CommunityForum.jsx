import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Eye,
  MessageSquare,
  Filter,
  Plus,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CommunityForum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const categories = [
    "All",
    "Crop Disease",
    "Pest Management",
    "Seasonal Advice",
    "Soil & Fertility",
    "Water Management",
    "Weather & Climate",
    "Tools & Equipment",
    "Market Prices",
    "General Query",
  ];

  useEffect(() => {
    const loadPosts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();

        if (selectedCategory !== "All") {
          params.append("category", selectedCategory);
        }
        if (searchTerm) {
          params.append("search", searchTerm);
        }
        params.append("sortBy", sortBy);

        const response = await fetch(
          `http://localhost:5000/api/forum?${params.toString()}`
        );
        const data = await response.json();

        if (data.success) {
          setPosts(data.data);
        }
      } catch (err) {
        setError("Failed to fetch posts");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [selectedCategory, sortBy, searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already triggered by useEffect when searchTerm changes
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Crop Disease": "bg-red-100 text-red-700",
      "Pest Management": "bg-orange-100 text-orange-700",
      "Seasonal Advice": "bg-blue-100 text-blue-700",
      "Soil & Fertility": "bg-green-100 text-green-700",
      "Water Management": "bg-cyan-100 text-cyan-700",
      "Weather & Climate": "bg-purple-100 text-purple-700",
      "Tools & Equipment": "bg-indigo-100 text-indigo-700",
      "Market Prices": "bg-yellow-100 text-yellow-700",
      "General Query": "bg-gray-100 text-gray-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const getStatusIcon = (status) => {
    if (status === "answered") {
      return (
        <CheckCircle className="w-5 h-5 text-green-600" title="Has accepted answer" />
      );
    } else if (status === "closed") {
      return (
        <AlertCircle className="w-5 h-5 text-gray-400" title="Closed" />
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Community Forum
            </h1>
            <p className="text-lg text-gray-600">
              Share knowledge, ask questions, and get expert advice
            </p>
          </div>

          {isAuthenticated && (
            <button
              onClick={() => navigate("/forum/create")}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
            >
              <Plus size={20} />
              Ask Question
            </button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
          </form>

          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="latest">Latest</option>
              <option value="views">Most Viewed</option>
              <option value="most-replies">Most Replies</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-green-600 text-white shadow-lg"
                  : "bg-white text-gray-700 border border-gray-300 hover:border-green-600"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-green-600" size={32} />
              <span className="ml-3 text-gray-600">Loading discussions...</span>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
              <MessageCircle className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <p className="text-gray-700">No discussions found. Be the first to ask!</p>
              {isAuthenticated && (
                <button
                  onClick={() => navigate("/forum/create")}
                  className="mt-4 text-green-600 font-bold hover:underline"
                >
                  Start a discussion
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                onClick={() => navigate(`/forum/${post._id}`)}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 hover:text-green-600">
                        {post.title}
                      </h3>
                      {getStatusIcon(post.status)}
                    </div>
                    <p className="text-gray-600 line-clamp-2">
                      {post.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(
                      post.category
                    )}`}
                  >
                    {post.category}
                  </span>

                  <span className="text-xs text-gray-500">
                    by {post.userName}
                  </span>

                  <div className="flex items-center gap-1 text-gray-600">
                    <Eye size={16} />
                    <span className="text-xs">{post.views} views</span>
                  </div>

                  <div className="flex items-center gap-1 text-gray-600">
                    <MessageSquare size={16} />
                    <span className="text-xs">{post.replies.length} replies</span>
                  </div>

                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityForum;
