export const TOKENS = {
	ARST: {
		name: 'ARST Finance',
		symbol: 'ARST',
		balance: '0',
		address: import.meta.env.VITE_ARST_TOKEN_ADDRESS as `0x${string}`,
		icon: '/assets/images/arst.webp',
		displayDecimals: 2,
		decimals: 18,
	},
	USDC: {
		name: 'USDC',
		symbol: 'USDC',
		balance: '0',
		address: import.meta.env.VITE_USDC_TOKEN_ADDRESS as `0x${string}`,
		icon: '/assets/images/usdc.png',
		displayDecimals: 2,
		decimals: 6,
	},
};

export const AVAILABLE_TOKENS = [TOKENS.ARST, TOKENS.USDC];
