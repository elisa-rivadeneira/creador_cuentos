# 🚀 Guía de Despliegue - Creador de Cuentos

## 📋 Checklist para Producción

### 🔧 Variables de Entorno Requeridas

Configurar estas variables en tu plataforma de hosting:

```bash
# 🔐 Autenticación
NEXTAUTH_URL="https://tu-dominio.com"
NEXTAUTH_SECRET="secreto-super-seguro-generar-nuevo"

# 🗄️ Base de Datos
DATABASE_URL="file:./production.db"  # SQLite
# O para PostgreSQL:
# DATABASE_URL="postgresql://user:password@host:5432/database"

# 🔗 N8N Webhook
N8N_WEBHOOK_URL="https://tu-n8n.com/webhook/crear-cuento"
```

### 🛠️ Comandos de Despliegue

1. **Construir la aplicación:**
   ```bash
   npm run build
   ```

2. **Migrar base de datos:**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. **Iniciar en producción:**
   ```bash
   npm start
   ```

### 🌐 Plataformas de Hosting Recomendadas

#### **Vercel (Recomendado)**
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Desplegar
vercel

# 3. Configurar variables de entorno en Vercel Dashboard
```

#### **Railway**
```bash
# 1. Conectar con GitHub
# 2. Configurar variables de entorno
# 3. Deploy automático
```

#### **DigitalOcean App Platform**
```bash
# 1. Conectar repositorio
# 2. Configurar build command: npm run build
# 3. Configurar run command: npm start
```

### 🗄️ Base de Datos en Producción

#### **SQLite (Simple)**
- Mantener `DATABASE_URL="file:./production.db"`
- Ideal para aplicaciones pequeñas/medianas

#### **PostgreSQL (Escalable)**
```bash
# Ejemplo con Supabase/Railway/PlanetScale
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

### 🔐 Seguridad

1. **Generar NEXTAUTH_SECRET seguro:**
   ```bash
   openssl rand -base64 32
   ```

2. **HTTPS obligatorio en producción**

3. **Configurar CORS si es necesario**

4. **Revisar logs regularmente**

### 🚨 Errores Comunes

1. **"Server error"** → Verificar variables de entorno
2. **"N8N_WEBHOOK_URL no configurada"** → Agregar webhook URL
3. **Error de base de datos** → Ejecutar migraciones
4. **NextAuth error** → Verificar NEXTAUTH_URL y SECRET

### 📝 Post-Despliegue

1. ✅ Probar login/registro
2. ✅ Verificar creación de cuentos (si webhook está configurado)
3. ✅ Probar proceso de pago
4. ✅ Verificar límites de usuarios gratuitos/premium
5. ✅ Revisar logs de errores

### 🔄 Actualizaciones

```bash
# 1. Push cambios a Git
git push origin main

# 2. En producción (automático en Vercel/Railway)
# O manual:
git pull
npm install
npm run build
npx prisma migrate deploy
npm start
```

### 🆘 Soporte

Si tienes problemas:
1. Revisar logs de la aplicación
2. Verificar variables de entorno
3. Comprobar conectividad con N8N
4. Verificar estado de la base de datos