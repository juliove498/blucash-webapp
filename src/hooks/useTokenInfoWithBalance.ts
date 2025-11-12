import { useQuery } from '@tanstack/react-query';
import { queryClient } from '@/config/queryClient';
import { getTokenInfoWithBalance } from '@/services/erc20';
import useTokenBalanceStore from '@/stores/useTokenBalanceStore';

export function useTokenInfoWithBalance(address?: `0x${string}`, token?: `0x${string}`) {
	const { setTokenBalance, tokens } = useTokenBalanceStore();

	return useQuery({
		queryKey: ['balance', token],
		queryFn: async () => {
			if (!address || !token) throw new Error('Missing address/token');
			const data = await getTokenInfoWithBalance(address, token);
			setTokenBalance(data.symbol, data.balance, data.decimals);
			const existingToken = tokens.find((t) => t.token === data.symbol);

			if (existingToken && data.balance !== existingToken.balance) {
				queryClient.invalidateQueries({ queryKey: ['balance-total'] });
			}

			return data;
		},
		enabled: !!address && !!token,
	});
}
