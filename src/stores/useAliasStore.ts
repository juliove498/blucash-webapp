import { create } from 'zustand';

interface AliasState {
	alias: string | null;
	setAlias: (alias: string) => void;
	clearAlias: () => void;
}

export const useAliasStore = create<AliasState>((set) => ({
	alias: null,
	setAlias: (alias) => set({ alias }),
	clearAlias: () => set({ alias: null }),
}));
