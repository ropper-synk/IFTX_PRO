const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const User = require('../models/user');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Get user's cart
router.get('/', requireAuth, async (req, res) => {
  try {
    console.log('Getting cart for user:', req.session.user.id);
    let cart = await Cart.findOne({ userId: req.session.user.id });
    
    if (!cart) {
      console.log('No cart found, creating new cart');
      // Get user details for the cart
      const user = await User.findById(req.session.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      cart = new Cart({ 
        userId: req.session.user.id, 
        userName: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        items: [] 
      });
      await cart.save();
      console.log('New cart created:', cart._id);
    }

    console.log('Cart retrieved:', cart);
    res.json({
      success: true,
      cart: cart
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add item to cart
router.post('/add', [
  requireAuth,
  body('productId').notEmpty().withMessage('Product ID is required'),
  body('name').notEmpty().withMessage('Product name is required'),
  body('description').notEmpty().withMessage('Product description is required'),
  body('price').isNumeric().withMessage('Valid price is required'),
  body('image').notEmpty().withMessage('Product image is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    console.log('Add to cart request received');
    console.log('User ID:', req.session.user.id);
    console.log('Request body:', req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId, name, description, price, image, quantity } = req.body;
    const userId = req.session.user.id;

    console.log('Looking for existing cart for user:', userId);
    let cart = await Cart.findOne({ userId });
    
    if (!cart) {
      console.log('No existing cart found, creating new cart with user info');
      // Get user details for the cart
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      cart = new Cart({ 
        userId, 
        userName: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        },
        items: [] 
      });
    } else {
      console.log('Found existing cart:', cart._id);
      // Update user info if it's missing (for existing carts)
      if (!cart.userName || !cart.userName.firstName) {
        console.log('Updating cart with user info');
        const user = await User.findById(userId);
        if (user) {
          cart.userName = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          };
        }
      }
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex > -1) {
      console.log('Item already exists in cart, updating quantity');
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      console.log('Adding new item to cart');
      cart.items.push({
        productId,
        name,
        description,
        price: parseFloat(price),
        image,
        quantity: parseInt(quantity)
      });
    }

    console.log('Saving cart with items:', cart.items.length);
    console.log('Cart user info:', cart.userName);
    await cart.save();
    console.log('Cart saved successfully:', cart._id);

    res.json({
      success: true,
      message: 'Item added to cart successfully',
      cart: cart
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update item quantity in cart
router.put('/update/:productId', [
  requireAuth,
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1')
], async (req, res) => {
  try {
    console.log('Update cart request for product:', req.params.productId);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.session.user.id;

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items[itemIndex].quantity = parseInt(quantity);
    await cart.save();

    res.json({
      success: true,
      message: 'Cart updated successfully',
      cart: cart
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Remove item from cart
router.delete('/remove/:productId', requireAuth, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.session.user.id;

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = cart.items.filter(item => item.productId !== productId);
    await cart.save();

    res.json({
      success: true,
      message: 'Item removed from cart successfully',
      cart: cart
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Clear entire cart
router.delete('/clear', requireAuth, async (req, res) => {
  try {
    const userId = req.session.user.id;

    const cart = await Cart.findOne({ userId });
    
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      success: true,
      message: 'Cart cleared successfully',
      cart: cart
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Test route to check if cart routes are working
router.get('/test', requireAuth, async (req, res) => {
  try {
    console.log('Cart test route accessed by user:', req.session.user.id);
    res.json({
      success: true,
      message: 'Cart routes are working',
      userId: req.session.user.id,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Cart test error:', error);
    res.status(500).json({
      success: false,
      message: 'Cart test failed',
      error: error.message
    });
  }
});

module.exports = router; 