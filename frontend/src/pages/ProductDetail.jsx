import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Star, ShoppingCart, ArrowLeft, MessageSquare, Shield, 
  Truck, Clock, Info, CheckCircle, Percent, Share2, Heart,
  Minus, Plus, Send, ChevronRight, Loader2, User
} from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/ChatWindow';
import api from '../services/api';
import { useToast } from '../components/Toast';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showChat, setShowChat] = useState(false);
  const [question, setQuestion] = useState('');
  const [rating, setRating] = useState(5);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    if (!question.trim()) return;

    try {
      setSubmittingQuestion(true);
      const response = await fetch(`http://localhost:5000/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comment: question, rating })
      });
      const data = await response.json();
      if (data.success) {
        setProduct(data.data);
        setQuestion('');
        addToast('Review submitted successfully!', 'success');
      }
    } catch (error) {
      console.error('Error adding question:', error);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleAddToCart = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/cart', {
        productId: product._id,
        quantity: quantity
      });
      addToast('Product added to cart successfully!', 'success');
    } catch (error) {
      console.error('Error adding to cart:', error);
      addToast('Failed to add product to cart', 'error');
    }
  };

  const handleBuyNow = async () => {
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/cart', {
        productId: product._id,
        quantity: quantity
      });
      navigate('/payment');
    } catch (error) {
      console.error('Error adding to cart for buy now:', error);
      addToast('Failed to proceed with purchase', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <Loader2 className="animate-spin text-green-600" size={48} />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-gray-900">Product not found</h2>
          <button onClick={() => navigate('/home')} className="mt-4 text-green-600 font-semibold">
            Go back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/home')} className="hover:text-green-600">Home</button>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-medium">{product.category}</span>
          <ChevronRight size={14} />
          <span className="text-gray-400 line-clamp-1">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 group">
              <img 
                src={product.image.startsWith('http') ? product.image : `http://localhost:5000/${product.image.replace(/\\/g, '/')}`} 
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white text-gray-600 hover:text-red-500 transition-all">
                  <Heart size={20} />
                </button>
                <button className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white text-gray-600 hover:text-green-600 transition-all">
                  <Share2 size={20} />
                </button>
              </div>
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 px-4 py-2 bg-red-500 text-white font-bold rounded-full shadow-lg">
                   {product.discount}% OFF
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                {product.stock > 0 ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                    <CheckCircle size={14} /> In Stock
                  </span>
                ) : (
                  <span className="text-xs font-medium text-red-500">Out of Stock</span>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={18} 
                      className={`${i < Math.floor(product.rating || 4.5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="ml-2 font-bold text-gray-900">{product.rating ? product.rating.toFixed(1) : '4.5'}</span>
                </div>
                <div className="h-4 w-px bg-gray-200"></div>
                <button className="text-sm font-medium text-green-600 hover:text-green-700">
                  {product.reviews.length} Reviews & Questions
                </button>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold text-gray-900">
                  Rs. {product.discount > 0 
                    ? (product.price * (1 - product.discount / 100)).toFixed(2) 
                    : Number(product.price).toFixed(2)}
                </span>
                {product.discount > 0 && (
                  <span className="text-xl text-gray-400 line-through">Rs. {Number(product.price).toFixed(2)}</span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed line-clamp-3">
                {product.description}
              </p>
            </div>

            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={20} />
                  Add to Cart
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setShowChat(true)}
                  className="py-4 border-2 border-green-600 text-green-600 hover:bg-green-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare size={20} />
                  Chat with Seller
                </button>
                <button 
                  onClick={handleBuyNow}
                  className="py-4 bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-bold transition-all"
                >
                  Buy Now
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-gray-100 text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Truck size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Fast Delivery</p>
                  <p className="text-gray-500">2-4 business days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">Secure Warranty</p>
                  <p className="text-gray-500">100% Quality Assurance</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details & Q&A Tabs */}
        <div className="mt-12">
          <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">
            {['description', 'specifications', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 font-bold text-sm uppercase tracking-wider transition-all relative ${
                  activeTab === tab ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-green-600 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-600">
                <p className="mb-4">{product.description}</p>
                <h4 className="text-gray-900 font-bold mb-2">Key Benefits:</h4>
                <ul className="list-disc pl-5 space-y-2">
                   <li>High quality nutrient content</li>
                   <li>Eco-friendly and sustainable choice</li>
                   <li>Faster growth and improved yield</li>
                   <li>Trusted by professional farmers</li>
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="grid md:grid-cols-2 gap-8">
                <table className="w-full text-sm">
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-4 font-medium text-gray-500">Category</td>
                      <td className="py-4 font-bold text-gray-900">{product.category}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-4 font-medium text-gray-500">SKU</td>
                      <td className="py-4 font-bold text-gray-900">{product.sku || 'N/A'}</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-4 font-medium text-gray-500">Stock Status</td>
                      <td className="py-4 font-bold text-gray-900">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</td>
                    </tr>
                  </tbody>
                </table>
                <table className="w-full text-sm">
                   <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-4 font-medium text-gray-500">Weight</td>
                      <td className="py-4 font-bold text-gray-900">50kg (Standard)</td>
                    </tr>
                    <tr className="border-b border-gray-50">
                      <td className="py-4 font-medium text-gray-500">Seller</td>
                      <td className="py-4 font-bold text-green-600">{product.seller?.name || 'AgriAssist Certified'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8">
                {/* Ask a Question */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageSquare size={20} className="text-green-600" />
                    Ask a Question or Post a Review
                  </h4>
                  <form onSubmit={handleAddReview} className="relative">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-gray-700 font-medium">Your Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star 
                              size={24} 
                              className={`${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} transition-colors`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea 
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Type your question or review here..."
                      className="w-full p-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none min-h-[120px] transition-all"
                    ></textarea>
                    <button 
                      type="submit"
                      disabled={submittingQuestion || !question.trim()}
                      className="absolute bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {submittingQuestion ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                      Post
                    </button>
                  </form>
                </div>

                {/* Question List */}
                <div className="space-y-6">
                  {product.reviews.length > 0 ? (
                    product.reviews.map((review, idx) => (
                      <div key={idx} className="pb-6 border-b border-gray-100 last:border-0 relative group">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold">
                              {review.userName?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{review.userName || 'Anonymous'}</p>
                              <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                   {[...Array(5)].map((_, i) => (
                                      <Star key={i} size={12} className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                                   ))}
                                </div>
                                <span className="text-xs text-gray-400 italic">Verified Buyer</span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-400">
                             {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {user && (user._id === review.user || user.role === 'admin') && (
                            <button 
                                onClick={async () => {
                                    if(window.confirm('Delete this review?')) {
                                        try {
                                            await api.delete(`/products/${product._id}/reviews/${review._id}`);
                                            fetchProduct();
                                            addToast('Review deleted', 'success');
                                        } catch(err) {
                                            addToast('Failed to delete review', 'error');
                                        }
                                    }
                                }}
                                className="absolute top-0 right-0 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all font-bold text-xs"
                            >
                                DELETE
                            </button>
                        )}
                        <p className="text-gray-600 text-sm leading-relaxed mb-4">
                          {review.comment}
                        </p>
                        
                        {/* Seller Reply */}
                        {review.replies && review.replies.length > 0 && review.replies.map((reply, rid) => (
                          <div key={rid} className="ml-8 mt-4 bg-green-50/50 p-4 rounded-xl border-l-4 border-green-500">
                             <div className="flex items-center gap-2 mb-2">
                                <Shield size={14} className="text-green-600" />
                                <span className="text-sm font-bold text-gray-900">AgriAssist Expert Reply</span>
                             </div>
                             <p className="text-gray-600 text-sm italic">
                                "{reply.text}"
                             </p>
                          </div>
                        ))}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                       <Info size={48} className="mx-auto mb-4 opacity-20" />
                       <p>No questions or reviews yet. Be the first to ask!</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Floating Chat Window */}
      {showChat && (
        <ChatWindow 
          receiverId={product.seller?._id || product.seller} // Handle both populated and ID
          receiverName={product.seller?.name || 'Seller'}
          productId={product._id}
          productName={product.name}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
           <p>© 2026 AgriAssist. Empowering Farmers with Innovation.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProductDetail;
