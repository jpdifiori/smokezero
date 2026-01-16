'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Clock, Shield, BarChart3, ChevronRight, X } from 'lucide-react'

// --- Components ---

const Hero = () => (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto text-center relative z-10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <span className="text-orange-pulse font-bold tracking-[0.3em] text-xs uppercase mb-6 block">
                    Estrategia impulsada por IA
                </span>
                <h1 className="text-5xl md:text-7xl font-bold text-core-black leading-tight mb-8">
                    Reclama tu aire.<br />
                    <span className="text-zinc-400">Domina tu identidad.</span>
                </h1>
                <p className="text-xl text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                    La mayoría falla porque intenta dejar de fumar con voluntad. Nosotros te damos una
                    estrategia de <span className="text-core-black font-semibold">180 segundos</span> para ganar cada batalla.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <a
                        href="/signup"
                        className="group bg-orange-pulse text-core-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-orange-pulse/20"
                    >
                        Empieza tu libertad hoy
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                    <a href="/login" className="text-core-black font-bold text-sm tracking-widest uppercase hover:underline underline-offset-8 decoration-orange-pulse">
                        Ya tengo cuenta
                    </a>
                </div>
            </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-lime-lift/10 rounded-full blur-[100px]" />
            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-orange-pulse/10 rounded-full blur-[100px]" />
        </div>
    </section>
)

const ThePain = () => (
    <section className="py-24 bg-core-black text-white px-6">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-orange-pulse font-bold tracking-widest text-xs mb-12 text-center uppercase">La Realidad</h2>
            <div className="grid md:grid-cols-3 gap-12">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold">El Costo Invisible</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        No solo quemas tus pulmones, sino el fondo universitario de tus hijos o tu próximo auto.
                    </p>
                </div>
                <div className="space-y-4">
                    <h3 className="text-xl font-bold">La Correa Invisible</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Fumar no es un placer, es una orden que tu cerebro obedece cada 45 minutos. ¿Quién manda realmente?
                    </p>
                </div>
                <div className="space-y-4">
                    <h3 className="text-xl font-bold">El Riesgo Real</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        Cada cigarrillo es una apuesta contra el tiempo que no puedes permitirte perder.
                    </p>
                </div>
            </div>
        </div>
    </section>
)

const BentoBenefits = () => (
    <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-core-black text-3xl md:text-5xl font-bold mb-16 text-center">Tácticas de Ganancia Cognitiva</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Identidad */}
                <div className="md:col-span-2 bg-[#F7F7F7] p-8 rounded-[24px] flex flex-col justify-between group hover:bg-zinc-100 transition-colors">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-12 shadow-sm">
                        <Shield className="text-orange-pulse w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-core-black mb-4">Identidad Recuperada</h3>
                        <p className="text-zinc-500">
                            Vuelve a ser el atleta, el padre y el líder que tu familia admira. Conéctate con tus anclas de identidad reales.
                        </p>
                    </div>
                </div>

                {/* Financiero */}
                <div className="bg-lime-lift p-8 rounded-[24px] flex flex-col justify-between">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-12">
                        <BarChart3 className="text-core-black w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-core-black mb-4">Libertad Financiera</h3>
                        <p className="text-core-black/70">
                            Mira cómo tus ahorros se convierten en capital de inversión en tiempo real.
                        </p>
                    </div>
                </div>

                {/* Paz Mental */}
                <div className="bg-core-black p-8 rounded-[24px] flex flex-col justify-between text-white md:col-span-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="max-w-md">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-8">
                                <Clock className="text-orange-pulse w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Intervención de 180 Segundos</h3>
                            <p className="text-zinc-400">
                                Elimina la ansiedad del 'craving' con una intervención diseñada para ganar cada batalla de 3 minutos.
                            </p>
                        </div>
                        <div className="bg-white/5 border border-white/10 p-6 rounded-2xl flex-1 max-w-sm">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-2 h-2 rounded-full bg-lime-lift animate-pulse" />
                                <span className="text-xs font-mono uppercase text-zinc-500">IA Analizando...</span>
                            </div>
                            <p className="italic text-zinc-300">"¿Es este impulso más fuerte que tu libertad?"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
)

