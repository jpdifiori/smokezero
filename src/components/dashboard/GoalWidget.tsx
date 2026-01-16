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
            className="w-full bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[24px] p-4 group hover:border-lime-lift/20 transition-all duration-500 relative"
        >
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-lime-lift/10 flex items-center justify-center border border-lime-lift/20">
                        <Target className="w-4 h-4 text-lime-lift" />
                    </div>
                    <div>
                        <span className="text-[10px] text-lime-lift uppercase tracking-[0.2em] font-bold block">Próximo Objetivo</span>
                        <h3 className="text-base md:text-lg font-serif italic text-white/90">"{goal.goal_name}"</h3>
                    </div>
                </div>

                <div className="text-right">
                    <div className="flex items-baseline gap-1 justify-end">
                        <span className="text-lg font-mono font-bold text-white">{Math.ceil(daysRemaining)}</span>
                        <span className="text-[8px] text-zinc-500 uppercase tracking-widest">Días</span>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-lime-lift shadow-[0_0_10px_rgba(209,255,116,0.5)]"
                />
            </div>

            <div className="absolute top-2 right-2 opacity-20">
                <Sparkles className="w-2 h-2 text-lime-lift" />
            </div>
        </motion.div>
    );
}
