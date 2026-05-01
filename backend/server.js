const express = require('express');
const cors = require('cors');
const db = require('./database');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Global request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ─── AUTH ───────────────────────────────────────────────
app.post('/api/auth/signup', (req, res) => {
  const { name, email, password, role, phone, organization } = req.body;
  const id = Date.now().toString();

  // Check if user exists
  db.get("SELECT * FROM users WHERE name = ? OR email = ?", [name, email], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) {
      if (row.name === name) return res.status(400).json({ error: 'User with this name already exists' });
      if (row.email === email) return res.status(400).json({ error: 'User with this email already exists' });
    }

    db.run(
      "INSERT INTO users (id, name, email, password, role, phone, organization) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, name, email, password, role, phone || '', organization || ''],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ id, name, email, role, phone, organization });
      }
    );
  });
});

app.post('/api/auth/login', (req, res) => {
  const { name, password } = req.body; // 'name' here can be either name or email from the form
  db.get("SELECT * FROM users WHERE (name = ? OR email = ?) AND password = ?", [name, name, password], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(401).json({ error: 'Invalid email/name or password' });
    res.json(user);
  });
});

app.post('/api/auth/google', (req, res) => {
  console.log('Google Auth Request Body:', req.body);
  const { email, name, googleId, role } = req.body;
  db.get("SELECT * FROM users WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (user) return res.json(user);
    
    // Create new user if first time Google Sign-In
    const id = 'g_' + googleId;
    db.run(
      "INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)",
      [id, name, email, role || 'Donor'],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json({ id, name, email, role: role || 'Donor' });
      }
    );
  });
});

// ─── ORDERS ─────────────────────────────────────────────
app.get('/api/orders', (req, res) => {
  db.all("SELECT * FROM orders ORDER BY timestamp DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // Parse volunteer JSON string back to object
    const orders = rows.map(r => ({
      ...r,
      volunteer: r.volunteer ? JSON.parse(r.volunteer) : null
    }));
    res.json(orders);
  });
});

app.get('/api/orders/:id', (req, res) => {
  db.get("SELECT * FROM orders WHERE id = ?", [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Order not found' });
    row.volunteer = row.volunteer ? JSON.parse(row.volunteer) : null;
    res.json(row);
  });
});

app.post('/api/orders', (req, res) => {
  const { food, quantity, type, source } = req.body;
  const id = Date.now().toString();
  const trl = Math.floor(Math.random() * (95 - 60 + 1)) + 60;
  const status = 'Pending';
  const ngoStatus = 'pending';
  const expiresIn = '4 hrs';
  const timestamp = new Date().toISOString();

  db.run(
    'INSERT INTO orders (id, food, quantity, type, trl, source, status, ngoStatus, expiresIn, timestamp, volunteer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, food, quantity, type, trl, source, status, ngoStatus, expiresIn, timestamp, null],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, food, quantity, type, trl, source, status, ngoStatus, expiresIn, timestamp, volunteer: null });
    }
  );
});

app.put('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  db.run("UPDATE orders SET status = ? WHERE id = ?", [status, req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });
    db.get("SELECT * FROM orders WHERE id = ?", [req.params.id], (err2, row) => {
      if (err2) return res.status(500).json({ error: err2.message });
      row.volunteer = row.volunteer ? JSON.parse(row.volunteer) : null;
      res.json(row);
    });
  });
});

app.put('/api/orders/:id/ngo-status', (req, res) => {
  const { action } = req.body; // 'accept' or 'decline'
  const ngoStatus = action === 'accept' ? 'accepted' : 'declined';
  const status = action === 'accept' ? 'Order Accepted' : 'Declined';

  // If accepted, assign a random available volunteer
  let assignedVolunteer = null;
  if (action === 'accept') {
    const available = volunteers.filter(v => v.status === 'Available');
    if (available.length > 0) {
      assignedVolunteer = available[Math.floor(Math.random() * available.length)];
      // Mark volunteer as busy for demo purposes
      assignedVolunteer.status = 'En Route';
    }
  }

  db.run(
    "UPDATE orders SET ngoStatus = ?, status = ?, volunteer = ? WHERE id = ?",
    [ngoStatus, status, assignedVolunteer ? JSON.stringify(assignedVolunteer) : null, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Order not found' });
      db.get("SELECT * FROM orders WHERE id = ?", [req.params.id], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        row.volunteer = row.volunteer ? JSON.parse(row.volunteer) : null;
        res.json(row);
      });
    }
  );
});

app.delete('/api/orders', (req, res) => {
  db.run("DELETE FROM orders", function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'All orders cleared', changes: this.changes });
  });
});

// ─── USERS ──────────────────────────────────────────────
app.put('/api/users/:id', (req, res) => {
  const { name, email, phone, organization, profileImage } = req.body;
  db.run(
    "UPDATE users SET name = ?, email = ?, phone = ?, organization = ?, profileImage = ? WHERE id = ?",
    [name, email, phone, organization, profileImage || null, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'User not found' });
      db.get("SELECT * FROM users WHERE id = ?", [req.params.id], (err2, row) => {
        if (err2) return res.status(500).json({ error: err2.message });
        res.json(row);
      });
    }
  );
});

app.get('/api/users', (req, res) => {
  db.all("SELECT * FROM users", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ─── VOLUNTEERS ─────────────────────────────────────────
// We store volunteers in memory for now (they were always mock data)
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

app.listen(PORT, () => {
  console.log(`ZeroHunger Backend v2.0 ACTIVE running on http://localhost:${PORT}`);
});

// Catch-all 404 handler for JSON
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: `Route not found: ${req.method} ${req.url}` });
});
