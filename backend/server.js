const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve custom generated jewelry images cleanly via absolute endpoints
const generatedImages = {
  'luxury_gold_necklace.png': path.join(__dirname, 'assets/luxury_gold_necklace.png'),
  'luxury_diamond_ring.png': path.join(__dirname, 'assets/luxury_diamond_ring.png'),
  'luxury_gold_earrings.png': path.join(__dirname, 'assets/luxury_gold_earrings.png'),
  'luxury_gold_bracelet.png': path.join(__dirname, 'assets/luxury_gold_bracelet.png'),
  'luxury_gold_chain.png': path.join(__dirname, 'assets/luxury_gold_chain.png'),
  'luxury_placeholder.png': path.join(__dirname, 'assets/luxury_placeholder.png'),
  'sapphire_royal_ring.png': path.join(__dirname, 'assets/sapphire_royal_ring.png'),
  'emerald_eternity_necklace.png': path.join(__dirname, 'assets/emerald_eternity_necklace.png'),
  'ruby_royale_earrings.png': path.join(__dirname, 'assets/ruby_royale_earrings.png'),
  'golden_heritage_kada.png': path.join(__dirname, 'assets/golden_heritage_kada.png'),
  'diamond_choker.png': path.join(__dirname, 'assets/diamond_choker.png'),
  'solitaire_diamond_studs.png': path.join(__dirname, 'assets/solitaire_diamond_studs.png'),
  'emerald_cut_ring.png': path.join(__dirname, 'assets/emerald_cut_ring.png'),
  'platinum_wedding_band.png': path.join(__dirname, 'assets/platinum_wedding_band.png'),
  'art_deco_pearl_brooch.png': path.join(__dirname, 'assets/art_deco_pearl_brooch.png')
};

app.get('/images/:imgName', (req, res) => {
  const imgPath = generatedImages[req.params.imgName];
  if (imgPath && fs.existsSync(imgPath)) {
    return res.sendFile(imgPath);
  }
  // Fallback direct elegant URL placeholders if not found
  res.redirect('https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80');
});

// Serve frontend static directory
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Integration
const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);

// Fallback HTML page renderers for store and admin
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/admin.html'));
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/premium_jewelry_store';

const mongooseOptions = {
  serverSelectionTimeoutMS: 5000 // Fail fast if no MongoDB connection
};

const startServer = () => {
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`💎 Premium Jewelry eCommerce Server alive on http://localhost:${PORT}`);
    });
  }
};

const connectWithFallback = (uri) => {
  mongoose.connect(uri, mongooseOptions)
    .then(async () => {
      console.log('✨ Connected to MongoDB Premium Jewelry Database');
      await seedDatabase();
      startServer();
    })
    .catch(async (err) => {
      console.error(`❌ MongoDB Connection Error for URI:`, err.message || err);
      const localUri = 'mongodb://127.0.0.1:27017/premium_jewelry_store';
      if (uri !== localUri) {
        console.log(`🔌 Attempting fallback to local MongoDB: ${localUri}`);
        connectWithFallback(localUri);
      } else {
        console.error('❌ Both remote and local MongoDB connections failed.');
        console.log('⚠️ Starting server anyway on Port ' + PORT + ' for static assets serving.');
        startServer();
      }
    });
};

connectWithFallback(MONGODB_URI);

