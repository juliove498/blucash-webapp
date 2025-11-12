import { usePrivy } from '@privy-io/react-auth';
import { formatUnits } from 'viem';

// Inferir el tipo de user desde usePrivy
type PrivyHook = ReturnType<typeof usePrivy>;
type User = PrivyHook['user'];

export const getUserName = (user: User) =>
	(user?.linkedAccounts?.[0].type === 'email' && user?.linkedAccounts?.[0]?.address) ||
	(user?.linkedAccounts?.[0].type === 'phone' && user?.linkedAccounts?.[0]?.number) ||
	'User';

type BalanceFormatParams = {
	amount: bigint;
	tokenDecimals?: number;
	displayDecimals?: number;
};

export const formatBalance = ({
	amount,
	tokenDecimals = 18,
	displayDecimals = 2,
}: BalanceFormatParams): string => {
	if (!amount) return '0,00';

	const raw = formatUnits(amount, tokenDecimals);

	const [intPart, decPart = ''] = raw.split('.');

	const truncatedDec = decPart.slice(0, displayDecimals).padEnd(displayDecimals, '0');

	const intFormatted = new Intl.NumberFormat('de-DE').format(Number(intPart));

	return `${intFormatted},${truncatedDec}`;
};

export const formatBalanceToNumber = ({
	amount,
	tokenDecimals = 18,
	displayDecimals = 2,
}: BalanceFormatParams): number => {
	return Number(
		formatBalance({ amount, tokenDecimals, displayDecimals }).replace(/\./g, '').replace(',', '.'),
	);
};

export const formatLargeNumber = (value: string | number, maxDecimals: number = 2): string => {
	const num =
		typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;

	if (Number.isNaN(num) || num === 0) return '0';

	const absNum = Math.abs(num);
	const sign = num < 0 ? '-' : '';

	if (absNum >= 1_000_000) {
		const formatted = new Intl.NumberFormat('de-DE', {
			minimumFractionDigits: 0,
			maximumFractionDigits: absNum >= 10_000_000 ? 0 : maxDecimals,
		}).format(absNum);
		return `${sign}${formatted}`;
	}

	if (absNum >= 1_000) {
		const formatted = new Intl.NumberFormat('de-DE', {
			minimumFractionDigits: maxDecimals,
			maximumFractionDigits: maxDecimals,
		}).format(absNum);
		return `${sign}${formatted}`;
	}

	const formatted = new Intl.NumberFormat('de-DE', {
		minimumFractionDigits: maxDecimals,
		maximumFractionDigits: maxDecimals,
	}).format(absNum);

	return `${sign}${formatted}`;
};
