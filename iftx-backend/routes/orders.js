const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
// Try different User model paths
let User;
try {
  User = require('../models/User');
  console.log('User model loaded from ../models/User');
} catch (error) {
  try {
    User = require('../models/user');
    console.log('User model loaded from ../models/user');
  } catch (error2) {
    console.error('Failed to load User model:', error2);
    throw new Error('User model not found');
  }
}
const Cart = require('../models/Cart');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// Test endpoint to verify orders route is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Orders route is working',
    timestamp: new Date().toISOString()
  });
});

// Test endpoint to create a simple order (for debugging)
router.post('/test-create', async (req, res) => {
  try {
    console.log('=== TESTING ORDER CREATION ===');
    console.log('Testing order creation...');
    
    // Test Order model instantiation with explicit orderNumber
    console.log('Creating Order model instance...');
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const testOrderNumber = `TEST-${timestamp}-${random}`;
    
    const testOrder = new Order({
      userId: 'test-user-id',
      userName: {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com'
      },
      items: [{
        productId: 'test-product',
        name: 'Test Product',
        description: 'Test Description',
        price: 10.00,
        image: 'test-image.jpg',
        quantity: 1
      }],
      totalAmount: 10.00,
      paymentMethod: 'cod',
      deliveryAddress: {
        fullName: 'Test User',
        address: 'Test Address',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        phone: '1234567890'
      },
      status: 'pending',
      orderNumber: testOrderNumber
    });

    console.log('Test order object created successfully');
    console.log('Order number:', testOrder.orderNumber);
    console.log('Saving to database...');
    
    await testOrder.save();
    console.log('Test order saved successfully:', testOrder._id);

    res.json({
      success: true,
      message: 'Test order created successfully',
      orderId: testOrder._id,
      orderNumber: testOrder.orderNumber
    });
  } catch (error) {
    console.error('=== TEST ORDER CREATION ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error stack:', error.stack);
    console.error('==================================');
    
    res.status(500).json({
      success: false,
      message: 'Test order creation failed',
      error: error.message,
      errorType: error.name,
      errorCode: error.code
    });
  }
});

// Create a new order - Simplified version
router.post('/create', requireAuth, async (req, res) => {
  try {
    console.log('=== ORDER CREATION START ===');
    console.log('User ID:', req.session.user.id);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const { items, totalAmount, paymentMethod, deliveryAddress } = req.body;
    const userId = req.session.user.id;

    // Basic validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No items in order'
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total amount'
      });
    }

    if (!deliveryAddress || !deliveryAddress.fullName) {
      return res.status(400).json({
        success: false,
        message: 'Delivery address required'
      });
    }

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.firstName, user.lastName);

    // Create order with minimal required fields
    const orderData = {
      userId: userId,
      userName: {
        firstName: user.firstName || 'Unknown',
        lastName: user.lastName || 'User',
        email: user.email || 'unknown@example.com'
      },
      items: items.map(item => ({
        productId: item.productId || 'unknown',
        name: item.name || 'Unknown Product',
        description: item.description || 'No description',
        price: parseFloat(item.price) || 0,
        image: item.image || '/placeholder.png',
        quantity: parseInt(item.quantity) || 1
      })),
      totalAmount: parseFloat(totalAmount),
      paymentMethod: paymentMethod || 'cod',
      deliveryAddress: {
        fullName: deliveryAddress.fullName || 'Unknown',
        address: deliveryAddress.address || 'No address',
        city: deliveryAddress.city || 'Unknown',
        state: deliveryAddress.state || 'Unknown',
        zipCode: deliveryAddress.zipCode || '00000',
        phone: deliveryAddress.phone || '0000000000'
      },
      status: 'pending'
    };

    console.log('Creating order with data:', {
      userId: orderData.userId,
      itemsCount: orderData.items.length,
      totalAmount: orderData.totalAmount,
      paymentMethod: orderData.paymentMethod
    });

    // Ensure orderNumber is set before creating the order
    if (!orderData.orderNumber) {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      orderData.orderNumber = `ORD-${timestamp}-${random}`;
      console.log('Set orderNumber in orderData:', orderData.orderNumber);
    }

    const order = new Order(orderData);
    console.log('Order object created, orderNumber:', order.orderNumber);
    
    await order.save();

    console.log('Order created successfully:', order._id);
    console.log('Order number:', order.orderNumber);

    // Clear cart
    try {
      await Cart.findOneAndDelete({ userId: userId });
      console.log('Cart cleared for user:', userId);
    } catch (cartError) {
      console.log('Cart clearing failed (non-critical):', cartError.message);
    }

    console.log('=== ORDER CREATION SUCCESS ===');

    res.json({
      success: true,
      message: 'Order placed successfully!',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('=== ORDER CREATION ERROR ===');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    console.error('============================');
    
    res.status(500).json({
      success: false,
      message: 'Order creation failed: ' + error.message
    });
  }
});

// Get user's orders
router.get('/', requireAuth, async (req, res) => {
  try {
    console.log('Getting orders for user:', req.session.user.id);
    
    const orders = await Order.find({ userId: req.session.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    console.log('Orders retrieved:', orders.length);
    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get specific order by ID
router.get('/:orderId', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log('Getting order:', orderId, 'for user:', req.session.user.id);

    const order = await Order.findOne({ 
      _id: orderId, 
      userId: req.session.user.id 
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('Order retrieved:', order._id);
    res.json({
      success: true,
      order: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update order status (for admin use)
router.patch('/:orderId/status', requireAuth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findOneAndUpdate(
      { _id: orderId, userId: req.session.user.id },
      { status: status, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    console.log('Order status updated:', order._id, 'to', status);
    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin routes - Get all orders
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    console.log('=== ADMIN REQUESTING ALL ORDERS ===');
    console.log('Admin user:', req.session.user);
    
    const orders = await Order.find({})
      .sort({ createdAt: -1 })
      .select('-__v');

    console.log('Orders found:', orders.length);
    console.log('Order details:', orders.map(o => ({
      id: o._id,
      orderNumber: o.orderNumber,
      customer: `${o.userName.firstName} ${o.userName.lastName}`,
      total: o.totalAmount,
      status: o.status,
      createdAt: o.createdAt
    })));

    res.json({
      success: true,
      orders: orders
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders: ' + error.message
    });
  }
});

// Admin route - Get order statistics
router.get('/admin/stats', requireAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const confirmedOrders = await Order.countDocuments({ status: 'confirmed' });
    const processingOrders = await Order.countDocuments({ status: 'processing' });
    const shippedOrders = await Order.countDocuments({ status: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ status: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ status: 'cancelled' });

    const totalRevenue = await Order.aggregate([
      { $match: { status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
