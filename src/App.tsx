import { PrivyProvider } from "@privy-io/react-auth";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { BrowserRouter } from "react-router-dom";

import { queryClient } from "@/config/queryClient";
import i18n from "@/config/index";
import { PRIVY_APP_ID, privyConfig } from "@/config/privy";

import { AppRoutes } from "@/routes";

import "@/styles/globals.css";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
        <SmartWalletsProvider>
          <QueryClientProvider client={queryClient}>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </QueryClientProvider>
        </SmartWalletsProvider>
      </PrivyProvider>
    </I18nextProvider>
  );
}

export default App;
