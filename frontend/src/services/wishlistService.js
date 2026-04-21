import api from "./api";

// Get user wishlist
const getWishlist = async () => {
  const response = await api.get("/wishlist");
  return response.data;
};

// Toggle product in wishlist
const toggleWishlist = async (productId) => {
  const response = await api.post(`/wishlist/${productId}`);
  return response.data;
};

const wishlistService = {
  getWishlist,
  toggleWishlist,
};

export default wishlistService;
