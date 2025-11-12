import { usePrivy } from '@privy-io/react-auth';
import { type DefaultError, type UseMutationOptions, useMutation } from '@tanstack/react-query';
import type { Address } from 'viem';
import { parseUnits } from 'viem';
import { queryClient } from '@/config/queryClient';
import { transferToken } from '@/services/erc20';

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

export interface TransferTokenParams {
	walletClient: any;
	tokenAddress: `0x${string}`;
	to: Address;
	amount: string | bigint;
	decimals: number;
	tokenSymbol?: string;
	from?: Address;
}

export function useTransferToken<
	TData = unknown,
	TError = DefaultError,
	TVariables = void,
	TContext = unknown,
>(options?: UseMutationOptions<TData, TError, TransferTokenParams, TContext>) {
	const { getAccessToken } = usePrivy();

	return useMutation({
		onSuccess: async (data, variables, context) => {
			// Agregar transacción optimista a la query de last-transactions
			if (
				data &&
				typeof data === 'object' &&
				'hash' in data &&
				variables.from &&
				variables.tokenSymbol
			) {
				const txData = data as { hash: string; blockHash: string; timestamp: number };
				const currentData = queryClient.getQueryData<Transaction[]>(['last-transactions']);

				// Convertir amount a string en wei
				const amountWei =
					typeof variables.amount === 'bigint'
						? variables.amount.toString()
						: parseUnits(variables.amount as string, variables.decimals).toString();

				// Crear transacción optimista (siempre es outgoing porque es un envío)
				const optimisticTransaction: Transaction = {
					type: 'outgoing',
					hash: txData.hash,
					blockHash: txData.blockHash,
					timeStamp: Math.floor(txData.timestamp).toString(),
					from: variables.from.toLowerCase(),
					to: variables.to.toLowerCase(),
					value: amountWei,
					tokenSymbol: variables.tokenSymbol,
					tokenDecimal: variables.decimals.toString(),
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

		queryClient.invalidateQueries({
			queryKey: ['balance', variables.tokenAddress],
		});

		queryClient.invalidateQueries({
			queryKey: ['last-transactions'],
		});
	},
	onError: (error: TError, variables, context) => {
		// TODO: Fix callback types
		// if (options?.onError) {
		// 	options.onError(error, variables, context);
		// }
	},
		mutationFn: async (params: TransferTokenParams) => {
			return await transferToken(
				params.walletClient,
				params.tokenAddress,
				params.to,
				params.amount,
				params.decimals,
			);
		},
	});
}
