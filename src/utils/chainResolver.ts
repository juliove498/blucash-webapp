import { base, baseSepolia } from 'viem/chains';

export const getChainFromConfig = () => {
	const chainName = import.meta.env.VITE_CHAIN_NAME || 'baseSepolia';

	switch (chainName) {
		case 'baseSepolia':
			return baseSepolia;
		case 'base':
			return base;
		default:
			return baseSepolia; // fallback to testnet
	}
};