// ==========================================
// AUTOMATIC LUXURY DATABASE SEEDING
// ==========================================
async function seedDatabase() {
  const Product = require('./models/Product');
  const Category = require('./models/Category');
  const Banner = require('./models/Banner');
  const Setting = require('./models/Setting');
  const Coupon = require('./models/Coupon');

  try {
    // 1. Seed Settings
    const settingCount = await Setting.countDocuments();
    if (settingCount === 0) {
      await Setting.create({
        siteName: 'AURELIA',
        contactEmail: 'concierge@aurelia.com',
        contactPhone: '+1 (800) 333-AURE',
        freeShippingThreshold: 300,
        currency: '$',
        primaryColor: '#C5A059'
      });
      console.log('⚜️ Default Settings Initialized');
    }

    // 1.5 Seed Mock Customer
    const Customer = require('./models/Customer');
    const bcrypt = require('bcrypt');
    const customerCount = await Customer.countDocuments();
    if (customerCount === 0) {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await Customer.create({
        name: 'Demo Client',
        email: 'client@aurelia.com',
        password: hashedPassword,
        totalSpent: 0,
        ordersCount: 0
      });
      console.log('👤 Default Mock Client Initialized (client@aurelia.com / password123)');
    }

    // 2. Seed Coupons
    const couponCount = await Coupon.countDocuments();
    if (couponCount === 0) {
      await Coupon.create([
        { code: 'LUXURY20', discountPercent: 20 },
        { code: 'WELCOME10', discountPercent: 10 }
      ]);
      console.log('🎟️ Default Coupons Initialized');
    }

    // 3. Seed Banners
    const bannerCount = await Banner.countDocuments();
    if (bannerCount === 0) {
      await Banner.create({
        title: 'L’Éternité Collection',
        subtitle: 'Uncompromising craftsmanship meets ultimate high-fashion luxury.',
        ctaText: 'Discover Pieces',
        image: '/images/luxury_gold_necklace.png',
        isActive: true
      });
      console.log('🖼️ Default Banner Initialized');
    }

    // 4. Seed Categories (Force Refresh to fix paths)
    await Category.deleteMany({});
    if (true) {
      const categoriesData = [
        { name: 'Earrings', image: '/images/luxury_gold_earrings.png' },
        { name: 'Chains', image: '/images/luxury_gold_chain.png' },
        { name: 'Jhumka', image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=600&q=80' },
        { name: 'Necklaces', image: '/images/luxury_gold_necklace.png' },
        { name: 'Rings', image: '/images/luxury_diamond_ring.png' },
        { name: 'Bracelets', image: '/images/luxury_gold_bracelet.png' }
      ];
      await Category.insertMany(categoriesData);
      console.log('📁 Default Categories Initialized');
    }

    // 5. Seed Premium Products (Force Refresh to add new 6 items)
    await Product.deleteMany({});
    if (true) {
      const productsData = [
        {
          name: 'Aurelia Solitaire Pendant',
          category: 'Necklaces',
          price: 1850,
          originalPrice: 2100,
          image: '/images/luxury_gold_necklace.png',
          isNewArrival: true,
          isBestSeller: true,
          rating: 4.9,
          reviewsCount: 38,
          description: 'A striking minimalist diamond solitaire resting elegantly on an 18-karat polished solid gold chain. Unmatched brilliance and sheer luxury.'
        },
        {
          name: 'Sovereign Diamond Ring',
          category: 'Rings',
          price: 3200,
          originalPrice: 3500,
          image: '/images/luxury_diamond_ring.png',
          isNewArrival: true,
          isBestSeller: true,
          rating: 5.0,
          reviewsCount: 52,
          description: 'Exquisite premium engagement band featuring a hand-selected conflict-free diamond set atop pristine white marble inspiration architecture.'
        },
        {
          name: 'Élégance Drop Pearls',
          category: 'Earrings',
          price: 940,
          originalPrice: 1100,
          image: '/images/luxury_gold_earrings.png',
          isNewArrival: true,
          isBestSeller: false,
          rating: 4.8,
          reviewsCount: 19,
          description: 'Subtle high-fashion drop earrings blending polished minimal accents with pristine ocean-harvested pearl spheres.'
        },
        {
          name: 'Classic Intertwined Link Bracelet',
          category: 'Bracelets',
          price: 1420,
          originalPrice: 1600,
          image: '/images/luxury_gold_bracelet.png',
          isNewArrival: false,
          isBestSeller: true,
          rating: 4.9,
          reviewsCount: 45,
          description: 'Sleek premium heavy-link bracelet engineered for absolute everyday prestige and superior wrist presence.'
        },
        {
          name: 'Imperial Golden Chain',
          category: 'Chains',
          price: 1150,
          originalPrice: 1300,
          image: '/images/luxury_gold_chain.png',
          isNewArrival: true,
          isBestSeller: false,
          rating: 4.7,
          reviewsCount: 14,
          description: 'Timeless luxury curb chain displaying deep reflective mirror finishing and heavy secure clasps.'
        },
        {
          name: 'Traditional Royal Jhumka',
          category: 'Jhumka',
          price: 890,
          originalPrice: 1050,
          image: 'https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=800&q=80',
          isNewArrival: false,
          isBestSeller: true,
          rating: 4.9,
          reviewsCount: 64,
          description: 'Exquisitely traditional high-end crafted heritage design pieces providing gorgeous ambient movement and sophisticated charm.'
        },
        {
          name: 'Sapphire Royal Ring',
          category: 'Rings',
          price: 4500,
          originalPrice: 5200,
          image: '/images/sapphire_royal_ring.png',
          isNewArrival: true,
          isBestSeller: true,
          rating: 5.0,
          reviewsCount: 12,
          description: 'A magnificent deep blue sapphire surrounded by a brilliant diamond halo, set in polished platinum.'
        },
        {
          name: 'Emerald Eternity Necklace',
          category: 'Necklaces',
          price: 5800,
          originalPrice: 6500,
          image: '/images/emerald_eternity_necklace.png',
          isNewArrival: true,
          isBestSeller: false,
          rating: 4.9,
          reviewsCount: 8,
          description: 'Vibrant emerald-cut emeralds alternating with pear-shaped diamonds in 18k yellow gold.'
        },
        {
          name: 'Diamond Tennis Bracelet',
          category: 'Bracelets',
          price: 2900,
          originalPrice: 3400,
          image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
          isNewArrival: false,
          isBestSeller: true,
          rating: 4.9,
          reviewsCount: 27,
          description: 'A seamless line of round brilliant-cut diamonds set in white gold for ultimate brilliance.'
        },
        {
          name: 'Rose Gold Floral Studs',
          category: 'Earrings',
          price: 750,
          originalPrice: 900,
          image: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=800&q=80',
          isNewArrival: true,
          isBestSeller: false,
          rating: 4.8,
          reviewsCount: 15,
          description: 'Delicate floral-inspired studs crafted in warm rose gold with micro-diamond accents.'
        },
        {
          name: 'Platinum Wedding Band',
          category: 'Rings',
          price: 1200,
          originalPrice: 1500,
          image: '/images/platinum_wedding_band.png',
          isNewArrival: false,
          isBestSeller: false,
          rating: 5.0,
          reviewsCount: 42,
          description: 'A timeless, high-polished platinum band representing eternal commitment and purity.'
        },
        {
          name: 'Art Deco Pearl Brooch',
          category: 'Chains',
          price: 1650,
          originalPrice: 1950,
          image: '/images/art_deco_pearl_brooch.png',
          isNewArrival: true,
          isBestSeller: false,
          rating: 4.7,
          reviewsCount: 6,
          description: 'Vintage-inspired Art Deco brooch featuring a large South Sea pearl and geometric diamond patterns.'
        },
        {
          name: 'Ruby Royale Earrings',
          category: 'Earrings',
          price: 1950,
          originalPrice: 2200,
          image: '/images/ruby_royale_earrings.png',
          isNewArrival: true,
          isBestSeller: true,
          rating: 4.9,
          reviewsCount: 18,
          description: 'Exquisite deep crimson rubies surrounded by a double halo of brilliant cut diamonds, set in 18k white gold.'
        },
        {
          name: 'Golden Heritage Kada',
          category: 'Bracelets',
          price: 2600,
          originalPrice: 2950,
          image: '/images/golden_heritage_kada.png',
          isNewArrival: false,
          isBestSeller: true,
          rating: 5.0,
          reviewsCount: 31,
          description: 'A heavy, meticulously hand-carved traditional gold bangle showcasing detailed antique craftsmanship.'
        },
        {
          name: 'Princess Cut Diamond Choker',
          category: 'Necklaces',
          price: 7200,
          originalPrice: 8000,
          image: '/images/diamond_choker.png',
          isNewArrival: true,
          isBestSeller: true,
          rating: 5.0,
          reviewsCount: 14,
          description: 'A stunning arrangement of princess-cut diamonds meticulously hand-set in a flexible platinum mesh choker layout.'
        },
        {
          name: 'Solitaire Diamond Studs',
          category: 'Earrings',
          price: 1500,
          originalPrice: 1750,
          image: '/images/solitaire_diamond_studs.png',
          isNewArrival: true,
          isBestSeller: false,
          rating: 4.9,
          reviewsCount: 22,
          description: 'Flawless round brilliant-cut diamonds held in a classic four-prong platinum setting, displaying unmatched fire and brilliance.'
        },
        {
          name: 'Emerald Cut Diamond Ring',
          category: 'Rings',
          price: 4200,
          originalPrice: 4800,
          image: '/images/emerald_cut_ring.png',
          isNewArrival: true,
          isBestSeller: true,
          rating: 5.0,
          reviewsCount: 9,
          description: 'A stunning emerald-cut solitaire diamond set in a minimalist 18k yellow gold band with hidden micro-pave diamonds.'
        }
      ];
      await Product.insertMany(productsData);
      console.log('💎 Premium Sample Products Seeded Successfully');
    }

    // 6. Seed Mock Orders
    const Order = require('./models/Order');
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      await Order.create([
        {
          orderId: 'AURELIA-1001',
          customerName: 'Lord Sterling',
          email: 'sterling@vault.com',
          phone: '+1 555-8832',
          address: 'Château de la Roche',
          items: [{ name: 'Sovereign Diamond Ring', price: 3200, quantity: 1 }],
          totalAmount: 3200,
          paymentStatus: 'Paid',
          orderStatus: 'Pending'
        },
        {
          orderId: 'AURELIA-1002',
          customerName: 'Countess Anastasia',
          email: 'anastasia@fashion.com',
          phone: '+1 555-0199',
          address: '742 High Fashion Avenue',
          items: [{ name: 'Aurelia Solitaire Pendant', price: 1850, quantity: 1 }],
          totalAmount: 1850,
          paymentStatus: 'Paid',
          orderStatus: 'Shipped'
        }
      ]);
      console.log('📦 Mock Orders Initialized');
    }
  } catch (err) {
    console.error('❌ Database Seeding Error:', err);
  }
}

module.exports = app;
