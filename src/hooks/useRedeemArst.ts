import { useMutation } from "@tanstack/react-query";

interface RedeemRequest {
  alias: string;
  wallet_address: string;
  email?: string;
  phone_number?: string;
}

interface RedeemResponse {
  success: boolean;
  message?: string;
}

const submitRedeem = async (data: RedeemRequest): Promise<RedeemResponse> => {
  // En desarrollo usa el proxy, en producción la URL completa
  const apiUrl = import.meta.env.DEV 
    ? "/api/redeem/submit"
    : "https://airdrop-devconnect.blucash.xyz/api/redeem/submit";
    
  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Error al enviar la solicitud de redención");
  }

  return response.json();
};

export const useRedeemArst = () => {
  return useMutation({
    mutationFn: submitRedeem,
  });
};
