'use client';

import { motion } from 'framer-motion';
import { Target, Sparkles } from 'lucide-react';

interface GoalWidgetProps {
    goal: {
        milestone_days: number;
        goal_name: string;
        target_amount: number;
        goal_image_url: string;
        status: string;
    } | null;
    daysSinceStart: number;
}

export function GoalWidget({ goal, daysSinceStart }: GoalWidgetProps) {
    if (!goal || goal.status !== 'active') return null;

    const daysRemaining = Math.max(0, goal.milestone_days - daysSinceStart);
    const progress = Math.min(100, (daysSinceStart / goal.milestone_days) * 100);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] overflow-hidden group hover:border-lime-lift/20 transition-all duration-500"
        >
            <div className="relative h-48 w-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                {goal.goal_image_url ? (
                    <img
                        src={goal.goal_image_url}
                        alt={goal.goal_name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex flex-col items-center gap-2 text-zinc-600">
                        <Target className="w-12 h-12 opacity-20" />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Sin Imagen Definida</span>
                    </div>
                )}

                {/* Overlay with progress */}
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-core-black via-core-black/60 to-transparent">
                    <div className="flex justify-between items-end">
                        <div>
                            <span className="text-[10px] text-lime-lift uppercase tracking-[0.2em] font-bold block mb-1">Próximo Objetivo</span>
                            <h3 className="text-xl font-serif italic text-white">"{goal.goal_name}"</h3>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-mono font-bold text-white">
                                {Math.ceil(daysRemaining)}
                            </div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">Días Restantes</div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-lime-lift shadow-[0_0_10px_#D1FF74]"
                        />
                    </div>
                </div>

                <div className="absolute top-4 right-4 bg-lime-lift text-core-black p-2 rounded-xl shadow-lg">
                    <Sparkles className="w-4 h-4" />
                </div>
            </div>
        </motion.div>
    );
}
