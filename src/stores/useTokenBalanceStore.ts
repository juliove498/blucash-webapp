import { create } from 'zustand';

interface TokenBalanceState {
	tokens: Array<{ token: string; balance: bigint; decimals: number }> | [];
	setTokenBalance: (token: string, balance: bigint, decimals: number) => void;
	clearTokenBalance: () => void;
	getTokens: () => Array<{ token: string; balance: bigint; decimals: number }>;
}

const useTokenBalanceStore = create<TokenBalanceState>((set, get) => ({
	tokens: [],
	setTokenBalance: (token, balance, decimals) =>
		set((state) => ({
			tokens: [...state.tokens.filter((t) => t.token !== token), { token, balance, decimals }],
		})),
	clearTokenBalance: () =>
		set({
			tokens: [],
		}),
	getTokens: () => get().tokens,
}));

export default useTokenBalanceStore;
