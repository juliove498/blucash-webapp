import { useTokenInfoWithBalance } from '@/hooks/useTokenInfoWithBalance';
import type { Address } from 'viem';
import { Skeleton } from './ui/Skeleton';
import Mask from './Mask';
import { formatBalance } from '@/utils';

interface TokenBalanceProps {
	address: Address;
	account?: Address;
	displayDecimals?: number;
	style?: React.CSSProperties;
	className?: string;
}

export const TokenBalance = ({ 
	address, 
	account, 
	displayDecimals = 2,
	style,
	className = ''
}: TokenBalanceProps) => {
	const { data, isLoading } = useTokenInfoWithBalance(address, account);

	if (isLoading) {
		return <Skeleton className="w-20 h-6" />;
	}

	if (!data) {
		return <span style={style} className={className}>0.00</span>;
	}

	const formatted = formatBalance({
		amount: data.balance,
		tokenDecimals: data.decimals,
		displayDecimals,
	});

	return (
		<span style={style} className={className}>
			<Mask>{formatted}</Mask>
		</span>
	);
};

export default TokenBalance;



