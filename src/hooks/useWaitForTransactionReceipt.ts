import { waitForTransactionReceipt } from '@/services/erc20';
import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';

export function useWaitForTransactionReceipt(hash: Address) {
	return useQuery({
		queryKey: ['transaction-receipt'],
		queryFn: async () => {
			if (!hash) throw new Error('Missing hash');
			return await waitForTransactionReceipt(hash);
		},
		enabled: !!hash,
	});
}
