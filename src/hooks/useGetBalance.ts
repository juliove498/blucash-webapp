import { useQuery } from '@tanstack/react-query';
import { AVAILABLE_TOKENS } from '@/constants/tokens';
import { getDollarOfficialPrice } from '@/services/dollar';
import useTokenBalanceStore from '@/stores/useTokenBalanceStore';
import { formatBalanceToNumber } from '@/utils';

function useGetBalance() {
	const { tokens, getTokens } = useTokenBalanceStore();

	const enabled = tokens.length === AVAILABLE_TOKENS.length;

	return useQuery({
		queryKey: ['balance-total'],
		queryFn: async () => {
			const price = await getDollarOfficialPrice();

			const totalBalance = getTokens().reduce((acc, { balance, token, decimals }) => {
				const parsedBalance = formatBalanceToNumber({
					amount: balance,
					tokenDecimals: decimals,
				});

				return token !== 'ARST' ? acc + parsedBalance * Number(price) : acc + parsedBalance;
			}, 0);
			return {
				totalBalance: new Intl.NumberFormat('de-DE', {
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				}).format(totalBalance),
			};
		},
		enabled,
	});
}

export default useGetBalance;
