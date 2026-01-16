'use client';

import { motion } from 'framer-motion';

interface MasterButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function MasterButton({ onClick, disabled }: MasterButtonProps) {
    return (
        <div className="relative flex items-center justify-center p-10">
            {/* Estela Effect (Atmospheric Rings) */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border border-orange-pulse/20"
                    initial={{ scale: 1, opacity: 0.3 }}
                    animate={{
                        scale: [1, 1.8 + i * 0.3],
                        opacity: [0.3, 0],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        delay: i * 1.3,
                        ease: "easeOut",
                    }}
                />
            ))}

            {/* Living Core Glow */}
            <motion.div
                className="absolute inset-0 rounded-full bg-orange-pulse/10 blur-3xl"
                animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Main Button with Powerful Pulse */}
            <motion.button
                onClick={onClick}
                disabled={disabled}
                animate={{
                    scale: [1, 1.08, 0.98, 1.05, 1],
                }}
                transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    times: [0, 0.05, 0.15, 0.25, 1],
                    ease: "easeInOut",
                }}
                whileHover={{ scale: 1.1, transition: { duration: 0.3 } }}
                whileTap={{ scale: 0.95 }}
                className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-orange-pulse text-core-black font-bold text-lg md:text-2xl shadow-[0_0_50px_rgba(255,150,9,0.2)] z-10 flex flex-col items-center justify-center border-2 border-white/10 hover:border-white/40 shadow-inner group transition-all duration-700"
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />
                <span className="relative uppercase tracking-[0.3em] text-[10px] md:text-xs mb-1 opacity-70 group-hover:opacity-100 transition-opacity">Urge?</span>
                <span className="relative tracking-tighter">RESISTIR</span>
            </motion.button>
        </div>
    );
}
