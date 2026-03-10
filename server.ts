import express from 'express';
import { createServer as createViteServer } from 'vite';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database('safepass.db');

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    module TEXT,
    event TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    severity TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS parents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS children (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id INTEGER,
    name TEXT,
    device_name TEXT,
    token TEXT UNIQUE,
    status TEXT DEFAULT 'inactive',
    FOREIGN KEY(parent_id) REFERENCES parents(id)
  )
`);

// Seed some data if empty
const parentCount = db.prepare('SELECT COUNT(*) as count FROM parents').get() as { count: number };
if (parentCount.count === 0) {
  db.prepare('INSERT INTO parents (name, email, password) VALUES (?, ?, ?)').run('Admin User', 'admin@gmail.com', '1234');
  const parentId = (db.prepare('SELECT id FROM parents WHERE email = ?').get('admin@gmail.com') as any).id;
  
  db.prepare('INSERT INTO children (parent_id, name, device_name, token, status) VALUES (?, ?, ?, ?, ?)').run(parentId, 'Alice', 'iPhone 16 Pro', '1234', 'active');
  db.prepare('INSERT INTO children (parent_id, name, device_name, token, status) VALUES (?, ?, ?, ?, ?)').run(parentId, 'Bob', 'iPad Air', 'XYZ-789', 'inactive');
} else {
  // Ensure admin user exists for current login
  const adminExists = db.prepare('SELECT * FROM parents WHERE email = ?').get('admin@gmail.com');
  if (!adminExists) {
    db.prepare('INSERT INTO parents (name, email, password) VALUES (?, ?, ?)').run('Admin User', 'admin@gmail.com', '1234');
  }
  
  const adminId = (db.prepare('SELECT id FROM parents WHERE email = ?').get('admin@gmail.com') as any).id;
  
  // Ensure child token 1234 exists
  const tokenExists = db.prepare('SELECT * FROM children WHERE token = ?').get('1234');
  if (!tokenExists) {
    db.prepare('INSERT INTO children (parent_id, name, device_name, token, status) VALUES (?, ?, ?, ?, ?)').run(adminId, 'Alice', 'iPhone 16 Pro', '1234', 'active');
  }
}

const count = db.prepare('SELECT COUNT(*) as count FROM activity_logs').get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO activity_logs (module, event, severity) VALUES (?, ?, ?)');
  insert.run('Media', 'Blocked inappropriate image in browser', 'high');
  insert.run('Links', 'Flagged suspicious phishing URL', 'medium');
  insert.run('Patterns', 'Detected dark pattern subscription trap', 'low');
  insert.run('Messages', 'Filtered toxic interaction on social media', 'medium');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Auth Routes
  app.post('/api/auth/parent/login', (req, res) => {
    const { email, password } = req.body;
    const parent = db.prepare('SELECT * FROM parents WHERE email = ? AND password = ?').get(email, password);
    if (parent) {
      res.json({ success: true, parent });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  });

  app.post('/api/auth/child/login', (req, res) => {
    const { token } = req.body;
    const child = db.prepare('SELECT * FROM children WHERE token = ?').get(token);
    if (child) {
      db.prepare('UPDATE children SET status = "active" WHERE id = ?').run(child.id);
      res.json({ success: true, child });
    } else {
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  });

  // Parent Dashboard Routes
  app.get('/api/parent/:id/children', (req, res) => {
    const children = db.prepare('SELECT * FROM children WHERE parent_id = ?').all(req.params.id);
    res.json(children);
  });

  app.post('/api/parent/:id/children/add', (req, res) => {
    const { name, device_name } = req.body;
    const token = Math.random().toString(36).substring(2, 8).toUpperCase();
    db.prepare('INSERT INTO children (parent_id, name, device_name, token) VALUES (?, ?, ?, ?)').run(req.params.id, name, device_name, token);
    res.json({ success: true, token });
  });

  app.delete('/api/children/:id', (req, res) => {
    db.prepare('DELETE FROM children WHERE id = ?').run(req.params.id);
    res.json({ success: true });
  });

  // Activity Log Routes
  app.get('/api/logs', (req, res) => {
    const logs = db.prepare('SELECT * FROM activity_logs ORDER BY timestamp DESC LIMIT 50').all();
    res.json(logs);
  });

  app.get('/api/stats', (req, res) => {
    const stats = db.prepare(`
      SELECT module, COUNT(*) as count 
      FROM activity_logs 
      GROUP BY module
    `).all();
    res.json(stats);
  });

  app.post('/api/logs/clear', (req, res) => {
    db.prepare('DELETE FROM activity_logs').run();
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
