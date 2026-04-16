const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: false
  },
  images: [{
    type: String
  }],
  badge: {
    type: String,
    default: 'Limited Time'
  },
  color: {
    type: String,
    default: 'from-red-500 to-orange-600'
  },
  active: {
    type: Boolean,
    default: true
  },
  price: {
    type: Number, // combo offer price
    default: 0
  },
  originalPrice: {
    type: Number, // regular original price summing the items
    default: 0
  },
  link: {
    type: String,
    default: '/products'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Deal', dealSchema);
