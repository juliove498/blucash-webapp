import { type Chain, createPublicClient, http } from 'viem';

const RPC_ENDPOINTS = {
	base: [
		'https://base-mainnet.rpc.privy.systems/?privyAppId=cmgtocdxh0063la0drq1uryr5',
		import.meta.env.DEV
			? '/rpc/base'
			: 'https://base-mainnet.g.alchemy.com/v2/tizaV0-Rx40MZX5FVJs68YUXeGB8Fu7y',
		'https://mainnet.base.org',
		'https://base.llamarpc.com',
		'https://base-mainnet.public.blastapi.io',
	],
	baseSepolia: ['https://sepolia.base.org'],
};

export const createPublicClientWithFallback = (chain: Chain) => {
	const chainName = chain.name.toLowerCase();
	const endpoints = RPC_ENDPOINTS[chainName as keyof typeof RPC_ENDPOINTS];

	if (!endpoints || endpoints.length === 0) {
		return createPublicClient({
			chain,
			transport: http(),
		});
	}

	return createPublicClient({
		chain,
		transport: http(endpoints[0]),
	});
};

export const createFallbackPublicClient = async (chain: Chain) => {
	const chainName = chain.name.toLowerCase();
	const endpoints = RPC_ENDPOINTS[chainName as keyof typeof RPC_ENDPOINTS];

	if (!endpoints || endpoints.length === 0) {
		return createPublicClient({
			chain,
			transport: http(),
		});
	}

	for (const endpoint of endpoints) {
		try {
			const client = createPublicClient({
				chain,
				transport: http(endpoint),
			});

			await client.getBlockNumber();

			console.log(`Successfully connected to RPC endpoint: ${endpoint}`);
			return client;
		} catch (error) {
			console.warn(`Failed to connect to RPC endpoint ${endpoint}:`, error);
		}
	}

	console.warn('All custom RPC endpoints failed, falling back to default');
	return createPublicClient({
		chain,
		transport: http(),
	});
};
