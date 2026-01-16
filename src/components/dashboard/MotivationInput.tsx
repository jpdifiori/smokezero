'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, Trophy, Target, Sparkles } from 'lucide-react';
import { saveMotivation } from '@/app/actions';

interface MotivationInputProps {
    onSuccess?: (category: string, entity: string) => void;
    placeholder?: string;
    variant?: 'minimal' | 'full';
}

export function MotivationInput({ onSuccess, placeholder, variant = 'minimal' }: MotivationInputProps) {
    const [text, setText] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || isPending) return;

        setIsPending(true);
        try {
            const result = await saveMotivation(text);
            if (result.success) {
                setIsSuccess(true);
                setTimeout(() => {
                    if (onSuccess && result.category && result.entity_name) {
                        onSuccess(result.category, result.entity_name);
                    }
                    setText('');
                    setIsSuccess(false);
                }, 2000);
            }
        } catch (error) {
            console.error('Error saving motivation:', error);
        } finally {
            setIsPending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full max-w-sm mx-auto ${variant === 'full' ? 'bg-zinc-900/40 p-6 rounded-[32px] border border-white/5 backdrop-blur-xl' : ''}`}
        >
            <form onSubmit={handleSubmit} className="relative">
                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.div
                            key="input"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative flex items-center"
                        >
                            <input
                                type="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                disabled={isPending}
                                placeholder={placeholder || "¿Por quién o qué resistís?"}
                                className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 pr-12 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-600 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={isPending || !text.trim()}
                                className="absolute right-2 p-2 bg-white text-core-black rounded-full hover:bg-zinc-200 transition-all disabled:opacity-20 disabled:hover:bg-white"
                            >
                                {isPending ? (
                                    <div className="w-4 h-4 border-2 border-core-black/20 border-t-core-black rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-3 px-6 py-3 bg-lime-lift/10 text-lime-lift rounded-full border border-lime-lift/20"
                        >
                            <Sparkles className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-widest">Memoria Guardada</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </form>

            {variant === 'full' && (
                <div className="mt-4 flex gap-4 justify-center">
                    <div className="flex flex-col items-center gap-1 opacity-40">
                        <Heart className="w-4 h-4" />
                        <span className="text-[8px] uppercase font-bold tracking-tighter">Familia</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-40">
                        <Trophy className="w-4 h-4" />
                        <span className="text-[8px] uppercase font-bold tracking-tighter">Deporte</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 opacity-40">
                        <Target className="w-4 h-4" />
                        <span className="text-[8px] uppercase font-bold tracking-tighter">Metas</span>
                    </div>
                </div>
            )}
        </motion.div>
    );
}
