import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import type { Address } from "viem";

import HideBalance from "@/components/HideBalance";
import Mask from "@/components/Mask";
import { Skeleton } from "@/components/ui/Skeleton";
import { LinkAccount } from "@/components/LinkAccount";
import { queryClient } from "@/config/queryClient";
import { AVAILABLE_TOKENS } from "@/constants/tokens";
import { useCompactUI } from "@/hooks/useCompactUI";
import { useGetAlias } from "@/hooks/useGetAlias";
import useGetBalance from "@/hooks/useGetBalance";
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
      </div>
    </div>
  );
};

export default ProfilePage;
