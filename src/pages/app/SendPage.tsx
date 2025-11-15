import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { motion } from "framer-motion";
import type { Address } from "viem";
import { encodeFunctionData, erc20Abi, parseUnits } from "viem";
import { AVAILABLE_TOKENS } from "@/constants/tokens";
import { QRScanner } from "@/components/QRScanner";
import { useGetAddressByAlias } from "@/hooks/useGetAddressByAlias";
import { Spinner } from "@/components/ui/Spinner";
import { useNavigate as useRouterNavigate } from "react-router-dom";
import { useTokenInfoWithBalance } from "@/hooks/useTokenInfoWithBalance";
import { formatBalance } from "@/utils";

const STEPS = {
  address: { nextStep: "amount", name: "address", number: 1 },
  amount: { nextStep: "summary", name: "amount", number: 2 },
  summary: { nextStep: "feedback", name: "summary", number: 3 },
};

type SendFormData = {
  to: string;
  amount: string;
  token: (typeof AVAILABLE_TOKENS)[number];
  currentStep: keyof typeof STEPS;
};

export const SendPage = () => {
  const navigate = useRouterNavigate();
  const { t } = useTranslation();
  const { user } = usePrivy();
  const { client } = useSmartWallets();
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [resolvedAddress, setResolvedAddress] = useState<string>("");
  const [isSending, setIsSending] = useState(false);
  const smartAccount = user?.smartWallet;

  const methods = useForm<SendFormData>({
    mode: "onChange",
    defaultValues: {
      to: "",
      amount: "",
      token: AVAILABLE_TOKENS[0],
      currentStep: "address",
    },
  });

  const { watch, setValue } = methods;
  const currentStep = watch("currentStep");
  const to = watch("to");
  const amount = watch("amount");
  const selectedToken = watch("token");

  // Get balances for both tokens
  const { data: arstBalance } = useTokenInfoWithBalance(
    smartAccount?.address as Address,
    AVAILABLE_TOKENS[0].address as Address
  );
  const { data: usdcBalance } = useTokenInfoWithBalance(
    smartAccount?.address as Address,
    AVAILABLE_TOKENS[1].address as Address
  );

  // Get current token balance
  const currentTokenBalance =
    selectedToken.symbol === "ARST" ? arstBalance : usdcBalance;

  // Validate amount against balance
  const isAmountValid = () => {
    if (!amount || !currentTokenBalance) return false;

    try {
      // Convert user input to wei/smallest unit using parseUnits
      const amountInWei = parseUnits(
        amount.replace(",", "."),
        selectedToken.decimals
      );

      // Compare with balance (both are now in wei/smallest unit)
      return amountInWei > 0n && amountInWei <= currentTokenBalance.balance;
    } catch {
      return false;
    }
  };

  // Check if input needs resolution (alias, email, or phone)
  // If it starts with 0x, it's a direct address
  const isDirectAddress = to.startsWith("0x") && to.length === 42;
  const needsResolution = !isDirectAddress && to.length > 0;

  // Query the API to resolve alias, email, or phone
  const {
    data: aliasData,
    isLoading: isLoadingAlias,
    error: aliasError,
  } = useGetAddressByAlias(needsResolution ? to : undefined);

  // Determine what type of input it is
  const inputType = to.endsWith(".blu")
    ? "alias"
    : to.includes("@")
    ? "email"
    : /^\+?[\d\s-()]+$/.test(to)
    ? "phone"
    : isDirectAddress
    ? "address"
    : "unknown";

  // Update resolved address when data changes
  useEffect(() => {
    if (aliasData?.smartWallet?.address) {
      setResolvedAddress(aliasData.smartWallet.address);
    } else if (isDirectAddress) {
      setResolvedAddress(to);
    } else {
      setResolvedAddress("");
    }
  }, [aliasData, to, isDirectAddress]);

  const handleClose = () => {
    navigate("/app");
  };

  const handleNext = () => {
    const step = STEPS[currentStep];
    if (step.nextStep) {
      setValue("currentStep", step.nextStep as keyof typeof STEPS);
    }
  };

  const handleBack = () => {
    if (currentStep === "address") {
      handleClose();
    } else if (currentStep === "amount") {
      setValue("currentStep", "address");
    } else if (currentStep === "summary") {
      setValue("currentStep", "amount");
    }
  };

  const handleQRScan = (decodedText: string) => {
    const formattedAddress = decodedText.replace("ethereum:", "");
    setValue("to", formattedAddress);
    setShowQRScanner(false);
  };

  const handleSend = async () => {
    if (!smartAccount?.address || !resolvedAddress || !amount || !client) {
      console.error("Missing required data");
      return;
    }

    const selectedToken = methods.watch("token");
    setIsSending(true);

    try {
      // Parse amount to correct decimals
      const amountInWei = parseUnits(
        amount.replace(",", "."),
        selectedToken.decimals
      );

      // Encode transfer function call
      const data = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [resolvedAddress as Address, amountInWei],
      });

      // Send transaction using Privy's smart wallet client
      // This automatically handles paymaster and gas sponsorship
      const txHash = await client.sendTransaction({
        to: selectedToken.address as Address,
        data,
      });

      console.log("Transaction sent:", txHash);

      // TODO: Add success toast
      alert("Transacción enviada exitosamente!");

      // Redirect to dashboard
      navigate("/app");
    } catch (error) {
      console.error("Error sending transaction:", error);
      // TODO: Add error toast
      alert("Error al enviar la transacción. Por favor intenta nuevamente.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-[#F6F7FB] flex justify-center">
        <div className="w-full max-w-[580px] bg-white flex flex-col min-h-screen">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4 pt-safe">
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
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
              <h1 className="text-xl font-bold text-[#12033A]">Enviar</h1>
              <div className="w-10" />
            </div>

            {/* Stepper */}
            <div className="flex justify-center mt-4 gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 flex-1 rounded-full ${
                    step <= STEPS[currentStep].number
                      ? "bg-accent"
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 px-6 py-8">
            {currentStep === "address" && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección del destinatario
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={to}
                      onChange={(e) => setValue("to", e.target.value)}
                      placeholder="0x..., alias.blu, email o teléfono"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                    {isLoadingAlias && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* Alias/Email/Phone verification status */}
                  {needsResolution && !isLoadingAlias && (
                    <div className="mt-2">
                      {aliasError ? (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          <span>
                            {inputType === "alias" && "Alias no encontrado"}
                            {inputType === "email" && "Email no encontrado"}
                            {inputType === "phone" && "Teléfono no encontrado"}
                            {inputType === "unknown" && "Usuario no encontrado"}
                          </span>
                        </div>
                      ) : aliasData?.smartWallet?.address ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-green-600 text-sm">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span>Usuario verificado</span>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                            {/* Alias */}
                            {aliasData.alias && (
                              <div>
                                <p className="text-xs text-green-800 font-medium mb-1">
                                  Alias:
                                </p>
                                <p className="text-sm text-green-700 font-semibold">
                                  {aliasData.alias}
                                </p>
                              </div>
                            )}

                            {/* Email */}
                            {aliasData.email && (
                              <div>
                                <p className="text-xs text-green-800 font-medium mb-1">
                                  Email:
                                </p>
                                <p className="text-sm text-green-700">
                                  {aliasData.email}
                                </p>
                              </div>
                            )}

                            {/* Phone */}
                            {aliasData.phoneNumber && (
                              <div>
                                <p className="text-xs text-green-800 font-medium mb-1">
                                  Teléfono:
                                </p>
                                <p className="text-sm text-green-700">
                                  {aliasData.phoneNumber}
                                </p>
                              </div>
                            )}

                            {/* Address */}
                            <div>
                              <p className="text-xs text-green-800 font-medium mb-1">
                                Dirección:
                              </p>
                              <p className="text-xs text-green-700 font-mono break-all">
                                {aliasData.smartWallet.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowQRScanner(true)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-bold flex items-center justify-center gap-2"
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
                  Escanear QR
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  disabled={!resolvedAddress || isLoadingAlias}
                  className={`w-full py-4 rounded-lg font-bold text-white ${
                    resolvedAddress && !isLoadingAlias
                      ? "bg-accent"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isLoadingAlias ? "Verificando..." : "Continuar"}
                </motion.button>
              </div>
            )}

            {currentStep === "amount" && (
              <div className="space-y-6">
                {/* Token Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Seleccionar moneda
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {AVAILABLE_TOKENS.map((token) => {
                      const balance =
                        token.symbol === "ARST" ? arstBalance : usdcBalance;
                      const formattedBalance = balance
                        ? formatBalance({
                            amount: balance.balance,
                            tokenDecimals: token.decimals,
                          })
                        : "0.00";

                      return (
                        <motion.button
                          key={token.address}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setValue("token", token)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            selectedToken.address === token.address
                              ? "border-accent bg-blue-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <img
                              src={token.icon}
                              alt={token.symbol}
                              className="w-10 h-10 rounded-full"
                            />
                            <span className="font-bold text-lg text-[#2C1B52]">
                              {token.symbol}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 text-left">
                            Balance: {formattedBalance}
                          </p>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto a enviar
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={amount}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9,]/g, "");
                        setValue("amount", value);
                      }}
                      placeholder="0,00"
                      className="w-full px-4 py-6 text-3xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-center"
                    />
                  </div>
                  <p className="text-center text-gray-500 mt-2 text-sm">
                    {selectedToken.symbol}
                  </p>
                  {amount && !isAmountValid() && (
                    <p className="text-center text-red-500 mt-2 text-sm font-medium">
                      Saldo insuficiente. Máximo disponible:{" "}
                      {currentTokenBalance
                        ? formatBalance({
                            amount: currentTokenBalance.balance,
                            tokenDecimals: selectedToken.decimals,
                          })
                        : "0.00"}{" "}
                      {selectedToken.symbol}
                    </p>
                  )}
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  disabled={!amount || !isAmountValid()}
                  className={`w-full py-4 rounded-lg font-bold text-white ${
                    amount && isAmountValid()
                      ? "bg-accent"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Continuar
                </motion.button>
              </div>
            )}

            {currentStep === "summary" && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  {needsResolution && aliasData?.smartWallet?.address && (
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600">
                        {inputType === "alias" && "Alias"}
                        {inputType === "email" && "Email"}
                        {inputType === "phone" && "Teléfono"}
                      </span>
                      <span className="font-medium text-accent">{to}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <span className="text-gray-600">Dirección</span>
                    <span className="font-mono text-xs text-right break-all max-w-[200px]">
                      {resolvedAddress.slice(0, 10)}...
                      {resolvedAddress.slice(-8)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monto</span>
                    <div className="flex items-center gap-2">
                      <img
                        src={selectedToken.icon}
                        alt={selectedToken.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                      <span className="font-bold text-xl">
                        {amount} {selectedToken.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={isSending}
                  className="w-full py-4 bg-accent text-white rounded-lg font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <Spinner size="sm" color="border-white" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    "Confirmar envío"
                  )}
                </motion.button>
              </div>
            )}
          </div>

          {/* QR Scanner Modal */}
          {showQRScanner && (
            <QRScanner
              onScanSuccess={handleQRScan}
              onClose={() => setShowQRScanner(false)}
            />
          )}
        </div>
      </div>
    </FormProvider>
  );
};

export default SendPage;
