'use client';

import { motion } from 'framer-motion';

interface MasterButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function MasterButton({ onClick, disabled }: MasterButtonProps) {
    return (
        <div className="relative flex items-center justify-center p-10">
            {/* Pulse Effect */}
            <motion.div
                className="absolute inset-0 rounded-full bg-orange-pulse/5 blur-3xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.25, 0.1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Main Button with Heartbeat */}
            <motion.button
                onClick={onClick}
                disabled={disabled}
                animate={{
                    scale: [1, 1.02, 1, 1.03, 1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    times: [0, 0.1, 0.2, 0.3, 1],
                    ease: "easeInOut",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-orange-pulse text-core-black font-bold text-lg md:text-2xl shadow-[0_0_35px_rgba(255,128,0,0.2)] z-10 flex flex-col items-center justify-center border-2 border-white/5 hover:border-white/20 transition-all duration-700"
            >
                <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs mb-1 opacity-70">Urge?</span>
                <span className="tracking-tighter">RESISTIR</span>
            </motion.button>
        </div>
    );
}
