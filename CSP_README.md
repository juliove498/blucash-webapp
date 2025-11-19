# 🔒 Content Security Policy (CSP) Configurations

Esta aplicación implementa una **Content Security Policy (CSP)** estricta siguiendo las recomendaciones de Privy para máxima seguridad.

## 📋 ¿Qué es CSP?

CSP es un conjunto de reglas que le dice al navegador qué fuentes de contenido son válidas. Ayuda a prevenir:
- **XSS (Cross-Site Scripting)** - Inyección de scripts maliciosos
- **Clickjacking** - Engañar al usuario para hacer clicks no deseados
- **Data exfiltration** - Robo de datos hacia sitios no autorizados

## 🎯 Configuración Actual

### Dominios Permitidos

#### Privy (Autenticación)
- `https://auth.privy.io` - Modal de login
- `https://*.rpc.privy.systems` - Proveedor RPC

#### WalletConnect
- `https://verify.walletconnect.com` - Verificación
- `https://verify.walletconnect.org` - Verificación (fallback)
- `wss://relay.walletconnect.com` - WebSocket relay
- `wss://relay.walletconnect.org` - WebSocket relay (fallback)
- `https://explorer-api.walletconnect.com` - Explorer API

#### Coinbase Wallet
- `wss://www.walletlink.org` - WebSocket API

#### Base Network (Blockchain)
- `https://base.llamarpc.com`
- `https://mainnet.base.org`
- `https://base-mainnet.public.blastapi.io`
- `https://base-mainnet.g.alchemy.com`

#### Tu Backend
- `https://blu-api.up.railway.app`

#### Cloudflare
- `https://challenges.cloudflare.com` - CAPTCHA Turnstile

### Directivas Implementadas

```csp
default-src 'self';
script-src 'self' https://challenges.cloudflare.com;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https://*.walletconnect.com https://*.walletconnect.org;
font-src 'self';
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'none';
child-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org;
frame-src https://auth.privy.io https://verify.walletconnect.com https://verify.walletconnect.org https://challenges.cloudflare.com;
connect-src 'self' https://auth.privy.io https://blu-api.up.railway.app wss://relay.walletconnect.com wss://relay.walletconnect.org wss://www.walletlink.org https://*.rpc.privy.systems https://explorer-api.walletconnect.com https://base.llamarpc.com https://mainnet.base.org https://base-mainnet.public.blastapi.io;
worker-src 'self' blob:;
manifest-src 'self';
```

## 🧪 Testing

### En Desarrollo

1. Abre DevTools (F12)
2. Ve a la pestaña **Console**
3. Busca errores de CSP que comiencen con:
   ```
   Refused to load ... because it violates the following Content Security Policy directive: ...
   ```

4. Si encuentras errores legítimos (no de extensiones), actualiza `src/config/csp.ts`

### Modo Report-Only

Para testing sin bloquear contenido, usa el header `Content-Security-Policy-Report-Only`:

```typescript
// En tu servidor de producción
res.setHeader('Content-Security-Policy-Report-Only', CSP_STRING);
```

Esto reportará violaciones sin bloquear.

## 🔧 Cómo Actualizar

### Agregar Nuevo Dominio

1. Abre `src/config/csp.ts`
2. Encuentra la directiva correspondiente
3. Agrega el dominio:

```typescript
'connect-src': [
  // ... dominios existentes
  'https://nuevo-dominio.com',
],
```

### Agregar Nueva Funcionalidad

Si agregas una nueva integración (ej: Telegram login):

```typescript
// Para Telegram
'frame-src': [
  // ... dominios existentes
  'https://oauth.telegram.org',
],
'script-src': [
  // ... dominios existentes
  'https://telegram.org',
],
```

## ⚠️ Notas Importantes

### `'unsafe-inline'` en `style-src`

Actualmente permitimos inline styles porque:
- Tailwind CSS genera estilos inline
- Framer Motion usa estilos inline para animaciones

**Alternativa más segura:** Usar un `nonce` o `hash` para cada style tag (más complejo).

### Web Workers y Service Workers

PWAs requieren `worker-src 'self' blob:` para:
- Service Worker de la PWA
- Workbox (caching)
- Web Workers para procesamiento

### Extensiones del Navegador

Las extensiones del navegador (ej: MetaMask, password managers) pueden generar violaciones de CSP. Esto es **normal** y esperado. Filtra estos errores en testing.

## 📚 Recursos

- [Privy CSP Guide](https://docs.privy.io/security/implementation-guide/content-security-policy)
- [MDN CSP Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [OWASP CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

## ✅ Checklist para Producción

- [ ] Probada en navegadores: Chrome, Safari, Firefox, Edge
- [ ] Probado login con email y SMS
- [ ] Probado conectar wallets (MetaMask, WalletConnect, Coinbase)
- [ ] Probadas transacciones
- [ ] Verificado que la PWA se instala correctamente
- [ ] Monitoreado por 1 semana en staging sin errores
- [ ] Configurado monitoring de violations en producción

## 🚨 Troubleshooting

### "Refused to connect to ..."

**Causa:** Falta agregar el dominio a `connect-src`.

**Solución:** Agrega el dominio en `src/config/csp.ts` bajo `connect-src`.

### "Refused to frame ..."

**Causa:** Falta agregar el dominio a `frame-src`.

**Solución:** Agrega el dominio en `src/config/csp.ts` bajo `frame-src`.

### "Refused to load script ..."

**Causa:** Script de dominio no permitido.

**Solución:** 
1. Verifica si el script es necesario
2. Si es legítimo, agrégalo a `script-src`
3. Si es de una extensión, ignóralo

---

**Última actualización:** Noviembre 2025  
**Documentación Privy:** [CSP Guide](https://docs.privy.io/security/implementation-guide/content-security-policy)
