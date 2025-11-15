import type { PrivyClientConfig } from '@privy-io/react-auth';
import { getChainFromConfig } from '@/utils/chainResolver';

const chain = getChainFromConfig();

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: 'light',
    accentColor: '#0047FF',
    logo: '/assets/images/adaptive-icon.png',
    landingHeader: 'Bienvenido a Blu Cash',
    loginMessage: 'Inicia sesión o regístrate',
  },
  intl: {
    defaultCountry: 'AR',
    textLocalization: {
      // Botones de login methods
      'continue-with-email': 'Continuar con Email',
      'continue-with-sms': 'Continuar con SMS',
      'continue-with-phone': 'Continuar con teléfono',
      
      // Placeholders
      'phone-number-placeholder': 'Número de teléfono',
      'email-placeholder': 'tu@email.com',
      'enter-code-placeholder': 'Ingresa el código',
      
      // Títulos y mensajes
      'check-your-email': 'Revisa tu correo',
      'check-your-phone': 'Revisa tu teléfono',
      'enter-verification-code': 'Ingresa el código de verificación',
      'verification-code-sent': 'Te enviamos un código',
      
      // Botones generales
      'continue': 'Continuar',
      'back': 'Volver',
      'cancel': 'Cancelar',
      'submit': 'Enviar',
      'done': 'Listo',
      'resend-code': 'Reenviar código',
      
      // Recent
      'recent': 'Recientes',
      
      // Términos
      'by-logging-in-you-agree': 'Al iniciar sesión aceptas los',
      'terms': 'Términos',
      'and': 'y',
      'privacy-policy': 'Política de Privacidad',
      'protected-by': 'Protegido por',
      
      // Errores
      'invalid-code': 'Código inválido',
      'code-expired': 'El código ha expirado',
      'error-generic': 'Algo salió mal. Intenta nuevamente.',
      'error-network': 'Error de conexión',
    } as any,
  },
  loginMethods: ['email', 'sms'],
  supportedChains: [chain],
  // @ts-ignore - smsAuth is a valid config option
  smsAuth: {
    countries: ['AR'],
  },
  whatsappAuth: {
    countries: ['AR'],
  },
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'all-users',
    },
  },
};

// Variables de entorno
export const PRIVY_APP_ID = import.meta.env.VITE_PRIVY_APP_ID || '';
export const PRIVY_CLIENT_ID = import.meta.env.VITE_PRIVY_CLIENT_ID || '';

