import express from 'express';
import session from 'express-session';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Credenciales (en producción usar base de datos)
const VALID_USERS = {
  [process.env.ADMIN_USER || 'admin']: process.env.ADMIN_PASSWORD || 'admin123'
};

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configuración de sesiones seguras
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-super-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 horas
  }
}));

// Middleware de autenticación
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

// Rutas sin autenticación
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/manifest.json', (req, res) => {
  res.sendFile(path.join(__dirname, 'manifest.json'));
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  }

  // Verificar credenciales (en producción usar bcrypt y base de datos)
  if (VALID_USERS[username] && VALID_USERS[username] === password) {
    req.session.user = { username, loginTime: new Date() };
    res.json({ success: true, redirect: '/' });
  } else {
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
});

app.get('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Error al cerrar sesión' });
    }
    res.json({ success: true });
  });
});

// Servir archivos estáticos públicos (sin autenticación)
app.use(express.static(path.join(__dirname, 'public')));

// Archivos que se sirven sin autenticación
app.get('/Grifols-logo.svg', (req, res) => {
  res.sendFile(path.join(__dirname, 'Grifols-logo.svg'));
});

app.get('/Grifols-logo.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'Grifols-logo.png'));
});

// Archivos de estilo y scripts (públicos)
app.use('/src', express.static(path.join(__dirname, 'src')));

// Servir archivos estáticos después de autenticación
app.get('/', requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Servir archivos estáticos protegidos (excepto archivos públicos)
app.use(requireLogin, express.static(__dirname, {
  ignore: ['login.html', 'server.js', '.env', '.env.*']
}));

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor (Render usa reverse proxy con HTTPS automático)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🔒 Servidor seguro ejecutándose en puerto ${PORT}`);
  console.log(`📍 En desarrollo: http://localhost:${PORT}`);
  console.log(`🌐 En producción (Render): HTTPS automático`);
});
