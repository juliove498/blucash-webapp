import { type Address, encodeFunctionData, erc20Abi, parseUnits } from 'viem';
import { TOKENS } from '@/constants/tokens';
import { getChainFromConfig } from '@/utils/chainResolver';
import { createPublicClientWithFallback } from '@/utils/rpcFallback';
import { convertOffsetToTimes } from 'framer-motion';

const chain = getChainFromConfig();


const publicClient = createPublicClientWithFallback(chain);


export async function getTokenInfoWithBalance(
	userAddress: `0x${string}`,
	tokenAddress: `0x${string}`,
) {
	const [balance, symbol, decimals, name] = await Promise.all([
		publicClient.readContract({
			address: tokenAddress,
			abi: erc20Abi,
			functionName: 'balanceOf',
			args: [userAddress],
		}),
		publicClient.readContract({
			address: tokenAddress,
			abi: erc20Abi,
			functionName: 'symbol',
		}),
		publicClient.readContract({
			address: tokenAddress,
			abi: erc20Abi,
			functionName: 'decimals',
		}),
		publicClient.readContract({
			address: tokenAddress,
			abi: erc20Abi,
			functionName: 'name',
		}),
	]);

	console.log('getTokenInfoWithBalance called with');
	console.log('Public client created:', publicClient);
	console.log('Using chain:', chain);
	console.log(`Token info for user ${userAddress} and token ${tokenAddress}:`, {
		symbol,
		decimals,
		balance: balance.toString(),
		name,
	});

	return {
		symbol,
		decimals,
		balance,
		address: tokenAddress,
		icon:
			TOKENS[symbol as keyof typeof TOKENS]?.icon ?? '/assets/images/fallbackToken.webp',
		name,
	};
}
export async function transferToken(
	walletClient: any,
	tokenAddress: `0x${string}`,
	to: Address,
	amount: string | bigint,
	decimals: number,
) {
	try {
		const value = parseUnits(amount as string, decimals);

		const hash = await walletClient.sendTransaction({
			to: tokenAddress,
			data: encodeFunctionData({
				abi: erc20Abi,
				functionName: 'transfer',
				args: [to, value],
			}),
		});

		// Esperar el receipt para obtener blockHash y timestamp
		const receipt = await publicClient.waitForTransactionReceipt({ hash });
		const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });

		return {
			hash,
			blockHash: receipt.blockHash,
			blockNumber: receipt.blockNumber,
			timestamp: Number(block.timestamp),
		};
	} catch (error: any) {
		console.log(error);
		if (error?.details?.includes('gas sponsoring policies')) {
			throw new Error('GAS_SPONSORSHIP_POLICY_BLOCK');
		}
		throw new Error('TRANSACTION_FAILED');
	}
}

// Formato común para transacciones mapeadas
interface MappedTransaction {
	blockHash: string;
	blockNumber: string;
	from: string;
	to: string;
	value: string;
	tokenSymbol: string;
	tokenDecimal: string;
	timeStamp: string;
	hash: string;
}

/**
 * Obtiene token transfers desde Etherscan API
 */
