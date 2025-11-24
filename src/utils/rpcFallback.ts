import { type Chain, createPublicClient, http } from 'viem';

const RPC_ENDPOINTS = {
	base: [
		import.meta.env.DEV
			? '/rpc/infura'
			: 'https://base-mainnet.infura.io/v3/18c0406d499541f4a74d009e04c54f99',
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
