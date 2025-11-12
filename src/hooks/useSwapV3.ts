import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { Address } from 'viem';
import { parseUnits } from 'viem';
import { queryClient } from '@/config/queryClient';
import { TOKENS } from '@/constants/tokens';
import { swapV3 } from '@/services/swapV3';

type Transaction = {
	type: 'swap' | 'incoming' | 'outgoing';
	hash: string;
	blockHash?: string;
	tokenIn?: string;
	tokenOut?: string;
	amountIn?: string;
	amountOut?: string;
	tokenInDecimals?: string;
	tokenOutDecimals?: string;
	timeStamp: string;
	from?: string;
	to?: string;
	value?: string;
	tokenSymbol?: string;
	tokenDecimal?: string;
	_isOptimistic?: boolean;
};

export interface SwapV3Params {
	walletClient: any;
	recipient: Address;
	tokenIn: `0x${string}`;
	tokenOut: `0x${string}`;
	amountIn: string;
	amountOutMinimum: bigint;
	amountOut?: string; // amountOut esperado del quote para la transacción optimista
	sqrtPriceLimitX96: bigint;
}

export function useSwapV3<
	TData = unknown,
	TError = DefaultError,
	TVariables = void,
	TContext = unknown,
>(options?: UseMutationOptions<TData, TError, SwapV3Params, TContext>) {
	return useMutation({
		onSuccess: async (data, variables, context) => {
			// Agregar transacción optimista a la query de last-transactions
			if (data && typeof data === 'object' && 'hash' in data) {
				const swapData = data as { hash: string; blockHash: string; timestamp: number };
				const currentData = queryClient.getQueryData<Transaction[]>(['last-transactions']);

				// Determinar símbolos de tokens
				const tokenInSymbol =
					variables.tokenIn.toLowerCase() === TOKENS.USDC.address?.toLowerCase()
						? 'USDC'
						: variables.tokenIn.toLowerCase() === TOKENS.ARST.address?.toLowerCase()
							? 'ARST'
							: 'UNKNOWN';
				const tokenOutSymbol =
					variables.tokenOut.toLowerCase() === TOKENS.USDC.address?.toLowerCase()
						? 'USDC'
						: variables.tokenOut.toLowerCase() === TOKENS.ARST.address?.toLowerCase()
							? 'ARST'
							: 'UNKNOWN';

				// Calcular amountOut (usar el del quote si está disponible, sino usar amountOutMinimum)
				const amountOutWei = variables.amountOut
					? parseUnits(variables.amountOut, TOKENS.ARST.decimals)
					: variables.amountOutMinimum;
				const amountInWei = parseUnits(variables.amountIn, TOKENS.USDC.decimals);

				// Crear transacción optimista
				const optimisticTransaction = {
					type: 'swap',
					hash: swapData.hash,
					blockHash: swapData.blockHash,
					tokenIn: tokenInSymbol,
					tokenOut: tokenOutSymbol,
					amountIn: amountInWei.toString(),
					amountOut: amountOutWei.toString(),
					tokenInDecimals: TOKENS.USDC.decimals.toString(),
					tokenOutDecimals: TOKENS.ARST.decimals.toString(),
					timeStamp: Math.floor(swapData.timestamp).toString(),
					from: variables.recipient.toLowerCase(),
					to: variables.recipient.toLowerCase(),
					_isOptimistic: true, // Marcar como optimista
				};

				// Agregar la transacción optimista al inicio de la lista
				const newData = currentData
					? [optimisticTransaction, ...currentData]
					: [optimisticTransaction];

				// Limitar a 10 resultados
				const limitedData = newData.slice(0, 10);

			queryClient.setQueryData(['last-transactions'], limitedData);
		}

		// TODO: Fix callback types
		// if (options?.onSuccess) {
		// 	options.onSuccess(data as TData, variables, context);
		// }

		// Invalidar queries de balance después del swap
		queryClient.invalidateQueries({
			queryKey: ['balance'],
		});

		queryClient.invalidateQueries({
			queryKey: ['balance', variables.tokenIn],
		});

		queryClient.invalidateQueries({
			queryKey: ['balance', variables.tokenOut],
		});
	},
	onError: (error, variables, context) => {
		// TODO: Fix callback types
		// if (options?.onError) {
		// 	options.onError(error as TError, variables, context);
		// }
	},
		mutationFn: async (params: SwapV3Params) => {
			return await swapV3(params);
		},
	});
}
