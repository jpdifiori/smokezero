'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MasterButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function MasterButton({ onClick, disabled }: MasterButtonProps) {
    return (
        <div className="relative flex items-center justify-center p-10">
            {/* Minimal Pulse Ring - Heartbeat synchronized */}
            <motion.div
                className="absolute inset-0 rounded-full border border-orange-pulse/20"
                animate={{
                    scale: [1, 1.15, 1.1, 1.25, 1],
                    opacity: [0.3, 0.5, 0.4, 0.6, 0.3],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    times: [0, 0.1, 0.2, 0.3, 1],
                    ease: "easeInOut",
                }}
            />

            {/* Main Button with Heartbeat Pulse */}
            <motion.button
                onClick={onClick}
                disabled={disabled}
                animate={{
                    scale: [1, 1.08, 1.05, 1.12, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    times: [0, 0.1, 0.2, 0.3, 1],
                    ease: "easeInOut",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-orange-pulse text-core-black font-bold text-lg md:text-2xl shadow-[0_0_40px_rgba(255,150,9,0.3)] z-10 flex flex-col items-center justify-center border-2 border-white/10 hover:border-white/30 transition-all duration-500"
            >
                <span className="uppercase tracking-[0.2em] text-[10px] md:text-xs mb-1 opacity-70">Urge?</span>
                <span className="tracking-tighter">RESISTIR</span>
            </motion.button>
        </div>
    );
}
