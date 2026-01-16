'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, X, Save, Heart, Briefcase, Users, Plus, Trash2, ChevronRight, ChevronLeft } from 'lucide-react';
import { getUserProfile, updateUserProfile } from '@/app/actions';
import { createPortal } from 'react-dom';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const [step, setStep] = useState(1);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [profession, setProfession] = useState('');
    const [knowledgeBase, setKnowledgeBase] = useState<any>({
        spouse: '',
        mother: '',
        father: '',
        children: [],
        siblings: ''
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadProfile();
            setStep(1);
        }
    }, [isOpen]);

    const loadProfile = async () => {
        setLoading(true);
        const profile = await getUserProfile();
        if (profile) {
            setFirstName(profile.first_name || '');
            setLastName(profile.last_name || '');
            setProfession(profile.profession || '');
            setKnowledgeBase(profile.knowledge_base || {
                spouse: '',
                mother: '',
                father: '',
                children: [],
                siblings: ''
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const result = await updateUserProfile({
            first_name: firstName,
            last_name: lastName,
            profession: profession,
            knowledge_base: knowledgeBase
        });

        if (result.error) {
            alert("Error al guardar: " + result.error);
        } else {
            onClose();
        }
        setSaving(false);
    };

    const addChild = () => {
        setKnowledgeBase({
            ...knowledgeBase,
            children: [...(knowledgeBase.children || []), { name: '', age: '' }]
        });
    };

    const removeChild = (index: number) => {
        const newChildren = [...knowledgeBase.children];
        newChildren.splice(index, 1);
        setKnowledgeBase({ ...knowledgeBase, children: newChildren });
    };

    const updateChild = (index: number, field: string, value: string) => {
        const newChildren = [...knowledgeBase.children];
        newChildren[index] = { ...newChildren[index], [field]: value };
        setKnowledgeBase({ ...knowledgeBase, children: newChildren });
    };

    if (typeof window === 'undefined') return null;

    const steps = [
        { id: 1, title: 'Identidad', icon: <User className="w-5 h-5" /> },
        { id: 2, title: 'Familia', icon: <Heart className="w-5 h-5" /> },
        { id: 3, title: 'Círculo', icon: <Users className="w-5 h-5" /> }
    ];

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[600] flex items-center justify-center p-4 backdrop-blur-xl bg-black/80"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        className="w-full max-w-lg bg-zinc-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-white/5 flex items-start justify-between bg-zinc-900/50">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-serif font-bold text-white tracking-tight">Tu Perfil</h2>
                                <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Base de Conocimiento Personal</p>
                            </div>
                            <button onClick={onClose} className="p-2 -mr-2 text-zinc-500 hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Progress Steps */}
                        <div className="px-8 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
                            {steps.map((s) => (
                                <div key={s.id} className="flex flex-col items-center gap-2">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${step >= s.id ? 'bg-lime-lift text-core-black shadow-[0_0_15px_rgba(209,255,116,0.3)]' : 'bg-white/5 text-zinc-600'}`}>
                                        {s.icon}
                                    </div>
                                    <span className={`text-[10px] uppercase tracking-tighter font-bold ${step === s.id ? 'text-lime-lift' : 'text-zinc-600'}`}>{s.title}</span>
                                </div>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {loading ? (
                                <div className="flex items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-lime-lift"></div>
                                </div>
                            ) : (
                                <>
                                    {step === 1 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1">Nombre</label>
                                                    <input
                                                        value={firstName}
                                                        onChange={(e) => setFirstName(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                                                        placeholder="Juan"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1">Apellido</label>
                                                    <input
                                                        value={lastName}
                                                        onChange={(e) => setLastName(e.target.value)}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                                                        placeholder="Pérez"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1 flex items-center gap-2 font-sans">
                                                    <Briefcase className="w-3 h-3" /> Profesión
                                                </label>
                                                <input
                                                    value={profession}
                                                    onChange={(e) => setProfession(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-serif italic"
                                                    placeholder="Diseñador, Ingeniero, Estudiante..."
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 2 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1 font-sans">Esposa / Esposo</label>
                                                <input
                                                    value={knowledgeBase.spouse}
                                                    onChange={(e) => setKnowledgeBase({ ...knowledgeBase, spouse: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                                                    placeholder="Nombre de tu pareja"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1 font-sans">Madre</label>
                                                    <input
                                                        value={knowledgeBase.mother}
                                                        onChange={(e) => setKnowledgeBase({ ...knowledgeBase, mother: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                                                        placeholder="Nombre"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1 font-sans">Padre</label>
                                                    <input
                                                        value={knowledgeBase.father}
                                                        onChange={(e) => setKnowledgeBase({ ...knowledgeBase, father: e.target.value })}
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-white/20 transition-all font-sans"
                                                        placeholder="Nombre"
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}

                                    {step === 3 && (
                                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between ml-1">
                                                    <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold font-sans">Hijos</label>
                                                    <button onClick={addChild} className="text-lime-lift flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity font-sans">
                                                        <Plus className="w-3 h-3" /> Añadir
                                                    </button>
                                                </div>
                                                <div className="space-y-3">
                                                    {knowledgeBase.children?.map((child: any, idx: number) => (
                                                        <div key={idx} className="flex gap-3 items-center bg-white/5 p-3 rounded-2xl border border-white/5">
                                                            <input
                                                                value={child.name}
                                                                onChange={(e) => updateChild(idx, 'name', e.target.value)}
                                                                className="bg-transparent border-none text-sm text-white focus:outline-none flex-1 font-sans"
                                                                placeholder="Nombre"
                                                            />
                                                            <input
                                                                type="number"
                                                                value={child.age}
                                                                onChange={(e) => updateChild(idx, 'age', e.target.value)}
                                                                className="bg-zinc-800 border border-white/10 rounded-lg w-16 py-1 px-2 text-xs text-center font-mono"
                                                                placeholder="Edad"
                                                            />
                                                            <button onClick={() => removeChild(idx)} className="text-zinc-600 hover:text-red-400 transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    {(!knowledgeBase.children || knowledgeBase.children.length === 0) && (
                                                        <p className="text-zinc-600 text-[10px] italic text-center py-2 font-sans">No has registrado hijos aún.</p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold ml-1 font-sans">Hermanos</label>
                                                <textarea
                                                    value={knowledgeBase.siblings}
                                                    onChange={(e) => setKnowledgeBase({ ...knowledgeBase, siblings: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:outline-none focus:border-white/20 transition-all resize-none font-sans"
                                                    rows={2}
                                                    placeholder="Ej: Pedro y Marta"
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-8 border-t border-white/5 bg-black/20 flex gap-4">
                            {step > 1 && (
                                <button
                                    onClick={() => setStep(step - 1)}
                                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-4 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all font-sans"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Atrás
                                </button>
                            )}
                            {step < 3 ? (
                                <button
                                    onClick={() => setStep(step + 1)}
                                    className="flex-[2] bg-white text-core-black font-bold py-4 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all hover:bg-lime-lift font-sans"
                                >
                                    Siguiente <ChevronRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-[2] bg-lime-lift text-core-black font-bold py-4 rounded-2xl uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-[0_0_30px_rgba(209,255,116,0.2)] disabled:opacity-50 font-sans"
                                >
                                    {saving ? 'Guardando...' : 'Finalizar Perfil'} <Save className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
}
