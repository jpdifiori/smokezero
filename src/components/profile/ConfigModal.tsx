import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Save, DollarSign, Cigarette } from 'lucide-react';
import { getUserConfig, updateUserConfig } from '@/lib/user-config';
import { useStats } from '@/providers/StatsProvider';
import { createPortal } from 'react-dom';

interface ConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
    const [cigsPerDay, setCigsPerDay] = useState<string>('');
    const [packPrice, setPackPrice] = useState<string>('');
    const [packSize, setPackSize] = useState<10 | 20>(20);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // We use the global stats provider to refresh data after save
    const { refreshStats } = useStats();

    useEffect(() => {
        if (isOpen) {
            loadConfig();
        }
    }, [isOpen]);

    const loadConfig = async () => {
        setLoading(true);
        const config = await getUserConfig();
        if (config) {
            setCigsPerDay(config.cigs_per_day.toString());
            setPackPrice(config.pack_price.toString());
            setPackSize((config.pack_size as 10 | 20) || 20);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const cigs = parseInt(cigsPerDay);
        const price = parseFloat(packPrice);

        if (isNaN(cigs) || isNaN(price)) {
            alert("Por favor ingresa valores válidos.");
            setSaving(false);
            return;
        }

        const result = await updateUserConfig({
            cigs_per_day: cigs,
            pack_price: price,
            pack_size: packSize
        });

        if (result.error) {
            alert("Error al guardar.");
        } else {
            await refreshStats(); // Refresh dashboard numbers
            onClose();
        }
        setSaving(false);
    };

    if (typeof window === 'undefined') return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl pt-24 px-6 overflow-y-auto"
                >
                    <div className="max-w-md mx-auto space-y-8 pb-12">
                        {/* Header matching Behaviors Page */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-serif font-bold tracking-tight text-white">Configuración</h1>
                                <p className="text-zinc-400 text-xs uppercase tracking-widest">Ajustes Personales</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="space-y-6">
                            {loading ? (
                                <div className="text-center text-zinc-500 py-8">Cargando...</div>
                            ) : (
                                <>
                                    <div className="space-y-3">
                                        <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold ml-1">Cigarrillos por día</label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
                                                <Cigarette className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="number"
                                                value={cigsPerDay}
                                                onChange={(e) => setCigsPerDay(e.target.value)}
                                                className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white/30 transition-all font-mono"
                                                placeholder="20"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold ml-1">Tamaño del Atado</label>
                                            <div className="flex bg-zinc-900/50 border border-white/10 rounded-2xl p-1 h-[68px]">
                                                <button
                                                    onClick={() => setPackSize(10)}
                                                    className={`flex-1 rounded-xl font-mono text-lg transition-all ${packSize === 10 ? 'bg-orange-pulse text-core-black font-bold shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                                >
                                                    10
                                                </button>
                                                <button
                                                    onClick={() => setPackSize(20)}
                                                    className={`flex-1 rounded-xl font-mono text-lg transition-all ${packSize === 20 ? 'bg-orange-pulse text-core-black font-bold shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                                                >
                                                    20
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-xs text-zinc-500 uppercase tracking-widest font-bold ml-1">Precio</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-white transition-colors">
                                                    <DollarSign className="w-5 h-5" />
                                                </div>
                                                <input
                                                    type="number"
                                                    value={packPrice}
                                                    onChange={(e) => setPackPrice(e.target.value)}
                                                    className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-xl text-white placeholder-zinc-700 focus:outline-none focus:border-white/30 transition-all font-mono h-[68px]"
                                                    placeholder="5000"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8">
                                        <button
                                            onClick={handleSave}
                                            disabled={loading || saving}
                                            className="w-full bg-lime-lift text-core-black py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 hover:bg-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(163,230,53,0.15)] hover:shadow-[0_0_40px_rgba(163,230,53,0.25)]"
                                        >
                                            {saving ? (
                                                <span className="animate-pulse">Guardando...</span>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4" />
                                                    Guardar Cambios
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
