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
                className="absolute inset-0 rounded-full bg-orange-pulse/20 blur-xl"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Main Button */}
            <motion.button
                onClick={onClick}
                disabled={disabled}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-40 h-40 md:w-48 md:h-48 rounded-full bg-orange-pulse text-core-black font-bold text-xl md:text-2xl shadow-lg z-10 flex flex-col items-center justify-center border-4 border-orange-pulse/50 hover:border-white/50 transition-colors"
            >
                <span className="uppercase tracking-widest text-xs md:text-sm mb-1 opacity-80">Urge?</span>
                <span>RESISTIR</span>
            </motion.button>
        </div>
    );
}
