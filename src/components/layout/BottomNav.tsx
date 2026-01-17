'use client';

import { Home, BarChart2, BookOpen, Target, User } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export function BottomNav() {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[900] bg-core-black/80 backdrop-blur-md border-t border-white/10 h-20 md:h-24 px-6 flex items-center justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            {/* Left Group */}
            <div className="flex gap-8 md:gap-12">
                <button title="Analítica" className="flex flex-col items-center gap-1 group opacity-60 hover:opacity-100 transition-opacity">
                    <BarChart2 className="w-6 h-6 text-white group-hover:text-lime-lift transition-colors" />
                    <div className="w-1 h-1 rounded-full bg-transparent group-hover:bg-lime-lift transition-colors" />
                </button>
                <button title="Diario" className="flex flex-col items-center gap-1 group opacity-60 hover:opacity-100 transition-opacity">
                    <BookOpen className="w-6 h-6 text-white group-hover:text-lime-lift transition-colors" />
                    <div className="w-1 h-1 rounded-full bg-transparent group-hover:bg-lime-lift transition-colors" />
                </button>
            </div>

            {/* Center Home Button (Floating) */}
            <div className="relative -top-6">
                <button
                    onClick={() => router.push('/dashboard')}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(209,255,116,0.2)] ${pathname === '/dashboard'
                            ? 'bg-lime-lift text-core-black scale-110 shadow-[0_0_30px_rgba(209,255,116,0.5)]'
                            : 'bg-zinc-900 border border-white/20 text-white hover:border-lime-lift hover:text-lime-lift'
                        }`}
                >
                    <Home className="w-8 h-8 md:w-10 md:h-10" />
                </button>
            </div>

            {/* Right Group */}
            <div className="flex gap-8 md:gap-12">
                <button title="Metas" className="flex flex-col items-center gap-1 group opacity-60 hover:opacity-100 transition-opacity">
                    <Target className="w-6 h-6 text-white group-hover:text-lime-lift transition-colors" />
                    <div className="w-1 h-1 rounded-full bg-transparent group-hover:bg-lime-lift transition-colors" />
                </button>
                <button title="Perfil" className="flex flex-col items-center gap-1 group opacity-60 hover:opacity-100 transition-opacity">
                    <User className="w-6 h-6 text-white group-hover:text-lime-lift transition-colors" />
                    <div className="w-1 h-1 rounded-full bg-transparent group-hover:bg-lime-lift transition-colors" />
                </button>
            </div>
        </div>
    );
}
