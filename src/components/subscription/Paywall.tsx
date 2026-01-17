'use client';

import { motion } from 'framer-motion';
import { Shield, CheckCircle, Lock } from 'lucide-react';
import { useState } from 'react';

export function Paywall() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubscribe = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
            });
            const data = await response.json();

            if (!response.ok) {
                console.error('Checkout Error:', data.error);
                alert(`Error: ${data.error || 'Algo salió mal'}`);
                setIsLoading(false);
                return;
            }

            if (data.url) window.location.href = data.url;
        } catch (error: any) {
            console.error('Subscription Error:', error);
            alert(`Error de Conexión: ${error.message}`);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-core-black flex flex-col items-center justify-center p-6 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 to-core-black z-0 pointer-events-none" />

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="z-10 w-full max-w-md bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-[32px] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lime-lift to-transparent opacity-50" />

                <div className="w-20 h-20 bg-lime-lift/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-lime-lift/20">
                    <Lock className="w-8 h-8 text-lime-lift" />
                </div>

                <h1 className="text-3xl font-bold text-white mb-2">Tu Prueba Finalizó</h1>
                <p className="text-zinc-400 mb-8 leading-relaxed">
                    Has completado tus 24 horas de acceso gratuito. Para continuar tu transformación con el Guardián, activá tu suscripción.
                </p>

                <div className="flex flex-col gap-3 mb-8 text-left bg-black/20 p-4 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-lime-lift" />
                        <span className="text-sm text-zinc-300">Acceso ilimitado al Guardián AI</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-lime-lift" />
                        <span className="text-sm text-zinc-300">Botón de Pánico "Resistir"</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-lime-lift" />
                        <span className="text-sm text-zinc-300">Análisis de Progreso y Salud</span>
                    </div>
                </div>

                <button
                    onClick={handleSubscribe}
                    disabled={isLoading}
                    className="w-full py-4 bg-lime-lift text-core-black font-bold uppercase tracking-widest rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(209,255,116,0.2)] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    ) : (
                        <>
                            <span>Suscribirme</span>
                            <span className="bg-black/10 px-2 py-0.5 rounded text-[10px]">$9.99/mes</span>
                        </>
                    )}
                </button>

                <p className="mt-6 text-[10px] text-zinc-600 uppercase tracking-widest">
                    Cancela cuando quieras. Sin compromiso.
                </p>
            </motion.div>
        </div>
    );
}
