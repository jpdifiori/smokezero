'use client';

import { motion } from 'framer-motion';
import { Trophy, Shield, Brain, ChevronRight } from 'lucide-react';
import { saveIdentity } from '@/app/auth/actions';
import { useState, useTransition } from 'react';

const identities = [
    {
        id: 'Atleta',
        title: 'Atleta',
        description: 'Tu cuerpo es un templo de alto rendimiento. Cada bocanada de aire es combustible para tu victoria.',
        icon: Trophy,
        color: 'k-blue',
        accent: 'blue-500',
    },
    {
        id: 'Protector',
        title: 'Protector',
        description: 'Tu fuerza es el escudo de los que amas. No dejes que una debilidad rompa tu guardia.',
        icon: Shield,
        color: 'orange-pulse',
        accent: 'orange-400',
    },
    {
        id: 'Estratega',
        title: 'Estratega',
        description: 'Tú controlas el tablero. El impulso es solo un error táctico que vas a corregir ahora.',
        icon: Brain,
        color: 'lime-lift',
        accent: 'lime-400',
    }
];

export default function IdentityPage() {
    const [selected, setSelected] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleConfirm = () => {
        if (!selected) return;
        setError(null);
        console.log('Confirming identity:', selected);
        startTransition(async () => {
            const result = await saveIdentity(selected);
            if (result?.error) {
                console.error('Save identity error:', result.error);
                setError(result.error);
            }
        });
    };

    return (
        <div className="min-h-screen bg-core-black text-white flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden relative">
            {/* Ambience */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,178,115,0.05)_0%,_transparent_50%)] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full z-10"
            >
                <div className="text-center mb-10 md:mb-16">
                    <h1 className="text-zinc-500 text-[10px] md:text-xs tracking-[0.5em] font-bold uppercase mb-4">Módulo de Identidad</h1>
                    <h2 className="text-3xl md:text-5xl font-serif italic mb-4 md:mb-6 leading-tight">¿Quién vas a elegir ser hoy?</h2>
                    <p className="text-zinc-400 text-base md:text-lg font-light max-w-2xl mx-auto">
                        El tabaco no te define. Tu elección sí. Selecciona el arquetipo que guiará tu victoria.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {identities.map((identity) => (
                        <motion.div
                            key={identity.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => !isPending && setSelected(identity.id)}
                            className={`relative cursor-pointer group bg-zinc-900/40 backdrop-blur-xl border-2 rounded-[32px] p-8 transition-all duration-500 ${selected === identity.id
                                ? `border-${identity.id === 'Atleta' ? 'blue-500' : identity.id === 'Protector' ? 'orange-pulse' : 'lime-lift'} shadow-[0_0_50px_rgba(0,0,0,0.5)]`
                                : 'border-white/5 hover:border-white/20'
                                } ${isPending ? 'opacity-50' : ''}`}
                        >
                            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-colors duration-500 ${selected === identity.id
                                ? identity.id === 'Atleta' ? 'bg-blue-500' : identity.id === 'Protector' ? 'bg-orange-pulse' : 'bg-lime-lift'
                                : 'bg-zinc-800'
                                }`}>
                                <identity.icon className={`w-7 h-7 ${selected === identity.id ? 'text-core-black' : 'text-zinc-400'}`} />
                            </div>

                            <h3 className="text-xl md:text-2xl font-bold mb-2 md:mb-3 tracking-tight">{identity.title}</h3>
                            <p className="text-zinc-500 text-xs md:text-sm leading-relaxed mb-6 md:mb-8 group-hover:text-zinc-300 transition-colors">
                                {identity.description}
                            </p>

                            {selected === identity.id && (
                                <motion.div
                                    layoutId="indicator"
                                    className="absolute bottom-6 right-8 text-white"
                                >
                                    <div className={`p-2 rounded-full ${identity.id === 'Atleta' ? 'bg-blue-500' : identity.id === 'Protector' ? 'bg-orange-pulse' : 'bg-lime-lift'}`}>
                                        <ChevronRight className="w-5 h-5 text-core-black" />
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-center mt-8 font-medium"
                    >
                        Error: {error}. Por favor, intenta de nuevo.
                    </motion.p>
                )}

                <motion.div
                    animate={{ opacity: selected ? 1 : 0, y: selected ? 0 : 20 }}
                    className="mt-16 flex justify-center"
                >
                    {selected && (
                        <button
                            onClick={handleConfirm}
                            disabled={isPending}
                            className={`bg-white text-core-black px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-lg md:text-xl transition-all flex items-center gap-3 shadow-2xl ${isPending ? 'opacity-70 cursor-wait' : 'hover:bg-zinc-200'
                                }`}
                        >
                            {isPending ? 'Confirmando...' : `Confirmar Identidad`}
                            {!isPending && <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />}
                        </button>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
