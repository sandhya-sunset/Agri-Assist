const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('./config/database');
const Testimonial = require('./models/Testimonial');
const BlogPost = require('./models/BlogPost');
const Deal = require('./models/Deal');

// Connect to MongoDB
connectDB();

const seedData = async () => {
  try {
    console.log('Seeding homepage data...');

    // Seed Testimonials
    await Testimonial.deleteMany({});
    const testimonials = await Testimonial.create([
      {
        name: 'Rajesh Kumar',
        role: 'Wheat Farmer, Punjab',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
        rating: 5,
        text: 'The AI disease detection saved my entire crop! Detected fungal infection early and recommended the perfect treatment. My yield increased by 35% this season.',
        product: 'Bio Growth Enhancer Pro',
        active: true,
        order: 1
      },
      {
        name: 'Priya Sharma',
        role: 'Organic Farmer, Maharashtra',
        image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
        rating: 5,
        text: 'Switched to AgriAssist organic fertilizers and the difference is remarkable. Plants are healthier, soil quality improved, and customers love the organic produce!',
        product: 'Organic Compost Mix',
        active: true,
        order: 2
      },
      {
        name: 'Suresh Patel',
        role: 'Vegetable Grower, Gujarat',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
        rating: 5,
        text: 'Best investment for my farm. The smart recommendations helped me reduce fertilizer costs by 25% while improving crop quality. Highly recommended!',
        product: 'Premium NPK 19-19-19',
        active: true,
        order: 3
      }
    ]);
    console.log(`✓ Created ${testimonials.length} testimonials`);

    // Seed Blog Posts
    await BlogPost.deleteMany({});
    const blogPosts = await BlogPost.create([
      {
        title: 'How to Optimize NPK Ratios for Wheat',
        category: 'Nutrition',
        content: 'Learn the best NPK ratios for maximum wheat yield...',
        image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=250&fit=crop',
        readTime: '5 min read',
        published: true
      },
      {
        title: 'Identifying Early Signs of Fungal Disease',
        category: 'Disease Control',
        content: 'Early detection is key to preventing crop loss...',
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&h=250&fit=crop',
        readTime: '8 min read',
        published: true
      },
      {
        title: 'Organic vs Chemical: What Your Soil Needs',
        category: 'Organic Farming',
        content: 'Understanding the benefits of organic fertilizers...',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=250&fit=crop',
        readTime: '6 min read',
        published: true
      }
    ]);
    console.log(`✓ Created ${blogPosts.length} blog posts`);

    // Seed Deals
    await Deal.deleteMany({});
    const deals = await Deal.create([
      {
        title: 'Flash Sale',
        subtitle: 'Up to 30% OFF',
        image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=400&fit=crop',
        badge: 'Limited Time',
        color: 'from-red-500 to-orange-600',
        active: true
      },
      {
        title: 'Combo Packs',
        subtitle: 'Save Rs. 500+ on bundles',
        image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=600&h=400&fit=crop',
        badge: 'Best Value',
        color: 'from-blue-500 to-purple-600',
        active: true
      }
    ]);
    console.log(`✓ Created ${deals.length} deals`);

    console.log('\n✅ Homepage data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
