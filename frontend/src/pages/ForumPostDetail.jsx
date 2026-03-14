import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  ThumbsUp,
  CheckCircle,
  Send,
  Loader2,
  AlertCircle,
  MessageCircle,
  Eye,
  Clock,
} from "lucide-react";
import Navbar from "../Components/Navbar";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ForumPostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyContent, setReplyContent] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/forum/${id}`);
        const data = await response.json();

        if (data.success) {
          setPost(data.data);
        } else {
          setError("Post not found");
        }
      } catch (err) {
        setError("Failed to load post");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  const handleSubmitReply = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!replyContent.trim()) {
      alert("Please enter a reply");
      return;
    }

    try {
      setSubmittingReply(true);
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/forum/${id}/replies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: replyContent,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReplyContent("");
        setPost(data.data);
      } else {
        alert(data.message || "Failed to submit reply");
      }
    } catch (err) {
      console.error(err);
      alert("Error submitting reply");
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleAcceptAnswer = async (replyId) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/forum/${id}/replies/${replyId}/accept`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setPost(data.data);
      } else {
        alert(data.message || "Failed to accept answer");
      }
    } catch (err) {
      console.error(err);
      alert("Error accepting answer");
    }
  };

  const handleLikeReply = async (replyId) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/forum/${id}/replies/${replyId}/like`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setPost(data.data);
      }
    } catch (err) {
      console.error(err);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="animate-spin text-green-600" size={32} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
            <p className="text-gray-700">{error}</p>
            <button
              onClick={() => navigate("/forum")}
              className="mt-4 text-green-600 font-bold hover:underline"
            >
              Back to forum
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div>Post not found</div>
        </div>
      </div>
    );
  }

  const isPostOwner = user && user.id === post.userId;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Back Button */}
        <button
          onClick={() => navigate("/forum")}
          className="flex items-center gap-2 text-green-600 hover:text-green-700 font-bold mb-6"
        >
          <ArrowLeft size={20} />
          Back to Forum
        </button>

        {/* Post Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(
                    post.category
                  )}`}
                >
                  {post.category}
                </span>

                <span className="text-sm text-gray-600">
                  Posted by <span className="font-bold">{post.userName}</span>
                </span>

                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock size={16} />
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>

                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Eye size={16} />
                  {post.views} views
                </span>

                {post.status === "answered" && (
                  <span className="text-sm text-green-600 font-bold flex items-center gap-1">
                    <CheckCircle size={16} />
                    Answered
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap mb-6">
            {post.description}
          </p>

          {post.cropType && (
            <div className="bg-gray-50 border-l-4 border-green-600 p-4 mb-4">
              <p className="text-sm text-gray-600">
                <span className="font-bold">Crop Type:</span> {post.cropType}
              </p>
            </div>
          )}

          {post.location && (
            <div className="bg-gray-50 border-l-4 border-blue-600 p-4">
              <p className="text-sm text-gray-600">
                <span className="font-bold">Location:</span> {post.location}
              </p>
            </div>
          )}
        </div>

        {/* Replies Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MessageCircle size={24} />
            Replies ({post.replies.length})
          </h2>

          {post.replies.length === 0 ? (
            <div className="bg-gray-100 rounded-xl p-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">
                No replies yet. Be the first to help!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {post.replies.map((reply) => (
                <div
                  key={reply._id}
                  className={`rounded-xl p-6 ${
                    reply.isAccepted
                      ? "bg-green-50 border-2 border-green-600"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-bold text-gray-900">
                        {reply.userName}
                        {reply.isAccepted && (
                          <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                            Accepted Answer
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {isPostOwner && !reply.isAccepted && (
                      <button
                        onClick={() => handleAcceptAnswer(reply._id)}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full font-bold transition-all"
                      >
                        Accept Answer
                      </button>
                    )}
                  </div>

                  <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                    {reply.content}
                  </p>

                  <button
                    onClick={() => handleLikeReply(reply._id)}
                    className="flex items-center gap-1 text-gray-600 hover:text-red-600 transition-all"
                  >
                    <ThumbsUp size={16} />
                    <span className="text-sm">{reply.likes}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reply Form */}
        {isAuthenticated && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Share Your Knowledge
            </h3>
            <form onSubmit={handleSubmitReply}>
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply here... Share your expertise and help other farmers!"
                rows="6"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              <button
                type="submit"
                disabled={submittingReply || !replyContent.trim()}
                className="mt-4 flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                {submittingReply ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Post Reply
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {!isAuthenticated && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
            <p className="text-gray-700 mb-4">
              Sign in to share your expertise and help other farmers
            </p>
            <button
              onClick={() => navigate("/login")}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPostDetail;
