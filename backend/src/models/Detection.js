const mongoose = require('mongoose');

const detectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  imagePath: {
    type: String,
    required: true
  },
  diseaseDetected: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true
  },
  plantType: String,
  recommendations: [{
    type: {
      type: String,
      enum: ['fertilizer', 'booster', 'pesticide', 'treatment']
    },
    name: String,
    description: String,
    dosage: String,
    applicationMethod: String
  }],
  recommendationDetails: {
    diseaseName: String,
    plantType: String,
    description: String,
    symptoms: [String],
    preventionTips: [String],
    fertilizers: [{
      name: String,
      description: String,
      dosage: String,
      applicationMethod: String
    }],
    boosters: [{
      name: String,
      description: String,
      dosage: String,
      applicationMethod: String
    }],
    pesticides: [{
      name: String,
      description: String,
      dosage: String,
      applicationMethod: String
    }],
    treatments: [{
      name: String,
      description: String,
      steps: [String]
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Detection', detectionSchema);