const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Session configuration (MUST be before CORS)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: false, // Allow client-side access
    sameSite: 'lax' // Allow cross-site requests
  }
}));

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Your React app URL
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/iftx', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('Connected to MongoDB');
  console.log('Database name:', mongoose.connection.name);
  console.log('Connection state:', mongoose.connection.readyState);
  
  // Test Order model
  try {
    const Order = require('./models/Order');
    console.log('Order model loaded successfully');
    
    // Test if we can count documents
    const orderCount = await Order.countDocuments();
    console.log('Current orders in database:', orderCount);
  } catch (error) {
    console.error('Error testing Order model:', error);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  console.error('Error details:', err.message);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

// Protected route example
app.get('/api/profile', requireAuth, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.session.user
  });
});

// Database test route
app.get('/api/test/db', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    // Test Order model
    const Order = require('./models/Order');
    const orderCount = await Order.countDocuments();
    
    res.json({
      success: true,
      message: 'Database connection working',
      database: mongoose.connection.name,
      collections: collectionNames,
      connectionState: mongoose.connection.readyState,
      orderCount: orderCount
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Test orders route
app.get('/api/orders/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Orders route is accessible',
    timestamp: new Date().toISOString()
  });
});

// Simple database test
app.get('/api/test/simple', async (req, res) => {
  try {
    // Test basic MongoDB connection
    const db = mongoose.connection.db;
    if (!db) {
      return res.status(500).json({
        success: false,
        message: 'Database not connected'
      });
    }

    // Test Order model
    const Order = require('./models/Order');
    const count = await Order.countDocuments();
    
    res.json({
      success: true,
      message: 'Database and Order model working',
      orderCount: count,
      connectionState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('Simple test error:', error);
    res.status(500).json({
      success: false,
      message: 'Database test failed',
      error: error.message,
      stack: error.stack
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});