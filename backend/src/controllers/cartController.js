const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Deal = require("../models/Deal");

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("items.deal");

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    } else {
      // Sync latest prices
      let modified = false;
      cart.items.forEach((item) => {
        if (item.deal && item.deal.price !== item.price) {
          item.price = item.deal.price || 0;
          modified = true;
        } else if (item.product && !item.deal) {
          let expectedPrice = item.product.price;
          if (item.size && item.product.sizes && item.product.sizes.length > 0) {
            const s = item.product.sizes.find(sz => sz.size === item.size);
            if (s) expectedPrice = s.price;
          }
          if (expectedPrice !== item.price) {
            item.price = expectedPrice || 0;
            modified = true;
          }
        }
      });
      if (modified) {
        cart.markModified('items');
        await cart.save();
      }
    }

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
exports.addToCart = async (req, res) => {
  try {
    const { productId, dealId, quantity, size } = req.body;
    const qty = parseInt(quantity) || 1;

    let product, deal;
    let finalPrice = 0;

    if (dealId) {
      deal = await Deal.findById(dealId);
      if (!deal) {
        return res.status(404).json({ success: false, message: "Deal not found" });
      }
      finalPrice = deal.price || 0; 
    } else if (productId) {
      product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ success: false, message: "Product not found" });
      }
      finalPrice = product.price;
      if (size && product.sizes && product.sizes.length > 0) {
        const sizeObj = product.sizes.find(s => s.size === size);
        if (sizeObj) {
          finalPrice = sizeObj.price;
        }
      }
    } else {
      return res.status(400).json({ success: false, message: "Provide productId or dealId" });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    let itemIndex = -1;
    if (dealId) {
      itemIndex = cart.items.findIndex(item => item.deal && item.deal.toString() === dealId);
    } else {
      itemIndex = cart.items.findIndex(item => item.product && item.product.toString() === productId && item.size === size);
    }

    if (itemIndex > -1) {
      // Item exists in cart, update quantity
      cart.items[itemIndex].quantity += qty;
      cart.items[itemIndex].price = finalPrice;
    } else {
      // Item does not exist in cart, add new item
      const newItem = { quantity: qty, price: finalPrice };
      if (dealId) newItem.deal = dealId;
      if (productId) {
        newItem.product = productId;
        newItem.size = size;
      }
      cart.items.push(newItem);
    }

    cart.markModified('items');
    await cart.save();

    // Populate product and deal details for response
    await cart.populate("items.product");
    await cart.populate("items.deal");

    res.status(200).json({
      success: true,
      message: dealId ? "Combo deal added to cart" : "Product added to cart",
      data: cart,
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

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId,
    );

    await cart.save();
    await cart.populate("items.product");
    await cart.populate("items.deal");

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === req.params.itemId,
    );

    if (itemIndex > -1) {
      if (quantity > 0) {
        cart.items[itemIndex].quantity = quantity;
      } else {
        // Remove if quantity is 0 or less
        cart.items.splice(itemIndex, 1);
      }
    } else {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    await cart.save();
    await cart.populate("items.product");
    await cart.populate("items.deal");

    res.status(200).json({
      success: true,
      data: cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
