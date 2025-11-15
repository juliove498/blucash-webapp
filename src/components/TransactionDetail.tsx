import { usePrivy } from "@privy-io/react-auth";
import { useGetAddressByAlias } from "@/hooks/useGetAddressByAlias";
import { AVAILABLE_TOKENS } from "@/constants/tokens";
import { formatBalance } from "@/utils";
import { Skeleton } from "./ui/Skeleton";
import type { Address } from "viem";

interface TransactionDetailProps {
  transaction: any;
}

export const TransactionDetail = ({ transaction }: TransactionDetailProps) => {
  const { user } = usePrivy();
  const smartAccount = user?.smartWallet;

  // Detectar si es un swap
  const isSwap = transaction.type === "swap";

  // Determinar si es ingreso o retiro (solo para transacciones normales)
  const isIncoming =
    !isSwap &&
    transaction.to?.toLowerCase() === smartAccount?.address?.toLowerCase();

  // Dirección a consultar (from si es ingreso, to si es retiro)
  const addressToQuery = isIncoming ? transaction.from : transaction.to;

  // Consultar alias del address (no aplica para swap)
  const { data: addressData, isLoading } = useGetAddressByAlias(
    isSwap ? undefined : addressToQuery
  );

  // Encontrar el token (para transacciones normales)
  const token = AVAILABLE_TOKENS.find(
    (t) => t.symbol === transaction.tokenSymbol
  );

  // Formatear el monto (para transacciones normales)
  const formattedAmount = !isSwap
    ? formatBalance({
        amount: BigInt(transaction.value || 0),
        tokenDecimals: transaction.tokenDecimal,
      })
    : "";

  // Si es swap, renderizar diseño especial
  if (isSwap) {
    return (
      <div className="px-6 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#354eab]">
            <svg
              className="w-8 h-8 text-white"
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
          <h3 className="text-2xl font-bold text-[#12033A] mb-2">
            {transaction.tokenIn} ⇄ {transaction.tokenOut}
          </h3>
          <p className="text-gray-500 text-sm">
            {new Date(Number(transaction.timeStamp) * 1000).toLocaleDateString(
              "es-ES",
              {
                day: "numeric",
                month: "long",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }
            )}
          </p>
        </div>

        {/* Detalles del swap */}
        <div className="bg-[#E8EBF4] rounded-2xl p-6 mb-6">
          <div className="space-y-4">
            {/* Cambiaste */}
            <div className="flex justify-between items-center">
              <p className="text-[#12033A] font-semibold text-lg">Cambiaste:</p>
              <p className="text-[#354eab] font-bold text-lg">
                {formatBalance({
                  amount: BigInt(transaction.amountIn || 0),
                  tokenDecimals: transaction.tokenInDecimals,
                })}{" "}
                {transaction.tokenIn}
              </p>
            </div>

            {/* Recibiste */}
            <div className="flex justify-between items-center">
              <p className="text-[#12033A] font-semibold text-lg">Recibiste:</p>
              <p className="text-[#3388f3] font-bold text-lg">
                {formatBalance({
                  amount: BigInt(transaction.amountOut || 0),
                  tokenDecimals: transaction.tokenOutDecimals,
                })}{" "}
                {transaction.tokenOut}
              </p>
            </div>
          </div>
        </div>

        {/* Hash de transacción */}
        <div className="bg-white rounded-xl p-4 border border-gray-100 mb-6">
          <p className="text-gray-500 text-sm mb-2">Hash de transacción</p>
          <p className="text-[#2C1B52] text-xs font-mono break-all">
            {transaction.hash}
          </p>
        </div>

        {/* Ver en explorador */}
        <a
          href={`https://basescan.org/tx/${transaction.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#3587f5] text-white py-3.5 rounded-xl font-semibold text-center block"
        >
          Ver en explorador
        </a>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
            isIncoming ? "bg-[#3587f5]" : "bg-[#4A6FC8]"
          }`}
        >
          <svg
            className="w-8 h-8 text-white"
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
        <h3 className="text-2xl font-bold text-[#2C1B52] mb-2">
          {isIncoming ? "Ingreso" : "Retiro"}
        </h3>
        <p className="text-gray-500 text-sm">
          {new Date(transaction.timeStamp * 1000).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      {/* Monto */}
      <div className="bg-[#F6F7FB] rounded-2xl p-6 mb-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          {token && (
            <img
              src={token.icon}
              alt={token.symbol}
              className="w-8 h-8 rounded-full"
            />
          )}
          <p
            className={`text-4xl font-bold ${
              isIncoming ? "text-[#3587f5]" : "text-[#E74C4C]"
            }`}
          >
            {isIncoming ? "+" : "-"}
            {formattedAmount}
          </p>
        </div>
        <p className="text-gray-500 text-sm">{transaction.tokenSymbol}</p>
      </div>

      {/* Detalles */}
      <div className="space-y-4">
        {/* De */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm mb-2">De</p>
          {isIncoming ? (
            isLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <div>
                <p className="text-[#2C1B52] font-bold text-base">
                  {addressData?.alias ||
                    addressData?.email ||
                    addressData?.phoneNumber ||
                    "Usuario"}
                </p>
                <p className="text-gray-400 text-xs font-mono mt-1">
                  {addressToQuery?.slice(0, 6)}...{addressToQuery?.slice(-4)}
                </p>
              </div>
            )
          ) : (
            <div>
              <p className="text-[#2C1B52] font-bold text-base">
                {user?.email?.address || user?.phone?.number || "Tú"}
              </p>
              <p className="text-gray-400 text-xs font-mono mt-1">
                {smartAccount?.address?.slice(0, 6)}...
                {smartAccount?.address?.slice(-4)}
              </p>
            </div>
          )}
        </div>

        {/* Para */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm mb-2">Para</p>
          {!isIncoming ? (
            isLoading ? (
              <Skeleton className="h-6 w-32" />
            ) : (
              <div>
                <p className="text-[#2C1B52] font-bold text-base">
                  {addressData?.alias ||
                    addressData?.email ||
                    addressData?.phoneNumber ||
                    "Usuario"}
                </p>
                <p className="text-gray-400 text-xs font-mono mt-1">
                  {addressToQuery?.slice(0, 6)}...{addressToQuery?.slice(-4)}
                </p>
              </div>
            )
          ) : (
            <div>
              <p className="text-[#2C1B52] font-bold text-base">
                {user?.email?.address || user?.phone?.number || "Tú"}
              </p>
              <p className="text-gray-400 text-xs font-mono mt-1">
                {smartAccount?.address?.slice(0, 6)}...
                {smartAccount?.address?.slice(-4)}
              </p>
            </div>
          )}
        </div>

        {/* Hash de transacción */}
        <div className="bg-white rounded-xl p-4 border border-gray-100">
          <p className="text-gray-500 text-sm mb-2">Hash de transacción</p>
          <p className="text-[#2C1B52] text-xs font-mono break-all">
            {transaction.hash}
          </p>
        </div>
      </div>

      {/* Ver en explorador */}
      <a
        href={`https://basescan.org/tx/${transaction.hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 w-full bg-[#3587f5] text-white py-3.5 rounded-xl font-semibold text-center block"
      >
        Ver en explorador
      </a>
    </div>
  );
};
