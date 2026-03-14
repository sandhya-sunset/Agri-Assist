import React, { useState } from "react";
import { ArrowLeft, Send, Loader2, AlertCircle } from "lucide-react";
import Navbar from "../Components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CreateForumPost = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Crop Disease",
    cropType: "",
    location: "",
    tags: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const categories = [
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <p className="text-gray-700 mb-4">
              Please sign in to create a forum post
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }

    if (formData.title.length > 500) {
      setError("Title must be less than 500 characters");
      return;
    }

    if (formData.description.length > 5000) {
      setError("Description must be less than 5000 characters");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        ...(formData.cropType && { cropType: formData.cropType }),
        ...(formData.location && { location: formData.location }),
        ...(formData.tags && { tags: formData.tags.split(",").map((tag) => tag.trim()) }),
      };

      const response = await fetch("http://localhost:5000/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/forum/${data.data._id}`);
      } else {
        setError(data.message || "Failed to create post");
      }
    } catch (err) {
      console.error(err);
      setError("Error creating post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back Button */}
        <button
          onClick={() => navigate("/forum")}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 font-bold mb-6"
        >
          <ArrowLeft size={20} />
          Back to Forum
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Start a Discussion
          </h1>
          <p className="text-gray-600 mb-8">
            Ask a question or share your knowledge with the farming community
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Brief summary of your question or topic"
                maxLength="500"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/500
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Provide detailed information about your question or topic. Include any background information that would help others understand your situation."
                rows="8"
                maxLength="5000"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/5000
              </p>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Crop Type */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Crop Type (Optional)
              </label>
              <input
                type="text"
                name="cropType"
                value={formData.cropType}
                onChange={handleInputChange}
                placeholder="E.g., Rice, Wheat, Corn, Tomato"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Location (Optional)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="E.g., District, Province"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                placeholder="Separate tags with commas (e.g., leaf spot, fungal, prevention)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Creating...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Create Discussion
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/forum")}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Tips Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-3">Tips for a good question:</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li>
                ✓ Be clear and specific about your problem or topic
              </li>
              <li>
                ✓ Include relevant details like crop type, location, and symptoms
              </li>
              <li>
                ✓ Use appropriate category for better visibility
              </li>
              <li>
                ✓ Check if similar questions have already been answered
              </li>
              <li>
                ✓ Be respectful and open to suggestions from the community
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateForumPost;
