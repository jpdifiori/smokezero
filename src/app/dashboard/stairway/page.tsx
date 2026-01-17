'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStats } from '@/providers/StatsProvider';
import { getSavingsGoals } from '@/app/actions';
import { StaircaseGrid } from '@/components/dashboard/StaircaseGrid';
import { GoalWidget } from '@/components/dashboard/GoalWidget';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function StairwayPage() {
    const [goals, setGoals] = useState<any[]>([]);
    const [activeGoal, setActiveGoal] = useState<any>(null);
    const { config, loading } = useStats();

    useEffect(() => {
        if (!loading && config) {
            getSavingsGoals().then(allGoals => {
                setGoals(allGoals);
                setActiveGoal(allGoals.find(g => g.status === 'active'));
            });
        }
    }, [config, loading]);

    if (loading) {
        return <div className="min-h-screen bg-core-black text-white flex items-center justify-center">Loading...</div>;
    }

    return (
        <main className="min-h-screen bg-core-black text-white pb-24 overflow-y-auto relative">
            {/* Immersive Background */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lime-lift/5 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-pulse/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] bg-repeat" />
            </div>

            <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-8 pt-12 md:pt-16">
                {/* Immersive Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
                    <div className="flex flex-col gap-4">
                        <Link
                            href="/dashboard"
                            className="w-fit flex items-center gap-2 text-zinc-500 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Volver al Dashboard</span>
                        </Link>

                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <div className="w-8 h-8 md:w-10 md:h-10 bg-lime-lift/10 rounded-xl flex items-center justify-center border border-lime-lift/20">
                                    <TrendingUp className="text-lime-lift w-5 h-5" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white">
                                    Mi Escalera
                                </h1>
                            </div>
                            <p className="text-sm text-zinc-500 uppercase tracking-[0.3em] font-mono ml-1">
                                Construyendo tu Libertad <span className="text-lime-lift/50">libre de humo</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-1 px-4 py-3 bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm">
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Estado Actual</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-lime-lift animate-pulse" />
                            <span className="text-lg font-mono font-bold text-white uppercase italic tracking-tight">Día {Math.ceil((new Date().getTime() - new Date(config?.manifesto_accepted_at || new Date()).getTime()) / (1000 * 60 * 60 * 24))}</span>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="w-full">
                    {/* The Staircase Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative"
                    >
                        <div className="bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[40px] p-2 md:p-4 overflow-hidden shadow-2xl">
                            {/* Inside we use the existing StaircaseGrid but we might need to style it to be more edge-to-edge if the component allows */}
                            <StaircaseGrid hideHeader={true} />
                        </div>

                        {/* Decorative background glow for the grid */}
                        <div className="absolute -inset-4 bg-lime-lift/5 blur-3xl rounded-full -z-10 opacity-50" />
                    </motion.div>

                    {/* Footer Info or Future Legend */}
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <h4 className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-2">Hito Conquistado</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed italic font-serif">"Tus victorias pasadas son la base de tu nueva identidad."</p>
                        </div>
                        <div className="p-6 bg-lime-lift/5 rounded-3xl border border-lime-lift/10">
                            <h4 className="text-[10px] text-lime-lift uppercase tracking-widest font-bold mb-2">Siguiente Escalón</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed italic font-serif">"Define premios que valgan el sacrificio de la resistencia."</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <h4 className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold mb-2">Bloqueado</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed italic font-serif">"La libertad se gana día tras día, decisión tras decisión."</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
