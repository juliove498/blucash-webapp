import { create } from 'zustand';

interface SmartWalletKey {
	key: number;
	incrementKey: () => void;
	clearKey: () => void;
}

export const useSmartWalletKeyStore = create<SmartWalletKey>((set) => ({
	key: 0,
	incrementKey: () => set((state) => ({ key: state.key + 1 })),
	clearKey: () => set({ key: 0 }),
}));
