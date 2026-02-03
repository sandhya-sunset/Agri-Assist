const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get seller dashboard statistics (Revenue, Orders, Products, etc.)
// @route   GET /api/seller/stats
// @access  Private (Seller only)
exports.getDashboardStats = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Get all products by this seller
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);

    // Find all orders containing these products
    const orders = await Order.find({ 'items.product': { $in: productIds } });

    let totalRevenue = 0;
    let totalOrders = orders.length;
    let pendingOrders = 0;
    let completedOrders = 0;

    // Calculate revenue solely from this seller's products within those orders
    orders.forEach(order => {
      let orderHasSellerItem = false;
      order.items.forEach(item => {
        if (productIds.some(id => id.equals(item.product))) {
          totalRevenue += item.price * item.quantity;
          orderHasSellerItem = true;
        }
      });
      if (orderHasSellerItem) {
        if (order.status === 'Delivered') completedOrders++;
        else if (order.status !== 'Cancelled') pendingOrders++;
      }
    });

    const totalProducts = products.length;

    res.status(200).json({
      success: true,
      data: {
        revenue: totalRevenue,
        orders: totalOrders,
        products: totalProducts,
        pendingOrders,
        completedOrders
      }
    });
  } catch (error) {
    console.error('Error fetching seller stats:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get seller's orders
// @route   GET /api/seller/orders
// @access  Private (Seller only)
exports.getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    // Find products by this seller
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);

    // Find orders containing these products, populate user and product details
    const orders = await Order.find({ 'items.product': { $in: productIds } })
      .populate('user', 'name email')
      .populate('items.product', 'name image price')
      .sort('-createdAt');

    // Format orders for frontend (filter out items not belonging to this seller if needed, 
    // but usually seller wants to see full order or just their items. 
    // For simplicity, we'll return the full order but mark which items are theirs if we were complex.
    // Here we will just return the order as is, but maybe calculate 'sellerTotal' for display)
    
    const formattedOrders = orders.map(order => {
      // Calculate total specific to this seller
      const sellerItems = order.items.filter(item => 
        item.product && productIds.some(id => id.equals(item.product._id))
      );

      const sellerTotal = sellerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      return {
        _id: order._id,
        id: order._id, // Frontend expects 'id'
        customer: order.user ? order.user.name : 'Unknown',
        email: order.user ? order.user.email : 'No email',
        products: sellerItems.length,
        total: sellerTotal, // Show only revenue relevant to this seller
        status: order.status,
        date: order.createdAt.toISOString().split('T')[0],
        items: sellerItems.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
          image: item.product.image
        }))
      };
    });

    res.status(200).json({
      success: true,
      data: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching seller orders:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get seller analytics (Sales chart, top products, metrics, reviews, etc.)
// @route   GET /api/seller/analytics?timeRange=week|month|quarter|year
// @access  Private (Seller only)
exports.getAnalytics = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const { timeRange = 'month' } = req.query;
    
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id);
    
    // Calculate date ranges
    const now = new Date();
    let startDate = new Date();
    let prevStartDate = new Date();
    let prevEndDate = new Date();
    
    switch (timeRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        prevStartDate.setDate(now.getDate() - 14);
        prevEndDate.setDate(now.getDate() - 7);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        prevStartDate.setMonth(now.getMonth() - 6);
        prevEndDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        prevStartDate.setFullYear(now.getFullYear() - 2);
        prevEndDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // month
        startDate.setMonth(now.getMonth() - 1);
        prevStartDate.setMonth(now.getMonth() - 2);
        prevEndDate.setMonth(now.getMonth() - 1);
    }
    
    const orders = await Order.find({ 
      'items.product': { $in: productIds },
      createdAt: { $gte: startDate }
    }).populate('user', 'name email');
    
    const previousOrders = await Order.find({ 
      'items.product': { $in: productIds },
      createdAt: { $gte: prevStartDate, $lt: prevEndDate }
    });

    // 1. Calculate Key Metrics
    let totalRevenue = 0;
    let totalOrders = orders.length;
    const uniqueCustomers = new Set();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(id => id.equals(item.product))) {
          totalRevenue += item.price * item.quantity;
        }
      });
      if (order.user) uniqueCustomers.add(order.user._id.toString());
    });

    // Previous period metrics
    let prevRevenue = 0;
    let prevOrdersCount = previousOrders.length;
    const prevCustomers = new Set();
    
    previousOrders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(id => id.equals(item.product))) {
          prevRevenue += item.price * item.quantity;
        }
      });
      if (order.user) prevCustomers.add(order.user._id.toString());
    });

    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const prevAvgOrderValue = prevOrdersCount > 0 ? prevRevenue / prevOrdersCount : 0;

    // Calculate percentage changes
    const revenueChange = prevRevenue > 0 ? ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1) : 0;
    const ordersChange = prevOrdersCount > 0 ? ((totalOrders - prevOrdersCount) / prevOrdersCount * 100).toFixed(1) : 0;
    const avgOrderChange = prevAvgOrderValue > 0 ? ((avgOrderValue - prevAvgOrderValue) / prevAvgOrderValue * 100).toFixed(1) : 0;
    const customersChange = prevCustomers.size > 0 ? ((uniqueCustomers.size - prevCustomers.size) / prevCustomers.size * 100).toFixed(1) : 0;

    // 2. Calculate Monthly Sales (Last 6 months)
    const salesData = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonth - i);
      const monthIdx = d.getMonth();
      const monthName = months[monthIdx];
      const year = d.getFullYear();
      
      const allMonthOrders = await Order.find({
        'items.product': { $in: productIds },
        createdAt: {
          $gte: new Date(year, monthIdx, 1),
          $lt: new Date(year, monthIdx + 1, 1)
        }
      });

      let monthRevenue = 0;
      allMonthOrders.forEach(o => {
        o.items.forEach(item => {
           if (productIds.some(id => id.equals(item.product))) {
             monthRevenue += item.price * item.quantity;
           }
        });
      });

      salesData.push({
        month: monthName,
        sales: monthRevenue,
        orders: allMonthOrders.length
      });
    }

    // 3. Top Products
    const productStats = {};
    
    const allOrders = await Order.find({ 'items.product': { $in: productIds } });
    
    allOrders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(id => id.equals(item.product))) {
          const pid = item.product.toString();
          if (!productStats[pid]) {
            const p = products.find(prod => prod._id.equals(item.product));
            productStats[pid] = {
              id: pid,
              name: p ? p.name : 'Unknown',
              sales: 0,
              revenue: 0,
              rating: p ? p.rating || 4.5 : 4.5,
              views: Math.floor(Math.random() * 1000) + 500, // Mock views
              growth: (Math.random() * 30 - 5).toFixed(1) // Mock growth -5% to +25%
            };
          }
          productStats[pid].sales += item.quantity;
          productStats[pid].revenue += item.price * item.quantity;
        }
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // 4. Recent Reviews
    const recentReviews = [];
    products.forEach(product => {
      if (product.reviews && product.reviews.length > 0) {
        product.reviews.forEach(review => {
          recentReviews.push({
            id: review._id,
            customer: review.userName || 'Anonymous',
            product: product.name,
            rating: review.rating,
            comment: review.comment,
            date: review.date,
            helpful: Math.floor(Math.random() * 20) // Mock helpful count
          });
        });
      }
    });
    
    // Sort by date and get last 4
    recentReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestReviews = recentReviews.slice(0, 4).map(review => ({
      ...review,
      date: getRelativeTime(review.date)
    }));

    // 5. Traffic Sources (Mock data - would need analytics integration)
    const trafficSources = [
      { source: 'Direct', percentage: 45, visits: Math.floor(totalOrders * 16), color: 'blue' },
      { source: 'Search Engines', percentage: 35, visits: Math.floor(totalOrders * 12.5), color: 'green' },
      { source: 'Social Media', percentage: 20, visits: Math.floor(totalOrders * 7), color: 'purple' }
    ];

    // 6. Category Performance
    const categoryStats = {};
    
    allOrders.forEach(order => {
      order.items.forEach(item => {
        if (productIds.some(id => id.equals(item.product))) {
          const p = products.find(prod => prod._id.equals(item.product));
          if (p) {
            const category = p.category || 'Other';
            if (!categoryStats[category]) {
              categoryStats[category] = {
                category,
                sales: 0,
                revenue: 0
              };
            }
            categoryStats[category].sales += item.quantity;
            categoryStats[category].revenue += item.price * item.quantity;
          }
        }
      });
    });

    const totalCategoryRevenue = Object.values(categoryStats).reduce((sum, cat) => sum + cat.revenue, 0);
    const categoryPerformance = Object.values(categoryStats)
      .map(cat => ({
        ...cat,
        percentage: totalCategoryRevenue > 0 ? Math.round((cat.revenue / totalCategoryRevenue) * 100) : 0
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // 7. Additional Metrics
    const totalProductViews = products.length * 500; // Mock
    const conversionRate = totalProductViews > 0 ? ((totalOrders / totalProductViews) * 100).toFixed(1) : 3.2;
    
    // Return rate (repeat customers)
    const allCustomerOrders = await Order.find({ 'items.product': { $in: productIds } });
    const customerOrderCount = {};
    allCustomerOrders.forEach(order => {
      if (order.user) {
        const userId = order.user.toString();
        customerOrderCount[userId] = (customerOrderCount[userId] || 0) + 1;
      }
    });
    const repeatCustomers = Object.values(customerOrderCount).filter(count => count > 1).length;
    const returnRate = uniqueCustomers.size > 0 ? ((repeatCustomers / uniqueCustomers.size) * 100).toFixed(0) : 42;

    // Average rating across all products
    const productsWithRatings = products.filter(p => p.rating > 0);
    const avgRating = productsWithRatings.length > 0 
      ? (productsWithRatings.reduce((sum, p) => sum + p.rating, 0) / productsWithRatings.length).toFixed(1)
      : 4.7;

    res.status(200).json({
      success: true,
      data: {
        // Key Metrics
        metrics: {
          totalRevenue: {
            value: totalRevenue,
            change: revenueChange,
            isPositive: parseFloat(revenueChange) >= 0
          },
          totalOrders: {
            value: totalOrders,
            change: ordersChange,
            isPositive: parseFloat(ordersChange) >= 0
          },
          avgOrderValue: {
            value: avgOrderValue,
            change: avgOrderChange,
            isPositive: parseFloat(avgOrderChange) >= 0
          },
          totalCustomers: {
            value: uniqueCustomers.size,
            change: customersChange,
            isPositive: parseFloat(customersChange) >= 0
          }
        },
        // Sales Chart Data
        salesData,
        // Top Products
        topProducts,
        // Recent Reviews
        recentReviews: latestReviews,
        // Traffic Sources
        trafficSources,
        // Category Performance
        categoryPerformance,
        // Additional Metrics
        additionalMetrics: {
          conversionRate: parseFloat(conversionRate),
          returnRate: parseFloat(returnRate),
          avgRating: parseFloat(avgRating)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Helper function to get relative time
function getRelativeTime(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
}


// @desc    Update order status
// @route   PUT /api/seller/orders/:id/status
// @access  Private (Seller only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify that this seller has items in this order
    // (Optional: strictly enforce that they can only update if they own items, 
    // but typically dashboard access implies permission or we check ownership)
    const sellerId = req.user._id;
    const products = await Product.find({ seller: sellerId });
    const productIds = products.map(p => p._id.toString());
    
    const hasSellerItems = order.items.some(item => productIds.includes(item.product.toString()));
    
    if (!hasSellerItems && req.user.role !== 'admin') {
       return res.status(403).json({ success: false, message: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
