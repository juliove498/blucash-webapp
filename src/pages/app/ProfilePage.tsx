import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import type { Address } from "viem";

import HideBalance from "@/components/HideBalance";
import Mask from "@/components/Mask";
import { Skeleton } from "@/components/ui/Skeleton";
import { LinkAccount } from "@/components/LinkAccount";
import { BottomSheet, type BottomSheetRef } from "@/components/ui/BottomSheet";
import { queryClient } from "@/config/queryClient";
import { AVAILABLE_TOKENS } from "@/constants/tokens";
import { useCompactUI } from "@/hooks/useCompactUI";
import { useGetAlias } from "@/hooks/useGetAlias";
import useGetBalance from "@/hooks/useGetBalance";
import { useRedeemArst } from "@/hooks/useRedeemArst";
import { useRedeemStatus } from "@/hooks/useRedeemStatus";
import { useAliasStore } from "@/stores/useAliasStore";
import { useSmartWalletKeyStore } from "@/stores/useSmartWalletKey";
import useTokenBalanceStore from "@/stores/useTokenBalanceStore";

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { logout, user } = usePrivy();
  const { alias = "", clearAlias } = useAliasStore();
  const { clearTokenBalance, tokens } = useTokenBalanceStore();
  const smartAccount = user?.smartWallet;
  const { t } = useTranslation();
  const { data: balanceData, isLoading } = useGetBalance();
  const { incrementKey } = useSmartWalletKeyStore();
  const isCompact = useCompactUI();
  const [isLoadingTerms, setIsLoadingTerms] = useState(false);
  const [isLoadingPrivacy, setIsLoadingPrivacy] = useState(false);
  const { data: aliasData } = useGetAlias(smartAccount?.address as Address);
  const redeemMutation = useRedeemArst();
  const { data: redeemStatusData } = useRedeemStatus(smartAccount?.address);
  const redeemBottomSheetRef = useRef<BottomSheetRef>(null);
  const [redeemStatus, setRedeemStatus] = useState<"success" | "error" | null>(
    null
  );

  const handleRedeemArst = async () => {
    if (!smartAccount?.address || !alias) return;

    try {
      const result = await redeemMutation.mutateAsync({
        alias,
        wallet_address: smartAccount.address,
        email: user?.email?.address,
        phone_number: user?.phone?.number,
      });

      if (result.success) {
        setRedeemStatus("success");
        redeemBottomSheetRef.current?.present();
        // Refrescar el estado del redeem
        queryClient.invalidateQueries({
          queryKey: ["redeemStatus", smartAccount.address],
        });
      }
    } catch (error) {
      setRedeemStatus("error");
      redeemBottomSheetRef.current?.present();
      console.error("Error al enviar solicitud de redención:", error);
    }
  };

  const handleCopyAddress = async () => {
    if (smartAccount?.address) {
      await navigator.clipboard.writeText(smartAccount.address);
      // TODO: Toast notification
      console.log("Address copied!");
    }
  };

  const handleCopyAlias = async () => {
    if (alias) {
      await navigator.clipboard.writeText(alias);
      // TODO: Toast notification
      console.log("Alias copied!");
    }
  };

  const handleShareAddress = async () => {
    if (smartAccount?.address && navigator.share) {
      try {
        await navigator.share({
          title: "Mi dirección de wallet",
          text: t("profile.shareAddress", { address: smartAccount.address }),
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleShareAlias = async () => {
    if (alias && navigator.share) {
      try {
        await navigator.share({
          title: "Mi alias",
          text: t("profile.shareAlias", { alias }),
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleLogout = async () => {
    clearAlias();
    incrementKey();
    await logout();
    clearTokenBalance();
    queryClient.removeQueries();
    navigate("/");
  };

  const handleOpenTerms = () => {
    if (isLoadingTerms) return;
    setIsLoadingTerms(true);
    window.open("https://blucash.xyz/terminos-condiciones", "_blank");
    setTimeout(() => setIsLoadingTerms(false), 1000);
  };

  const handleOpenPrivacy = () => {
    if (isLoadingPrivacy) return;
    setIsLoadingPrivacy(true);
    window.open("https://blucash.xyz/politica-privacidad", "_blank");
    setTimeout(() => setIsLoadingPrivacy(false), 1000);
  };

  return (
    <div className="flex-1 bg-white overflow-y-auto mb-12">
      {/* Header con background */}
      {/* <div
        className="bg-cover bg-center"
        style={{
          backgroundImage: "url(/assets/images/header-background.webp)",
        }}
      >
        <div className={`px-5 ${isCompact ? "py-10" : "py-10"}`}>
          <div className="flex flex-col items-center gap-5">
            <h1
              className={`${
                isCompact ? "text-2xl" : "text-2xl"
              } font-bold text-white text-center tracking-tight`}
            >
              {alias}
            </h1>

            {/* Balance Section */}
      {/*<div className="w-full">
              <div className="flex justify-center items-center mb-2">
                <HideBalance />
              </div>
              <div className="flex justify-center items-center">
                {isLoading || tokens.length !== AVAILABLE_TOKENS.length ? (
                  <Skeleton className="w-[250px] h-12" />
                ) : (
                  <p
                    className={`${
                      isCompact ? "text-3xl" : "text-4xl"
                    } tracking-tight text-white font-bold`}
                  >
                    $ <Mask>{balanceData?.totalBalance || "0,00"}</Mask> ARS
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* Content */}
      <div className="px-5 py-16 -mt-8 bg-white rounded-t-[40px]">
        {/* Network and Alias */}
        <h2 className="text-[#12033A] font-bold text-xl mb-5 pt-2.5">
          {t("profile.networkAndAlias")}
        </h2>

        <div className="bg-[#F1F3FA] rounded-[40px] p-6 mb-5">
          {/* Alias Section */}
          <div className="mb-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[#191C32] font-bold text-base flex-1">
                {t("profile.userAlias")}
              </p>
              <div className="bg-[#DFD4F9] px-4 py-1.5 rounded-lg">
                <span className="text-accent text-[10px] font-semibold tracking-wider">
                  {t("profile.primary")}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 bg-white rounded-2xl border border-[#E3F2FD] px-4 py-2.5">
              <div className="flex-1">
                <p className="text-[#12033A] text-lg font-medium mb-0.5">
                  {alias || t("profile.noAlias")}
                </p>
                <p className="text-[#12033A66] text-xs font-medium">
                  {t("profile.aliasSubtext")}
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopyAlias}
                  disabled={!alias}
                  className={alias ? "opacity-100" : "opacity-30"}
                >
                  <svg
                    className="w-6 h-6 text-[#12033ACC]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShareAlias}
                  disabled={!alias}
                  className={alias ? "opacity-100" : "opacity-30"}
                >
                  <svg
                    className="w-6 h-6 text-[#12033ACC]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Email Section */}
          {user?.email && (
            <div className="mb-5">
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-[#E3F2FD] px-5 py-4">
                <div className="w-12 h-12 rounded-xl bg-[#3587f5] flex items-center justify-center shrink-0">
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
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[#12033A] text-sm font-bold mb-1">Email</p>
                  <p className="text-[#12033A99] text-base font-medium">
                    {user.email.address}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#3587f5] flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Phone Section */}
          {user?.phone && (
            <div className="mb-5">
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-[#E3F2FD] px-5 py-4">
                <div className="w-12 h-12 rounded-xl bg-[#3587f5] flex items-center justify-center shrink-0">
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
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-[#12033A] text-sm font-bold mb-1">
                    Teléfono
                  </p>
                  <p className="text-[#12033A99] text-base font-medium">
                    {user.phone.number}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#3587f5] flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* Address Section */}
          <div>
            <p className="text-[#191C32] font-bold text-base mb-2">
              {t("profile.walletAddress")}
            </p>
            <div className="flex items-center justify-between gap-2 bg-white rounded-2xl px-4 py-2.5">
              <p className="flex-1 text-[#12033A66] text-xs font-medium break-all">
                {smartAccount?.address}
              </p>
              <div className="flex items-center gap-2.5">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCopyAddress}
                >
                  <svg
                    className="w-6 h-6 text-[#12033ACC]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleShareAddress}
                >
                  <svg
                    className="w-6 h-6 text-[#12033ACC]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Link Accounts */}
        <LinkAccount />

        {/* DevConnect ARG Banner */}
        <div className="mb-6 bg-gradient-to-br from-[#E8EBF4] to-[#D8DBE8] rounded-3xl p-6 relative overflow-hidden">
          <div className="relative z-10">
            {redeemStatusData?.data.status === "completed" ? (
              // Completed state - Ya recibió los ARST
              <>
                <h3 className="text-[#12033A] text-xl font-bold mb-2">
                  ¡Ahora sí! 🎉
                </h3>
                <p className="text-[#12033A] text-base leading-relaxed">
                  Acercate al food truck y reclamá tu sándwich con tus ARST
                </p>
              </>
            ) : redeemStatusData?.data.status === "pending" ? (
              // Pending state - Ya solicitó pero no recibió
              <>
                <h3 className="text-[#12033A] text-xl font-bold mb-2">
                  ¡Solicitud enviada!
                </h3>
                <p className="text-[#12033A] text-base mb-3 leading-relaxed">
                  Acercate a nuestro stand en Devconnect ARG para recibir tus
                  ARST
                </p>
                <div className="flex items-center gap-2 text-[#0F2854] text-sm font-medium">
                  <svg
                    className="w-5 h-5 animate-spin"
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
                  <span>Pendiente de validación en el stand</span>
                </div>
              </>
            ) : (
              // Not found state - Nunca solicitó
              <>
                <h3 className="text-[#12033A] text-xl font-bold mb-2">
                  ¿Estás en Devconnect ARG?
                </h3>
                <p className="text-[#12033A] text-base mb-4 leading-relaxed">
                  Reclamá tus ARST y arrimate a nuestro stand que te invitamos
                  un café y nos conocemos
                </p>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleRedeemArst}
                  disabled={redeemMutation.isPending}
                  className="bg-[#0F2854] text-white rounded-full px-6 py-3 font-semibold flex items-center gap-3 shadow-lg hover:bg-[#1a3d72] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z" />
                    </svg>
                  </div>
                  <span>
                    {redeemMutation.isPending
                      ? "Enviando..."
                      : "Quiero mis ARST"}
                  </span>
                </motion.button>
              </>
            )}
          </div>
          {/* Decorative icon */}
          <div className="absolute -right-4 -top-4 w-32 h-32 opacity-10">
            <img
              src="/assets/images/arst.webp"
              alt=""
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-2.5">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => alias && navigate("/profile/edit")}
          className="w-full flex items-center justify-between bg-white border-b border-[#12033A1A] p-4"
        >
          <div className="flex items-center gap-4">
            <svg
              className="w-6 h-6 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-[#12033A] font-bold text-base">
              {t("profile.editProfile")}
            </span>
          </div>
          <svg
            className="w-5 h-5 text-[#12033A66]"
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
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/profile/security")}
          className="w-full flex items-center justify-between bg-white border-b border-[#12033A1A] p-4"
        >
          <div className="flex items-center gap-4">
            <svg
              className="w-6 h-6 text-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span className="text-[#12033A] font-bold text-base">
              {t("profile.security")}
            </span>
          </div>
          <svg
            className="w-5 h-5 text-[#12033A66]"
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
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenTerms}
          disabled={isLoadingTerms}
          className={`w-full flex items-center justify-between bg-white border-b border-[#12033A1A] p-4 ${
            isLoadingTerms ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-center gap-4">
            <svg
              className={`w-6 h-6 ${
                isLoadingTerms ? "text-accent/60" : "text-accent"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span
              className={`font-bold text-base ${
                isLoadingTerms ? "text-[#12033A66]" : "text-[#12033A]"
              }`}
            >
              {t("profile.termsAndConditions")}
            </span>
          </div>
          <svg
            className={`w-5 h-5 ${
              isLoadingTerms ? "text-[#12033A33]" : "text-[#12033A66]"
            }`}
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
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenPrivacy}
          disabled={isLoadingPrivacy}
          className={`w-full flex items-center justify-between bg-white border-b border-[#12033A1A] p-4 ${
            isLoadingPrivacy ? "opacity-60" : ""
          }`}
        >
          <div className="flex items-center gap-4">
            <svg
              className={`w-6 h-6 ${
                isLoadingPrivacy ? "text-accent/60" : "text-accent"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span
              className={`font-bold text-base ${
                isLoadingPrivacy ? "text-[#12033A66]" : "text-[#12033A]"
              }`}
            >
              {t("profile.privacyPolicy")}
            </span>
          </div>
          <svg
            className={`w-5 h-5 ${
              isLoadingPrivacy ? "text-[#12033A33]" : "text-[#12033A66]"
            }`}
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
        </motion.button>
      </div>

      {/* Logout */}
      <div className="px-5 mt-8 mb-8">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 bg-[#12033A] text-white rounded-[20px] h-[58px] font-bold text-base"
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
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          {t("profile.logout")}
        </motion.button>
      </div>

      {/* Redeem Result BottomSheet */}
      <BottomSheet ref={redeemBottomSheetRef}>
        <div className="py-6">
          {redeemStatus === "success" ? (
            // Success Message
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#12033A] mb-3">
                ¡Excelente!
              </h3>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                Acercate al stand y mostrá tu alias para recibir tus ARST
              </p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => redeemBottomSheetRef.current?.dismiss()}
                className="w-full bg-[#2952E8] text-white rounded-2xl py-4 font-semibold"
              >
                Entendido
              </motion.button>
            </div>
          ) : (
            // Error Message
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-[#12033A] mb-3">
                Oops, algo salió mal
              </h3>
              <p className="text-gray-600 text-base leading-relaxed mb-6">
                Recordá que solo podes reclamar una vez tus ARST en Devconnect.
              </p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => redeemBottomSheetRef.current?.dismiss()}
                className="w-full bg-[#2952E8] text-white rounded-2xl py-4 font-semibold"
              >
                Entendido
              </motion.button>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};

export default ProfilePage;
