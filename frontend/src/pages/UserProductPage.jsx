import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, Filter, Edit, Trash2, 
  MoreVertical, AlertCircle, Loader2, Star, TrendingUp
} from 'lucide-react';
import Navbar from '../components/Navbar';
import productService from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserProductPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProducts();
  }, [user]);

  const fetchUserProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getProducts(user?._id); 
      setProducts(data.data || []); 
    } catch (error) {
      console.error('Error fetching user products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productService.deleteProduct(productId);
        setProducts(products.filter(p => p._id !== productId));
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
            <p className="text-gray-600 mt-1">Manage your product listings and inventory</p>
          </div>
          <button 
            onClick={() => {/* Navigate to add product page if it exists or open modal */}}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2"
          >
            <Plus size={20} />
            Add New Product
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <Package className="text-green-600" size={24} />
              </div>
              <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{products.length}</p>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Star className="text-blue-600" size={24} />
              </div>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">4.8 avg</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Average Rating</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">4.5</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">Total Views</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">1.2k</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search your products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 flex items-center gap-2 text-gray-700 font-medium transition-colors">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-green-600" size={48} />
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <div className="relative h-48 overflow-hidden bg-gray-50">
                  <img 
                    src={product.image?.startsWith('http') ? product.image : `http://localhost:5000/${product.image?.replace(/\\/g, '/')}`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-2">
                      <button 
                        onClick={() => navigate(`/product/edit/${product._id}`)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-blue-50 text-blue-600 shadow-sm"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product._id)}
                        className="p-2 bg-white/90 backdrop-blur-sm rounded-lg hover:bg-red-50 text-red-600 shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                   <div className="absolute bottom-2 left-2 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-bold text-gray-700 shadow-sm">
                   Rs. {product.discount > 0 
                      ? (product.price * (1 - product.discount / 100)).toFixed(2) 
                      : Number(product.price).toFixed(2)}
                  </div>
                  {product.discount > 0 && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-md shadow-sm">
                      -{product.discount}%
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{product.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      {product.rating || 0}
                    </span>
                    <span>{product.stock} in stock</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package size={40} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              You haven't listed any products yet. Start selling by adding your first product.
            </p>
            <button className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all duration-300 inline-flex items-center gap-2">
              <Plus size={20} />
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProductPage;
