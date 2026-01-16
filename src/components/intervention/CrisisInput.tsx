'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Shield, Activity, Armchair, Skull } from 'lucide-react';

export type ActionCapacity = 'MOVEMENT' | 'STATIC';
export type SocialContext = 'SOLO' | 'PUBLIC' | 'SMOKERS';
export type Emotion = 'STRESS' | 'BOREDOM' | 'SOCIAL_PRESSURE';

export interface CrisisContext {
    actionCapacity: ActionCapacity;
    socialContext: SocialContext;
    emotion: Emotion;
}

interface CrisisInputProps {
    onConfirm: (context: CrisisContext) => void;
}

export function CrisisInput({ onConfirm }: CrisisInputProps) {
    const [actionCapacity, setActionCapacity] = useState<ActionCapacity>('STATIC');
    const [socialContext, setSocialContext] = useState<SocialContext>('SOLO');
    const [emotion, setEmotion] = useState<Emotion>('STRESS');

    const handleSubmit = () => {
        onConfirm({ actionCapacity, socialContext, emotion });
    };

    return (
        <div className="w-full max-w-md mx-auto flex flex-col gap-4 md:gap-6 px-2 md:px-4 pb-4 pt-0">

            {/* 1. Action Capacity */}
            <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1">Capacidad de Acción</span>
                <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setActionCapacity('STATIC')}
                        className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${actionCapacity === 'STATIC' ? 'bg-white/10 text-white shadow-lg border border-white/10' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        <Armchair className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Estático</span>
                    </button>
                    <button
                        onClick={() => setActionCapacity('MOVEMENT')}
                        className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${actionCapacity === 'MOVEMENT' ? 'bg-orange-pulse/20 text-orange-pulse shadow-lg border border-orange-pulse/20' : 'text-zinc-600 hover:text-zinc-400'}`}
                    >
                        <Activity className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Movimiento</span>
                    </button>
                </div>
            </div>

            {/* 2. Social Context */}
            <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1">Entorno Social</span>
                <div className="grid grid-cols-3 gap-2">
                    {[
                        { id: 'SOLO', label: 'Solo', icon: Shield },
                        { id: 'PUBLIC', label: 'Público', icon: Users },
                        { id: 'SMOKERS', label: 'Fumadores', icon: Skull }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setSocialContext(item.id as SocialContext)}
                            className={`flex flex-col items-center gap-2 py-3 md:py-4 rounded-2xl border transition-all ${socialContext === item.id ? 'bg-white/10 border-white/20 text-white' : 'bg-transparent border-white/5 text-zinc-600 hover:bg-white/5'}`}
                        >
                            <item.icon className="w-4 h-4" />
                            <span className="text-[10px] uppercase font-bold tracking-wider">{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Emotion / Trigger */}
            <div className="flex flex-col gap-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1">Detonante Principal</span>
                <div className="flex flex-wrap gap-1.5 justify-between">
                    {[
                        { id: 'STRESS', label: 'Estrés' },
                        { id: 'BOREDOM', label: 'Aburrimiento' },
                        { id: 'SOCIAL_PRESSURE', label: 'Presión' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setEmotion(item.id as Emotion)}
                            className={`flex-1 px-1 py-3 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${emotion === item.id ? 'bg-lime-lift text-core-black border-lime-lift' : 'bg-transparent border-white/10 text-zinc-500 hover:border-white/20'}`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Confirm Action */}
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSubmit}
                className="mt-4 w-full bg-white text-core-black py-4 md:py-5 rounded-full text-sm font-bold uppercase tracking-[0.2em] shadow-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
                <Shield className="w-4 h-4" />
                Generar Escudo
            </motion.button>

        </div>
    );
}
