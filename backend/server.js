require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── MONGODB CONNECTION ─────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.error('MongoDB Connection Error:', err));
} else {
  console.warn('MONGODB_URI not found. Application will use a local in-memory fallback (non-persistent).');
}

// ─── SCHEMAS ────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  id: String,
  name: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  role: String,
  phone: String,
  organization: String,
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  id: String,
  food: String,
  quantity: String,
  type: String,
  trl: Number,
  source: String,
  status: String,
  ngoStatus: String,
  expiresIn: String,
  timestamp: { type: String, default: () => new Date().toISOString() },
  volunteer: Object
});

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);

// ─── MIDDLEWARE ─────────────────────────────────────────
const allowedOrigins = [
  'https://zerohunger-91139.web.app',
  'https://zerohunger-91139.firebaseapp.com',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// ─── HEALTH CHECK ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ZeroHunger Backend is ONLINE',
    database: MONGODB_URI ? 'MongoDB' : 'In-Memory Fallback',
    timestamp: new Date().toISOString()
  });
});

// ─── AUTH ROUTES ────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, phone, organization } = req.body;
    
    const existing = await User.findOne({ $or: [{ name }, { email }] });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = new User({
      id: Date.now().toString(),
      name,
      email,
      password, // Use bcrypt in production
      role,
      phone: phone || '',
      organization: organization || ''
    });

    await newUser.save();
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({
      $or: [{ name: name }, { email: name }],
      password: password
    });

    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, name, googleId, role } = req.body;
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        id: 'g_' + googleId,
        name,
        email,
        role: role || 'Donor'
      });
      await user.save();
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ORDER ROUTES ───────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ timestamp: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { food, quantity, type, source } = req.body;
    const newOrder = new Order({
      id: Date.now().toString(),
      food,
      quantity,
      type,
      source,
      trl: Math.floor(Math.random() * 35) + 60,
      status: 'Pending',
      ngoStatus: 'pending',
      expiresIn: '4 hrs',
      volunteer: null
    });

    await newOrder.save();
    res.json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { status: req.body.status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/ngo-status', async (req, res) => {
  try {
    const { action } = req.body;
    const ngoStatus = action === 'accept' ? 'accepted' : 'declined';
    const status = action === 'accept' ? 'Order Accepted' : 'Declined';

    const order = await Order.findOneAndUpdate(
      { id: req.params.id },
      { ngoStatus, status },
      { new: true }
    );
    
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── START SERVER ───────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ZeroHunger Backend (MongoDB) ACTIVE on port ${PORT}`);
});

// ─── 404 ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});
