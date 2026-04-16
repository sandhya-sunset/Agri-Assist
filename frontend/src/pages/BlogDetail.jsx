import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Clock, User, Share2 } from 'lucide-react';
import Navbar from '../Components/Navbar';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/blog/posts/${id}`);
        setPost(response.data.data);
      } catch (error) {
        console.error('Error fetching blog post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col justify-center items-center text-center px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Article Not Found</h2>
          <p className="text-gray-500 mb-8">The farming resource you are looking for does not exist or has been removed.</p>
          <button 
            onClick={() => navigate('/blog')}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Back to Articles
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-green-600 transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={18} />
          Back to previous
        </button>

        <article className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative h-[300px] md:h-[450px] w-full">
            <img 
              src={post.image || 'https://images.unsplash.com/photo-1592982537447-6f2aafe6a0c5'} 
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-6 left-6 px-4 py-1.5 bg-white shadow-md text-green-600 text-sm font-bold rounded-full uppercase tracking-wider">
              {post.category}
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500 mb-10 pb-8 border-b border-gray-100">
              {post.author?.name && (
                <div className="flex items-center gap-2 font-medium text-gray-800">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                    <User size={16} />
                  </div>
                  {post.author.name}
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-green-600" />
                {new Date(post.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>

              <div className="flex items-center gap-2">
                <Clock size={16} className="text-green-600" />
                {post.readTime}
              </div>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied to clipboard!');
                }}
                className="ml-auto flex items-center gap-2 hover:text-green-600 transition-colors bg-gray-50 px-3 py-1.5 rounded-lg"
              >
                <Share2 size={16} />
                Share
              </button>
            </div>

            <div 
              className="prose prose-lg prose-green max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </main>
    </div>
  );
};

export default BlogDetail;