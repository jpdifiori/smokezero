'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Lock, CheckCircle2, Image as ImageIcon, Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSavingsGoals, updateSavingsGoal } from '@/app/actions';
import { useRef } from 'react';

export function StaircaseGrid() {
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingGoal, setEditingGoal] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchGoals = async () => {
        const data = await getSavingsGoals();
        setGoals(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollAmount = clientWidth * 0.8;
            const scrollTo = direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const handleSave = async (milestone: number, updates: any) => {
        await updateSavingsGoal(milestone, updates);
        setEditingGoal(null);
        fetchGoals();
    };

    if (loading) return null;

    return (
        <section className="w-full mt-12 mb-20 px-4">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-lime-lift/10 rounded-xl flex items-center justify-center">
                        <Trophy className="text-lime-lift w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white uppercase tracking-tighter">Mi Escalera de Libertad</h2>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">Hitos de Victoria Secuenciales</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => scroll('left')}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-5 h-5 text-white/50" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                        aria-label="Siguiente"
                    >
                        <ChevronRight className="w-5 h-5 text-white/50" />
                    </button>
                </div>
            </div>

            <div className="relative w-full">
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto pb-8 pt-2 px-2 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {goals.map((goal, index) => (
                        <div key={goal.milestone_days} className="flex-none w-[200px] md:w-[240px] snap-center">
                            <MilestoneCard
                                goal={goal}
                                onEdit={() => goal.status === 'active' && setEditingGoal(goal)}
                            />
                        </div>
                    ))}
                </div>

                {/* Gradient Fades for Carousel indicators */}
                <div className="absolute top-0 right-0 bottom-8 w-20 bg-gradient-to-l from-core-black to-transparent pointer-events-none z-10" />
                <div className="absolute top-0 left-0 bottom-8 w-20 bg-gradient-to-r from-core-black to-transparent pointer-events-none z-10" />
            </div>

            <AnimatePresence>
                {editingGoal && (
                    <GoalEditModal
                        goal={editingGoal}
                        onClose={() => setEditingGoal(null)}
                        onSave={handleSave}
                    />
                )}
            </AnimatePresence>
        </section>
    );
}

function MilestoneCard({ goal, onEdit }: { goal: any, onEdit: () => void }) {
    const isLocked = goal.status === 'locked';
    const isActive = goal.status === 'active';
    const isAchieved = goal.status === 'achieved';

    return (
        <motion.div
            whileHover={isActive ? { y: -5 } : {}}
            onClick={onEdit}
            className={`
                relative p-4 md:p-6 rounded-[28px] md:rounded-[32px] border transition-all cursor-default
                ${isActive ? 'bg-zinc-900 border-lime-lift/40 shadow-[0_0_30px_rgba(209,255,116,0.1)] cursor-pointer' : ''}
                ${isAchieved ? 'bg-zinc-900/50 border-white/10 opacity-80' : ''}
                ${isLocked ? 'bg-transparent border-white/5 opacity-40' : ''}
            `}
        >
            <div className="flex flex-col items-center text-center gap-4">
                <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center
                    ${isActive ? 'bg-lime-lift text-core-black' : 'bg-zinc-800 text-zinc-500'}
                    ${isAchieved ? 'bg-white/10 text-lime-lift' : ''}
                `}>
                    {isAchieved ? <CheckCircle2 className="w-6 h-6" /> : (isLocked ? <Lock className="w-5 h-5" /> : <Sparkles className="w-6 h-6" />)}
                </div>

                <div>
                    <span className="text-2xl font-mono font-bold block">Día {goal.milestone_days}</span>
                    <span className="text-[10px] uppercase tracking-widest font-bold text-zinc-500">
                        {isAchieved ? 'Conquistado' : (isActive ? 'En la Mira' : 'Bloqueado')}
                    </span>
                </div>

                {goal.goal_name && (
                    <div className="pt-2 border-t border-white/5 w-full">
                        <p className="text-xs font-serif italic text-white line-clamp-1">"{goal.goal_name}"</p>
                        <p className="text-[10px] font-mono text-lime-lift mt-1">${goal.target_amount}</p>
                    </div>
                )}

                {isActive && !goal.goal_name && (
                    <div className="text-[10px] text-zinc-400 uppercase tracking-wider animate-pulse">
                        Click para Definir Meta
                    </div>
                )}
            </div>
        </motion.div>
    );
}

function GoalEditModal({ goal, onClose, onSave }: { goal: any, onClose: () => void, onSave: (m: number, u: any) => void }) {
    const [name, setName] = useState(goal.goal_name || '');
    const [amount, setAmount] = useState(goal.target_amount || '');
    const [significance, setSignificance] = useState(goal.significance || '');

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-core-black/60"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[32px] md:rounded-[40px] p-6 md:p-8 relative overflow-hidden shadow-2xl"
            >
                <button onClick={onClose} className="absolute right-6 top-6 text-zinc-500 hover:text-white">
                    <X className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-lime-lift/10 rounded-xl flex items-center justify-center">
                        <Sparkles className="text-lime-lift w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tighter">Hito: Día {goal.milestone_days}</h3>
                        <p className="text-xs text-zinc-500 uppercase tracking-widest">
                            {goal.goal_name ? 'Ajusta tu compromiso' : 'Define tu próximo premio de libertad'}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-2 block ml-1">¿Qué te vas a regalar?</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Cena de gala"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-white/20 transition-all font-serif italic"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-2 block ml-1">Inversión ($)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-white/20 transition-all font-mono"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold mb-2 block ml-1">¿Por qué es importante para ti?</label>
                        <textarea
                            value={significance}
                            onChange={(e) => setSignificance(e.target.value)}
                            placeholder="Describe el valor emocional de este hito..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm focus:outline-none focus:border-white/20 transition-all font-normal leading-relaxed resize-none"
                        />
                        <p className="text-[9px] text-zinc-600 mt-2 ml-1 italic">Este motivo será usado por tu IA para darte fuerza en momentos críticos.</p>
                    </div>

                    <button
                        onClick={() => onSave(goal.milestone_days, {
                            goal_name: name,
                            target_amount: parseFloat(amount),
                            significance: significance
                        })}
                        disabled={!name || !amount || !significance}
                        className="w-full bg-lime-lift text-core-black font-bold py-5 rounded-2xl uppercase tracking-widest text-xs hover:scale-[1.02] transition-all disabled:opacity-20 flex items-center justify-center gap-2"
                    >
                        {goal.goal_name ? 'Guardar Ajustes' : 'Activar Meta'} <Sparkles className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