const Testimonials = () => {
    const [index, setIndex] = useState(0)
    const testimonials = [
        {
            name: "Marcos, 42 años",
            text: "Había probado todo. Con SmokeZero dejé de sentir que 'me faltaba algo'. La IA me conoce mejor que yo mismo. Llevo 6 meses libre y ahorré para mi primer viaje en familia.",
        },
        {
            name: "Lucía, 35 años",
            text: "Lo que más me impactó fue el botón de emergencia. Esos 180 segundos cambiaron mi vida. Hoy corro 10k sin agitarme.",
        },
        {
            name: "Roberto, 50 años",
            text: "Pasé de ser un esclavo del tabaco a ser el dueño de mis finanzas. Ver cómo mi dinero pasaba de humo a mi cartera de inversión fue el clic definitivo.",
        }
    ]

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % testimonials.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [testimonials.length])

    return (
        <section className="py-24 px-6 bg-[#FAFAFA]">
            <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-zinc-400 font-bold tracking-widest text-xs mb-16 uppercase">Prueba Social de Alto Rendimiento</h2>

                <div className="relative h-64 md:h-48">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.05 }}
                            className="absolute inset-0 flex flex-col items-center"
                        >
                            <p className="text-xl md:text-2xl font-medium text-core-black mb-8 italic">
                                "{testimonials[index].text}"
                            </p>
                            <span className="font-bold text-orange-pulse tracking-widest uppercase text-sm">
                                {testimonials[index].name}
                            </span>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </section>
    )
}

const ExitIntent = () => {
    const [show, setShow] = useState(false)

    useEffect(() => {
        const handleMouseLeave = (e: MouseEvent) => {
            if (e.clientY <= 0 && !localStorage.getItem('exit-intent-shown')) {
                setShow(true)
                localStorage.setItem('exit-intent-shown', 'true')
            }
        }
        document.addEventListener('mouseleave', handleMouseLeave)
        return () => document.removeEventListener('mouseleave', handleMouseLeave)
    }, [])

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] bg-core-black/80 backdrop-blur-sm flex items-center justify-center p-6"
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="bg-white rounded-[32px] p-10 max-w-lg w-full relative shadow-2xl"
                    >
                        <button
                            onClick={() => setShow(false)}
                            className="absolute top-6 right-6 text-zinc-400 hover:text-core-black"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="text-center">
                            <h3 className="text-3xl font-bold text-core-black mb-4">¿Te vas a rendir tan fácil?</h3>
                            <p className="text-zinc-500 mb-8 leading-relaxed">
                                ¿Seguro que quieres seguir regalándole tus minutos de vida al humo? Prueba SmokeZero gratis por 7 días y siente la diferencia en tus pulmones hoy mismo.
                            </p>
                            <a
                                href="/signup"
                                className="block w-full bg-orange-pulse text-core-black py-4 rounded-full font-bold hover:scale-[1.02] transition-transform"
                            >
                                No, quiero empezar ahora
                            </a>
                            <button
                                onClick={() => setShow(false)}
                                className="mt-6 text-xs text-zinc-400 uppercase tracking-widest font-bold hover:text-core-black"
                            >
                                Tal vez en otro momento
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white">
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md px-6 py-6 border-b border-zinc-100 flex justify-between items-center">
                <span className="font-bold tracking-[0.3em] text-xs text-core-black">SMOKEZERO</span>
                <div className="flex items-center gap-8">
                    <a href="/login" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-core-black transition-colors">Ingresar</a>
                    <a href="/signup" className="text-xs font-bold uppercase tracking-widest bg-core-black text-white px-6 py-2 rounded-full hover:bg-zinc-800 transition-colors">Activar</a>
                </div>
            </nav>

            <Hero />
            <ThePain />
            <BentoBenefits />
            <Testimonials />

            <section className="py-32 px-6 text-center">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-core-black mb-8">Un solo paso entre tú y tu nueva vida.</h2>
                    <a
                        href="/signup"
                        className="inline-flex items-center gap-3 bg-orange-pulse text-core-black px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl transition-shadow"
                    >
                        Activar mi SmokeZero
                        <ChevronRight className="w-6 h-6" />
                    </a>
                    <p className="mt-8 text-zinc-400 text-sm">Empieza gratis. Resultados en el primer impulso.</p>
                </div>
            </section>

            <footer className="py-12 border-t border-zinc-100 px-6 text-center">
                <p className="text-xs text-zinc-400 tracking-widest uppercase mb-4">Integrado con el Sistema Konkest</p>
                <p className="text-xs text-zinc-300">© 2026 SmokeZero. Reclama tu Aire.</p>
            </footer>

            <ExitIntent />
        </div>
    )
}
