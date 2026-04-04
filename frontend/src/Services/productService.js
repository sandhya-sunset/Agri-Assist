import api from "./api";

// Get all products (can filter by seller if backend supports it via query param)
const getProducts = async (sellerId = null) => {
  let url = "/products";
  if (sellerId) {
    url += `?seller=${sellerId}`;
  }
  const response = await api.get(url);
  return response.data;
};

// Create a new product
const createProduct = async (productData) => {
  const response = await api.post("/products", productData);
  return response.data;
};

// Update a product
const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

// Delete a product
const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

// Reply to a review
const replyToReview = async (productId, reviewId, text) => {
  const response = await api.post(
    `/products/${productId}/reviews/${reviewId}/reply`,
    { text },
  );
  return response.data;
};

const productService = {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  replyToReview,
};

export default productService;
