import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const VALID_USERS = {
  [process.env.ADMIN_USER || 'admin']: process.env.ADMIN_PASSWORD || 'admin123'
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

const requireLogin = (req, res, next) => {
  if (req.session?.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Health check
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok' });
});

// Login page
app.get('/login', (req, res) => {
  try {
    const html = fs.readFileSync(path.join(__dirname, 'login.html'), 'utf8');
    res.send(html);
  } catch (e) {
    res.send('<h1>Login</h1><p>Error loading login page</p>');
  }
});

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (username && password && VALID_USERS[username] === password) {
    req.session.user = { username };
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Logout
app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Dashboard (protected)
app.get('/', requireLogin, (req, res) => {
  try {
    const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
    res.send(html);
  } catch (e) {
    res.send('<h1>Dashboard</h1><p>Error loading dashboard</p>');
  }
});

// Static files (simple approach)
app.get('/Grifols-logo.svg', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'Grifols-logo.svg'));
  } catch (e) {
    res.status(404).send('Not found');
  }
});

app.get('/Grifols-logo.png', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'Grifols-logo.png'));
  } catch (e) {
    res.status(404).send('Not found');
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