async function getTransactionsFromEtherscan(accountAddress: Address): Promise<MappedTransaction[]> {
	const etherscanKey = import.meta.env.VITE_ETHERSCAN_KEY;
	if (!etherscanKey) {
		throw new Error('Etherscan API key not configured');
	}

	// Obtener chainId de la configuración de la red
	const network = getChainFromConfig();
	const chainId = network.id;

	// Usar endpoint genérico de Etherscan con chainid
	const baseUrl = 'https://api.etherscan.io/v2/api';

	// Obtener direcciones de tokens para filtrar
	const arstAddress = TOKENS.ARST.address?.toLowerCase();
	const usdcAddress = TOKENS.USDC.address?.toLowerCase();

	// Hacer una sola llamada para obtener 20 token transfers (sin contractaddress para obtener todos)
	const response = await fetch(
		`${baseUrl}?chainid=${chainId}&module=account&action=tokentx&address=${accountAddress}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc&apikey=${etherscanKey}`,
	);
	const result = await response.json();

	const mappedResults: MappedTransaction[] = [];

	if (result.status === '1' && Array.isArray(result.result)) {
		result.result.forEach((tx: any) => {
			const tokenAddress = tx.contractAddress?.toLowerCase() || '';

			// Filtrar solo ARST y USDC
			if (tokenAddress !== arstAddress && tokenAddress !== usdcAddress) {
				return;
			}

			const token =
				tokenAddress === arstAddress
					? TOKENS.ARST
					: tokenAddress === usdcAddress
						? TOKENS.USDC
						: null;

			if (!token) return;

			mappedResults.push({
				blockHash: tx.blockHash || '',
				blockNumber: tx.blockNumber || '0',
				from: tx.from?.toLowerCase() || '',
				to: tx.to?.toLowerCase() || '',
				value: tx.value || '0',
				tokenSymbol: token.symbol || 'UNKNOWN',
				tokenDecimal: token.decimals?.toString() || '18',
				timeStamp: tx.timeStamp || '0',
				hash: tx.hash || '',
			});
		});

		// Limitar a 10 resultados
		const limitedResults = mappedResults.slice(0, 10);
		return limitedResults;
	}

	return mappedResults;
}

/**
 * Obtiene token transfers desde Blockscout API
 */
async function getTransactionsFromBlockscout(
	accountAddress: Address,
): Promise<MappedTransaction[]> {
	const chainName = import.meta.env.VITE_CHAIN_NAME || 'baseSepolia';
	const blockscoutUrl =
		chainName === 'base' ? 'https://base.blockscout.com' : 'https://base-sepolia.blockscout.com';
	const blockscoutApiKey =
		chainName === 'base'
			? '222a074c-be2e-4e64-a966-0adc1858b7bd'
			: '3860f4ed-17af-4d72-a6d5-d54c53b6b622';

	const res = await fetch(
		`${blockscoutUrl}/api/v2/addresses/${accountAddress}/token-transfers?apikey=${blockscoutApiKey}`,
	);
	const data = await res.json();

	if (!data.items || !Array.isArray(data.items)) {
		return [];
	}

	const arstAddress = TOKENS.ARST.address?.toLowerCase();
	const usdcAddress = TOKENS.USDC.address?.toLowerCase();

	const mappedResults = data.items
		.map((tx: any) => {
			const tokenAddress = tx.token?.address_hash?.toLowerCase() || '';

			// Solo procesar tokens ERC-20 de ARST y USDC
			if (
				!tokenAddress ||
				tx.token_type !== 'ERC-20' ||
				(tokenAddress !== arstAddress && tokenAddress !== usdcAddress)
			) {
				return null;
			}

			const token =
				tokenAddress === arstAddress
					? TOKENS.ARST
					: tokenAddress === usdcAddress
						? TOKENS.USDC
						: null;

			if (!token) return null;

			// Convertir timestamp a formato Unix
			const timeStamp = tx.timestamp
				? Math.floor(new Date(tx.timestamp).getTime() / 1000).toString()
				: '0';

			// Mapear from y to - Blockscout usa objetos con hash
			const fromAddress = tx.from?.hash?.toLowerCase() || '';
			const toAddress = tx.to?.hash?.toLowerCase() || '';

			return {
				blockHash: tx.block_hash || '',
				blockNumber: tx.block_number?.toString() || '0',
				from: fromAddress,
				to: toAddress,
				value: tx.total?.value || '0',
				tokenSymbol: token.symbol || 'UNKNOWN',
				tokenDecimal: token.decimals?.toString() || '18',
				timeStamp: timeStamp,
				hash: tx.transaction_hash || '',
			} as MappedTransaction | null;
		})
		.filter((tx: MappedTransaction | null): tx is MappedTransaction => tx !== null);

	return mappedResults;
}

/**
 * Procesa las transacciones mapeadas para identificar swaps, entrantes y salientes
 */
