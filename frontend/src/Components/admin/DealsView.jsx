import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, Image as ImageIcon, CheckCircle, XCircle, Settings2 } from "lucide-react";
import api from "../../services/api";
import { toast } from "react-hot-toast";

const DealsView = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    image: "",
    images: [],
    badge: "Limited Time",
    color: "from-red-500 to-orange-600",
    active: true,
    link: "/products"
  });

  const colorOptions = [
    { label: "Red-Orange", value: "from-red-500 to-orange-600" },
    { label: "Green-Teal", value: "from-green-500 to-teal-600" },
    { label: "Blue-Indigo", value: "from-blue-500 to-indigo-600" },
    { label: "Purple-Pink", value: "from-purple-500 to-pink-600" },
    { label: "Yellow-Orange", value: "from-yellow-400 to-orange-500" },
  ];

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await api.get("/deals");
      if (response.data.success) {
        setDeals(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching deals:", error);
      toast.error("Failed to load deals");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // Process all selected files into Base64 strings
    Promise.all(
      files.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      })
    ).then((base64Strings) => {
      setFormData((prev) => {
        // Keep existing images and add new ones
        const updatedImages = [...(prev.images || []), ...base64Strings];
        return {
          ...prev,
          images: updatedImages,
          // Set primary image to the first one available if not already set
          image: updatedImages[0] || "",
        };
      });
    });
  };

  const removeImage = (indexToRemove) => {
    setFormData((prev) => {
      const updatedImages = (prev.images || []).filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        images: updatedImages,
        image: updatedImages[0] || "", // maintain primary
      };
    });
  };

  const openAddModal = () => {
    setFormData({
      title: "",
      subtitle: "",
      image: "",
      images: [],
      badge: "Limited Time",
      color: "from-red-500 to-orange-600",
      active: true,
      link: "/products"
    });
    setEditingId(null);
    setShowAdvanced(false);
    setShowModal(true);
  };

  const openEditModal = (deal) => {
    setFormData({
      title: deal.title || "",
      subtitle: deal.subtitle || "",
      image: deal.image || "",
      images: deal.images || [], // Load existing multiple images
      badge: deal.badge || "Limited Time",
      color: deal.color || "from-red-500 to-orange-600",
      active: deal.active !== undefined ? deal.active : true,
      link: deal.link || "/products"
    });
    setEditingId(deal._id);
    setShowAdvanced(false);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this deal?")) {
      try {
        const response = await api.delete(`/deals/${id}`);
        if (response.data.success) {
          toast.success("Deal deleted successfully");
          fetchDeals();
        }
      } catch (error) {
        console.error("Error deleting deal:", error);
        toast.error("Failed to delete deal");
      }
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.title || !formData.subtitle) {
      toast.error("Please fill in all required fields (Title and Description)");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        const response = await api.put(`/deals/${editingId}`, formData);
        if (response.data.success) {
          toast.success("Deal updated successfully");
        }
      } else {
        const response = await api.post("/deals", formData);
        if (response.data.success) {
          toast.success("Deal created successfully");
        }
      }
      setShowModal(false);
      fetchDeals();
    } catch (error) {
      console.error("Error saving deal:", error);
      toast.error(error.response?.data?.message || "Failed to save deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-green-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Combo Deals Management</h2>
          <p className="text-gray-500">Create promotional banners for the Home page</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Add Deal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.length > 0 ? deals.map((deal) => (
          <div key={deal._id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 flex flex-col">
            <div className={`h-32 bg-gradient-to-r ${deal.color} relative overflow-hidden flex items-center p-4`}>
              <div className="absolute inset-0 opacity-20 bg-black mix-blend-overlay"></div>
              
              <div className="z-10 text-white w-2/3 pr-4">
                <span className="inline-block px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-xs font-bold mb-2">
                  {deal.badge}
                </span>
                <h3 className="font-bold text-lg leading-tight line-clamp-1">{deal.title}</h3>
                <p className="text-white/80 text-xs mt-1 line-clamp-2">{deal.subtitle}</p>
              </div>
              
              <div className="z-10 w-1/3 h-full flex items-center justify-center">
                {deal.image ? (
                  <img src={deal.image} alt={deal.title} className="max-h-full object-contain drop-shadow-lg" />
                ) : (
                  <ImageIcon size={48} className="text-white/50" />
                )}
              </div>
            </div>
            
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="flex justify-between items-center mb-4">
                <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${deal.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {deal.active ? <CheckCircle size={14} /> : <XCircle size={14} />}
                  {deal.active ? "Active" : "Inactive"}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(deal.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => openEditModal(deal)}
                  className="flex-1 flex justify-center items-center gap-2 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium"
                >
                  <Edit size={16} /> Edit
                </button>
                <button 
                  onClick={() => handleDelete(deal._id)}
                  className="flex-none p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
            No deals found. Create your first promotional deal!
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h3 className="text-xl font-bold">{editingId ? "Edit Deal" : "Create New Deal"}</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              {/* Primary Simple Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">Combo / Deal Title *</label>
                  <input 
                    type="text" 
                    name="title" 
                    required 
                    value={formData.title} 
                    onChange={handleInputChange}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                    placeholder="e.g. Summer Fertilizer & Seeds Combo"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-bold text-gray-700">Description / Offer Details *</label>
                  <textarea 
                    name="subtitle" 
                    required 
                    rows="2"
                    value={formData.subtitle} 
                    onChange={handleInputChange}
                    className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="e.g. Get 3 bags of seeds and 1 premium fertilizer for just Rs. 1500!"
                  ></textarea>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-2">Upload Combo Images</label>
                  <div className="flex items-center gap-4">
                    <label className="cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 px-4 py-2 rounded-lg font-semibold inline-block border border-green-200 transition-colors">
                      <span>+ Select Multiple Images</span>
                      <input 
                        type="file" 
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-gray-500">Select images. They will be displayed together.</span>
                  </div>

                  {/* Multi-Image Preview */}
                  {(formData.images?.length > 0 || formData.image) && (
                    <div className="mt-3 flex flex-wrap gap-3">
                      {(formData.images?.length > 0 ? formData.images : (formData.image ? [formData.image] : [])).map((imgSrc, idx) => (
                        <div key={idx} className="relative p-1 border border-gray-200 rounded-lg bg-white shadow-sm group">
                          <img src={imgSrc} alt={`Preview ${idx}`} className="h-16 w-16 object-cover rounded" />
                          <button
                            type="button"
                            onClick={() => removeImage(idx)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Settings Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-green-600 transition-colors"
                >
                  <Settings2 size={16} />
                  {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
                </button>
              </div>

              {/* Advanced Settings Section */}
              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-gray-50 border border-gray-200 rounded-lg mt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Badge Text</label>
                    <input 
                      type="text" 
                      name="badge" 
                      value={formData.badge} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                      placeholder="e.g. Combo Deal"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Background Color</label>
                    <select 
                      name="color" 
                      value={formData.color} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                    >
                      {colorOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Target Deal Link</label>
                    <input 
                      type="text" 
                      name="link" 
                      value={formData.link || ""} 
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 bg-white"
                      placeholder="e.g. /products?combo=true"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-6 pl-2">
                    <input 
                      type="checkbox" 
                      id="active" 
                      name="active" 
                      checked={formData.active} 
                      onChange={handleInputChange}
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                    <label htmlFor="active" className="text-sm font-semibold text-gray-700 cursor-pointer">
                      Deal is currently Active & Visible on Homepage
                    </label>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? "Update Deal" : "Create Deal"}
                </button>
              </div>
            </form>
            
          </div>
        </div>
      )}
    </div>
  );
};

export default DealsView;
