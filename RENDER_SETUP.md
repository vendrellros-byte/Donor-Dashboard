# 🚀 Deployment en Render.com - Pasos Rápidos

## ✅ Paso 1: Sincronizar con GitHub

Desde tu terminal en el proyecto:

```bash
# Inicializar git si no está hecho
git init

# Agregar todos los archivos
git add .

# Commit
git commit -m "Initial commit - Donor Dashboard with auth"

# Vincular al repositorio (reemplaza USER y REPO)
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

---

## ✅ Paso 2: Crear el Servicio en Render

1. **Ir a** https://dashboard.render.com
2. **Click en** `New +` → `Web Service`
3. **Seleccionar tu repositorio** `Donor-Dashboard` o similar
4. **Configurar:**
   - **Name:** `donor-dashboard`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free (gratis)

---

## ✅ Paso 3: Configurar Variables de Entorno

En la pantalla de creación del servicio, ir a **Environment** y agregar:

| Key | Value | Notas |
|-----|-------|-------|
| `NODE_ENV` | `production` | Obligatorio |
| `ADMIN_USER` | `admin` | Cambia a tu usuario |
| `ADMIN_PASSWORD` | `tu_contraseña_segura` | **ASEGÚRATE DE CAMBIAR** |
| `SESSION_SECRET` | `clave-muy-segura-de-32-caracteres` | Usa algo fuerte |
| `PORT` | `(dejar vacío, Render lo asigna)` | |

### 🔑 Generar SESSION_SECRET seguro:

Opción 1 - En PowerShell:
```powershell
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes([System.Guid]::NewGuid().ToString() + [System.Guid]::NewGuid().ToString()))
```

Opción 2 - Copiar este ejemplo:
```
render-donor-dashboard-super-secret-key-2024-abc123xyz789
```

---

## ✅ Paso 4: Deploy

1. **Click en** `Create Web Service`
2. Render **compilará y desplegará** automáticamente (2-3 minutos)
3. Verás una URL como: `https://donor-dashboard.onrender.com`

---

## ✅ Paso 5: Acceder a tu Dashboard

```
URL: https://donor-dashboard.onrender.com/login
Usuario: admin
Contraseña: (la que configuraste en ADMIN_PASSWORD)
```

---

## 🔄 Actualizaciones Futuras

Solo hace `git push` y Render despliega automáticamente:

```bash
git add .
git commit -m "Cambios"
git push origin main
```

---

## ⚠️ Notas Importantes

- **Render usa el puerto dinámicamente** - No configuramos puerto manualmente
- **HTTPS es automático** - Render maneja certificados SSL
- **Free tier:** 750 horas/mes (suficiente para 1 app)
- **Inactividad:** Se pausa si no hay tráfico durante 15 min (reinicia al acceder)
- **Variables en .env.example** - Nunca commitear .env con credenciales reales

---

## 🆘 Troubleshooting

### "Build failed"
- Verificar que todas las dependencias estén en `package.json`
- Ejecutar localmente: `npm install && npm start`

### "Port binding error"
- Render asigna el puerto vía variable `PORT`
- El server.js ya maneja: `const PORT = process.env.PORT || 3000`

### "Cannot find module"
- Asegurar que `.gitignore` NO excluye `package.json`
- Comprobar que dependencies en package.json son correctas

### App se pausa en free tier
- Normal - Render pausa apps inactivas
- Se reactivan automáticamente al acceder

---

¡Listo! 🎉 Dashboard en vivo con HTTPS automático y login seguro.
