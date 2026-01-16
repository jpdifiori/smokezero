'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface MasterButtonProps {
    onClick: () => void;
    disabled?: boolean;
}

export function MasterButton({ onClick, disabled }: MasterButtonProps) {
    return (
        <div className="relative flex items-center justify-center p-10">
            {/* Flame Rings (Closer, flickering) */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-orange-pulse/40 mix-blend-screen"
                    animate={{
                        scale: [1, 1.3, 1.1, 1.4, 1],
                        opacity: [0.4, 0.8, 0.3, 0.6, 0.4],
                        rotate: [0, 5, -5, 3, 0],
                        borderRadius: ["50%", "45%", "52%", "48%", "50%"],
                    }}
                    transition={{
                        duration: 2 + i * 0.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Core Fire Glow */}
            <motion.div
                className="absolute inset-0 rounded-full bg-orange-pulse/30 blur-2xl mix-blend-screen"
                animate={{
                    scale: [1, 1.25, 1.1, 1.3, 1],
                    opacity: [0.3, 0.6, 0.4, 0.7, 0.3],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    times: [0, 0.1, 0.2, 0.4, 1],
                }}
            />

            {/* Internal "Lava" Pulse */}
            <motion.div
                className="absolute inset-4 rounded-full bg-orange-pulse/20 blur-xl"
                animate={{
                    scale: [1, 1.1, 0.9, 1.2, 1],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Main Button with Powerful Flame Beat */}
            <motion.button
                onClick={onClick}
                disabled={disabled}
                animate={{
                    scale: [1, 1.08, 1.02, 1.12, 1],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    times: [0, 0.1, 0.2, 0.4, 1],
                    ease: "easeInOut",
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-orange-pulse text-core-black font-extrabold text-lg md:text-2xl shadow-[0_0_80px_rgba(255,150,9,0.7)] z-10 flex flex-col items-center justify-center border-4 border-white/30 hover:border-white transition-all duration-300 relative overflow-hidden group"
            >
                {/* Internal Fire Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent pointer-events-none opacity-50 group-hover:opacity-80 transition-opacity" />

                <span className="relative uppercase tracking-widest text-[10px] md:text-xs mb-1 opacity-80 font-bold">Urge?</span>
                <span className="relative tracking-tighter">RESISTIR</span>

                {/* Button Base Gloss */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3/4 h-1/4 bg-white/10 rounded-full blur-sm" />
            </motion.button>
        </div>
    );
}
