const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: function() { return !this.deal; }
      },
      deal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Deal',
        required: function() { return !this.product; }
      },
      size: {
        type: String
      },
      quantity: {
        type: Number,
        required: true
      },
      price: {
        type: Number,
        required: true
      }
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Khalti'],
    required: true,
    default: 'Khalti'
  },
  transactionUuid: {
    type: String,
    unique: true,
    sparse: true
  },
  khaltiPidx: {
    type: String,
    sparse: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  status: {
    type: String,
    enum: ['Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  shippingAddress: {
    type: String,
    default: 'Kathmandu, Nepal'
  },
  shippingFee: {
    type: Number,
    default: 0
  },
  location: {
    type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
    },
    coordinates: {
        type: [Number], // [longitude, latitude]
        required: false
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
