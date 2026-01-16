import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { User, Heart, Briefcase, GripVertical, Check, X, Target } from 'lucide-react';
import { getUnifiedFocus, updateFocusOrder } from '@/app/actions';
import { createPortal } from 'react-dom';

interface FocusItem {
    id: string;
    category: string;
    entity_name: string;
    priority: number;
}

interface FocusModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function FocusModal({ isOpen, onClose }: FocusModalProps) {
    const [items, setItems] = useState<FocusItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadFocus();
        }
    }, [isOpen]);

    const loadFocus = async () => {
        setLoading(true);
        const data = await getUnifiedFocus();
        setItems(data as FocusItem[]);
        setLoading(false);
    };

    const handleReorder = (newOrder: FocusItem[]) => {
        setItems(newOrder);
    };

    const handleSave = async () => {
        setSaving(true);
        console.log("Saving Focus Order:", items);

        // Prepare updates with new priorities based on index
        const updates = items.map((item, index) => ({
            id: item.id,
            priority: index + 1, // 1-based index
            category: item.category,
            entity_name: item.entity_name
        }));

        const result = await updateFocusOrder(updates);
        console.log("Save Result:", result);

        setSaving(false);

        if (result?.error) {
            alert(`Error al guardar: ${result.error}`);
            return;
        }

        onClose();
    };

    const getIcon = (category: string) => {
        switch (category) {
            case 'IDENTITY': return <User className="w-4 h-4 text-blue-400" />;
            case 'Familia': return <Heart className="w-4 h-4 text-pink-400" />;
            case 'Negocio': return <Briefcase className="w-4 h-4 text-emerald-400" />;
            default: return <User className="w-4 h-4 text-zinc-400" />;
        }
    };

    // Use Portal to break out of Header stacking context
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
                    <div className="max-w-md mx-auto space-y-6 pb-12">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-serif font-bold tracking-tight text-white">Ajustar Foco</h1>
                                <p className="text-zinc-400 text-xs uppercase tracking-widest">Prioridades de Identidad</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <p className="text-xs text-zinc-400 leading-relaxed">
                            Arrastra para priorizar. El <strong>Foco #1</strong> dominará la estrategia de la IA.
                        </p>

                        <div className="min-h-[300px]">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-4">
                                    <div className="w-8 h-8 border-2 border-white/20 border-t-blue-500 rounded-full animate-spin" />
                                    <span className="text-xs text-zinc-500">Cargando prioridades...</span>
                                </div>
                            ) : items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                    <Target className="w-8 h-8 mb-2 opacity-50" />
                                    <p className="text-sm">No hay focos definidos.</p>
                                </div>
                            ) : (
                                <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3 pb-8">
                                    {items.map((item, index) => (
                                        <Reorder.Item key={item.id} value={item} className="relative">
                                            {/* Logic Visual Indicators */}
                                            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-full max-h-[40px] rounded-r-lg"
                                                style={{ backgroundColor: index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : 'transparent' }}
                                            />

                                            <div className={`
                                                relative border p-4 rounded-2xl flex items-center gap-4 cursor-grab active:cursor-grabbing transition-all
                                                ${index === 0 ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.15)]' :
                                                    index === 1 ? 'bg-zinc-900 border-emerald-500/30' :
                                                        'bg-zinc-900/50 border-white/10'}
                                            `}>
                                                <div className="text-zinc-500">
                                                    <GripVertical className="w-5 h-5" />
                                                </div>

                                                <div className={`p-2 rounded-xl border flex items-center justify-center
                                                    ${index === 0 ? 'bg-blue-500/20 border-blue-500/30 text-blue-400' : 'bg-white/5 border-white/5 text-zinc-400'}
                                                `}>
                                                    {getIcon(item.category)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-0.5">
                                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded
                                                            ${index === 0 ? 'bg-blue-500 text-white' :
                                                                index === 1 ? 'bg-emerald-900/50 text-emerald-400' :
                                                                    'bg-zinc-800 text-zinc-500'}
                                                        `}>
                                                            {index === 0 ? 'PRIMARIO' : index === 1 ? 'SECUNDARIO' : 'TERCIARIO'}
                                                        </span>
                                                    </div>
                                                    <p className={`text-sm font-bold truncate ${index === 0 ? 'text-white' : 'text-zinc-300'}`}>
                                                        {item.entity_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            )}
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleSave}
                                disabled={loading || saving}
                                className="w-full bg-white text-core-black py-4 rounded-full font-bold uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)]"
                            >
                                {saving ? (
                                    <span className="animate-pulse">Guardando...</span>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Confirmar Orden
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
