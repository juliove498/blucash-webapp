// CSP Configuration para Privy
// Documentación: https://docs.privy.io/security/implementation-guide/content-security-policy

export const CSP_CONFIG = {
  // Dominios base
  'default-src': ["'self'"],
  
  // Scripts - solo de origen propio y Cloudflare Turnstile
  'script-src': [
    "'self'",
    'https://challenges.cloudflare.com',
  ],
  
  // Estilos - permite inline styles (necesario para styled-components/tailwind)
  'style-src': [
    "'self'",
    "'unsafe-inline'",
  ],
  
  // Imágenes - origen propio, data URIs, blobs y WalletConnect
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https://*.walletconnect.com',
    'https://*.walletconnect.org',
  ],
  
  // Fuentes
  'font-src': ["'self'"],
  
  // Sin objetos embebidos
  'object-src': ["'none'"],
  
  // Base URI
  'base-uri': ["'self'"],
  
  // Acciones de formularios
  'form-action': ["'self'"],
  
  // Prevenir clickjacking
  'frame-ancestors': ["'none'"],
  
  // IFrames hijos (Privy modal, WalletConnect)
  'child-src': [
    'https://auth.privy.io',
    'https://verify.walletconnect.com',
    'https://verify.walletconnect.org',
  ],
  
  // IFrames (Privy, WalletConnect, Cloudflare)
  'frame-src': [
    'https://auth.privy.io',
    'https://verify.walletconnect.com',
    'https://verify.walletconnect.org',
    'https://challenges.cloudflare.com',
  ],
  
  // Conexiones (APIs y WebSockets)
  'connect-src': [
    "'self'",
    // Privy
    'https://auth.privy.io',
    'https://*.rpc.privy.systems',
    // Tu API
    'https://blu-api.up.railway.app',
    // WalletConnect
    'wss://relay.walletconnect.com',
    'wss://relay.walletconnect.org',
    'https://explorer-api.walletconnect.com',
    // Coinbase Wallet
    'wss://www.walletlink.org',
    // Base Network RPCs
    'https://base.llamarpc.com',
    'https://mainnet.base.org',
    'https://base-mainnet.public.blastapi.io',
    'https://base-mainnet.g.alchemy.com',
  ],
  
  // Web Workers (necesario para PWA y Service Workers)
  'worker-src': [
    "'self'",
    'blob:',
  ],
  
  // Manifest de PWA
  'manifest-src': ["'self'"],
};

// Convertir config a string CSP
export function generateCSPString(config = CSP_CONFIG): string {
  return Object.entries(config)
    .map(([directive, values]) => `${directive} ${values.join(' ')}`)
    .join('; ');
}

// CSP en modo Report-Only para testing
export function generateCSPReportOnlyString(config = CSP_CONFIG): string {
  const csp = generateCSPString(config);
  return csp + '; report-uri /api/csp-report';
}
