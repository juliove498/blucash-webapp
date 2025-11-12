# ARST Wallet PWA

Progressive Web App de ARST Wallet - migración desde React Native a React + Vite.

## 🚀 Stack Tecnológico

- **React 19** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Framer Motion** - Animaciones
- **Radix UI** - Componentes accesibles
- **Privy** - Autenticación y Smart Wallets
- **Viem** - Blockchain interactions
- **React Query** - Data fetching
- **Zustand** - State management
- **React Router** - Routing
- **i18next** - Internacionalización

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .envrc .env

# Actualizar .env con tus credenciales de Privy Web
# IMPORTANTE: Crear un nuevo App Client Web en dashboard.privy.io
```

## 🔧 Configuración

### 1. Privy Web SDK

Necesitas crear un nuevo **App Client para Web** en [dashboard.privy.io](https://dashboard.privy.io/):

1. Ve a tu app en Privy Dashboard
2. Crea un nuevo "App Client" de tipo **Web**
3. Configura los dominios permitidos:
   - `http://localhost:5173` (desarrollo)
   - Tu dominio de producción
4. Copia el `App ID` y `Client ID`
5. Actualiza el archivo `.env`:

```env
VITE_PRIVY_APP_ID=tu-app-id-web
VITE_PRIVY_CLIENT_ID=tu-client-id-web
```

### 2. Variables de Entorno

Todas las variables en `.env`:

```env
# Privy Web
VITE_PRIVY_APP_ID=
VITE_PRIVY_CLIENT_ID=

# Backend API
VITE_API_URL=https://arst-wallet-backend-testing.up.railway.app

# Blockchain
VITE_ETHERSCAN_KEY=
VITE_ARST_TOKEN_ADDRESS=
VITE_USDC_TOKEN_ADDRESS=
VITE_CHAIN_NAME=baseSepolia
```

## 🏃 Ejecutar

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Preview del build
npm run preview

# Type check
npx tsc --noEmit
```

La aplicación estará disponible en: **http://localhost:5173**

## 📁 Estructura del Proyecto

```
src/
├── assets/          # Recursos estáticos
├── components/      # Componentes reutilizables
│   ├── ui/         # Componentes base (Button, Card, etc)
│   ├── Auth/       # Componentes de autenticación
│   └── Send/       # Componentes de envío
├── pages/          # Páginas/Pantallas
│   ├── auth/       # Páginas de autenticación
│   └── app/        # Páginas de la aplicación
├── hooks/          # Custom hooks
├── services/       # Servicios API
├── stores/         # Zustand stores
├── utils/          # Utilidades
├── constants/      # Constantes
├── config/         # Configuración (Privy, i18n, etc)
├── layouts/        # Layouts (Auth, App)
├── routes/         # Configuración de rutas
└── styles/         # Estilos globales
```

## 🎨 Componentes UI

### Button
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>
```

### Card
```tsx
import { Card } from '@/components/ui/Card';

<Card>Content</Card>
```

### Bottom Sheet
```tsx
import { BottomSheet, BottomSheetRef } from '@/components/ui/BottomSheet';

const ref = useRef<BottomSheetRef>(null);

<button onClick={() => ref.current?.present()}>Open</button>
<BottomSheet ref={ref}>Content</BottomSheet>
```

## 🔐 Autenticación

La autenticación se maneja automáticamente con Privy:

```tsx
import { usePrivy } from '@privy-io/react-auth';

const { login, logout, authenticated, user } = usePrivy();
```

## 📱 PWA Features

- ✅ Service Worker configurado
- ✅ Manifest.json
- ✅ Offline fallback
- ✅ Add to Home Screen
- ✅ Icons optimizados

Para probar PWA:
1. Hacer build: `npm run build`
2. Preview: `npm run preview`
3. Abrir en móvil o usar DevTools > Application > Manifest

## 🚀 Deployment

### Vercel (Recomendado)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Configurar variables de entorno en Vercel Dashboard.

### Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy
```

## 📊 Estado de Migración

### ✅ Completado
- [x] Setup del proyecto
- [x] Configuración de Vite + PWA
- [x] TailwindCSS
- [x] Componentes UI base
- [x] Routing
- [x] Privy Web SDK
- [x] Stores (Zustand)
- [x] Services API
- [x] Utils y constants
- [x] i18n
- [x] HomePage básica

### 🚧 En Progreso
- [ ] Dashboard completo
- [ ] Pantallas de Send
- [ ] Pantallas de Swap
- [ ] Pantallas de Deposit
- [ ] QR Scanner web
- [ ] Pantallas de Profile

### 📝 Pendiente
- [ ] Testing exhaustivo
- [ ] Optimización de performance
- [ ] Testing en múltiples navegadores
- [ ] Testing en dispositivos móviles

## 🐛 Issues Conocidos

1. **Privy SDK**: Asegúrate de usar el App Client correcto (Web, no Mobile)
2. **HTTPS**: Algunas funcionalidades (cámara, PWA) requieren HTTPS en producción
3. **Safe Area**: Los insets pueden variar entre navegadores

## 📚 Recursos

- [Privy Web Docs](https://docs.privy.io/guide/react/)
- [Vite Docs](https://vitejs.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Radix UI](https://www.radix-ui.com/)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Proyecto privado - ARST Wallet

---

**Estado**: 🚧 En desarrollo activo  
**Última actualización**: Noviembre 2025
