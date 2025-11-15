import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePrivy } from "@privy-io/react-auth";
import { useCreateAlias } from "@/hooks/useCreateAlias";
import { useDebounce } from "use-debounce";
import { Spinner } from "@/components/ui/Spinner";
import { useAliasStore } from "@/stores/useAliasStore";

export const CreateAliasPage = () => {
  const navigate = useNavigate();
  const { getAccessToken } = usePrivy();
  const { alias: existingAlias } = useAliasStore();
  const [alias, setAlias] = useState("");
  const [debouncedAlias] = useDebounce(alias, 500);
  const [isCheckingAlias, setIsCheckingAlias] = useState(false);
  const [aliasError, setAliasError] = useState("");
  const [aliasAvailable, setAliasAvailable] = useState(false);

  const { mutate: createAlias, isPending } = useCreateAlias();

  // Redirigir a home si ya tiene alias
  useEffect(() => {
    if (existingAlias) {
      navigate("/app", { replace: true });
    }
  }, [existingAlias, navigate]);

  // Validar formato del alias
  const isValidFormat = (value: string) => {
    // Solo letras, números y punto. Entre 4 y 20 caracteres
    const regex = /^[a-z0-9.]{4,20}$/;
    return regex.test(value);
  };

  // Verificar disponibilidad del alias
  useEffect(() => {
    const checkAlias = async () => {
      if (!debouncedAlias) {
        setAliasError("");
        setAliasAvailable(false);
        return;
      }

      if (!isValidFormat(debouncedAlias)) {
        setAliasError("Entre 4 y 20 caracteres. Solo letras, números y punto.");
        setAliasAvailable(false);
        return;
      }

      setIsCheckingAlias(true);
      try {
        const token = await getAccessToken();
        if (!token) {
          setAliasError("Error de autenticación");
          setAliasAvailable(false);
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/alias/${debouncedAlias}.blu`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();
        if (response.ok && data.alias !== null) {
          setAliasError("El alias ya está en uso");
          setAliasAvailable(false);
        } else {
          setAliasError("");
          setAliasAvailable(true);
        }
      } catch (error) {
        setAliasError("");
        setAliasAvailable(true);
      } finally {
        setIsCheckingAlias(false);
      }
    };

    checkAlias();
  }, [debouncedAlias, getAccessToken]);

  const handleCreateAlias = () => {
    if (aliasAvailable && alias) {
      createAlias({ alias: alias + ".blu" });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Logo/Icono */}
        <div className="flex justify-center mb-8">
          <div className="relative w-40 h-40">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#4A6FC8] to-[#3B99FC] opacity-20 blur-2xl"></div>
            </div>
            <div className="relative flex items-center justify-center h-full">
              <svg
                className="w-32 h-32"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="100" cy="100" r="80" fill="url(#gradient1)" />
                <circle
                  cx="100"
                  cy="60"
                  r="30"
                  fill="url(#gradient2)"
                  opacity="0.6"
                />
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
        <h1 className="text-3xl font-bold text-[#12033A] text-center mb-3">
          Creá tu alias
        </h1>

        {/* Descripción */}
        <p className="text-gray-600 text-center mb-10 px-4">
          Tu alias es único y sirve para que te envíen dinero de forma rápida y
          segura
        </p>

        {/* Input de alias */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value.toLowerCase())}
              placeholder="juan.perez"
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-accent pr-24"
            />
            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 text-lg">
              .blu
            </span>
          </div>

          {/* Mensajes de estado */}
          <div className="mt-3 px-2 min-h-[24px]">
            {isCheckingAlias ? (
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <Spinner />
                <span>Verificando disponibilidad...</span>
              </div>
            ) : aliasAvailable ? (
              <p className="text-green-600 text-sm font-medium">
                Este alias está disponible
              </p>
            ) : aliasError ? (
              <p className="text-red-500 text-sm font-medium">{aliasError}</p>
            ) : alias ? (
              <p className="text-blue-600 text-sm">
                Entre 4 y 20 caracteres. Solo letras, números y punto.
              </p>
            ) : (
              <p className="text-blue-600 text-sm">
                Entre 4 y 20 caracteres. Solo letras, números y punto.
              </p>
            )}
          </div>
        </div>

        {/* Botón */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleCreateAlias}
          disabled={!aliasAvailable || isPending}
          className={`w-full py-4 rounded-2xl font-bold text-lg text-white ${
            aliasAvailable && !isPending
              ? "bg-[#3587f5]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
        >
          {isPending ? (
            <div className="flex items-center justify-center gap-2">
              <Spinner />
              <span>Creando alias...</span>
            </div>
          ) : (
            "Crear Alias"
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default CreateAliasPage;
