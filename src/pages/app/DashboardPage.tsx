import { useRef, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { usePrivy } from "@privy-io/react-auth";
import type { Address } from "viem";
import { motion } from "framer-motion";

import { BottomSheet, type BottomSheetRef } from "@/components/ui/BottomSheet";
import HideBalance from "@/components/HideBalance";
import Mask from "@/components/Mask";
import { Skeleton } from "@/components/ui/Skeleton";
import { queryClient } from "@/config/queryClient";
import { AVAILABLE_TOKENS } from "@/constants/tokens";
import { useCompactUI } from "@/hooks/useCompactUI";
import { useGetAlias } from "@/hooks/useGetAlias";
import useGetBalance from "@/hooks/useGetBalance";
import { useGetLastTransaction } from "@/hooks/useGetLastTransaction";
import useTokenBalanceStore from "@/stores/useTokenBalanceStore";
import { formatBalance, formatLargeNumber } from "@/utils";
import TokenBalance from "@/components/TokenBalance";
import { TransactionDetail } from "@/components/TransactionDetail";

export const DashboardPage = () => {
  const { user, logout, ready } = usePrivy();
  const navigate = useNavigate();
  const bottomSheet = useRef<BottomSheetRef>(null);
  const transactionBottomSheet = useRef<BottomSheetRef>(null);
  const smartAccount = user?.smartWallet;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const { t } = useTranslation();

  // Pull to refresh states
  const [pullDistance, setPullDistance] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log("[DashboardPage] Privy ready:", ready);
  console.log("[DashboardPage] User:", user);
  console.log("[DashboardPage] Smart account:", smartAccount);
  console.log("[DashboardPage] Smart account address:", smartAccount?.address);

  // Efecto para debuggear cuando cambia el user
  useEffect(() => {
    console.log("[DashboardPage] User changed:", {
      hasUser: !!user,
      hasSmartWallet: !!user?.smartWallet,
      address: user?.smartWallet?.address,
    });
  }, [user]);

  const { data: aliasData } = useGetAlias(smartAccount?.address);
  const isCompact = useCompactUI();

  const { tokens } = useTokenBalanceStore();
  console.log(user);

  const {
    data,
    isLoading: transactionIsLoading,
    refetch: getLastTransactions,
  } = useGetLastTransaction(smartAccount?.address as Address);

  const { data: balanceData, isLoading } = useGetBalance();

  const handleOnRefresh = async () => {
    setIsRefreshing(true);
    await getLastTransactions();
    AVAILABLE_TOKENS.forEach((token) => {
      queryClient.invalidateQueries({
        queryKey: ["balance", token.address],
      });
    });
    setIsRefreshing(false);
  };

  // Pull to refresh handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (containerRef.current?.scrollTop === 0) {
      setStartY(e.touches[0].clientY);
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - startY;

    if (distance > 0 && containerRef.current?.scrollTop === 0) {
      e.preventDefault();
      setPullDistance(Math.min(distance * 0.5, 80)); // Max 80px
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    setIsPulling(false);

    if (pullDistance > 60) {
      await handleOnRefresh();
    }

    setPullDistance(0);
  };

  const handleLogout = async () => {
    await logout();
    queryClient.removeQueries();
    navigate("/");
  };

  console.log("DATA:", data);

  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-screen bg-[#F6F7FB] overflow-y-auto"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: isPulling ? "none" : "transform 0.3s ease-out",
      }}
    >
      {/* Pull to refresh indicator */}
      {pullDistance > 0 && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center z-50"
          style={{
            height: `${pullDistance}px`,
            opacity: Math.min(pullDistance / 60, 1),
          }}
        >
          <div className="bg-white rounded-full p-2 shadow-lg">
            {isRefreshing ? (
              <svg
                className="animate-spin h-6 w-6 text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{
                  transform: `rotate(${
                    pullDistance > 60 ? 180 : pullDistance * 3
                  }deg)`,
                  transition: "transform 0.2s ease-out",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Header con background púrpura */}
      <div
        className="relative bg-cover bg-no-repeat px-12 pt-12 pb-12 mb-8"
        style={{
          backgroundImage: "url(/assets/images/header-background.webp)",
          backgroundPosition: "bottom",
          color: "#FFFFFF",
        }}
      >
        <div className="px-6 pt-4 pb-6">
          {/* Title */}
          <div className="mb-8 relative">
            <h1
              className="text-[32px] font-bold text-center leading-tight"
              style={{ color: "#FFFFFF" }}
            >
              {t("screens.dashboard.greeting", {
                name: aliasData?.alias || "Usuario",
              })}
            </h1>
            {/* Logout Button */}
            <motion.button
              onClick={handleLogout}
              className="absolute  top-[10px] right-[-50px] -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </motion.button>
          </div>

          {/* Balance Section */}
          <div className="mb-10">
            <div className="flex justify-between items-center w-full mb-0">
              <p
                className="font-medium text-[15px]"
                style={{ color: "#FFFFFF" }}
              >
                {t("screens.dashboard.balanceTotal")}
              </p>
              <HideBalance />
            </div>
            <div className="flex items-center mb-4">
              {isLoading || tokens.length !== AVAILABLE_TOKENS.length ? (
                <Skeleton className="w-[250px] h-12" />
              ) : (
                <p
                  className="text-[36px] tracking-tight font-bold leading-tight"
                  style={{ color: "#FFFFFF" }}
                >
                  $ <Mask>{balanceData?.totalBalance || "0,00"}</Mask> ARS
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 justify-center px-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/app/send")}
              className="flex-1 max-w-[240px] bg-white/95 rounded-full px-3 py-3 pr-[20px] shadow-lg flex items-center gap-4"
            >
              <div className="w-[54px] h-[54px] rounded-full bg-[#4A6FC8] flex items-center justify-center shrink-0">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="#FFFFFF"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              </div>
              <span className="text-[#808080] font-semibold text-[20px] tracking-tight">
                {t("screens.dashboard.send")}
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/app/deposit")}
              className="flex-1 max-w-[240px] bg-white/95 rounded-full px-3 pr-[20px] py-3 shadow-lg flex items-center gap-4"
            >
              <div className="w-[54px] h-[54px] rounded-full bg-[#3B99FC] flex items-center justify-center shrink-0">
                <svg
                  className="w-7 h-7"
                  fill="none"
                  stroke="#FFFFFF"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
              </div>
              <span className="text-[#808080] font-semibold text-[20px] tracking-tight">
                {t("screens.dashboard.deposit")}
              </span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-24 -mt-4">
        {/* Banner de Swap */}
        <div className="px-5 mb-6 mt-2">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/app/swap")}
            className="w-full bg-gradient-to-r from-[#5B7FCE] to-[#6B8FDE] rounded-[28px] p-5 shadow-lg flex items-center justify-between overflow-hidden relative"
          >
            {/* Contenido */}
            <div className="flex items-center gap-3 relative z-10">
              {/* Icono de swap izquierdo */}
              <div className="w-[56px] h-[56px] rounded-full bg-white flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-[#5B7FCE]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </div>

              {/* Texto */}
              <p className="text-white font-bold text-[19px] leading-tight">
                Convertí tus USDC en ARST
              </p>
            </div>

            {/* Flecha derecha */}
            <div className="relative z-10 shrink-0">
              <svg
                className="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>

            {/* Decoración de fondo - Logo USDC */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-32 h-32 opacity-[0.15]">
              <img
                src="/assets/images/usdc-logo.webp"
                alt="USDC"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Decoración de fondo - Logo ARST */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-36 h-36 opacity-[0.15]">
              <img
                src="/assets/images/arst-logo.webp"
                alt="ARST"
                className="w-full h-full object-contain"
              />
            </div>
          </motion.button>
        </div>

        {/* Saldo disponible */}
        <div className="px-5 mb-7">
          <h2 className="text-[#12033A] font-bold text-[19px] mb-4">
            Saldo disponible
          </h2>
          <div className="bg-[#E8EBF4] rounded-[28px] px-6 shadow-sm">
            {AVAILABLE_TOKENS.map((token, index) => (
              <div
                key={token.address}
                className={`flex justify-between items-center py-4 ${
                  index !== AVAILABLE_TOKENS.length - 1
                    ? "border-b border-white/50"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center">
                    <img
                      src={token.icon}
                      alt={token.symbol}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="font-semibold text-[20px] text-[#12033A]">
                    {token.symbol}
                  </span>
                </div>
                <TokenBalance
                  account={token.address as Address}
                  address={smartAccount?.address as Address}
                  displayDecimals={2}
                  className="font-bold text-[24px] text-[#12033A]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Actividad reciente */}
        <div className="px-5">
          <h2 className="text-[#2C1B52] font-bold text-[19px] mb-4">
            {t("screens.dashboard.lastTransactions")}
          </h2>

          {transactionIsLoading && (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[85px] rounded-[22px]" />
              ))}
            </div>
          )}

          {data?.length === 0 && !transactionIsLoading && (
            <div className="flex flex-col items-center justify-center py-12 gap-2">
              <svg
                className="w-12 h-12 text-gray-300"
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
              <p className="text-gray-400 text-[15px] font-medium">
                {t("screens.dashboard.noTransactions")}
              </p>
            </div>
          )}

          <div className="space-y-2.5">
            {data?.map((item: any) => {
              const isSwap = item.type === "swap";
              const isIncoming =
                !isSwap &&
                item.to?.toLowerCase() === smartAccount?.address?.toLowerCase();

              // Render para transacciones de swap
              if (isSwap) {
                return (
                  <motion.button
                    key={`${item.blockHash}-swap`}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedTransaction(item);
                      transactionBottomSheet.current?.present();
                    }}
                    className="w-full bg-white rounded-[22px] p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5 flex-1">
                        <div className="w-[60px] h-[60px] rounded-full flex items-center justify-center shrink-0 bg-[#354eab]">
                          <svg
                            className="w-6 h-6 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                            />
                          </svg>
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-[#12033A] font-bold text-[16px] mb-1 tracking-tight">
                            {item.tokenIn} → {item.tokenOut}
                          </p>
                          <p className="text-[#12033A66] text-[14px] font-medium tracking-tight">
                            {new Date(
                              Number(item.timeStamp) * 1000
                            ).toLocaleString("es-ES", {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "America/Argentina/Buenos_Aires",
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1 mr-2">
                        <p className="text-[16px] font-medium text-[#354eab] tracking-tight">
                          <Mask>
                            -
                            {formatLargeNumber(
                              formatBalance({
                                amount: BigInt(item.amountIn || 0),
                                tokenDecimals: item.tokenInDecimals,
                              })
                            )}{" "}
                            {item.tokenIn}
                          </Mask>
                        </p>
                        <p className="text-[16px] font-medium text-[#3388f3] tracking-tight">
                          <Mask>
                            +
                            {formatLargeNumber(
                              formatBalance({
                                amount: BigInt(item.amountOut || 0),
                                tokenDecimals: item.tokenOutDecimals,
                              })
                            )}{" "}
                            {item.tokenOut}
                          </Mask>
                        </p>
                      </div>
                      <svg
                        className="w-5 h-5 text-[#12033A33]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </motion.button>
                );
              }

              // Render para transacciones normales (incoming/outgoing)
              return (
                <motion.button
                  key={`${item.blockHash}-${item.to}`}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedTransaction(item);
                    transactionBottomSheet.current?.present();
                  }}
                  className="w-full bg-white rounded-[22px] p-3 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5 flex-1">
                      <div
                        className={`w-[60px] h-[60px] rounded-full flex items-center justify-center shrink-0 ${
                          isIncoming ? "bg-[#3587f5]" : "bg-[#354eab]"
                        }`}
                      >
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          {isIncoming ? (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                          ) : (
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 10l7-7m0 0l7 7m-7-7v18"
                            />
                          )}
                        </svg>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[#12033A] font-bold text-[16px] mb-1 tracking-tight">
                          {isIncoming ? "Ingreso" : "Retiro"} {item.tokenSymbol}
                        </p>
                        <p className="text-[#12033A66] text-[14px] font-medium tracking-tight">
                          {new Date(item.timeStamp * 1000).toLocaleString(
                            "es-ES",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              timeZone: "America/Argentina/Buenos_Aires",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-[16px] font-medium tracking-tight ${
                          isIncoming ? "text-[#3388f3]" : "text-[#354eab]"
                        }`}
                      >
                        <Mask>
                          {isIncoming ? "+" : "-"}
                          {formatLargeNumber(
                            formatBalance({
                              amount: BigInt(item.value || 0),
                              tokenDecimals: item.tokenDecimal,
                            })
                          )}
                        </Mask>
                      </p>
                      <svg
                        className="w-5 h-5 text-[#12033A33]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sheets */}
      <BottomSheet ref={bottomSheet}>
        <div className="p-4">
          <h3 className="text-lg font-bold mb-4">Enviar</h3>
          <p>Métodos de envío aquí</p>
        </div>
      </BottomSheet>

      <BottomSheet ref={transactionBottomSheet}>
        {selectedTransaction && (
          <TransactionDetail transaction={selectedTransaction} />
        )}
      </BottomSheet>
    </div>
  );
};

export default DashboardPage;
