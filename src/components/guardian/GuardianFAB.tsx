'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, X, Send, Sparkles, Heart, Activity, Target, MessageSquare } from 'lucide-react';
import { GuardianChat } from './GuardianChat';

export function GuardianFAB() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* FAB Container with Label */}
            <div className="fixed bottom-6 right-6 z-[1000] flex flex-col items-center gap-2 pointer-events-none">
                <span className="text-[10px] font-bold text-lime-lift uppercase tracking-[0.2em] bg-core-black/80 px-2 py-0.5 rounded-full backdrop-blur-sm border border-lime-lift/20 mb-1 pointer-events-auto">
                    Guardian
                </span>

                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                        scale: [1, 1.05, 1],
                        opacity: 1,
                        rotate: 360,
                        boxShadow: [
                            "0 0 20px rgba(209,255,116,0.3)",
                            "0 0 35px rgba(209,255,116,0.6)",
                            "0 0 20px rgba(209,255,116,0.3)"
                        ]
                    }}
                    transition={{
                        scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" }, // Slower rotation for better UX
                        boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                    }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-core-black border-2 border-lime-lift rounded-full flex items-center justify-center transition-transform group overflow-hidden pointer-events-auto"
                >
                    {/* Living Shine Effect */}
                    <motion.div
                        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent z-10 skew-x-12"
                        animate={{
                            translateX: ['100%']
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 3,
                            ease: "easeOut",
                            repeatDelay: 1
                        }}
                    />

                    <Shield className="w-6 h-6 text-lime-lift group-hover:scale-110 transition-transform relative z-20" />
                    <motion.div
                        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.3, 1] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full border border-lime-lift/30"
                    />
                </motion.button>
            </div>

            {/* Chat Drawer / Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm sm:hidden"
                        />
                        <motion.div
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed bottom-0 left-0 right-0 sm:right-6 sm:left-auto sm:bottom-24 z-[1200] sm:w-[400px] bg-zinc-900 border-t sm:border border-white/10 rounded-t-[32px] sm:rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-[85vh] sm:h-[650px]"
                        >
                            <GuardianChat onClose={() => setIsOpen(false)} />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
