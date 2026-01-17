'use client'

import { logout } from '@/app/auth/actions'
import { User } from '@supabase/supabase-js'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStats } from '@/providers/StatsProvider'
import { LifeTimer } from '@/components/dashboard/LifeTimer'
import { LogOut, User as UserIcon, ChevronDown, Target, Activity, Settings, UserCheck, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { FocusModal } from '../profile/FocusModal'
import { ConfigModal } from '../profile/ConfigModal'
import { ProfileModal } from '../profile/ProfileModal'
import { SubscriptionModal } from '../profile/SubscriptionModal'

export default function Header({ user }: { user: User | null }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const { savings, loading, config } = useStats();

    if (!user) return null;

    return (
        <header className="fixed top-0 left-0 right-0 z-[500] bg-core-black/50 backdrop-blur-md border-b border-white/5 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Link href="/dashboard">
                    <span className="text-white font-bold tracking-[0.2em] text-[14px] hover:opacity-80 transition-opacity cursor-pointer">SMOKEZERO</span>
                </Link>
            </div>

            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-3 bg-zinc-900/50 hover:bg-zinc-800 transition-colors border border-white/5 pl-2 pr-4 py-1.5 rounded-full"
                >
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-zinc-400" />
                    </div>
                    <span className="text-xs text-zinc-300 font-medium hidden sm:block">{user.email?.split('@')[0]}</span>
                    <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <>
                            <div className="fixed inset-0 z-[-1]" onClick={() => setIsOpen(false)} />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-[calc(100vw-2rem)] sm:w-80 bg-zinc-900 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden p-2"
                            >
                                <div className="p-4 space-y-6 relative">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="absolute top-2 right-2 p-1.5 hover:bg-white/10 rounded-full transition-colors text-zinc-500 hover:text-white"
                                    >
                                        <div className="w-5 h-5 flex items-center justify-center">
                                            <span className="text-xl leading-none">&times;</span>
                                        </div>
                                    </button>
                                    <div className="flex flex-col gap-1 mt-2">
                                        <div className="flex items-center gap-3 p-3">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-zinc-400 font-medium">{user.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-2 pt-2 border-t border-white/5">
                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            // Navigation happens via Link usually, but here we can use window or just Link component wrapping
                                        }}
                                        className="w-full text-left"
                                    >
                                        <Link href="/dashboard/behaviors" className="flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-white/5 transition-colors text-[10px] font-bold uppercase tracking-widest">
                                            <Activity className="w-4 h-4 text-orange-400" />
                                            Comportamientos
                                        </Link>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            setIsFocusModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-white/5 transition-colors text-[10px] font-bold uppercase tracking-widest text-left"
                                    >
                                        <Target className="w-4 h-4 text-blue-400" />
                                        Ajustar Foco
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            setIsConfigModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-white/5 transition-colors text-[10px] font-bold uppercase tracking-widest text-left"
                                    >
                                        <Settings className="w-4 h-4 text-zinc-400" />
                                        Configuración
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            setIsProfileModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-white/5 transition-colors text-[10px] font-bold uppercase tracking-widest text-left"
                                    >
                                        <UserCheck className="w-4 h-4 text-lime-lift" />
                                        Perfil
                                    </button>

                                    <button
                                        onClick={() => {
                                            setIsOpen(false);
                                            setIsSubscriptionModalOpen(true);
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-zinc-300 hover:bg-white/5 transition-colors text-[10px] font-bold uppercase tracking-widest text-left"
                                    >
                                        <CreditCard className="w-4 h-4 text-purple-400" />
                                        Suscripción
                                    </button>

                                    <form action={logout}>
                                        <button
                                            type="submit"
                                            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-[10px] font-bold uppercase tracking-widest text-left"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Cerrar Sesión
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                <FocusModal isOpen={isFocusModalOpen} onClose={() => setIsFocusModalOpen(false)} />
                <ConfigModal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} />
                <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
                <SubscriptionModal isOpen={isSubscriptionModalOpen} onClose={() => setIsSubscriptionModalOpen(false)} />
            </div>
        </header>
    )
}
