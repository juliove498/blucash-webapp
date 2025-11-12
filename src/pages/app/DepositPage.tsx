import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import { getChainFromConfig } from "@/utils/chainResolver";
import { AVAILABLE_TOKENS } from "@/constants/tokens";

export const DepositPage = () => {
  const { t } = useTranslation();
  const { user } = usePrivy();
  const navigate = useNavigate();
  const smartAccount = user?.smartWallet;
  const chain = getChainFromConfig();
  const networkName = chain?.name;

  const handleCopyAddress = async () => {
    if (smartAccount?.address) {
      await navigator.clipboard.writeText(smartAccount.address);
      // TODO: Show toast
      console.log("Address copied!");
    }
  };

  const handleShareQR = async () => {
    // Share QR functionality
    console.log("Share QR");
  };

  const handleShareAddress = async () => {
    if (smartAccount?.address && navigator.share) {
      try {
        await navigator.share({
          title: "Mi dirección de wallet",
          text: smartAccount.address,
        });
      } catch (err) {
        console.log("Share cancelled or failed");
      }
    } else {
      handleCopyAddress();
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex justify-center">
      <div className="w-full max-w-[580px] bg-white flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 px-6 py-4 pt-safe">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/app")}
              className="w-10 h-10 flex items-center justify-center"
            >
              <svg
                className="w-6 h-6 text-gray-800"
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
            <h1 className="text-xl font-bold text-[#12033A]">
              {t("screens.deposit.title") || "Ingresar dinero"}
            </h1>
            <div className="w-10" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-6 py-6 overflow-y-auto pb-safe">
          {/* QR Code */}
          <div className="bg-white p-6 rounded-2xl mb-6 flex justify-center">
            <div className="relative">
              <QRCode
                value={smartAccount?.address || ""}
                size={280}
                level="M"
                style={{ height: "auto", maxWidth: "100%", width: "280px" }}
              />
              {/* Center logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center p-2">
                <img
                  src="/assets/images/base.png"
                  alt="Base"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-500 text-sm">Red:</p>
              <div className="flex items-center gap-2">
                <img
                  src="/assets/images/base.png"
                  alt="Base"
                  className="w-6 h-6 rounded-full object-contain"
                />
                <span className="text-gray-900 font-semibold capitalize">
                  {networkName || "Base"}
                </span>
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="mb-6">
            <p className="text-gray-500 text-sm mb-2">Tu billetera</p>
            <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
              <p className="font-mono text-sm text-gray-900 flex-1 break-all">
                {smartAccount?.address}
              </p>
              <button
                onClick={handleCopyAddress}
                className="ml-3 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
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
              </button>
            </div>
          </div>

          <hr className="border-gray-200 mb-6" />

          {/* Accepted Tokens */}
          <div className="mb-4">
            <p className="text-gray-500 text-sm mb-3">Tokens aceptados:</p>
            <div className="flex gap-2">
              {AVAILABLE_TOKENS.map((token) => {
                const tokenIcon =
                  token.symbol === "ARST"
                    ? "/assets/images/arst.webp"
                    : "/assets/images/usdc.png";

                return (
                  <div
                    key={token.address}
                    className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2"
                  >
                    <img
                      src={tokenIcon}
                      alt={token.symbol}
                      className="w-5 h-5 rounded-full object-contain"
                    />
                    <span className="text-sm font-semibold text-gray-900">
                      {token.symbol}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fee Info */}
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-500 text-sm">Comisión:</p>
            <p className="text-gray-900 font-semibold">Sin comisión</p>
          </div>

          {/* Minimum Amount */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-500 text-sm">Monto mínimo:</p>
            <p className="text-gray-900 font-semibold">1,00</p>
          </div>

          {/* Warning */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <svg
                className="w-6 h-6 text-blue-600 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-blue-800 text-sm leading-relaxed">
                Asegurate de depositar USDC/ARST desde la red{" "}
                {networkName || "Base"}. De lo contrario, perderás tus fondos.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleShareQR}
              className="py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2"
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
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              Compartir QR
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleShareAddress}
              className="py-4 bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2"
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
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
              Compartir dirección
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositPage;
