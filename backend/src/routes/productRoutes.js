const express = require('express');
const router = express.Router();
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addReview,
  addReply,
  deleteReview
} = require('../controllers/productController');

const { protect, seller } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Public routes (or arguably public to search)
// GET /api/products
router.get('/', getProducts);
// GET /api/products/:id
router.get('/:id', getProductById);

// Add review/question
router.post('/:id/reviews', protect, addReview);
router.delete('/:id/reviews/:reviewId', protect, deleteReview);

// Protected Routes (Seller Only)
// Use 'image' as the field name for file upload
router.post('/', protect, seller, upload.single('image'), createProduct);
router.put('/:id', protect, seller, upload.single('image'), updateProduct);
router.delete('/:id', protect, seller, deleteProduct);

// Reply to review
router.post('/:id/reviews/:reviewId/reply', protect, seller, addReply);

module.exports = router;
