'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface AuthorityRankProps {
    votes: number;
}

const ranks = [
    { name: 'Iniciado', min: 0, max: 10, color: 'zinc-500' },
    { name: 'Aprendiz', min: 11, max: 30, color: 'blue-400' },
    { name: 'Guerrero', min: 31, max: 100, color: 'orange-pulse' },
    { name: 'Maestro', min: 101, max: 300, color: 'lime-lift' },
    { name: 'Soberano', min: 301, max: Infinity, color: 'white' }
];

export const AuthorityRank = ({ votes }: AuthorityRankProps) => {
    const currentRank = ranks.find(r => votes >= r.min && votes <= r.max) || ranks[0];
    const nextRank = ranks[ranks.indexOf(currentRank) + 1] || currentRank;

    const progress = currentRank.max === Infinity
        ? 100
        : ((votes - currentRank.min) / (currentRank.max - currentRank.min)) * 100;

    return (
        <div className="w-full bg-zinc-900/40 backdrop-blur-sm border border-white/5 p-6 rounded-[32px] space-y-4">
            <div className="flex justify-between items-end">
                <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">Rango de Autoridad</span>
                    <span className={`text-2xl font-serif italic text-${currentRank.color === 'orange-pulse' ? '[#FFB273]' : currentRank.color === 'lime-lift' ? '[#D1FF74]' : currentRank.color}`}>
                        {currentRank.name}
                    </span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest">Votos de Identidad</span>
                    <span className="text-xl font-mono font-bold text-white">{votes}</span>
                </div>
            </div>

            <div className="relative h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`absolute top-0 left-0 h-full bg-${currentRank.color === 'orange-pulse' ? 'orange-pulse' : currentRank.color === 'lime-lift' ? 'lime-lift' : currentRank.color}`}
                />
            </div>

            <div className="flex justify-between items-center text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                <span>{currentRank.name}</span>
                {currentRank.max !== Infinity && (
                    <span>Faltan {currentRank.max - votes + 1} para {nextRank.name}</span>
                )}
            </div>
        </div>
    );
};
