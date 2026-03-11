import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// ConfiguraciÃ³n bÃ¡sica
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: 'donor-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true, 
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    secure: false
  }
}));

// Credenciales
const credentials = {
  [process.env.ADMIN_USER || 'admin']: process.env.ADMIN_PASSWORD || 'admin123'
};

// Middleware
const auth = (req, res, next) => {
  if (req.session?.user) return next();
  res.redirect('/login');
};

// Rutas de autenticaciÃ³n (pÃºblicas)
app.get('/api/status', (req, res) => res.json({ status: 'ok' }));

app.get('/login', (req, res) => {
  res.type('html').send(fs.readFileSync(path.join(__dirname, 'login.html'), 'utf8'));
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (credentials[username] === password) {
    req.session.user = { username };
    req.session.save((err) => {
      if (err) {
        res.status(500).json({ error: 'Session error' });
      } else {
        res.json({ success: true });
      }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.get('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Servir assets pÃºblicos (CSS, JS, imÃ¡genes)
app.use('/assets', express.static(path.join(__dirname, 'dist/assets')));

app.get('/Grifols-logo.svg', (req, res) => {
  res.sendFile(path.join(__dirname, 'Grifols-logo.svg')).catch(() => res.status(404).end());
});

app.get('/Grifols-logo.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'Grifols-logo.png')).catch(() => res.status(404).end());
});

app.get('/manifest.json', (req, res) => {
  res.type('json').send(fs.readFileSync(path.join(__dirname, 'dist/assets/manifest-C1FjQeLr.json'), 'utf8'));
});

// Ruta raÃ­z protegida - sirve dashboard compilado
app.get('/', auth, (req, res) => {
  res.type('html').send(fs.readFileSync(path.join(__dirname, 'dist/index.html'), 'utf8'));
});

// Fallback para SPA - cualquier ruta desconocida protegida sirve el index.html
app.use(auth, (req, res) => {
  res.type('html').send(fs.readFileSync(path.join(__dirname, 'dist/index.html'), 'utf8'));
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server ready on port ${PORT}`));
