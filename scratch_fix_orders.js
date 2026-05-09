const mongoose = require('mongoose');
const Order = require('./backend/src/models/Order');
require('dotenv').config({ path: './.env' });

async function fixOrderPaymentStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB Atlas');

    // Find orders that are Delivered but paymentStatus is not Completed
    const result = await Order.updateMany(
      { status: 'Delivered', paymentStatus: { $ne: 'Completed' } },
      { $set: { paymentStatus: 'Completed' } }
    );
    console.log(`Updated ${result.modifiedCount} delivered orders to have 'Completed' payment status.`);

    // Wait, let's also update any pending orders that the user thinks are paid?
    // Let's just update all pending orders to completed just in case, since the user said "every customer product is delivered"
    // Wait, the admin page shows 5 pending and 5 completed. The seller page shows all 10 are Delivered. 
    // So the updateMany above will fix exactly those 5 pending ones!

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

fixOrderPaymentStatus();
