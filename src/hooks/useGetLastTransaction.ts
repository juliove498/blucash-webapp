import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/config/queryClient';
import { getLastTransactions } from '@/services/erc20';

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

export function useGetLastTransaction(address?: `0x${string}`) {
	return useQuery({
		queryKey: ['last-transactions'],
		queryFn: async () => {
			if (!address) throw new Error('Missing address');
			const newData = await getLastTransactions({ accountAddress: address });
			const currentData = queryClient.getQueryData<Transaction[]>(['last-transactions']);

			// Preservar transacciones optimistas que aún no aparecen en los datos nuevos
			if (currentData && newData) {
				// Filtrar transacciones optimistas del currentData
				const optimisticTransactions = currentData.filter((tx) => tx._isOptimistic);

				// Si hay transacciones optimistas, verificar si ya aparecen en newData por hash
				if (optimisticTransactions.length > 0) {
					// Crear un Set con los hashes de las transacciones nuevas (en minúsculas)
					const newDataHashes = new Set(
						newData.map((tx) => tx.hash?.toLowerCase()).filter((hash): hash is string => !!hash),
					);

					// Filtrar transacciones optimistas que aún no existen en newData (por hash)
					const filteredOptimistic = optimisticTransactions.filter(
						(tx) => tx.hash && !newDataHashes.has(tx.hash.toLowerCase()),
					);

					// Si hay transacciones optimistas que preservar, combinarlas con los datos nuevos
					if (filteredOptimistic.length > 0) {
						// Combinar: optimistas primero, luego las nuevas
						const merged = [...filteredOptimistic, ...newData];

						// Ordenar por timestamp descendente
						merged.sort((a, b) => {
							const timeA = parseInt(a.timeStamp) || 0;
							const timeB = parseInt(b.timeStamp) || 0;
							return timeB - timeA;
						});

						// Limitar a 10 resultados
						return merged.slice(0, 10);
					}
				}
			}

			return newData;
		},
		retry: 3,
		enabled: !!address,
	});
}
