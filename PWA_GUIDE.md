# 📱 Guía para Completar la PWA

## Estado Actual ✅

Tu PWA está **95% lista**. Solo falta generar los **iconos reales** de la app.

---

## 🎨 Iconos Necesarios (IMPORTANTE)

Los archivos actuales en `/public/` son placeholders. Necesitas reemplazarlos con iconos reales:

### Archivos a crear:

1. **`icon-192.png`** (192x192px)
   - Icono principal para Android
   - Propósito: `maskable` y `any`

2. **`icon-512.png`** (512x512px)
   - Icono de alta resolución
   - Para pantallas grandes y splash screen

3. **`apple-touch-icon.png`** (180x180px)
   - Icono para iOS cuando se añade a la pantalla de inicio
   - Debe ser cuadrado con bordes redondeados (iOS los redondea automáticamente)

4. **`favicon.ico`** (32x32px o multi-tamaño)
   - Icono para pestañas del navegador

---

## 🛠️ Cómo Generar los Iconos

### Opción 1: Herramienta Online (Recomendado)

1. Ve a: **https://www.pwabuilder.com/imageGenerator**
2. Sube tu logo (mínimo 512x512px, fondo transparente o color sólido)
3. Descarga el pack de iconos
4. Reemplaza los archivos en `/public/`

### Opción 2: Usar tu logo actual

Si tienes el logo en `/public/assets/images/adaptive-icon.png`:

```bash
# Instalar ImageMagick (si no lo tienes)
brew install imagemagick  # macOS
# o
sudo apt install imagemagick  # Linux

# Generar iconos desde tu logo
convert /public/assets/images/adaptive-icon.png -resize 192x192 public/icon-192.png
convert /public/assets/images/adaptive-icon.png -resize 512x512 public/icon-512.png
convert /public/assets/images/adaptive-icon.png -resize 180x180 public/apple-touch-icon.png
convert /public/assets/images/adaptive-icon.png -resize 32x32 public/favicon.ico
```

### Opción 3: Figma/Photoshop

1. Exporta tu logo en los tamaños: 192x192, 512x512, 180x180, 32x32
2. Guárdalos como PNG (excepto favicon.ico)
3. Reemplaza los archivos en `/public/`

---

## ✅ Checklist PWA Completa

### Ya Implementado ✅

- [x] **Service Worker** (vite-plugin-pwa)
- [x] **Manifest.json** (generado automáticamente)
- [x] **Meta tags PWA** (theme-color, viewport, etc)
- [x] **Apple meta tags** (mobile-web-app-capable, etc)
- [x] **Offline caching** (Workbox configurado)
- [x] **Auto-update** (registerType: 'autoUpdate')
- [x] **Responsive design** (max-width 580px)
- [x] **Touch-friendly UI** (botones grandes, espaciado)

### Falta ⏳

- [ ] **Iconos reales** (actualmente son placeholders)
- [ ] **Screenshots** (para app stores, opcional)
- [ ] **Notificaciones push** (opcional)

---

## 🚀 Despliegue en Producción

### 1. Build de Producción

```bash
yarn build
```

Esto genera:
- `/dist/` - Archivos estáticos
- `/dist/sw.js` - Service Worker
- `/dist/manifest.webmanifest` - Manifest PWA

### 2. Preview Local

```bash
yarn preview
```

Prueba la PWA en: http://localhost:4173

### 3. Deploy (Ej: Vercel, Netlify, Railway)

```bash
# Vercel
vercel --prod

# Netlify
netlify deploy --prod --dir=dist

# Railway
railway up
```

### 4. Configurar HTTPS

⚠️ **IMPORTANTE**: Las PWAs **requieren HTTPS** en producción.

- Vercel/Netlify incluyen HTTPS automáticamente
- Railway: Habilita HTTPS en settings

---

## 📱 Instalar la PWA

### Android (Chrome)

1. Abre la app en Chrome
2. Verás un banner "Añadir a pantalla de inicio"
3. O toca el menú (⋮) → "Instalar app"

### iOS (Safari)

1. Abre la app en Safari
2. Toca el botón de compartir (⎙)
3. Desplázate y toca "Añadir a pantalla de inicio"

### Desktop (Chrome/Edge)

1. Abre la app en el navegador
2. Verás un icono de instalación (+) en la barra de direcciones
3. O ve a menú → "Instalar Blu Cash"

---

## 🧪 Probar la PWA

### Chrome DevTools

1. Abre DevTools (F12)
2. Ve a la pestaña "Application"
3. Verifica:
   - **Manifest**: Debe mostrar nombre, iconos, theme color
   - **Service Workers**: Debe estar registrado y activo
   - **Storage**: LocalStorage debe tener datos de Privy

### Lighthouse (Auditoría PWA)

1. DevTools → Lighthouse
2. Selecciona "Progressive Web App"
3. Click en "Analyze"
4. Objetivo: Score > 90

---

## 🎯 Características PWA Actuales

### ✅ Instalable
- Manifest completo
- Service Worker registrado
- Cumple criterios de instalación

### ✅ Funciona Offline (Parcial)
- Assets estáticos cacheados
- API usa NetworkFirst (online-first con fallback)
- Transacciones requieren conexión (blockchain)

### ✅ App-like
- Sin barra de navegador (display: standalone)
- Orientación portrait forzada
- UI nativa (max 580px)

### ✅ Rápida
- Code splitting (vendor chunks)
- Lazy loading de rutas
- Optimización de imágenes

---

## 💡 Mejoras Opcionales Futuras

### Notificaciones Push

```typescript
// Ejemplo básico
if ('Notification' in window && 'serviceWorker' in navigator) {
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    new Notification('Transacción recibida', {
      body: '+10 ARST de julio.blu',
      icon: '/icon-192.png'
    });
  }
}
```

### Actualización Automática con UI

```typescript
// En main.tsx
import { registerSW } from 'virtual:pwa-register';

registerSW({
  onNeedRefresh() {
    // Mostrar banner: "Nueva versión disponible"
  },
  onOfflineReady() {
    // Mostrar: "App lista para usar offline"
  }
});
```

### Background Sync

```typescript
// workbox config en vite.config.ts
workbox: {
  runtimeCaching: [{
    urlPattern: /\/api\/transactions/,
    handler: 'NetworkOnly',
    options: {
      backgroundSync: {
        name: 'transactions-queue',
        options: {
          maxRetentionTime: 24 * 60 // 24 horas
        }
      }
    }
  }]
}
```

---

## 📊 Checklist Final

Antes de lanzar en producción:

- [ ] Reemplazar iconos con versiones reales
- [ ] Probar instalación en Android
- [ ] Probar instalación en iOS
- [ ] Probar instalación en Desktop
- [ ] Verificar Lighthouse score > 90
- [ ] Probar offline (desconectar red)
- [ ] Verificar que las transacciones funcionen
- [ ] Configurar dominio con HTTPS
- [ ] Actualizar URLs permitidas en Privy Dashboard

---

## 🎉 ¡Tu PWA está lista!

Con los iconos reales, tu app será una **PWA completa y profesional** que los usuarios pueden instalar en cualquier dispositivo.

**Próximo paso**: Genera los iconos y reemplaza los placeholders en `/public/` 🚀
