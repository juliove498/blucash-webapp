import { type UseQueryOptions, useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';
import { getQuote } from '@/services/quoter';

export interface GetQuoteParams {
	tokenIn: Address;
	tokenOut: Address;
	amountIn: string;
	decimalsIn: number;
	tickSpacing: number;
}

export interface QuoteResult {
	amountOut: string;
	sqrtPriceX96After: bigint;
	initializedTicksCrossed: number;
	gasEstimate: bigint;
}

export function useGetQuote(
	params: GetQuoteParams | null,
	options?: Omit<UseQueryOptions<QuoteResult>, 'queryKey' | 'queryFn'>,
) {
	return useQuery({
		queryKey: ['quote', params],
		queryFn: async () => {
			if (!params) {
				throw new Error('Quote parameters are required');
			}
			return await getQuote(params);
		},
		enabled: params !== null && options?.enabled !== false,
		...options,
	});
}
