const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const initDb = () => {
  db.serialize(() => {
    // Create Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT,
      phone TEXT,
      organization TEXT,
      profileImage TEXT
    )`);

    // Wipe users table as requested
    // db.run("DELETE FROM users");

    // Create Orders table
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      food TEXT,
      quantity TEXT,
      type TEXT,
      trl INTEGER,
      source TEXT,
      status TEXT,
      ngoStatus TEXT,
      expiresIn TEXT,
      timestamp TEXT,
      volunteer TEXT
    )`);

    // Seed mock orders if empty
    db.get("SELECT count(*) as count FROM orders", (err, row) => {
      if (!err && row && row.count === 0) {
        const insert = db.prepare('INSERT INTO orders (id, food, quantity, type, trl, source, status, ngoStatus, expiresIn, timestamp, volunteer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
        
        insert.run(
          '1', 'Dal Makhani & Naan', '8.5kg', 'Veg', 64, 'Taj West End', 'Order Accepted', 'accepted', '2 hrs', new Date().toISOString(),
          JSON.stringify({ name: 'Rahul S.', phone: '+91 98765 43210' })
        );
        insert.run(
          '2', 'Mixed Veg Curry', '12kg', 'Veg', 80, 'ITC Gardenia', 'Pending', 'pending', '4 hrs', new Date().toISOString(), null
        );
        insert.finalize();
        console.log('Seeded initial orders.');
      }
    });

    // User seeding removed for fresh authentication system.
  });
};

initDb();

module.exports = db;
