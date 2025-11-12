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
      defaultCountry: "AR",
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

