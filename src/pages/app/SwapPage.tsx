import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import type { Address } from "viem";
import { useGetQuote } from "@/hooks/useGetQuote";
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
  const navigate = useNavigate();
  const [amountIn, setAmountIn] = useState("");
  const [debouncedAmountIn, setDebouncedAmountIn] = useState("");
  const [isSwapDirection, setIsSwapDirection] = useState(true); // true: USDC->ARST, false: ARST->USDC

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
    const parsedAmountOut = parseFloat(quoteData.amountOut.replace(",", "."));

    if (parsedAmountIn === 0) return null;

    return (parsedAmountOut / parsedAmountIn).toFixed(4);
  }, [quoteData, debouncedAmountIn]);

  const handleSwapDirection = () => {
    setIsSwapDirection(!isSwapDirection);
    setAmountIn("");
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
              onClick={() => navigate("/dashboard")}
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
              <span className="text-gray-500 text-xs">Balance: 0.00</span>
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
                className="flex-1 bg-transparent text-2xl font-bold outline-none"
              />
              <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2">
                <img
                  src={
                    tokenIn === "USDC"
                      ? "/assets/images/usdc.png"
                      : "/assets/images/arst.webp"
                  }
                  alt={tokenIn}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-bold">{tokenIn}</span>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center -my-2 relative z-10">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleSwapDirection}
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
              <span className="text-gray-500 text-xs">Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 text-2xl font-bold">
                {isLoadingQuote && debouncedAmountIn ? (
                  <Skeleton className="h-8 w-32" />
                ) : quoteData?.amountOut ? (
                  quoteData.amountOut
                ) : (
                  "0,00"
                )}
              </div>
              <div className="bg-white rounded-full px-4 py-2 flex items-center gap-2">
                <img
                  src={
                    tokenOut === "USDC"
                      ? "/assets/images/usdc.png"
                      : "/assets/images/arst.webp"
                  }
                  alt={tokenOut}
                  className="w-6 h-6 rounded-full"
                />
                <span className="font-bold">{tokenOut}</span>
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
            onClick={() => console.log("Swap")}
            disabled={!amountIn || !quoteData}
            className={`w-full py-4 rounded-lg font-bold text-white ${
              amountIn && quoteData
                ? "bg-accent"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {!amountIn ? "Ingresa un monto" : "Confirmar Swap"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default SwapPage;
