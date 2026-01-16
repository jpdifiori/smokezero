'use client';

import { motion } from 'framer-motion';

interface MasterButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function MasterButton({ onClick, disabled }: MasterButtonProps) {
    return (
        <div className="relative flex items-center justify-center p-10">
            {/* Estela Effect (Multiple Rings) */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full bg-orange-pulse/10 border border-orange-pulse/20"
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{
                        scale: 1.5 + i * 0.2,
                        opacity: 0,
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 1,
                        ease: "easeOut",
                    }}
                />
            ))}

            {/* Core Glow (Heartbeat synchronized) */}
            <motion.div
                className="absolute inset-0 rounded-full bg-orange-pulse/10 blur-3xl"
                animate={{
                    scale: [1, 1.15, 1.05, 1.3, 1],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    times: [0, 0.1, 0.15, 0.3, 1],
                    ease: "easeInOut",
                }}
            />

            {/* Main Button with Rhythmic Heartbeat */}
            <motion.button
                onClick={onClick}
                disabled={disabled}
                animate={{
                    scale: [1, 1.04, 1.01, 1.06, 1],
                }}
                transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    times: [0, 0.1, 0.15, 0.3, 1],
                    ease: "easeInOut",
                }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-orange-pulse text-core-black font-bold text-lg md:text-2xl shadow-[0_0_50px_rgba(255,150,9,0.3)] z-10 flex flex-col items-center justify-center border-2 border-white/10 hover:border-white/30 transition-all duration-300"
            >
                <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs mb-1 opacity-70">Urge?</span>
                <span className="tracking-tighter">RESISTIR</span>
            </motion.button>
        </div>
    );
}
