const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'aurelia-super-secret-key-2026';
// Mongoose Models
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Customer = require('../models/Customer');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');
const Setting = require('../models/Setting');

// Ensure uploads directory exists (use OS temp dir for serverless compatibility)
const uploadDir = process.env.NODE_ENV === 'production' 
  ? path.join(require('os').tmpdir(), 'uploads')
  : path.join(__dirname, '../../backend/uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'jewelry-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Real-time SSE Live Order updates clients array
let sseClients = [];

// Helper function to broadcast events to admin dashboard
function broadcastLiveOrder(eventType, data) {
  sseClients.forEach(client => {
    client.res.write(`event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`);
  });
}

// ==========================================
// ADMIN AUTHENTICATION ROUTE
// ==========================================
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  // Simple highly reliable auth for local premium demo dashboard
  if (username === 'bantikr11' && password === 'banti@123') {
    return res.json({ success: true, token: 'luxury-jwt-token-aurelia-2026', adminName: 'Aurelia Concierge' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Admin Credentials' });
});

// ==========================================
// CUSTOMER AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let customer = await Customer.findOne({ email });
    if (customer) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    customer = new Customer({ name, email, password: hashedPassword });
    await customer.save();
    
    const token = jwt.sign({ id: customer._id, email: customer.email }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ success: true, token, customer: { name: customer.name, email: customer.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    
    if (customer.password) {
      const isMatch = await bcrypt.compare(password, customer.password);
      if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid credentials (No password set)' });
    }

    const token = jwt.sign({ id: customer._id, email: customer.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, token, customer: { name: customer.name, email: customer.email } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Middleware for JWT protection
const verifyCustomerToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ success: false, message: 'Access denied. Please login.' });
  try {
    const verified = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token. Please login again.' });
  }
};

// ==========================================
// UPLOAD ROUTE
// ==========================================
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, imageUrl });
});

// ==========================================
// PRODUCTS ROUTES
// ==========================================
router.get('/products', async (req, res) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }
    if (req.query.isNewArrival === 'true') {
      filter.isNewArrival = true;
    }
    if (req.query.isBestSeller === 'true') {
      filter.isBestSeller = true;
    }
    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/products', async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ success: true, data: newProduct });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: updatedProduct });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// CATEGORIES ROUTES
// ==========================================
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: 1 });
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/categories', async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    await newCategory.save();
    res.status(201).json({ success: true, data: newCategory });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/categories/:id', async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// ORDERS & SSE LIVE TRACKING ROUTES
// ==========================================
router.get('/orders/live', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // flush the headers to establish SSE connection immediately

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  sseClients.push(newClient);

  // Send initial ping connection string
  res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Live Order Channel Established' })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client.id !== clientId);
  });
});

router.post('/orders', verifyCustomerToken, async (req, res) => {
  try {
    const { customerName, email, phone, address, items, totalAmount } = req.body;
    
    // Generate lovely Order ID
    const orderCount = await Order.countDocuments();
    const orderId = `AURELIA-${1001 + orderCount}`;

    const newOrder = new Order({
      orderId,
      customerName,
      email,
      phone,
      address,
      items,
      totalAmount,
      paymentStatus: 'Paid',
      orderStatus: 'Pending'
    });

    await newOrder.save();

    // Update Customer details logic
    let customer = await Customer.findOne({ email });
    if (!customer) {
      customer = new Customer({ name: customerName, email, phone, totalSpent: totalAmount, ordersCount: 1 });
    } else {
      customer.totalSpent += totalAmount;
      customer.ordersCount += 1;
      if (phone) customer.phone = phone;
    }
    await customer.save();

    // Broadcast update to real-time admin dashboard
    broadcastLiveOrder('new_order', newOrder);

    res.status(201).json({ success: true, orderId: newOrder.orderId, data: newOrder });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/orders/:id/status', async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { orderStatus }, { new: true });
    
    // Broadcast status change
    broadcastLiveOrder('status_update', updatedOrder);
    
    res.json({ success: true, data: updatedOrder });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// CUSTOMERS ROUTES
// ==========================================
router.get('/customers', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ totalSpent: -1 });
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// COUPON SYSTEM ROUTES
// ==========================================
router.get('/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/coupons', async (req, res) => {
  try {
    const newCoupon = new Coupon(req.body);
    await newCoupon.save();
    res.status(201).json({ success: true, data: newCoupon });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/coupons/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid or inactive coupon code' });
    }
    res.json({ success: true, discountPercent: coupon.discountPercent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/coupons/:id', async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Coupon removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// BANNER MANAGEMENT ROUTES
// ==========================================
router.get('/banners', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/banners', async (req, res) => {
  try {
    const newBanner = new Banner(req.body);
    await newBanner.save();
    res.status(201).json({ success: true, data: newBanner });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/banners/:id', async (req, res) => {
  try {
    await Banner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Banner removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ==========================================
// WEBSITE SETTINGS CONTROL ROUTE
// ==========================================
router.get('/settings', async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/settings', async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting(req.body);
      await setting.save();
    } else {
      setting = await Setting.findByIdAndUpdate(setting._id, req.body, { new: true });
    }
    res.json({ success: true, data: setting });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ==========================================
// SALES & REVENUE ANALYTICS DASHBOARD
// ==========================================
router.get('/analytics', async (req, res) => {
  try {
    const orders = await Order.find();
    const productsCount = await Product.countDocuments();
    const customersCount = await Customer.countDocuments();

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;

    // Calculate category sales distribution from order items
    const categorySales = {};
    const allProducts = await Product.find();
    
    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const prod = allProducts.find(p => p.name === item.name);
          const cat = prod ? prod.category : 'General';
          categorySales[cat] = (categorySales[cat] || 0) + item.quantity;
        });
      }
    });

    const categoriesStats = Object.keys(categorySales).map(cat => ({
      _id: cat,
      count: categorySales[cat]
    }));

    // If no sales yet, fallback to catalog distribution with varying heights
    if (categoriesStats.length === 0) {
      const prodStats = await Product.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);
      categoriesStats.push(...prodStats);
    }

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        productsCount,
        customersCount,
        pendingOrders,
        deliveredOrders,
        categoriesStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
