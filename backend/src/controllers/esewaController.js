const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { createSignature } = require('../utils/esewa');
const { v4: uuidv4 } = require('uuid');

// @desc    Initiate eSewa Payment
// @route   POST /api/esewa/initiate
// @access  Private
exports.initiatePayment = async (req, res) => {
  try {
    console.log('=== eSewa Payment Initiation Started ===');
    
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      console.log('Error: Empty cart');
      return res.status(400).json({ success: false, message: 'No items in cart' });
    }

    const { location } = req.body;

    if (!location || !location.lat || !location.lng) {
      console.log('Error: Missing location');
      return res.status(400).json({ success: false, message: 'Delivery location is required' });
    }

    // Calculate amounts - eSewa expects amounts in paisa (multiply by 100) or as decimal strings
    const amount = parseFloat(cart.totalAmount.toFixed(2));
    const taxAmount = 0;
    const totalAmount = amount;
    
    // Use UUID v4 for transaction ID
    const transactionUuid = uuidv4();

    console.log('Cart Total:', amount);
    console.log('Transaction UUID:', transactionUuid);

    // Create Order (Pending)
    const orderData = {
      user: req.user._id,
      items: cart.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount: totalAmount,
      paymentMethod: 'eSewa',
      paymentStatus: 'Pending',
      transactionUuid: transactionUuid,
      shippingAddress: location.address || 'Kathmandu, Nepal',
      location: {
        type: 'Point',
        coordinates: [location.lng, location.lat]
      }
    };

    const order = await Order.create(orderData);
    console.log('Order created:', order._id);

    // eSewa Configuration
    const productCode = 'EPAYTEST'; // Use your actual product code in production
    const secretKey = '8gBm/:&EnhH.1/q'; // Use your actual secret key in production
    
    // Check if we should use mock eSewa (when test server is down)
    const useMockEsewa = process.env.USE_MOCK_ESEWA === 'true';
    
    // Format amounts as strings with 2 decimal places
    const strAmount = amount.toFixed(2);
    const strTaxAmount = taxAmount.toFixed(2);
    const strTotalAmount = totalAmount.toFixed(2);
    
    // Create signature message - IMPORTANT: No spaces, exact format
    const signatureMessage = `total_amount=${strTotalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
    
    console.log('Signature Message:', signatureMessage);
    
    // Generate signature using HMAC SHA256
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(signatureMessage);
    const signature = hmac.digest('base64');
    
    console.log('Generated Signature:', signature);

    // Prepare payment parameters for eSewa
    const paymentParams = {
      amount: strAmount,
      tax_amount: strTaxAmount,
      total_amount: strTotalAmount,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`,
      failure_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: signature,
      // Use mock eSewa if enabled, otherwise use real eSewa test URL
      esewa_url: useMockEsewa 
        ? `${process.env.FRONTEND_URL || 'http://localhost:5173'}/mock-esewa-payment`
        : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form'
    };
    
    console.log('Payment Parameters:', {
      ...paymentParams,
      signature: signature.substring(0, 20) + '...' // Log partial signature for security
    });

    res.status(200).json({
      success: true,
      message: 'Payment initiated successfully',
      paymentParams,
      orderId: order._id
    });

    console.log('=== Payment Initiation Successful ===');

  } catch (error) {
    console.error('=== Payment Initiation Error ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
};


// @desc    Verify eSewa Payment
// @route   GET /api/esewa/verify
// @access  Public (Called by Frontend or eSewa Callback)
exports.verifyPayment = async (req, res) => {
    try {
        console.log('=== eSewa Payment Verification Started ===');
        console.log('Query params:', req.query);
        
        const { data } = req.query;
        
        if (!data) {
            console.log('Error: Missing payment data');
            return res.status(400).json({ 
                success: false, 
                message: 'Missing payment data from eSewa' 
            });
        }

        // Decode base64 data from eSewa
        let decodedData;
        try {
            decodedData = JSON.parse(Buffer.from(data, 'base64').toString('utf-8'));
            console.log('Decoded eSewa Response:', decodedData);
        } catch (decodeError) {
            console.error('Error decoding eSewa data:', decodeError);
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid payment data format' 
            });
        }
        
        const { status, total_amount, transaction_uuid, product_code } = decodedData;

        // Check payment status
        if (status !== 'COMPLETE') {
            console.log('Payment not complete. Status:', status);
            return res.status(400).json({ 
                success: false, 
                message: `Payment ${status.toLowerCase()}. Please try again.` 
            });
        }

        // Find the order
        const order = await Order.findOne({ transactionUuid: transaction_uuid });
        
        if (!order) {
            console.log('Error: Order not found for UUID:', transaction_uuid);
            return res.status(404).json({ 
                success: false, 
                message: 'Order not found. Please contact support.' 
            });
        }

        console.log('Order found:', order._id);
        console.log('Current order payment status:', order.paymentStatus);

        // Check if payment is already completed (idempotency check)
        if (order.paymentStatus === 'Completed') {
            console.log('Payment already verified for this order. Skipping stock reduction.');
            return res.status(200).json({
                success: true,
                message: 'Payment already verified',
                orderId: order._id
            });
        }

        // Verify amounts match
        const orderTotal = parseFloat(order.totalAmount.toFixed(2));
        const esewaTotal = parseFloat(total_amount);
        
        if (Math.abs(orderTotal - esewaTotal) > 0.01) {
            console.log('Amount mismatch! Order:', orderTotal, 'eSewa:', esewaTotal);
            return res.status(400).json({ 
                success: false, 
                message: 'Payment amount mismatch. Please contact support.' 
            });
        }

        // Update Order status
        order.paymentStatus = 'Completed';
        order.status = 'Processing';
        await order.save();
        
        console.log('Order updated to Completed');
        
        // Reduce stock for each product in the order
        console.log('Reducing stock for purchased items...');
        const io = req.app.get('io');
        
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                const previousStock = product.stock;
                product.stock -= item.quantity;
                await product.save();
                console.log(`Reduced stock for product ${product.name}: ${previousStock} -> ${product.stock} (${item.quantity} units)`);
                
                // Emit real-time stock update event
                if (io) {
                    io.emit('stockUpdated', {
                        productId: product._id.toString(),
                        productName: product.name,
                        newStock: product.stock,
                        quantitySold: item.quantity,
                        previousStock: previousStock
                    });
                    console.log(`Emitted stockUpdated event for ${product.name}`);
                }
            } else {
                console.warn(`Product not found for stock reduction: ${item.product}`);
            }
        }
        
        // Clear user's cart
        await Cart.findOneAndUpdate(
            { user: order.user }, 
            { items: [], totalAmount: 0 }
        );
        
        console.log('Cart cleared');
        console.log('=== Payment Verification Successful ===');

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            orderId: order._id
        });

    } catch (error) {
        console.error('=== Payment Verification Error ===');
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message
        });
    }
};