function processTransactions(mappedResults: MappedTransaction[], accountAddress: Address): any[] {
	const accountAddressLower = accountAddress.toLowerCase();

	// Agrupar transacciones por transaction_hash para identificar swaps
	const groupedByTransactionHash: Record<string, MappedTransaction[]> = {};

	mappedResults.forEach((tx) => {
		const txHash = tx.hash;
		if (!groupedByTransactionHash[txHash]) {
			groupedByTransactionHash[txHash] = [];
		}
		groupedByTransactionHash[txHash].push(tx);
	});

	// Procesar grupos: si hay 2 transacciones con el mismo transaction_hash, es un swap
	const processedTransactions: any[] = [];

	Object.keys(groupedByTransactionHash).forEach((txHash) => {
		const group = groupedByTransactionHash[txHash];

		// Si hay 2 transacciones con el mismo transaction_hash, verificar si es un swap
		if (group.length === 2) {
			// Identificar tokenIn (outgoing) y tokenOut (incoming)
			const outgoingTx = group.find((t) => t.from?.toLowerCase() === accountAddressLower);
			const incomingTx = group.find((t) => t.to?.toLowerCase() === accountAddressLower);

			// Verificar que sean diferentes tokens (ARST y USDC)
			const isDifferentTokens =
				outgoingTx &&
				incomingTx &&
				outgoingTx.tokenSymbol?.toUpperCase() !== incomingTx.tokenSymbol?.toUpperCase();

			if (outgoingTx && incomingTx && isDifferentTokens) {
				// Crear objeto de swap
				const swapTransaction = {
					...outgoingTx,
					type: 'swap',
					tokenIn: outgoingTx.tokenSymbol,
					tokenOut: incomingTx.tokenSymbol,
					amountIn: outgoingTx.value,
					amountOut: incomingTx.value,
					tokenInDecimals: outgoingTx.tokenDecimal,
					tokenOutDecimals: incomingTx.tokenDecimal,
					timeStamp: outgoingTx.timeStamp,
					blockHash: outgoingTx.blockHash || incomingTx.blockHash || txHash,
				};

				processedTransactions.push(swapTransaction);
			} else {
				// Si no se pueden identificar claramente como swap, agregar ambas como transacciones normales
				group.forEach((t) => {
					const isOutgoing = t.from?.toLowerCase() === accountAddressLower;
					processedTransactions.push({
						...t,
						type: isOutgoing ? 'outgoing' : 'incoming',
					});
				});
			}
		} else {
			// Transacción normal (no es swap) - clasificar como entrante o saliente
			group.forEach((t) => {
				const isOutgoing = t.from?.toLowerCase() === accountAddressLower;
				processedTransactions.push({
					...t,
					type: isOutgoing ? 'outgoing' : 'incoming',
				});
			});
		}
	});

	// Ordenar por timestamp descendente
	processedTransactions.sort((a, b) => {
		const timeA = parseInt(a.timeStamp) || 0;
		const timeB = parseInt(b.timeStamp) || 0;
		return timeB - timeA;
	});

	// Limitar a 10 resultados
	return processedTransactions.slice(0, 10);
}

/**
 * Obtiene las últimas transacciones usando Blockscout como principal y Etherscan como fallback
 */
export const getLastTransactions = async ({ accountAddress }: { accountAddress: Address }) => {
	try {
		let mappedResults: MappedTransaction[] = [];

		// Intentar primero con Blockscout
		try {
			mappedResults = await getTransactionsFromBlockscout(accountAddress);

			// Si Blockscout devuelve vacío, intentar con Etherscan
			if (mappedResults.length === 0) {
				mappedResults = await getTransactionsFromEtherscan(accountAddress);
			}
		} catch {
			// Si falla Blockscout, usar Etherscan como fallback
			try {
				mappedResults = await getTransactionsFromEtherscan(accountAddress);
			} catch {
				// Devolver array vacío en lugar de lanzar error
				return [];
			}
		}

		// Procesar las transacciones mapeadas
		const processedTransactions = processTransactions(mappedResults, accountAddress);

		return processedTransactions;
	} catch {
		// Devolver array vacío en lugar de lanzar error para evitar que la UI se rompa
		return [];
	}
};

export const waitForTransactionReceipt = async (hash: Address) => {
	return await publicClient.waitForTransactionReceipt({ hash });
};
