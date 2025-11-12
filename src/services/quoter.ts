import { type Address, formatUnits, parseUnits } from 'viem';
import { TOKENS } from '@/constants/tokens';
import { ADDRESSES } from '@/constants/v3Addresses';
import { getChainFromConfig } from '@/utils/chainResolver';
import { createPublicClientWithFallback } from '@/utils/rpcFallback';

// Aerodrome V3 Quoter ABI (minimal)
const AERO_V3_QUOTER_ABI = [
	{
		inputs: [
			{
				components: [
					{ name: 'tokenIn', type: 'address' },
					{ name: 'tokenOut', type: 'address' },
					{ name: 'amountIn', type: 'uint256' },
					{ name: 'tickSpacing', type: 'int24' },
					{ name: 'sqrtPriceLimitX96', type: 'uint160' },
				],
				name: 'params',
				type: 'tuple',
			},
		],
		name: 'quoteExactInputSingle',
		outputs: [
			{ name: 'amountOut', type: 'uint256' },
			{ name: 'sqrtPriceX96After', type: 'uint160' },
			{ name: 'initializedTicksCrossed', type: 'uint32' },
			{ name: 'gasEstimate', type: 'uint256' },
		],
		stateMutability: 'nonpayable',
		type: 'function',
	},
] as const;

const chain = getChainFromConfig();

const publicClient = createPublicClientWithFallback(chain);

export const getQuote = async ({
	tokenIn,
	tokenOut,
	amountIn,
	decimalsIn,
	tickSpacing,
}: {
	tokenIn: Address;
	tokenOut: Address;
	amountIn: string;
	decimalsIn: number;
	tickSpacing: number;
}) => {
	console.log('📊 Getting price quote using V3 Quoter...');
	console.log(`   Input Token: ${tokenIn}`);
	console.log(`   Output Token: ${tokenOut}`);
	console.log(`   Amount In: ${amountIn}`);
	console.log(`   Tick Spacing: ${tickSpacing}\n`);

	// Parse amount to wei/smallest unit
	const amountInWei = parseUnits(amountIn, decimalsIn);
	console.log(`   Amount In (wei): ${amountInWei}\n`);

	try {
		// Call quoteExactInputSingle on the V3 Quoter
		const result = await publicClient.simulateContract({
			address: ADDRESSES.V3_QUOTER,
			abi: AERO_V3_QUOTER_ABI,
			functionName: 'quoteExactInputSingle',
			args: [
				{
					tokenIn,
					tokenOut,
					amountIn: amountInWei,
					tickSpacing,
					sqrtPriceLimitX96: 0n, // 0 = no limit
				},
			],
		});

		const [amountOut, sqrtPriceX96After, initializedTicksCrossed, gasEstimate] = result.result;

		// Determinar decimales del token de salida
		const decimalsOut =
			tokenOut.toLowerCase() === TOKENS.USDC.address.toLowerCase()
				? TOKENS.USDC.decimals
				: tokenOut.toLowerCase() === TOKENS.ARST.address.toLowerCase()
					? TOKENS.ARST.decimals
					: 18; // Default a 18 si no se reconoce

		// Convertir amountOut de wei a número legible
		const amountOutFormatted = formatUnits(amountOut, decimalsOut);

		console.log(`   ✅ Quote successful!`);
		console.log(`   Amount Out (wei): ${amountOut}`);
		console.log(`   Amount Out (formatted): ${amountOutFormatted}`);
		console.log(`   Price After: ${sqrtPriceX96After}`);
		console.log(`   Ticks Crossed: ${initializedTicksCrossed}`);
		console.log(`   Gas Estimate: ${gasEstimate}\n`);

		return {
			amountOut: amountOut.toString(),
			sqrtPriceX96After,
			initializedTicksCrossed: Number(initializedTicksCrossed),
			gasEstimate,
		};
	} catch (error) {
		console.error('❌ Error getting V3 quote:', error);
		throw error;
	}
};
