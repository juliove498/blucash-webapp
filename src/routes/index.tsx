import { Routes, Route, Navigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";

// Layouts
import { AuthLayout } from "@/layouts/AuthLayout";
import { AppLayout } from "@/layouts/AppLayout";

// Pages - Auth
import { HomePage } from "@/pages/auth/HomePage";

// Pages - App
import { DashboardPage } from "@/pages/app/DashboardPage";
import { ProfilePage } from "@/pages/app/ProfilePage";
import { SendPage } from "@/pages/app/SendPage";
import { DepositPage } from "@/pages/app/DepositPage";
import { SwapPage } from "@/pages/app/SwapPage";

// Pages - Onboarding
import { WelcomePage } from "@/pages/onboarding/WelcomePage";
import { CreateAliasPage } from "@/pages/onboarding/CreateAliasPage";

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { authenticated, ready } = usePrivy();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-[580px] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
};

export const AppRoutes = () => {
  const { authenticated, ready } = usePrivy();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="w-full max-w-[580px] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth/login" element={<AuthLayout />}>
        <Route index element={<HomePage />} />
      </Route>

      {/* Root redirect based on auth status */}
      <Route
        path="/"
        element={
          authenticated ? (
            <Navigate to="/app" replace />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />

      {/* App Routes - Dashboard */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="send" element={<SendPage />} />
        <Route path="deposit" element={<DepositPage />} />
        <Route path="swap" element={<SwapPage />} />
      </Route>

      {/* Onboarding Routes */}
      <Route
        path="/onboarding/welcome"
        element={
          <ProtectedRoute>
            <WelcomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/onboarding/create-alias"
        element={
          <ProtectedRoute>
            <CreateAliasPage />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
