'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, CheckCircle, AlertTriangle, Calendar } from 'lucide-react';
import { useStats } from '@/providers/StatsProvider';
import { useState } from 'react';

interface SubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function SubscriptionModal({ isOpen, onClose }: SubscriptionModalProps) {
    const { config } = useStats();
    const [isLoading, setIsLoading] = useState(false);

    if (!config) return null;

    const isTrial = !config.subscription_status || config.subscription_status === 'trial';
    const isActive = config.subscription_status === 'active';
    const isPastDue = config.subscription_status === 'past_due' || config.subscription_status === 'unpaid';

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

    const formatDate = (dateString?: string) => {
        if (!dateString) return '---';
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[1500]"
                    />
                    <div className="fixed inset-0 flex items-start justify-center z-[1500] pointer-events-none p-4 pt-32">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-zinc-900 border border-white/10 w-full max-w-lg rounded-[32px] overflow-hidden shadow-2xl pointer-events-auto"
                        >
                            <div className="p-6 border-b border-white/5 flex items-center justify-between relative">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-lime-lift/10 flex items-center justify-center">
                                        <CreditCard className="w-5 h-5 text-lime-lift" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Suscripción</h2>
                                        <p className="text-xs text-zinc-400">Estado de tu membresía</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full bg-white/5 text-white hover:bg-white/10 transition-all hover:rotate-90"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-8 space-y-8">

                                {/* Status Card */}
                                <div className={`p-6 rounded-2xl border ${isActive
                                    ? 'bg-lime-lift/5 border-lime-lift/20'
                                    : isPastDue
                                        ? 'bg-red-500/5 border-red-500/20'
                                        : 'bg-zinc-800/50 border-white/5'
                                    }`}>
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Estado Actual</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${isActive
                                            ? 'bg-lime-lift/20 text-lime-lift'
                                            : isPastDue
                                                ? 'bg-red-500/20 text-red-500'
                                                : 'bg-zinc-700 text-zinc-300'
                                            }`}>
                                            {isActive ? 'Activa' : isPastDue ? 'Pago Pendiente' : 'Prueba Gratuita'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 mb-2">
                                        {isActive ? (
                                            <CheckCircle className="w-6 h-6 text-lime-lift" />
                                        ) : isPastDue ? (
                                            <AlertTriangle className="w-6 h-6 text-red-500" />
                                        ) : (
                                            <Calendar className="w-6 h-6 text-zinc-400" />
                                        )}
                                        <span className="text-2xl font-bold text-white">
                                            {isActive ? 'Plan Guardián' : 'Acceso Limitado'}
                                        </span>
                                    </div>

                                    {isActive && (
                                        <p className="text-xs text-zinc-400 mt-2">
                                            Tu próxima renovación es el <span className="text-white">{formatDate(config.subscription_end_date)}</span>.
                                        </p>
                                    )}

                                    {isTrial && (
                                        <p className="text-xs text-zinc-400 mt-2">
                                            Tu periodo de prueba finaliza pronto. Suscribite para evitar interrupciones.
                                        </p>
                                    )}
                                </div>

                                {/* Plan Details */}
                                <div>
                                    <h3 className="text-sm font-bold text-white mb-4">Detalles del Plan</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                                            <span className="text-sm text-zinc-400">Monto Mensual</span>
                                            <span className="text-sm font-mono text-white">$9.99 USD</span>
                                        </div>
                                        <div className="flex justify-between items-center py-3 border-b border-white/5">
                                            <span className="text-sm text-zinc-400">Acceso AI</span>
                                            <span className="text-sm text-lime-lift">Ilimitado</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {!isActive && (
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={isLoading}
                                        className="w-full py-4 bg-lime-lift text-core-black font-bold uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(209,255,116,0.3)] disabled:opacity-50"
                                    >
                                        {isLoading ? 'Procesando...' : isActive ? 'Gestionar Suscripción' : 'Suscribirme Ahora'}
                                    </button>
                                )}

                                {isActive && (
                                    <button
                                        onClick={() => window.open('https://billing.stripe.com/p/login/test', '_blank')}
                                        className="w-full py-4 bg-zinc-800 text-white font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-700 transition-colors"
                                    >
                                        Gestionar Pagos
                                    </button>
                                )}

                                <p className="text-center text-[10px] text-zinc-600">
                                    Los pagos son procesados de forma segura por Stripe.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
