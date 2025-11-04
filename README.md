# 🏰 Creador de Cuentos Mágicos

Una aplicación Next.js para crear cuentos educativos ilustrados para niños de primaria, integrada con n8n y Python Pillow.

## ✨ Características

- 🎨 **Diseño infantil colorido** con animaciones y efectos visuales
- 📚 **Formulario intuitivo** para especificar tema, grado y área de estudio
- 🖼️ **Múltiples formatos de imagen** (cabecera, lado, cuadrado)
- 🤖 **Integración con IA** a través de workflows de n8n
- 📖 **Genera automáticamente**:
  - Ficha de lectura (cuento ilustrado)
  - Ficha de comprensión lectora
- 📱 **Responsive design** optimizado para dispositivos móviles

## 🚀 Instalación

1. **Clona el repositorio**:
   ```bash
   git clone <repo-url>
   cd creador_cuentos
   ```

2. **Instala las dependencias**:
   ```bash
   npm install
   ```

3. **Configura las variables de entorno**:
   ```bash
   cp .env.example .env.local
   ```

   Edita `.env.local` y configura:
   ```
   N8N_WEBHOOK_URL=https://tu-instancia-n8n.com/webhook/crear-cuento
   ```

4. **Ejecuta el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

5. **Abre** [http://localhost:3000](http://localhost:3000) en tu navegador

## 🔧 Configuración del Webhook de n8n

Tu workflow de n8n debe:

1. **Recibir** los siguientes datos del webhook:
   ```json
   {
     "tema": "string",
     "grado": "string",
     "area": "string",
     "formato_imagen": "cabecera|lado|cuadrado",
     "timestamp": "string"
   }
   ```

2. **Devolver** las URLs de las imágenes generadas:
   ```json
   {
     "cuento_url": "https://...",
     "ficha_url": "https://..."
   }
   ```

## 🎨 Tecnologías Utilizadas

- **Next.js 14** con App Router
- **TypeScript** para type safety
- **Tailwind CSS** para estilos
- **React** para componentes interactivos
- **Google Fonts** (Comic Neue, Fredoka One)

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── api/crear-cuento/    # API route para n8n
│   ├── globals.css          # Estilos globales
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página principal
├── components/
│   └── FormularioCuento.tsx # Formulario principal
└── types/
    └── index.ts             # Tipos TypeScript
```

## 🎯 Áreas de Estudio Soportadas

- Ciencias Naturales
- Ciencias Sociales
- Matemáticas
- Lenguaje
- Inglés
- Educación Física
- Artes

## 🏫 Grados Soportados

- 1° a 6° de Primaria

## 🔮 Próximas Características

- 🔐 Sistema de autenticación para profesores
- 📊 Dashboard con historial de cuentos
- 👥 Compartir cuentos entre profesores
- 🎵 Integración con audio/narración
- 📱 App móvil nativa

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. Haz un fork del proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.