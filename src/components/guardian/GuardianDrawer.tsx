'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { GuardianChat } from './GuardianChat';
import { useGuardian } from './GuardianContext';

export function GuardianDrawer() {
    const { isGuardianOpen, closeGuardian } = useGuardian();

    return (
        <AnimatePresence>
            {isGuardianOpen && (
                <>
                    {/* Backdrop for Mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeGuardian}
                        className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm sm:hidden"
                    />

                    {/* Chat Container */}
                    <motion.div
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 left-0 right-0 sm:right-6 sm:left-auto sm:bottom-24 z-[1200] sm:w-[400px] bg-zinc-900 border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[650px] pointer-events-auto"
                    >
                        <GuardianChat onClose={closeGuardian} />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
