import { type ReactNode } from 'react';
import { useHideBalanceStore } from '@/stores/useHideBalance';

interface MaskProps {
  children: ReactNode;
}

export const Mask = ({ children }: MaskProps) => {
  const { hideBalance } = useHideBalanceStore();

  if (hideBalance) {
    return <span>****</span>;
  }

  return <>{children}</>;
};

export default Mask;



