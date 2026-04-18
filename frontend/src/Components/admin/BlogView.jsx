import React, { useState, useEffect } from "react";
import api from "../../services/api";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, Search, X, Image as ImageIcon } from "lucide-react";

const BlogView = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    tags: "",
    category: "General",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/posts");
      // Assuming response.data is the array or response.data.posts
      setBlogs(Array.isArray(response.data) ? response.data : response.data.posts || response.data.data || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast.error("Failed to load blog posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({ title: "", content: "", tags: "", category: "General", image: null });
    setImagePreview(null);
    setEditingBlog(null);
    setIsModalOpen(false);
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || "",
      content: blog.content || "",
      tags: blog.tags ? blog.tags.join(", ") : "",
      category: blog.category || "General",
      image: null
    });
    // Set existing image preview if available
    setImagePreview(blog.coverImage || blog.image || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await api.delete(`/posts/${id}`);
        toast.success("Blog post deleted successfully");
        fetchBlogs();
      } catch (error) {
        console.error("Error deleting blog:", error);
        toast.error("Failed to delete blog post");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      return toast.error("Title and content are required");
    }
    
    // Create FormData for multipart/form-data
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("content", formData.content);
    submitData.append("category", formData.category);
    
    if (formData.tags) {
      const tagsArray = formData.tags.split(",").map(tag => tag.trim());
      submitData.append("tags", JSON.stringify(tagsArray));
    }
    
    if (formData.image) {
      submitData.append("image", formData.image); // Depending on what multer expects, could be 'coverImage'
    }

    try {
      if (editingBlog) {
        // Edit existing blog - assuming PUT or PATCH /posts/:id
        await api.put(`/posts/${editingBlog._id}`, submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Blog post updated successfully");
      } else {
        // Create new blog
        await api.post("/posts", submitData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Blog post created successfully");
      }
      
      resetForm();
      fetchBlogs();
    } catch (error) {
      console.error("Error saving blog:", error);
      toast.error(error.response?.data?.message || "Failed to save blog post");
    }
  };

  const filteredBlogs = blogs.filter(blog => 
    (blog.title && blog.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (blog.category && blog.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Blog Management</h2>
          <p className="text-gray-600">Create and manage blog posts for farmers</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-600 outline-none  text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition"
        >
          <Plus size={20} />
          Create Post
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="max-w-md relative">
          <input
            type="text"
            placeholder="Search blogs by title or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border outline-none border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {/* Blog List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading blogs...</div>
        ) : filteredBlogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No blog posts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="p-4">Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredBlogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-gray-800">{blog.title}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                        {blog.category || "General"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => openEditModal(blog)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(blog._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-800">
                {editingBlog ? "Edit Blog Post" : "Create New Blog Post"}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blog Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-200 outline-none rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Enter blog title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 outline-none rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="General">General</option>
                      <option value="Farming Tips">Farming Tips</option>
                      <option value="Pest Control">Pest Control</option>
                      <option value="Technology">Technology</option>
                      <option value="Market Trends">Market Trends</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-200 outline-none rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="e.g. wheat, fertilizer, summer"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cover Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {imagePreview ? (
                      <div className="flex flex-col items-center">
                        <img 
                          src={imagePreview.startsWith('blob:') ? imagePreview : `http://localhost:5000${imagePreview}`} 
                          alt="Preview" 
                          className="h-32 object-cover rounded-lg mb-2" 
                        />
                        <p className="text-sm text-gray-500">Click or drag to change image</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <ImageIcon className="text-gray-400 mb-2" size={32} />
                        <p className="text-sm font-medium text-gray-700">Upload a cover image</p>
                        <p className="text-xs text-gray-500">JPG, PNG or WEBP (max. 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    required
                    rows="8"
                    className="w-full p-3 border border-gray-200 outline-none rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Write your blog content here..."
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 text-gray-600 bg-gray-100 outline-none hover:bg-gray-200 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-white bg-green-600 outline-none hover:bg-green-700 rounded-lg font-medium transition"
                >
                  {editingBlog ? "Update Post" : "Publish Post"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogView;
