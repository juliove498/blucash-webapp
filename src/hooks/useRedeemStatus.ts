import { useQuery } from "@tanstack/react-query";

interface RedeemStatusData {
  wallet_address: string;
  alias?: string;
  status: "not_found" | "pending" | "completed";
  exists: boolean;
  created_at?: string;
  redeemed_at?: string;
  transaction_hash?: string;
  explorer_url?: string;
  status_message?: string;
}

interface RedeemStatusResponse {
  success: boolean;
  message?: string;
  error?: string;
  data: RedeemStatusData;
}

const fetchRedeemStatus = async (
  walletAddress: string
): Promise<RedeemStatusResponse> => {
  // En desarrollo usa el proxy, en producción la URL completa
  const apiUrl = import.meta.env.DEV
    ? `/api/redeem/status?wallet_address=${walletAddress}`
    : `https://airdrop-devconnect.blucash.xyz/api/redeem/status?wallet_address=${walletAddress}`;

  const response = await fetch(apiUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Error al consultar el estado del redeem");
  }

  return response.json();
};

export const useRedeemStatus = (walletAddress?: string) => {
  const query = useQuery({
    queryKey: ["redeemStatus", walletAddress],
    queryFn: () => fetchRedeemStatus(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnMount: true,
    refetchInterval: (query) => {
      // Revalidar cada 10 segundos si el status es "pending"
      return query.state.data?.data.status === "pending" ? 10000 : false;
    },
  });
  
  return query;
};
