import { type Address, encodeFunctionData, erc20Abi, parseUnits } from 'viem';
import { TOKENS } from '@/constants/tokens';
import { ADDRESSES } from '@/constants/v3Addresses';
import { getChainFromConfig } from '@/utils/chainResolver';
import { createPublicClientWithFallback } from '@/utils/rpcFallback';

// Aerodrome V3 Swap Router ABI (minimal)
const AERO_V3_SWAP_ROUTER_ABI = [
	{
		inputs: [
			{
				components: [
					{ name: 'tokenIn', type: 'address' },
					{ name: 'tokenOut', type: 'address' },
					{ name: 'tickSpacing', type: 'int24' },
					{ name: 'recipient', type: 'address' },
					{ name: 'deadline', type: 'uint256' },
					{ name: 'amountIn', type: 'uint256' },
					{ name: 'amountOutMinimum', type: 'uint256' },
					{ name: 'sqrtPriceLimitX96', type: 'uint160' },
				],
				name: 'params',
				type: 'tuple',
			},
		],
		name: 'exactInputSingle',
		outputs: [{ name: 'amountOut', type: 'uint256' }],
		stateMutability: 'payable',
		type: 'function',
	},
] as const;
const chain = getChainFromConfig();

const publicClient = createPublicClientWithFallback(chain);

export const swapV3 = async ({
	walletClient,
	recipient,
	tokenIn,
	tokenOut,
	amountIn,
	amountOutMinimum,
	sqrtPriceLimitX96,
}: {
	walletClient: any;
	recipient: Address;
	tokenIn: `0x${string}`;
	tokenOut: `0x${string}`;
	amountIn: string;
	amountOutMinimum: bigint;
	sqrtPriceLimitX96: bigint;
}) => {
	const amountInWei = parseUnits(amountIn, TOKENS.USDC.decimals);

	console.log('Aprobando router para gastar tokens...');
	const approveHash = await walletClient.sendTransaction({
		to: TOKENS.USDC.address,
		data: encodeFunctionData({
			abi: erc20Abi,
			functionName: 'approve',
			args: [ADDRESSES.V3_SWAP_ROUTER as Address, amountInWei],
		}),
	});

	console.log('Approve transaction hash:', approveHash);

	await publicClient.waitForTransactionReceipt({ hash: approveHash });
	console.log('Approve confirmado');

	const swapData = encodeFunctionData({
		abi: AERO_V3_SWAP_ROUTER_ABI,
		functionName: 'exactInputSingle',
		args: [
			{
				tokenIn,
				tokenOut,
				tickSpacing: 10,
				recipient: recipient,
				deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 10), // 10 minutes
				amountIn: amountInWei,
				amountOutMinimum,
				sqrtPriceLimitX96, // 0 = no limit
			},
		],
	});

	const swapHash = await walletClient.sendTransaction({
		to: ADDRESSES.V3_SWAP_ROUTER as Address,
		data: swapData,
	});
	console.log('Swap transaction hash:', swapHash);

	const receipt = await publicClient.waitForTransactionReceipt({ hash: swapHash });
	console.log('Swap confirmado', swapHash);

	// Obtener el block para el timestamp
	const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });

	return {
		hash: swapHash,
		blockHash: receipt.blockHash,
		blockNumber: receipt.blockNumber,
		timestamp: Number(block.timestamp),
	};
};
