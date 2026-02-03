const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  diseaseName: {
    type: String,
    required: true,
    unique: true
  },
  plantType: String,
  description: String,
  symptoms: [String],
  fertilizers: [{
    name: String,
    description: String,
    dosage: String,
    applicationMethod: String,
    price: Number,
    imageUrl: String
  }],
  pesticides: [{
    name: String,
    description: String,
    dosage: String,
    applicationMethod: String,
    price: Number,
    imageUrl: String
  }],
  treatments: [{
    name: String,
    description: String,
    steps: [String]
  }],
  preventionTips: [String]
});

module.exports = mongoose.model('Recommendation', recommendationSchema);