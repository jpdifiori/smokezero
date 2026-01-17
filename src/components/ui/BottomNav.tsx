'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Utensils, CircleDashed, TrendingUp, Shield, Sparkles } from "lucide-react"
import { useGuardian } from "@/components/guardian/GuardianContext"
import { motion } from "framer-motion"

export function BottomNav() {
    const pathname = usePathname()
    const { openGuardian, isGuardianOpen } = useGuardian()

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-6 pt-2 pointer-events-none">
            <div className="mx-auto max-w-sm pointer-events-auto">
                <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/5 rounded-full p-2 flex items-center shadow-2xl shadow-black/50">

                    {/* Left Group - Centered in the left half */}
                    <div className="flex-1 flex items-center justify-center gap-6">
                        {/* Stairway */}
                        <Link
                            href="/dashboard/stairway"
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isActive('/dashboard/stairway')
                                ? 'bg-lime-lift text-core-black shadow-[0_0_15px_rgba(209,255,116,0.3)]'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <TrendingUp className="w-5 h-5" />
                        </Link>

                        {/* Nutrition */}
                        <Link
                            href="/dashboard/nutrition"
                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${isActive('/dashboard/nutrition')
                                ? 'bg-lime-lift text-core-black shadow-[0_0_15px_rgba(209,255,116,0.3)]'
                                : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Utensils className="w-5 h-5" />
                        </Link>
                    </div>

                    {/* Center - Dashboard (Home) */}
                    <div className="flex-none px-2">
                        <Link
                            href="/dashboard"
                            className="w-14 h-14 bg-core-black border border-white/10 rounded-full flex items-center justify-center text-white shadow-lg transform transition-transform hover:scale-105 active:scale-95 relative -mt-6 ring-4 ring-black z-10"
                        >
                            <Home className="w-6 h-6" />
                        </Link>
                    </div>

                    {/* Right Group - Centered in the right half */}
                    <div className="flex-1 flex items-center justify-center">
                        {/* Guardian Hero Button */}
                        <button
                            onClick={openGuardian}
                            className={`
                                flex items-center gap-2 px-4 py-2 rounded-full transition-all relative group
                                ${isGuardianOpen
                                    ? 'bg-lime-lift text-core-black shadow-[0_0_20px_rgba(209,255,116,0.5)]'
                                    : 'bg-zinc-800/50 border border-lime-lift/30 text-lime-lift shadow-[0_0_15px_rgba(209,255,116,0.15)] hover:bg-zinc-800/80 hover:shadow-[0_0_20px_rgba(209,255,116,0.3)]'
                                }
                            `}
                        >
                            <Shield className={`w-4 h-4 relative z-10 transition-transform ${isGuardianOpen ? 'scale-110' : 'group-hover:scale-110'}`} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">
                                Guardian
                            </span>

                            {/* Enhanced Light Effect / Pulse */}
                            {!isGuardianOpen && (
                                <>
                                    <motion.div
                                        animate={{ opacity: [0.1, 0.4, 0.1], scale: [1, 1.1, 1] }}
                                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                        className="absolute inset-0 rounded-full bg-lime-lift/20 blur-md pointer-events-none"
                                    />
                                    <motion.div
                                        animate={{ opacity: [0, 0.6, 0], scale: [1, 1.2, 1.4] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                                        className="absolute inset-0 rounded-full border border-lime-lift/40 pointer-events-none"
                                    />
                                </>
                            )}

                            {/* Subtle sparkle for "Active AI" feel */}
                            <motion.div
                                animate={{ opacity: [0.3, 0.9, 0.3], scale: [0.8, 1.2, 0.8] }}
                                transition={{ repeat: Infinity, duration: 3 }}
                                className="absolute -top-1 -right-1"
                            >
                                <Sparkles className="w-3 h-3 text-lime-lift" />
                            </motion.div>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
