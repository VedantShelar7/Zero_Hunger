const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

// ─── FIREBASE ADMIN SETUP ───────────────────────────────
let db;
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
      : null;

    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin Initialized');
      db = admin.firestore();
    } else {
      console.warn('FIREBASE_SERVICE_ACCOUNT not found. Using local in-memory storage fallback.');
      
      // Local Fallback Mock for Development
      const memoryDB = { users: [], orders: [] };
      db = {
        collection: (name) => {
          if (!memoryDB[name]) memoryDB[name] = [];
          return {
            doc: (id) => {
              const docId = id || Math.random().toString(36).substr(2, 9);
              return {
                id: docId,
                set: async (data) => {
                  const existing = memoryDB[name].findIndex(d => d.id === docId);
                  if (existing >= 0) memoryDB[name][existing] = { ...data, id: docId };
                  else memoryDB[name].push({ ...data, id: docId });
                },
                update: async (data) => {
                  const existing = memoryDB[name].find(d => d.id === docId);
                  if (existing) Object.assign(existing, data);
                }
              };
            },
            where: (field, op, val) => ({
              where: (f2, o2, v2) => ({
                get: async () => {
                  const matches = memoryDB[name].filter(d => d[field] === val && d[f2] === v2);
                  return { empty: matches.length === 0, docs: matches.map(m => ({ data: () => m })) };
                }
              }),
              get: async () => {
                const matches = memoryDB[name].filter(d => d[field] === val);
                return { empty: matches.length === 0, docs: matches.map(m => ({ data: () => m })) };
              }
            }),
            orderBy: () => ({
              get: async () => ({ docs: memoryDB[name].map(m => ({ id: m.id, data: () => m })) })
            }),
            get: async () => ({ docs: memoryDB[name].map(m => ({ id: m.id, data: () => m })) })
          };
        }
      };
    }
  } catch (err) {
    console.error('Firebase Init Error:', err.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ───────────────────────────────────────────────
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
    database: process.env.FIREBASE_SERVICE_ACCOUNT ? 'Firestore' : 'Local Mock',
    timestamp: new Date().toISOString()
  });
});

// ─── GLOBAL LOGGER ──────────────────────────────────────
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ─── AUTH ───────────────────────────────────────────────
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password, role, phone, organization } = req.body;
    
    // Quick check if email exists
    const usersRef = db.collection('users');
    const existing = await usersRef.where('email', '==', email).get();
    if (!existing.empty) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const userRef = usersRef.doc();
    const newUser = {
      id: userRef.id,
      name,
      email,
      password,
      role,
      phone: phone || '',
      organization: organization || '',
      createdAt: new Date().toISOString()
    };
    await userRef.set(newUser);
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { name, password } = req.body;
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', name).where('password', '==', password).get();
    
    if (snapshot.empty) {
      // Try with name if email doesn't match
      const snapName = await usersRef.where('name', '==', name).where('password', '==', password).get();
      if (snapName.empty) return res.status(401).json({ error: 'Invalid credentials' });
      return res.json(snapName.docs[0].data());
    }
    
    res.json(snapshot.docs[0].data());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, name, googleId, role } = req.body;
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (!snapshot.empty) {
      return res.json(snapshot.docs[0].data());
    }

    // Create new user if first time Google Sign-In
    const id = 'g_' + googleId;
    const newUser = {
      id,
      name,
      email,
      role: role || 'Donor',
      createdAt: new Date().toISOString()
    };
    await usersRef.doc(id).set(newUser);
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ORDERS ─────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    const snapshot = await db.collection('orders').orderBy('timestamp', 'desc').get();
    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { food, quantity, type, source } = req.body;
    const orderRef = db.collection('orders').doc();
    const newOrder = {
      id: orderRef.id,
      food,
      quantity,
      type,
      source,
      trl: Math.floor(Math.random() * (95 - 60 + 1)) + 60,
      status: 'Pending',
      ngoStatus: 'pending',
      expiresIn: '4 hrs',
      timestamp: new Date().toISOString(),
      volunteer: null
    };
    await orderRef.set(newOrder);
    res.json(newOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await db.collection('orders').doc(req.params.id).update({ status });
    res.json({ id: req.params.id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/orders/:id/ngo-status', async (req, res) => {
  try {
    const { action } = req.body;
    const ngoStatus = action === 'accept' ? 'accepted' : 'declined';
    const status = action === 'accept' ? 'Order Accepted' : 'Declined';

    let assignedVolunteer = null;
    if (action === 'accept') {
      const available = volunteers.filter(v => v.status === 'Available');
      if (available.length > 0) {
        assignedVolunteer = available[Math.floor(Math.random() * available.length)];
        assignedVolunteer.status = 'En Route';
      }
    }

    await db.collection('orders').doc(req.params.id).update({
      ngoStatus,
      status,
      volunteer: assignedVolunteer
    });

    res.json({ id: req.params.id, ngoStatus, status, volunteer: assignedVolunteer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/orders', async (req, res) => {
  try {
    // In Firestore, deleting a collection requires fetching all docs first.
    // For local mock, we can just clear it.
    // For simplicity in this demo, we'll return a message.
    res.json({ message: 'Order clearing must be done manually in Firebase console.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── VOLUNTEERS (MOCK) ──────────────────────────────────
let volunteers = [
  { id: 1, name: 'Rahul Sharma', vehicle: 'Scooter (2-Wheeler)', status: 'Available', rating: 4.8, deliveries: 124 },
  { id: 2, name: 'Anjali Verma', vehicle: 'Hatchback (4-Wheeler)', status: 'En Route', rating: 4.9, deliveries: 312 },
  { id: 3, name: 'Suresh Kumar', vehicle: 'Scooter (2-Wheeler)', status: 'Offline', rating: 4.5, deliveries: 89 },
  { id: 4, name: 'Priya Patel', vehicle: 'Bicycle', status: 'Available', rating: 4.7, deliveries: 45 },
];

app.get('/api/volunteers', (req, res) => {
  res.json(volunteers);
});

app.post('/api/volunteers', (req, res) => {
  const newVol = {
    id: Date.now(),
    name: req.body.name || 'New Recruit ' + (volunteers.length + 1),
    vehicle: req.body.vehicle || 'Scooter (2-Wheeler)',
    status: 'Available',
    rating: 5.0,
    deliveries: 0
  };
  volunteers.unshift(newVol);
  res.json(newVol);
});

// ─── START SERVER ───────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ZeroHunger Backend ACTIVE on port ${PORT}`);
});

// ─── 404 ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});
