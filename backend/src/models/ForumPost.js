const mongoose = require('mongoose');

const forumPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    category: {
      type: String,
      enum: [
        'Crop Disease',
        'Pest Management',
        'Seasonal Advice',
        'Soil & Fertility',
        'Water Management',
        'Weather & Climate',
        'Tools & Equipment',
        'Market Prices',
        'General Query',
      ],
      default: 'General Query',
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userRole: {
      type: String,
      enum: ['user', 'expert', 'admin'],
      default: 'user',
    },
    userAvatar: String,
    status: {
      type: String,
      enum: ['open', 'answered', 'closed'],
      default: 'open',
    },
    views: {
      type: Number,
      default: 0,
    },
    replies: [
      {
        _id: mongoose.Schema.Types.ObjectId,
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        userName: String,
        userRole: {
          type: String,
          enum: ['user', 'expert', 'admin'],
        },
        userAvatar: String,
        content: String,
        isAccepted: {
          type: Boolean,
          default: false,
        },
        likes: {
          type: Number,
          default: 0,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tags: [String],
    location: String,
    cropType: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for faster queries
forumPostSchema.index({ category: 1, status: 1 });
forumPostSchema.index({ userId: 1 });
forumPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ForumPost', forumPostSchema);
