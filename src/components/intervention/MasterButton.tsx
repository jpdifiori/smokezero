'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MasterButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function MasterButton({ onClick, disabled }: MasterButtonProps) {
    return (
        <div className="relative flex items-center justify-center p-10">
            {/* Synchronized Estela (Pulse Rings) */}
            <AnimatePresence>
                {[...Array(2)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-orange-pulse/40"
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{
                            scale: [1, 2.8],
                            opacity: [0.6, 0],
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.2, // Synchronized with lub-DUB beat
                            ease: "easeOut",
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Living Glow */}
            <motion.div
                className="absolute inset-0 rounded-full bg-orange-pulse/20 blur-3xl"
                animate={{
                    scale: [1, 1.5, 1.2, 1.6, 1],
                    opacity: [0.2, 0.5, 0.25, 0.6, 0.2],
                }}
                transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    times: [0, 0.05, 0.15, 0.25, 1],
                    ease: "easeInOut",
                }}
            />

            {/* Main Button with Powerful Double Thump */}
            <motion.button
                onClick={onClick}
                disabled={disabled}
                animate={{
                    scale: [1, 1.15, 1.08, 1.25, 1],
                }}
                transition={{
                    duration: 1.8,
                    repeat: Infinity,
                    times: [0, 0.05, 0.15, 0.25, 1],
                    ease: "easeInOut",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-orange-pulse text-core-black font-extrabold text-lg md:text-2xl shadow-[0_0_80px_rgba(255,150,9,0.5)] z-10 flex flex-col items-center justify-center border-4 border-white/20 hover:border-white transition-all duration-300 relative overflow-hidden"
            >
                {/* Internal Glow Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />

                <span className="relative uppercase tracking-widest text-[10px] md:text-xs mb-1 opacity-80 font-bold">Urge?</span>
                <span className="relative tracking-tighter">RESISTIR</span>
                <div className="absolute bottom-4 w-4 h-[2px] bg-core-black/20 rounded-full" />
            </motion.button>
        </div>
    );
}
