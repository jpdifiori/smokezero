'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ResistanceTimerProps {
    duration: number; // seconds (180)
    onComplete: () => void;
    initialMission?: string;
}

const MISSIONS = [
    "Haz 10 flexiones de pecho ahora mismo.",
    "Bebe un vaso grande de agua fría.",
    "Escribe 3 cosas por las que estás agradecido.",
    "Respira profundo 4-7-8.",
    "Llama a alguien que te inspire.",
    "Sal a caminar y mira el cielo.",
];

export function ResistanceTimer({ duration, onComplete, initialMission }: ResistanceTimerProps) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [currentMission, setCurrentMission] = useState(initialMission || MISSIONS[0]);

    useEffect(() => {
        if (initialMission) {
            setCurrentMission(initialMission);
        } else {
            setCurrentMission(MISSIONS[Math.floor(Math.random() * MISSIONS.length)]);
        }
    }, [initialMission]);

    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete();
            return;
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timeLeft, onComplete]);

    // Rotate mission every 60s
    useEffect(() => {
        if (timeLeft % 60 === 0 && timeLeft !== duration && timeLeft > 0) {
            setCurrentMission(MISSIONS[Math.floor(Math.random() * MISSIONS.length)]);
        }
    }, [timeLeft, duration]);

    const progress = ((duration - timeLeft) / duration) * 100;

    return (
        <div className="flex flex-col items-center space-y-6 md:space-y-8 w-full max-w-md mx-auto">
            {/* Timer Circle */}
            <div className="relative w-56 h-56 md:w-64 md:h-64 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                    <circle
                        cx="112" cy="112" r="108"
                        className="stroke-white/10 fill-none stroke-[6] md:stroke-[8]"
                    />
                    <motion.circle
                        cx="112" cy="112" r="108"
                        className="stroke-lime-lift fill-none stroke-[6] md:stroke-[8]"
                        strokeDasharray="678.58" // 2 * pi * 108
                        strokeDashoffset={678.58 - (678.58 * progress) / 100}
                        initial={{ strokeDashoffset: 678.58 }}
                        animate={{ strokeDashoffset: 678.58 - (678.58 * progress) / 100 }}
                        transition={{ duration: 1, ease: "linear" }}
                    />
                </svg>
                {/* Fallback for different sizes or simpler path calculation */}
                <div className="md:hidden">
                    <svg className="absolute inset-0 w-full h-full -rotate-90 hidden prose">
                        {/* Hidden to keep logic clean but available if needed later for explicit md break */}
                    </svg>
                </div>
                <div className="relative z-10 text-center">
                    <div className="text-5xl md:text-6xl font-mono text-white font-bold tracking-tighter">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                    <p className="text-white/50 text-sm mt-2 uppercase tracking-widest">Resiste</p>
                </div>
            </div>

            {/* Mission Card */}
            <motion.div
                key={currentMission}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900 rounded-xl p-6 border border-white/10 w-full text-center shadow-2xl"
            >
                <h4 className="text-orange-pulse text-xs uppercase tracking-widest font-bold mb-2">Micro-Misión</h4>
                <p className="text-white text-lg font-serif italic">"{currentMission}"</p>
            </motion.div>
        </div>
    );
}
