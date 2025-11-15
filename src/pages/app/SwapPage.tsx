import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { motion } from "framer-motion";
import type { Address } from "viem";
import { useGetQuote } from "@/hooks/useGetQuote";
import { useTokenInfoWithBalance } from "@/hooks/useTokenInfoWithBalance";
import { useSwapV3 } from "@/hooks/useSwapV3";
import { Skeleton } from "@/components/ui/Skeleton";

const ADDRESSES = {
  USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as Address,
  ARST: "0xE29410178928ECbF0f20203Ede333AA6058c8767" as Address,
} as const;

const DECIMALS = {
  USDC: 6,
  ARST: 18,
} as const;

const TICK_SPACING = 10;

export const SwapPage = () => {
  const { t } = useTranslation();
  const { user } = usePrivy();
  const { client } = useSmartWallets();
  const navigate = useNavigate();
  const [amountIn, setAmountIn] = useState("");
  const [debouncedAmountIn, setDebouncedAmountIn] = useState("");
  const [isSwapDirection, setIsSwapDirection] = useState(true); // true: USDC->ARST, false: ARST->USDC
  const [isSwapping, setIsSwapping] = useState(false);

  const smartWalletAddress = user?.smartWallet?.address as Address | undefined;

  // Mutation para el swap
  const swapMutation = useSwapV3({
    onSuccess: () => {
      // Limpiar el formulario
      setAmountIn("");
      setIsSwapping(false);

      // Mostrar éxito
      alert("¡Swap exitoso!");

      // Volver al dashboard
      setTimeout(() => navigate("/app"), 1500);
    },
    onError: (error: any) => {
      setIsSwapping(false);
      console.error("Error en swap:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Error al ejecutar el swap. Por favor intenta nuevamente."
      );
    },
  });

  // Obtener balances
  const { data: usdcBalance } = useTokenInfoWithBalance(
    smartWalletAddress,
    ADDRESSES.USDC
  );
  const { data: arstBalance } = useTokenInfoWithBalance(
    smartWalletAddress,
    ADDRESSES.ARST
  );

  // Debounce de 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedAmountIn(amountIn);
    }, 400);

    return () => clearTimeout(timer);
  }, [amountIn]);

  // Quote para el monto ingresado
  const quoteParams = useMemo(() => {
    if (!debouncedAmountIn) {
      return null;
    }
    const normalizedAmount = debouncedAmountIn
      .replace(/\./g, "")
      .replace(",", ".");
    const parsedAmount = parseFloat(normalizedAmount);

    if (!parsedAmount || parsedAmount <= 0) {
      return null;
    }

    return {
      tokenIn: isSwapDirection ? ADDRESSES.USDC : ADDRESSES.ARST,
      tokenOut: isSwapDirection ? ADDRESSES.ARST : ADDRESSES.USDC,
      amountIn: normalizedAmount,
      decimalsIn: isSwapDirection ? DECIMALS.USDC : DECIMALS.ARST,
      tickSpacing: TICK_SPACING,
    };
  }, [debouncedAmountIn, isSwapDirection]);

  const { data: quoteData, isLoading: isLoadingQuote } =
    useGetQuote(quoteParams);

  // Calcular el exchange rate
  const exchangeRate = useMemo(() => {
    if (!quoteData?.amountOut || !debouncedAmountIn) return null;

    const normalizedAmount = debouncedAmountIn
      .replace(/\./g, "")
      .replace(",", ".");
    const parsedAmountIn = parseFloat(normalizedAmount);

    // Convertir amountOut de wei a número
    const decimalsOut = isSwapDirection ? DECIMALS.ARST : DECIMALS.USDC;
    const parsedAmountOut =
      Number(quoteData.amountOut) / Math.pow(10, decimalsOut);

    if (parsedAmountIn === 0) return null;

    return (parsedAmountOut / parsedAmountIn).toFixed(4);
  }, [quoteData, debouncedAmountIn, isSwapDirection]);

  const handleSwapDirection = () => {
    setIsSwapDirection(!isSwapDirection);
    setAmountIn("");
  };

  // Formatear balance a 2 decimales
  const formatBalance = (
    balance: bigint | undefined,
    decimals: number | undefined
  ) => {
    if (!balance || !decimals) return "0.00";
    const formattedBalance = Number(balance) / Math.pow(10, decimals);
    return formattedBalance.toFixed(2);
  };

  // Formatear quote amount (viene como string en wei)
  const formatQuoteAmount = (amountOut: string | undefined) => {
    if (!amountOut) return "0,00";
    const decimalsOut = isSwapDirection ? DECIMALS.ARST : DECIMALS.USDC;
    const formattedAmount = Number(amountOut) / Math.pow(10, decimalsOut);
    return formattedAmount.toFixed(2).replace(".", ",");
  };

  // Manejar el swap
  const handleSwap = async () => {
    if (
      !smartWalletAddress ||
      !amountIn ||
      parseFloat(amountIn.replace(/\./g, "").replace(",", ".")) <= 0
    ) {
      alert(t("send.errors.required"));
      return;
    }

    if (!quoteData?.amountOut) {
      alert("No hay cotización disponible");
      return;
    }

    if (!client) {
      alert("Smart Wallet client no disponible");
      return;
    }

    setIsSwapping(true);

    // Calcular amountOutMinimum (con 0.1% de slippage)
    const amountOutBigInt = BigInt(quoteData.amountOut);
    const amountOutMinimum = (amountOutBigInt * 999n) / 1000n; // 0.1% slippage

    const tokenInAddress = isSwapDirection ? ADDRESSES.USDC : ADDRESSES.ARST;
    const tokenOutAddress = isSwapDirection ? ADDRESSES.ARST : ADDRESSES.USDC;

    // Convertir el amountIn a formato numérico válido (sin separadores)
    // Puede venir como "12,09" o "1.234,56"
    // Necesitamos convertir a "12.09" o "1234.56"
    let cleanAmount = amountIn;

    // Si contiene coma, es el separador decimal
    if (cleanAmount.includes(",")) {
      // Remover los puntos (separadores de miles) y convertir coma a punto
      cleanAmount = cleanAmount.replace(/\./g, "").replace(",", ".");
    }

    // Usar el client de Privy que maneja automáticamente el paymaster
    const walletClient = {
      sendTransaction: async (params: { to: string; data: string }) => {
        const txHash = await client.sendTransaction({
          to: params.to as Address,
          data: params.data as `0x${string}`,
        });
        return txHash;
      },
    };

    swapMutation.mutate({
      walletClient,
      recipient: smartWalletAddress,
      tokenIn: tokenInAddress,
      tokenOut: tokenOutAddress,
      amountIn: cleanAmount,
      amountOutMinimum,
      amountOut: formatQuoteAmount(quoteData.amountOut),
      sqrtPriceLimitX96: 0n,
    });
  };

  const tokenIn = isSwapDirection ? "USDC" : "ARST";
  const tokenOut = isSwapDirection ? "ARST" : "USDC";

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex justify-center">
      <div className="w-full max-w-[580px] bg-white flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 pt-safe">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/app")}
              className="w-10 h-10 flex items-center justify-center"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-[#12033A]">Swap</h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-8">
          {/* Token In */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Envías</span>
              <span className="text-gray-500 text-xs">
                Balance:{" "}
                {formatBalance(
                  isSwapDirection ? usdcBalance?.balance : arstBalance?.balance,
                  isSwapDirection
                    ? usdcBalance?.decimals
                    : arstBalance?.decimals
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={amountIn}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9,]/g, "");
                  setAmountIn(value);
                }}
                placeholder="0,00"
                className="flex-1 bg-transparent text-2xl font-bold outline-none min-w-0"
              />
              <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shrink-0">
                <img
                  src={
                    tokenIn === "USDC"
                      ? "/assets/images/usdc.png"
                      : "/assets/images/arst.webp"
                  }
                  alt={tokenIn}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-bold text-sm whitespace-nowrap">
                  {tokenIn}
                </span>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => null}
              className="w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </motion.button>
          </div>

          {/* Token Out */}
          <div className="bg-gray-50 rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 text-sm">Recibes</span>
              <span className="text-gray-500 text-xs">
                Balance:{" "}
                {formatBalance(
                  isSwapDirection ? arstBalance?.balance : usdcBalance?.balance,
                  isSwapDirection
                    ? arstBalance?.decimals
                    : usdcBalance?.decimals
                )}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-2xl font-bold min-w-0">
                {isLoadingQuote && debouncedAmountIn ? (
                  <Skeleton className="h-8 w-32" />
                ) : quoteData?.amountOut ? (
                  formatQuoteAmount(quoteData.amountOut)
                ) : (
                  "0,00"
                )}
              </div>
              <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2 shrink-0">
                <img
                  src={
                    tokenOut === "USDC"
                      ? "/assets/images/usdc.png"
                      : "/assets/images/arst.webp"
                  }
                  alt={tokenOut}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-bold text-sm whitespace-nowrap">
                  {tokenOut}
                </span>
              </div>
            </div>
          </div>

          {/* Exchange Rate */}
          {exchangeRate && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Tasa de cambio</span>
                <span className="font-bold text-sm">
                  1 {tokenIn} = {exchangeRate} {tokenOut}
                </span>
              </div>
            </div>
          )}

          {/* Swap Button */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSwap}
            disabled={!amountIn || !quoteData || isSwapping}
            className={`w-full py-4 rounded-lg font-bold text-white ${
              amountIn && quoteData && !isSwapping
                ? "bg-accent"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {isSwapping
              ? "Procesando..."
              : !amountIn
              ? "Ingresa un monto"
              : "Confirmar Swap"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;
