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

  const handleLogout = async () => {
    await logout();
    queryClient.removeQueries();
    navigate("/");
  };

  console.log(AVAILABLE_TOKENS);

  return (
    <div className="flex flex-col min-h-screen bg-[#F6F7FB]">
      {/* Header con background púrpura */}
      <div
        className="relative bg-cover bg-no-repeat px-12 pt-12 pb-24 mb-10"
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
              className="absolute  top-[-20px] right-[-50px] -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
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
                  className="text-[42px] tracking-tight font-bold leading-tight"
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
              className="flex-1 max-w-[240px] bg-white/95 rounded-full px-3 py-3 shadow-lg flex items-center gap-4"
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
              <span className="text-[#808080] font-semibold text-[22px] tracking-tight">
                {t("screens.dashboard.send")}
              </span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/app/deposit")}
              className="flex-1 max-w-[240px] bg-white/95 rounded-full px-3 py-3 shadow-lg flex items-center gap-4"
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
              <span className="text-[#808080] font-semibold text-[22px] tracking-tight">
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
            onClick={() => navigate("/swap")}
            className="w-full bg-gradient-to-r from-[#4A6FC8] to-[#3B99FC] rounded-[28px] p-6 shadow-lg flex items-center justify-between overflow-hidden relative"
          >
            {/* Icono izquierdo */}
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-[48px] h-[48px] rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <div className="text-left">
                <p className="text-white font-bold text-[18px] leading-tight">
                  Convertí tus USDC en ARST
                </p>
              </div>
            </div>

            {/* Icono derecho con flecha */}
            <div className="relative z-10">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>

            {/* Decoración de fondo */}
            <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-white/30" />
              <div className="absolute right-12 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-white/20" />
            </div>
          </motion.button>
        </div>

        {/* Saldo disponible */}
        <div className="px-5 mb-7">
          <h2 className="text-[#2C1B52] font-bold text-[19px] mb-4">
            {t("screens.dashboard.portfolio")}
          </h2>
          <div className="bg-white rounded-[28px] p-5 shadow-sm">
            {AVAILABLE_TOKENS.map((token, index) => (
              <div
                key={token.address}
                className={`flex justify-between items-center py-3.5 ${
                  index !== AVAILABLE_TOKENS.length - 1
                    ? "border-b border-gray-50"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-[46px] h-[46px] rounded-full bg-[#3587f5] flex items-center justify-center">
                    <img
                      src={token.icon}
                      alt={token.symbol}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <span className="font-semibold text-[17px] text-[#2C1B52]">
                    {token.symbol}
                  </span>
                </div>
                <TokenBalance
                  account={token.address as Address}
                  address={smartAccount?.address as Address}
                  displayDecimals={2}
                  className="font-bold text-[22px] text-[#2C1B52]"
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
              const isIncoming =
                item.to?.toLowerCase() === smartAccount?.address?.toLowerCase();

              return (
                <motion.button
                  key={`${item.blockHash}-${item.to}`}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedTransaction(item);
                    transactionBottomSheet.current?.present();
                  }}
                  className="w-full bg-white rounded-[22px] p-4 shadow-sm"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-[50px] h-[50px] rounded-full flex items-center justify-center shrink-0 ${
                        isIncoming ? "bg-[#3587f5]" : "bg-primary-light"
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
                      <p className="text-[#2C1B52] font-bold text-[17px] mb-1">
                        {isIncoming ? "Ingreso" : "Retiro"} {item.tokenSymbol}
                      </p>
                      <p className="text-gray-400 text-[14px] font-medium">
                        {new Date(item.timeStamp * 1000).toLocaleDateString(
                          "es-ES",
                          {
                            day: "numeric",
                            month: "long",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-[22px] font-bold ${
                          isIncoming ? "text-[#3587f5]" : "text-[#E74C4C]"
                        }`}
                      >
                        <Mask>
                          {isIncoming ? "+" : "-"}
                          {formatBalance({
                            amount: BigInt(item.value || 0),
                            tokenDecimals: item.tokenDecimal,
                          })}
                        </Mask>
                      </p>
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
