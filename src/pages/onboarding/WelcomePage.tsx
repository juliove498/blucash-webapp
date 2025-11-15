import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAliasStore } from "@/stores/useAliasStore";

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { alias } = useAliasStore();

  // Redirigir a home si ya tiene alias
  useEffect(() => {
    if (alias) {
      window.location.href = "/app";
    }
  }, [alias, navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo/Icono */}
        <div className="flex justify-center mb-12">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#4A6FC8] to-[#3B99FC] opacity-20 blur-3xl"></div>
            </div>
            <div className="relative flex items-center justify-center h-full">
              <svg
                className="w-48 h-48"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Círculo base */}
                <circle cx="100" cy="100" r="80" fill="url(#gradient1)" />
                {/* Círculo superior */}
                <circle
                  cx="100"
                  cy="60"
                  r="30"
                  fill="url(#gradient2)"
                  opacity="0.6"
                />
                {/* Círculo inferior */}
                <circle
                  cx="100"
                  cy="110"
                  r="40"
                  fill="url(#gradient3)"
                  opacity="0.8"
                />

                <defs>
                  <linearGradient
                    id="gradient1"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" style={{ stopColor: "#4A6FC8" }} />
                    <stop offset="100%" style={{ stopColor: "#3B99FC" }} />
                  </linearGradient>
                  <linearGradient
                    id="gradient2"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" style={{ stopColor: "#A8C5FF" }} />
                    <stop offset="100%" style={{ stopColor: "#7BA7FF" }} />
                  </linearGradient>
                  <linearGradient
                    id="gradient3"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" style={{ stopColor: "#5A8FE8" }} />
                    <stop offset="100%" style={{ stopColor: "#4A7FD8" }} />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-[#12033A] text-center mb-4">
          Bienvenido
        </h1>

        {/* Descripción */}
        <div className="text-center mb-12 space-y-1">
          <p className="text-gray-600 text-lg">
            Gracias por sumarte a Blu Cash. Tu
          </p>
          <p className="text-gray-600 text-lg">
            dinero en efectivo, pero digital.
          </p>
          <p className="text-gray-600 text-lg font-medium">
            Simple... Rápido... Blu.
          </p>
        </div>

        {/* Botón */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/onboarding/create-alias")}
          className="w-full bg-[#12033A] text-white py-4 rounded-2xl font-bold text-lg"
        >
          Listo
        </motion.button>
      </div>
    </div>
  );
};

export default WelcomePage;
