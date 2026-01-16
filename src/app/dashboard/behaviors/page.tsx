'use client';

import { useEffect, useState } from 'react';
import { getBehaviorAnalytics } from '@/app/actions';
import { TriggerRadar } from '@/components/behaviors/TriggerRadar';
import { VulnerabilityMap } from '@/components/behaviors/VulnerabilityMap';
import { AIInsightCard } from '@/components/behaviors/AIInsightCard';
import { ArrowLeft, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BehaviorsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            setLoading(true);
            const res = await getBehaviorAnalytics();
            setData(res);
            setLoading(false);
        }
        load();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-black p-6 flex flex-col items-center justify-center text-center">
                <h1 className="text-white text-xl font-bold mb-2">Sin Datos Suficientes</h1>
                <p className="text-zinc-500 max-w-xs mb-6">Necesitas registrar más eventos para que el oráculo pueda leer tus patrones.</p>
                <Link href="/dashboard" className="text-white underline text-sm">Volver al Dashboard</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white px-6 pt-24 pb-24 font-sans max-w-lg mx-auto">
            <header className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-serif font-bold tracking-tight">Comportamientos</h1>
                    <p className="text-zinc-400 text-xs uppercase tracking-widest mt-1">Inteligencia Predictiva</p>
                </div>
                <Link
                    href="/dashboard"
                    className="p-2 -mr-2 bg-zinc-900/50 hover:bg-zinc-800 rounded-full transition-colors border border-white/5"
                >
                    <X className="w-5 h-5 text-zinc-300 hover:text-white transition-colors" />
                </Link>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6 w-full"
            >
                {/* Section 1: Radar */}
                <section className="bg-zinc-950 border border-white/10 rounded-[32px] p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Radar de Disparadores</h2>
                        <span className="text-[10px] bg-orange-500/10 text-orange-400 px-2 py-1 rounded-full border border-orange-500/20">Origen del Deseo</span>
                    </div>
                    <TriggerRadar data={data.radarData} />
                </section>

                {/* Section 2: Chrono-Density */}
                <section className="bg-zinc-950 border border-white/10 rounded-[32px] p-6 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2 relative z-10">
                        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">Mapa de Vulnerabilidad</h2>
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">Ritmo Circadiano</span>
                    </div>
                    <VulnerabilityMap data={data.timelineData} />
                </section>

                {/* Section 3: Oracle */}
                <AIInsightCard prediction={data.aiPrediction} />

            </motion.div>
        </div>
    );
}
