import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, BookOpen, User } from 'lucide-react';
import axios from 'axios';
import Navbar from '../Components/Navbar';

const BlogListPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/blog/posts?limit=50`);
        setBlogPosts(response.data.data);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Farming Resources & News
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with expert tips, agricultural news, and guides carefully curated to help you grow better crops and manage your farm effectively.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg">
            No articles available at the moment. Please check back later.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <div
                key={post._id}
                onClick={() => navigate(`/blog/${post._id}`)}
                className="group bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
              >
                <div className="relative h-56 overflow-hidden bg-gray-200 shrink-0">
                  <img
                    src={post.image || 'https://images.unsplash.com/photo-1592982537447-6f2aafe6a0c5'}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1592982537447-6f2aafe6a0c5';
                    }}
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    {post.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 bg-gray-50 p-2 rounded-lg">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} className="text-green-600" />
                      <span>
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} className="text-green-600" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-xl mb-3 line-clamp-2 group-hover:text-green-600 transition-colors flex-1">
                    {post.title}
                  </h3>
                  
                  {post.author?.name && (
                     <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                        <User size={14} />
                        <span>By {post.author.name}</span>
                     </div>
                  )}

                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-green-600 font-semibold group-hover:underline">Read Article</span>
                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                      <ArrowRight size={16} />
                    </div>
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

export default BlogListPage;