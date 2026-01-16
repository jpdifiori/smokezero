import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Heart } from 'lucide-react';

interface LifeTimerProps {
    minutes: number;
    cigsPerDay?: number;
}

export const LifeTimer = ({ minutes, cigsPerDay = 20 }: LifeTimerProps) => {
    const [liveMinutes, setLiveMinutes] = useState(minutes);

    useEffect(() => {
        setLiveMinutes(minutes);

        // Rate: (Cigs per day * 11 mins) / ms in a day
        const ratePerMs = (cigsPerDay * 11) / (24 * 60 * 60 * 1000);

        const timer = setInterval(() => {
            setLiveMinutes(prev => prev + (ratePerMs * 100)); // Update every 100ms
        }, 100);

        return () => clearInterval(timer);
    }, [minutes, cigsPerDay]);

    const days = Math.floor(liveMinutes / (24 * 60));
    const hours = Math.floor((liveMinutes % (24 * 60)) / 60);
    const remainingMinutes = Math.floor(liveMinutes % 60);
    const seconds = Math.floor((liveMinutes * 60) % 60);

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 py-4 px-6 rounded-[24px] flex items-center gap-4 group hover:border-[#d1ff74]/20 transition-colors"
        >
            <div className="w-10 h-10 bg-orange-pulse/10 rounded-full flex items-center justify-center">
                <Clock className="text-orange-pulse w-5 h-5 shadow-[0_0_15px_rgba(255,165,0,0.3)] animate-pulse" />
            </div>
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Reserva de Vida</span>
                    <Heart className="w-3 h-3 fill-[#d1ff74] text-[#d1ff74] animate-pulse drop-shadow-[0_0_5px_rgba(209,255,116,0.5)]" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <div className="flex flex-col items-center min-w-[32px]">
                        <span className="text-white text-xl font-mono font-bold leading-none">{days.toString().padStart(2, '0')}</span>
                        <span className="text-[8px] text-white/50 font-mono uppercase mt-1">DD</span>
                    </div>
                    <span className="text-white/20 font-bold mb-4">-</span>
                    <div className="flex flex-col items-center min-w-[32px]">
                        <span className="text-white text-xl font-mono font-bold leading-none">{hours.toString().padStart(2, '0')}</span>
                        <span className="text-[8px] text-white/50 font-mono uppercase mt-1">HH</span>
                    </div>
                    <span className="text-white/20 font-bold mb-4">-</span>
                    <div className="flex flex-col items-center min-w-[32px]">
                        <span className="text-white text-xl font-mono font-bold leading-none">{remainingMinutes.toString().padStart(2, '0')}</span>
                        <span className="text-[8px] text-white/50 font-mono uppercase mt-1">MM</span>
                    </div>
                    <div className="flex flex-col items-start ml-2 pl-2 border-l border-white/5">
                        <span className="text-orange-pulse text-xs font-mono font-bold">{seconds.toString().padStart(2, '0')}s</span>
                        <span className="text-[7px] text-white/50 uppercase tracking-tighter">Live</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
