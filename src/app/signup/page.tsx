'use client'

import { signup } from '@/app/auth/actions'
import { useState, use } from 'react'

export default function SignupPage(props: {
    searchParams: Promise<{ error?: string }>
}) {
    const searchParams = use(props.searchParams);
    const [packSize, setPackSize] = useState<10 | 20>(20);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-core-black text-white p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-zinc-500 text-[10px] tracking-[0.5em] font-bold mb-4">SMOKEZERO</h1>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white/90">
                        Crear Cuenta
                    </h2>
                    <p className="mt-2 text-xs md:text-sm text-zinc-500">
                        Configura tu perfil para comenzar tu veto.
                    </p>
                </div>

                <form className="mt-8 space-y-6" action={signup}>
                    <div className="space-y-4 rounded-md shadow-sm">

                        {searchParams.error && (
                            <div className="p-4 bg-red-900/20 border border-red-500/20 rounded-lg text-center">
                                <p className="text-red-400 text-sm font-mono">
                                    Error: {searchParams.error}
                                </p>
                            </div>
                        )}

                        {/* Auth Fields */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-zinc-400">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1 block w-full px-3 py-3 border border-zinc-800 placeholder-zinc-500 text-white bg-zinc-900/50 rounded-lg focus:outline-none focus:ring-orange-pulse focus:border-orange-pulse sm:text-sm"
                                placeholder="tu@email.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-400">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                minLength={6}
                                className="mt-1 block w-full px-3 py-3 border border-zinc-800 placeholder-zinc-500 text-white bg-zinc-900/50 rounded-lg focus:outline-none focus:ring-orange-pulse focus:border-orange-pulse sm:text-sm"
                                placeholder="******"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="first_name" className="block text-sm font-medium text-zinc-400">Nombre</label>
                                <input
                                    id="first_name"
                                    name="first_name"
                                    type="text"
                                    required
                                    placeholder="Juan"
                                    className="mt-1 block w-full px-3 py-3 border border-zinc-800 placeholder-zinc-500 text-white bg-zinc-900/50 rounded-lg focus:outline-none focus:ring-orange-pulse focus:border-orange-pulse sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="last_name" className="block text-sm font-medium text-zinc-400">Apellido</label>
                                <input
                                    id="last_name"
                                    name="last_name"
                                    type="text"
                                    required
                                    placeholder="Pérez"
                                    className="mt-1 block w-full px-3 py-3 border border-zinc-800 placeholder-zinc-500 text-white bg-zinc-900/50 rounded-lg focus:outline-none focus:ring-orange-pulse focus:border-orange-pulse sm:text-sm"
                                />
                            </div>
                        </div>

                        {/* Config Fields */}
                        <div className="pt-4 border-t border-zinc-800">
                            <h3 className="text-lg font-medium text-white mb-4">Tu Hábito</h3>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="cigs_per_day" className="block text-sm font-medium text-zinc-400">Cigarrillos por día</label>
                                    <input
                                        id="cigs_per_day"
                                        name="cigs_per_day"
                                        type="number"
                                        min="1"
                                        required
                                        className="mt-1 block w-full px-3 py-3 border border-zinc-800 placeholder-zinc-500 text-white bg-zinc-900/50 rounded-lg focus:outline-none focus:ring-orange-pulse focus:border-orange-pulse sm:text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-400 mb-1">Tamaño del Atado</label>
                                        <div className="flex rounded-md shadow-sm">
                                            <button
                                                type="button"
                                                onClick={() => setPackSize(10)}
                                                className={`flex-1 px-4 py-2 text-sm font-medium border rounded-l-lg focus:z-10 focus:ring-1 focus:ring-orange-pulse ${packSize === 10 ? 'bg-orange-pulse text-core-black border-orange-pulse' : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-white'}`}
                                            >
                                                10
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPackSize(20)}
                                                className={`flex-1 px-4 py-2 text-sm font-medium border rounded-r-lg focus:z-10 focus:ring-1 focus:ring-orange-pulse ${packSize === 20 ? 'bg-orange-pulse text-core-black border-orange-pulse' : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-white'}`}
                                            >
                                                20
                                            </button>
                                        </div>
                                        <input type="hidden" name="pack_size" value={packSize} />
                                    </div>
                                    <div>
                                        <label htmlFor="pack_price" className="block text-sm font-medium text-zinc-400 mb-1">Precio del Atado</label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-zinc-500 sm:text-sm">$</span>
                                            </div>
                                            <input
                                                type="number"
                                                name="pack_price"
                                                id="pack_price"
                                                required
                                                className="block w-full pl-7 px-3 py-2 border border-zinc-800 placeholder-zinc-500 text-white bg-zinc-900/50 rounded-lg focus:outline-none focus:ring-orange-pulse focus:border-orange-pulse sm:text-sm h-[42px]"
                                                placeholder="0.00"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-full text-core-black bg-lime-lift hover:bg-lime-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-lime-500 transition-colors"
                        >
                            Comenzar Veto
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <p className="text-sm text-zinc-500">
                            ¿Ya tienes cuenta?{' '}
                            <a href="/login" className="text-lime-lift hover:underline">
                                Iniciar Sesión
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
