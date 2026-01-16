'use client';

import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

interface DistractionPromptProps {
    question: string;
}

export function DistractionPrompt({ question }: DistractionPromptProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-3xl mx-auto"
        >
            {/* Background Glow */}
            <div className="absolute inset-0 bg-lime-lift/5 blur-[100px] rounded-full" />

            <div className="relative p-6 md:p-12 text-center">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 0.2, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center mb-6"
                >
                    <Quote className="w-10 h-10 text-lime-lift" />
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-lg md:text-2xl font-serif text-white leading-[1.6] tracking-tight italic px-2 md:px-4"
                >
                    {question}
                </motion.p>

                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.8, duration: 1.5 }}
                    className="h-[1px] w-24 bg-gradient-to-r from-transparent via-lime-lift/30 to-transparent mx-auto mt-6"
                />
            </div>
        </motion.div>
    );
}
