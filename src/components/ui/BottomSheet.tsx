import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef, useImperativeHandle, useState, type ReactNode } from 'react';

interface BottomSheetProps {
  children: ReactNode;
  snapPoints?: string[];
}

export interface BottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

export const BottomSheet = forwardRef<BottomSheetRef, BottomSheetProps>(
  ({ children }, ref) => {
    const [isOpen, setIsOpen] = useState(false);

    useImperativeHandle(ref, () => ({
      present: () => setIsOpen(true),
      dismiss: () => setIsOpen(false),
    }));

    return (
      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <AnimatePresence>
            {isOpen && (
              <>
                {/* Overlay */}
                <Dialog.Overlay asChild>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-40"
                  />
                </Dialog.Overlay>

                {/* Content */}
                <Dialog.Content asChild>
                  <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 max-h-[85vh] overflow-y-auto"
                  >
                    {/* Handle bar */}
                    <div className="flex justify-center pt-4 pb-2">
                      <div className="w-12 h-1 bg-gray-300 rounded-full" />
                    </div>

                    {/* Content */}
                    <div className="px-6 pb-6">{children}</div>
                  </motion.div>
                </Dialog.Content>
              </>
            )}
          </AnimatePresence>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);

BottomSheet.displayName = 'BottomSheet';



