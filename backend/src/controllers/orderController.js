const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { initiateKhaltiPayment, lookupKhaltiPayment } = require("../utils/payment");

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const { paymentMethod, shippingAddress, shippingFee, location } = req.body;

    // Get user cart
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("items.deal");

    if (!cart || cart.items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items in cart" });
    }

    // Calculate resilient total mapping deal overrides if present
    let synchronizedTotalAmount = 0;
    cart.items.forEach((item) => {
      let effectivePrice = item.price || 0;
      if (item.deal) {
         effectivePrice = item.deal.price || item.price || 0;
         item.price = effectivePrice;
      } else if (item.product) {
         let basePrice = item.price || 0;
         if (item.product.discount && item.product.discount > 0) {
            basePrice = item.price * (1 - item.product.discount / 100);
         }
         effectivePrice = basePrice;
      }
      synchronizedTotalAmount += (effectivePrice * item.quantity);
    });

    // Check stock availability
    for (const item of cart.items) {
      if (item.product) {
        if (item.product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${item.product.name}. Available: ${item.product.stock}`,
          });
        }
      }
    }

    // Decrement stock for each product
    for (const item of cart.items) {
      if (item.product) {
        const product = await Product.findById(item.product._id);
        if (product) {
          product.stock -= item.quantity;
          await product.save();
        }
      }
    }

    const totalAmount = Math.max(synchronizedTotalAmount || 0, cart.totalAmount || 0) + (shippingFee || 0);

    const order = await Order.create({
      user: req.user._id,
      items: cart.items.map((item) => ({
        product: item.product ? item.product._id : undefined,
        deal: item.deal ? item.deal._id : undefined,
        size: item.size,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      paymentMethod: paymentMethod || "Khalti",
      paymentStatus: "Pending",
      shippingAddress: shippingAddress || "Kathmandu, Nepal",
      shippingFee: shippingFee || 0,
      location: location || undefined,
    });

    // NOTE: Cart is NOT cleared here.
    // It will be cleared only after Khalti payment is confirmed.
    // This prevents the "No items in cart" error if Khalti initiation fails.

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Initiate Khalti e-Payment for an order
// @route   POST /api/orders/:id/payment/khalti/initiate
// @access  Private
exports.initiateKhaltiOrderPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (order.paymentStatus === "Completed") {
      return res.status(400).json({ success: false, message: "Order is already paid" });
    }

    const khaltiData = await initiateKhaltiPayment({
      orderId: order._id.toString(),
      amount: Math.round(order.totalAmount * 100), // Convert to paisa
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone,
    });

    // Store the pidx on the order
    order.khaltiPidx = khaltiData.pidx;
    await order.save();

    res.status(200).json({
      success: true,
      data: khaltiData,
    });
  } catch (error) {
    console.error("Khalti initiate error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to initiate Khalti payment",
    });
  }
};

// @desc    Confirm/verify Khalti payment for an order
// @route   PUT /api/orders/:id/payment/khalti/confirm
// @access  Private
exports.confirmKhaltiOrderPayment = async (req, res) => {
  try {
    const { pidx } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (order.paymentStatus === "Completed") {
      return res.status(200).json({ success: true, message: "Payment already confirmed" });
    }

    const lookupData = await lookupKhaltiPayment(pidx);

    if (lookupData.status === "Completed") {
      order.paymentStatus = "Completed";
      order.transactionUuid = lookupData.transaction_id;
      order.khaltiPidx = pidx;
      await order.save();

      // Clear the user's cart ONLY after payment is successfully confirmed
      const cart = await Cart.findOne({ user: req.user._id });
      if (cart) {
        cart.items = [];
        cart.totalAmount = 0;
        await cart.save();
      }

      return res.status(200).json({
        success: true,
        message: "Payment confirmed successfully",
        data: order,
      });
    } else {
      order.paymentStatus = "Failed";
      await order.save();

      return res.status(400).json({
        success: false,
        message: `Payment not completed. Khalti status: ${lookupData.status}`,
      });
    }
  } catch (error) {
    console.error("Khalti confirm error:", error);
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to confirm Khalti payment",
    });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .populate("items.deal", "title image images price badge");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Ensure user owns the order (or is admin)
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized to view this order" });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // Ensure user owns the order (or is admin)
    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Not authorized to cancel this order",
        });
    }

    // Check if order can be cancelled
    if (order.status !== "Processing" && order.status !== "Pending") {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status ${order.status}`,
      });
    }

    order.status = "Cancelled";
    order.cancelledReason = req.body.reason || "Cancelled by user";
    await order.save();

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    // Populate the order before returning
    const populatedOrder = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("items.product", "name image price");

    res.status(200).json({
      success: true,
      data: populatedOrder,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
