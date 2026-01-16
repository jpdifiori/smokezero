'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Shield, Sparkles, Heart, Activity, Target, Zap, Bot, User } from 'lucide-react';
import { getGuardianResponse, saveGuardianMessage, getGuardianMessages, getHealthRegeneration } from '@/app/actions';

interface Message {
    id?: string;
    role: 'user' | 'assistant';
    content: string;
    created_at?: string;
}

export function GuardianChat({ onClose }: { onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadMessages();
        loadStats();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadMessages = async () => {
        const msgs = await getGuardianMessages();
        if (msgs.length === 0) {
            setMessages([{
                role: 'assistant',
                content: 'Hola Juan Pablo. Soy tu Guardián de Libertad. Estoy acá para blindar tu aire y tu identidad. ¿Qué desafío tenemos hoy?'
            }]);
        } else {
            setMessages(msgs);
        }
    };

    const loadStats = async () => {
        const hStats = await getHealthRegeneration();
        setStats(hStats || []);
    };

    const handleSend = async (text?: string) => {
        const content = text || input;
        if (!content.trim()) return;

        const userMsg: Message = { role: 'user', content };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        // Save user message
        await saveGuardianMessage('user', content);

        const response = await getGuardianResponse(content, messages.map(m => ({ role: m.role, content: m.content })));

        if (response.response) {
            const assistantMsg: Message = { role: 'assistant', content: response.response };
            setMessages(prev => [...prev, assistantMsg]);
            await saveGuardianMessage('assistant', response.response);
        } else {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Perdoná, perdí la conexión con el cuartel. ¿Podés repetir?' }]);
        }
        setLoading(false);
    };

    const quickActions = [
        { id: 'craving', label: 'Tengo un antojo YA', icon: <Zap className="w-3 h-3" />, action: () => handleSend('Tengo un antojo YA. ¡Ayudame!') },
        { id: 'identity', label: 'Recordame quién soy', icon: <User className="w-3 h-3" />, action: () => handleSend('Recordame quién soy y por qué decidí esto.') },
        { id: 'mission', label: 'Dame una micro-misión', icon: <Sparkles className="w-3 h-3" />, action: () => handleSend('Dame una micro-misión rápida para romper este patrón.') },
        { id: 'truth', label: 'Me estoy mintiendo (ayudame)', icon: <Shield className="w-3 h-3" />, action: () => handleSend('Siento que me estoy mintiendo a mí mismo sobre fumar. Ayudame a ver la verdad.') },
        { id: 'relapse', label: 'Recaí... quiero volver', icon: <Heart className="w-3 h-3" />, action: () => handleSend('Recaí... acabo de fumar uno. Quiero volver al camino ahora mismo. ¿Qué hago?') },
    ];

    return (
        <div className="flex flex-col h-full bg-zinc-900">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-core-black border border-lime-lift/50 flex items-center justify-center">
                        <Shield className="w-5 h-5 text-lime-lift" />
                    </div>
                    <div>
                        <h3 className="text-white font-serif font-bold text-lg leading-tight">Guardián de Libertad</h3>
                        <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-lime-lift animate-pulse" />
                            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Activo 24/7</span>
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                {messages.map((msg, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${msg.role === 'user'
                            ? 'bg-lime-lift text-core-black rounded-tr-none font-medium'
                            : 'bg-white/5 text-zinc-300 border border-white/10 rounded-tl-none font-sans leading-relaxed'
                            }`}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 p-4 rounded-3xl rounded-tl-none border border-white/10">
                            <div className="flex gap-1">
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 rounded-full bg-lime-lift" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-lime-lift" />
                                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-lime-lift" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Health Overlay Hidden per User Request */}

            {/* Quick Actions */}
            <div className="px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide border-t border-white/5 bg-black/20">
                {quickActions.map((action) => (
                    <button
                        key={action.id}
                        onClick={action.action}
                        className="flex-none flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all white-space-nowrap"
                    >
                        <span className="text-lime-lift">{action.icon}</span>
                        <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-zinc-900">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Escribile a tu Guardián..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-lime-lift/50 transition-all font-sans"
                    />
                    <button
                        onClick={() => handleSend()}
                        className="absolute right-2 top-2 bottom-2 w-10 bg-lime-lift text-core-black rounded-xl flex items-center justify-center hover:scale-105 transition-transform"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
