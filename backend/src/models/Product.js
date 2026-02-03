const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: [true, 'Please add a category'],
      enum: ['Fertilizer', 'Pesticide', 'Seeds', 'Tools', 'Supplements', 'Disease Treatment', 'Other'],
      default: 'Fertilizer'
    },
    price: {
      type: Number,
      required: [true, 'Please add a price']
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      default: 0
    },
    description: {
      type: String,
      required: [true, 'Please add a description']
    },
    image: {
      type: String,
      required: [true, 'Please add a product image']
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'draft'],
      default: 'active'
    },
    sku: {
      type: String,
      unique: true,
      sparse: true // Allows null/undefined to be non-unique if needed, though usually SKU should be present
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    offerText: {
      type: String,
      trim: true
    },
    rating: {
      type: Number,
      default: 0
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        userName: String, // Store name for easier display
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        },
        comment: {
          type: String,
          required: true
        },
        date: {
          type: Date,
          default: Date.now
        },
        replies: [
          {
            text: { type: String, required: true },
            date: { type: Date, default: Date.now },
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Who replied (usually seller)
          }
        ]
      }
    ]
  },
  {
    timestamps: true
  }
);

// Calculate average rating before saving if needed, but for now we'll keep it simple
// Or could add a method to recalculate it

module.exports = mongoose.model('Product', productSchema);
