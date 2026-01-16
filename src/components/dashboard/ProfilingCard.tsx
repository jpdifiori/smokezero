'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, BrainCircuit } from 'lucide-react';
import { getProfilingQuestion, saveProfilingAnswer } from '@/app/actions';

interface ProfilingCardProps {
    onComplete: () => void;
}

export function ProfilingCard({ onComplete }: ProfilingCardProps) {
    const [data, setData] = useState<{ question: string, category: string } | null>(null);
    const [answer, setAnswer] = useState('');
    const [status, setStatus] = useState<'loading' | 'idle' | 'pending' | 'success'>('loading');

    useEffect(() => {
        const fetchQuestion = async () => {
            const questionData = await getProfilingQuestion();
            setData(questionData);
            setStatus('idle');
        };
        fetchQuestion();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim() || status === 'pending' || !data) return;

        setStatus('pending');
        try {
            const result = await saveProfilingAnswer(data.category, answer);
            if (result.success) {
                setStatus('success');
                setTimeout(() => {
                    onComplete();
                }, 2000);
            } else if (result.error) {
                console.error('Profiling Action Error:', result.error);
                setStatus('idle');
                alert(result.error); // Basic feedback for now
            }
        } catch (error) {
            console.error('Error saving profiling answer:', error);
            setStatus('idle');
        }
    };

    if (status === 'loading') {
        return (
            <div className="w-full bg-zinc-900/40 p-8 rounded-[32px] border border-white/5 backdrop-blur-xl flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Conectando con tu Perfil...</span>
            </div>
        );
    }

    if (!data) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-zinc-900/40 p-8 rounded-[32px] border border-white/10 backdrop-blur-xl shadow-2xl relative overflow-hidden"
        >
            {/* Background Icon */}
            <BrainCircuit className="absolute -right-4 -bottom-4 w-32 h-32 text-white/[0.02]" />

            <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 mb-4 bg-white/5 py-1 px-3 rounded-full border border-white/5">
                    <Sparkles className="w-3 h-3 text-lime-lift" />
                    <span className="text-[10px] text-zinc-400 uppercase tracking-[0.2em] font-bold">
                        Perfil de Libertad: {data.category}
                    </span>
                </div>

                <h3 className="text-xl font-serif italic mb-8 px-4">
                    "{data.question}"
                </h3>

                <AnimatePresence mode="wait">
                    {status !== 'success' ? (
                        <motion.form
                            key="input"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit}
                            className="w-full relative"
                        >
                            <input
                                type="text"
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                disabled={status === 'pending'}
                                placeholder="Escribe tu respuesta aquí..."
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pr-14 text-sm focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-600 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={status === 'pending' || !answer.trim()}
                                className="absolute right-2 top-2 p-3 bg-white text-core-black rounded-xl hover:bg-zinc-200 transition-all disabled:opacity-20 shadow-lg"
                            >
                                {status === 'pending' ? (
                                    <div className="w-5 h-5 border-2 border-core-black/20 border-t-core-black rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </motion.form>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center p-4 gap-2 text-lime-lift"
                        >
                            <div className="w-12 h-12 bg-lime-lift/20 rounded-full flex items-center justify-center mb-2">
                                <Sparkles className="w-6 h-6 animate-pulse" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-widest">Rasgo Extraído</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-medium italic">Tu perfil evoluciona...</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}
