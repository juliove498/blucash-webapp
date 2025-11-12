import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface HideBalance {
	hideBalance: boolean;
	setHideBalance: (hideBalance: boolean) => void;
	toggleHideBalance: () => void;
}

export const useHideBalanceStore = create<HideBalance>()(
	persist(
		(set) => ({
			hideBalance: false,
			setHideBalance: (hideBalance) => set({ hideBalance }),
			toggleHideBalance: () => set((state) => ({ hideBalance: !state.hideBalance })),
		}),
		{
			name: 'hide-balance-storage',
			storage: createJSONStorage(() => localStorage),
		},
	),
);
