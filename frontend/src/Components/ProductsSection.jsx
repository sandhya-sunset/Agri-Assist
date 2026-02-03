import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, Search, Filter, Star, X, Send, Tag, Percent, Loader, Package } from 'lucide-react';
import productService from '../services/productService';
import { useSocket } from '../context/SocketContext';

const ProductsSection = ({ initialShowAddModal, searchQuery = '' }) => {
  const [showAddModal, setShowAddModal] = useState(initialShowAddModal || false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [replyText, setReplyText] = useState({});
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Fertilizer',
    price: '',
    description: '',
    stock: '',
    sku: '',
    discount: 0,
    offerText: ''
  });
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { socket } = useSocket();

  useEffect(() => {
    fetchProducts();
  }, []);

  // Listen for real-time stock updates
  useEffect(() => {
    if (!socket) return;
    
    const handleStockUpdate = (data) => {
      console.log('📦 Stock updated:', data);
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product._id === data.productId 
            ? { ...product, stock: data.newStock }
            : product
        )
      );
    };
    
    socket.on('stockUpdated', handleStockUpdate);
    
    return () => {
      socket.off('stockUpdated', handleStockUpdate);
    };
  }, [socket]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await productService.getProducts();
      setProducts(res.data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscountedPrice = (price, discount) => {
    if (!discount || discount === 0) return price;
    return (price - (price * discount / 100)).toFixed(2);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1592424002053-21f369ad7fdb?w=100&h=100&fit=crop'; // Fallback
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000/${imagePath.replace(/\\/g, '/')}`;
  };

  const handleDeleteProduct = async (id) => {
    try {
      await productService.deleteProduct(id);
      fetchProducts();
      setShowDeleteConfirm(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete product');
    }
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setEditFormData({ ...product, imageFile: null }); // Reset image file
    setShowEditModal(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setShowViewModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('category', editFormData.category);
      formData.append('price', editFormData.price);
      formData.append('stock', editFormData.stock);
      formData.append('description', editFormData.description);
      formData.append('sku', editFormData.sku);
      formData.append('discount', editFormData.discount);
      formData.append('offerText', editFormData.offerText || '');
      formData.append('status', editFormData.status);

      if (editFormData.imageFile) {
        formData.append('image', editFormData.imageFile);
      }

      await productService.updateProduct(selectedProduct._id, formData);
      fetchProducts();
      setShowEditModal(false);
      setSelectedProduct(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update product');
    }
  };

  const handleAddProduct = async () => {
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('category', newProduct.category);
      formData.append('price', newProduct.price);
      formData.append('stock', newProduct.stock);
      formData.append('description', newProduct.description);
      formData.append('sku', newProduct.sku);
      formData.append('discount', newProduct.discount);
      formData.append('offerText', newProduct.offerText || '');
      
      const status = parseInt(newProduct.stock) > 0 ? 'active' : 'draft';
      formData.append('status', status);

      if (newProduct.imageFile) {
        formData.append('image', newProduct.imageFile);
      } else {
        alert('Please select an image');
        return;
      }

      await productService.createProduct(formData);
      fetchProducts();
      setShowAddModal(false);
      setNewProduct({
        name: '',
        category: 'Fertilizer',
        price: '',
        description: '',
        stock: '',
        sku: '',
        discount: 0,
        offerText: '',
        imageFile: null
      });
    } catch (err) {
      console.error(err);
      alert('Failed to create product');
    }
  };

  const handleAddReply = async (productId, reviewId) => {
    const reply = replyText[reviewId];
    if (!reply || !reply.trim()) return;

    try {
      await productService.replyToReview(productId, reviewId, reply);
      
      const res = await productService.getProducts(); 
      setProducts(res.data);
      
      if (selectedProduct && selectedProduct._id === productId) {
        const updated = res.data.find(p => p._id === productId);
        setSelectedProduct(updated);
      }
      
      setReplyText({ ...replyText, [reviewId]: '' });
      
    } catch (err) {
      console.error(err);
      alert('Failed to add reply');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <Loader className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-red-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="text-red-600" size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchProducts}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Products</h2>
            <p className="text-gray-600 mt-1">Manage your product inventory</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus size={20} />
            Add Product
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
            <div className="flex-1 min-w-[200px]">
              {/* Global search is now in the header */}
               <p className="text-sm text-gray-500 py-2">Use the top bar to search products.</p>
            </div>
            </div>
            
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>All Categories</option>
              <option>Fertilizer</option>
              <option>Pesticide</option>
              <option>Seeds</option>
              <option>Tools</option>
              <option>Supplements</option>
              <option>Disease Treatment</option>
              <option>Other</option>
            </select>
            
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
              <option>All Status</option>
              <option>Active</option>
              <option>Out of Stock</option>
              <option>Draft</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={20} />
              More Filters
            </button>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Product</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Category</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Price</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Offer</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Stock</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      {/* existing columns content */}
                      <td className="px-6 py-4">
                        <div 
                          className="flex items-center gap-3 cursor-pointer group"
                          onClick={() => handleViewProduct(product)}
                        >
                          <div className="relative">
                            <img 
                              src={getImageUrl(product.image)} 
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover group-hover:opacity-80 transition-opacity"
                            />
                            {product.discount > 0 && (
                              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                                -{product.discount}%
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 group-hover:text-green-600 transition-colors">{product.name}</p>
                            <p className="text-sm text-gray-500">ID: #{product._id.substring(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">{product.category}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          {product.discount > 0 ? (
                            <>
                              <span className="font-semibold text-green-600">Rs {calculateDiscountedPrice(product.price, product.discount)}</span>
                              <span className="text-sm text-gray-400 line-through">Rs {product.price}</span>
                            </>
                          ) : (
                            <span className="font-semibold text-gray-800">Rs {product.price}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {product.offerText ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">
                            <Tag size={12} />
                            {product.offerText}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`${product.stock > 0 ? 'text-gray-800' : 'text-red-600'}`}>
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          product.status === 'active' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {product.status === 'active' ? 'Active' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleViewProduct(product)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="p-2 hover:bg-green-50 rounded-lg text-green-600 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedProduct(product);
                              setShowDeleteConfirm(true);
                            }}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="text-gray-300" size={48} />
                        <p className="text-gray-500 font-medium">No products found</p>
                        <p className="text-sm text-gray-400">Add some products to get started</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold">Add New Product</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter product name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select 
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option>Fertilizer</option>
                      <option>Pesticide</option>
                      <option>Seeds</option>
                      <option>Tools</option>
                      <option>Supplements</option>
                      <option>Disease Treatment</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="4"
                    placeholder="Enter product description"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="SKU-001"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Percent size={18} className="text-orange-600" />
                    Offers & Discounts
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                      <input
                        type="number"
                        value={newProduct.discount}
                        onChange={(e) => setNewProduct({...newProduct, discount: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Offer Text</label>
                      <input
                        type="text"
                        value={newProduct.offerText}
                        onChange={(e) => setNewProduct({...newProduct, offerText: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Summer Sale"
                      />
                    </div>
                  </div>
                  {newProduct.discount > 0 && newProduct.price && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Final Price: </span>
                        <span className="text-green-600 font-bold">Rs {calculateDiscountedPrice(parseFloat(newProduct.price), parseInt(newProduct.discount))}</span>
                        <span className="text-gray-500 ml-2 line-through">Rs {newProduct.price}</span>
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={(e) => setNewProduct({...newProduct, imageFile: e.target.files[0]})}
                      accept="image/*"
                    />
                    <Plus className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-500">
                      {newProduct.imageFile ? newProduct.imageFile.name : "Click to upload images"}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddProduct}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm" style={{zIndex: 9999}}>
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold">Edit Product</h3>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select 
                      value={editFormData.category || ''}
                      onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option>Fertilizer</option>
                      <option>Pesticide</option>
                      <option>Seeds</option>
                      <option>Tools</option>
                      <option>Supplements</option>
                      <option>Disease Treatment</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      value={editFormData.price || ''}
                      onChange={(e) => setEditFormData({...editFormData, price: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editFormData.description || ''}
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="4"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={editFormData.stock || ''}
                      onChange={(e) => setEditFormData({...editFormData, stock: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      value={editFormData.sku || ''}
                      onChange={(e) => setEditFormData({...editFormData, sku: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Percent size={18} className="text-orange-600" />
                    Offers & Discounts
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (%)</label>
                      <input
                        type="number"
                        value={editFormData.discount || 0}
                        onChange={(e) => setEditFormData({...editFormData, discount: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Offer Text</label>
                      <input
                        type="text"
                        value={editFormData.offerText || ''}
                        onChange={(e) => setEditFormData({...editFormData, offerText: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Summer Sale"
                      />
                    </div>
                  </div>
                  {editFormData.discount > 0 && editFormData.price && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Final Price: </span>
                        <span className="text-green-600 font-bold">Rs {calculateDiscountedPrice(editFormData.price, editFormData.discount)}</span>
                        <span className="text-gray-500 ml-2 line-through">Rs {editFormData.price}</span>
                      </p>
                    </div>
                  )}
                </div>

                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">Update Image</label>
                   <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-green-500 transition-colors cursor-pointer relative">
                      <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => setEditFormData({...editFormData, imageFile: e.target.files[0]})}
                        accept="image/*"
                      />
                      <Plus className="mx-auto text-gray-400 mb-1" size={20} />
                      <p className="text-gray-500 text-sm">
                        {editFormData.imageFile ? editFormData.imageFile.name : "Click to change image"}
                      </p>
                   </div>
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveEdit}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Product Modal with Reviews */}
        {showViewModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm" style={{zIndex: 9999}}>
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold">Product Details</h3>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Product Information */}
                <div className="flex gap-6">
                  <div className="relative">
                    <img 
                      src={getImageUrl(selectedProduct.image)} 
                      alt={selectedProduct.name}
                      className="w-48 h-48 rounded-xl object-cover shadow-md"
                    />
                    {selectedProduct.discount > 0 && (
                      <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                        -{selectedProduct.discount}%
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="text-2xl font-bold text-gray-800">{selectedProduct.name}</h4>
                      <p className="text-gray-500 mt-1">SKU: {selectedProduct.sku}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div>
                        {selectedProduct.discount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="text-3xl font-bold text-green-600">
                              Rs {calculateDiscountedPrice(selectedProduct.price, selectedProduct.discount)}
                            </span>
                            <span className="text-lg text-gray-400 line-through">Rs {selectedProduct.price}</span>
                          </div>
                        ) : (
                          <span className="text-3xl font-bold text-gray-800">Rs {selectedProduct.price}</span>
                        )}
                      </div>
                      {selectedProduct.offerText && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg font-medium">
                          <Tag size={14} />
                          {selectedProduct.offerText}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 pt-2">
                      <div>
                        <p className="text-sm text-gray-500">Category</p>
                        <p className="font-semibold text-gray-800">{selectedProduct.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Stock</p>
                        <p className={`font-semibold ${selectedProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedProduct.stock} units
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          selectedProduct.status === 'active' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          {selectedProduct.status === 'active' ? 'Active' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-sm text-gray-500 mb-1">Description</p>
                      <p className="text-gray-700">{selectedProduct.description}</p>
                    </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-lg font-bold text-gray-800 mb-4">
                    Customer Reviews ({selectedProduct.reviews?.length || 0})
                  </h4>
                  
                  {!selectedProduct.reviews || selectedProduct.reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No reviews yet for this product</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedProduct.reviews?.map((review) => (
                        <div key={review._id || review.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-800">{review.userName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star 
                                      key={i} 
                                      size={16} 
                                      className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          
                          {review.comment && <p className="text-gray-700 mb-3">{review.comment}</p>}
                          
                          {/* Replies */}
                          {review.replies?.length > 0 && (
                            <div className="ml-6 space-y-2 mb-3">
                              {review.replies.map((reply, idx) => (
                                <div key={idx} className="bg-white rounded-lg p-3 border-l-4 border-green-500">
                                  <p className="text-sm font-semibold text-green-600 mb-1">Store Response</p>
                                  <p className="text-sm text-gray-700">{reply.text}</p>
                                  <p className="text-xs text-gray-500 mt-1">{reply.date}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Reply Input */}
                          <div className="ml-6 flex gap-2">
                            <input
                              type="text"
                              value={replyText[review._id || review.id] || ''}
                              onChange={(e) => setReplyText({...replyText, [review._id || review.id]: e.target.value})}
                              placeholder="Write a response..."
                              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                            <button
                              onClick={() => handleAddReply(selectedProduct._id, review._id || review.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <Send size={16} />
                              Reply
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button 
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditProduct(selectedProduct);
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Edit2 size={18} />
                  Edit Product
                </button>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm" style={{zIndex: 9999}}>
            <div className="bg-white rounded-xl max-w-md w-full shadow-2xl">
              <div className="p-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="text-red-600" size={24} />
                </div>
                <h3 className="text-xl font-bold text-center mb-2">Delete Product</h3>
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to delete "{selectedProduct.name}"? This action cannot be undone.
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedProduct(null);
                    }}
                    className="flex-1 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(selectedProduct._id)}
                    className="flex-1 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsSection;
