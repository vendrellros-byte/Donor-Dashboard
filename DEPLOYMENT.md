# Guía de Despliegue Seguro - Donor Data Journey Dashboard

## 📋 Requisitos Previos

- Node.js 18+ instalado
- npm o yarn
- Dominio/IP para acceder al servidor
- Certificados SSL (recomendado)

## 🚀 Instalación y Configuración Local

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env` y cambiar las credenciales:

```bash
cp .env.example .env
```

Editar `.env`:
```
ADMIN_USER=tu_usuario
ADMIN_PASSWORD=tu_contrasena_segura
SESSION_SECRET=tu_clave_secreta_super_segura
```

### 3. Iniciar servidor en desarrollo

```bash
npm run server-dev
```

Acceder a: `http://localhost:3000/login`

Credenciales: (las configuradas en .env)

---

## 🔒 Despliegue Seguro en Producción

### Opción 1: Vercel (Recomendado - Fácil)

1. Crear cuenta en [vercel.com](https://vercel.com)
2. Conectar repositorio GitHub
3. Agregar variables de entorno en settings:
   - `ADMIN_USER`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
4. Deploy automático

**Ventajas:**
- HTTPS automático
- Escalado automático
- CDN global
- Fácil mantenimiento

### Opción 2: Heroku

1. Crear cuenta en [heroku.com](https://www.heroku.com)
2. Instalar Heroku CLI
3. Deployar:

```bash
heroku login
heroku create your-app-name
git push heroku main
heroku config:set ADMIN_USER=admin
heroku config:set ADMIN_PASSWORD=your_secure_password
heroku config:set SESSION_SECRET=your_secret_key
```

### Opción 3: AWS (Más Control)

1. EC2 instance (Ubuntu 20.04)
2. Instalar Node.js
3. Usar PM2 para mantener el servidor activo
4. Configurar Nginx como reverse proxy
5. Certificado SSL con Let's Encrypt

**Script de instalación en EC2:**

```bash
#!/bin/bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Clonar repositorio
git clone your-repo-url
cd Donor-mini

# Instalar dependencias
npm install

# Agregar variables de entorno
echo "ADMIN_USER=admin" > .env
echo "ADMIN_PASSWORD=changeme" >> .env
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env
echo "NODE_ENV=production" >> .env

# Iniciar con PM2
pm2 start server.js --name "donor-dashboard"
pm2 startup
pm2 save
```

### Opción 4: Azure App Service

1. Crear App Service
2. Configurar deployment desde GitHub
3. Agregar Application Settings:
   - `ADMIN_USER`
   - `ADMIN_PASSWORD`
   - `SESSION_SECRET`
   - `NODE_ENV=production`

---

## 🔐 Configuración de HTTPS en Producción

### Con Let's Encrypt (Gratuito)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Generar certificado
sudo certbot certonly --standalone -d your-domain.com

# Los certificados están en:
# /etc/letsencrypt/live/your-domain.com/cert.pem
# /etc/letsencrypt/live/your-domain.com/privkey.pem
```

### Configurar en server.js

Actualizar to reference:
```javascript
const options = {
  cert: fs.readFileSync('/etc/letsencrypt/live/your-domain.com/cert.pem'),
  key: fs.readFileSync('/etc/letsencrypt/live/your-domain.com/privkey.pem')
};
```

---

## 🔑 Gestión de Credenciales

### Para Producción (NO usar en .env directamente):

**Opción 1: Base de datos**

Implementar con MongoDB/PostgreSQL:
```javascript
// Hashear contraseñas con bcrypt
import bcrypt from 'bcrypt';
const hashedPassword = await bcrypt.hash(password, 10);
```

**Opción 2: Variables de entorno empresariales**

- AWS Secrets Manager
- Azure Key Vault
- HashiCorp Vault

---

## 📊 Monitoreo

### PM2 Plus
```bash
pm2 plus
```

### New Relic
```bash
npm install newrelic
```

### Datadog
Integración para monitorear rendimiento

---

## ✅ Checklist de Seguridad

- [ ] Cambiar credenciales por defecto
- [ ] Usar contraseña fuerte (20+ caracteres)
- [ ] Habilitar HTTPS/SSL
- [ ] Configurar firewall
- [ ] Usar sesiones seguras (httpOnly, secure)
- [ ] Implementar rate limiting
- [ ] Agregar CORS si API externa
- [ ] Usar variables de entorno seguras
- [ ] Realizar backups regulares
- [ ] Mantener Node.js actualizado
- [ ] Usar helmet.js para headers de seguridad
- [ ] Logs y auditoría de acceso

---

## 🐛 Troubleshooting

### "Cannot find module bcrypt"
```bash
npm install express-session dotenv
```

### Puerto ya en uso
```bash
sudo lsof -i :3000
kill -9 <PID>
```

### Certificado SSL expirado
```bash
sudo certbot renew
```

---

## 📞 Soporte

Para más información sobre seguridad:
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
