import express from 'express';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Credenciales
const VALID_USERS = {
  [process.env.ADMIN_USER || 'admin']: process.env.ADMIN_PASSWORD || 'admin123'
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ConfiguraciÃ³n de sesiones seguras
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

// Middleware de autenticaciÃ³n
const requireLogin = (req, res, next) => {
  if (req.session && req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Health check para Render
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Rutas de autenticaciÃ³n (pÃºblicas)
app.get('/login', (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'login.html'));
  } catch (err) {
    res.status(404).send('Login page not found');
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseÃ±a requeridos' });
  }

  if (VALID_USERS[username] && VALID_USERS[username] === password) {
    req.session.user = { username, loginTime: new Date() };
    res.json({ success: true, redirect: '/' });
  } else {
    res.status(401).json({ error: 'Credenciales invÃ¡lidas' });
  }
});

app.get('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesiÃ³n' });
    }
    res.json({ success: true });
  });
});

// Archivos estÃ¡ticos pÃºblicos (antes de autenticaciÃ³n)
app.use(express.static(__dirname, {
  index: false,
  ignore: ['server.js', '.env', '.env.*', 'node_modules', 'dist', 'upload-to-github.ps1']
}));

// Ruta raÃ­z protegida
app.get('/', requireLogin, (req, res) => {
  try {
    res.sendFile(path.join(__dirname, 'index.html'));
  } catch (err) {
    res.status(404).send('Dashboard not found');
  }
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ðŸ”’ Servidor ejecutÃ¡ndose en puerto ${PORT}`);
  console.log(`ðŸ“ URL: http://localhost:${PORT}`);
});
