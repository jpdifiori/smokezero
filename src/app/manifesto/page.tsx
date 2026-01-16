'use client';

import { motion } from 'framer-motion';
import { acceptManifesto } from '@/app/auth/actions';
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

const content = [
    { text: "La ciencia ha hablado: cada cigarrillo que enciendes te roba exactamente 11 minutos de vida.", highlight: false },
    { text: "No es una metáfora. Es tiempo real. Son 11 minutos menos para ver crecer a tus hijos, 11 minutos menos para disfrutar de tu éxito, 11 minutos menos de aire puro en la cima de una montaña.", highlight: false },
    { text: "Un atado al día no es un hábito; es un contrato donde firmas que hoy vas a vivir 3 horas y media menos que el resto del mundo.", highlight: false },
    { text: "En SmokeZero, no contamos días sin fumar. Contamos tiempo recuperado. Cada vez que presionas el botón de victoria, le estás devolviendo a tu 'Yo del Futuro' el regalo más caro del mundo: TIEMPO.", highlight: "TIEMPO" },
    { text: "Tu identidad no es la de un fumador. Eres un arquitecto de tu propia longevidad.", highlight: false },
    { text: "A partir de ahora, cada segundo cuenta.", highlight: false },
    { text: "Reclama tus 11 minutos.", highlight: "11 minutos" },
];

function ManifestoContent() {
    const searchParams = useSearchParams();
    const identity = searchParams.get('type') || 'Libre';
    const [name, setName] = useState('');
    const [statement, setStatement] = useState('');

    useEffect(() => {
        setStatement(`Yo soy ${name || '[Tu Nombre]'} y hoy elijo ser ${identity}`);
    }, [name, identity]);

    return (
        <div className="max-w-3xl w-full pt-20 pb-32">
            <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-3xl md:text-6xl font-serif text-center mb-12 md:mb-20 italic leading-tight"
            >
                La Matemática de tu Libertad
            </motion.h1>

            <div className="space-y-8 md:space-y-12">
                {content.map((item, i) => (
                    <motion.p
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8, delay: i * 0.1 }}
                        className="text-lg md:text-2xl leading-relaxed text-zinc-300 font-light"
                    >
                        {typeof item.highlight === 'string' ? (
                            <>
                                {item.text.split(item.highlight)[0]}
                                <span className="text-orange-pulse font-bold">{item.highlight}</span>
                                {item.text.split(item.highlight)[1]}
                            </>
                        ) : item.text}
                    </motion.p>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 1, duration: 1 }}
                className="mt-16 md:mt-24 space-y-10 md:space-y-12"
            >
                <div className="bg-zinc-900/50 p-6 md:p-8 rounded-[28px] md:rounded-[32px] border border-white/5 space-y-6">
                    <h3 className="text-orange-pulse font-bold uppercase tracking-widest text-center text-[10px] md:text-sm">Mi Declaración de Poder</h3>

                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] text-zinc-500 uppercase tracking-widest text-center">Escribe tu nombre para sellar este compromiso</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Tu nombre..."
                            className="bg-transparent border-b-2 border-zinc-800 focus:border-orange-pulse outline-none text-xl md:text-2xl text-center py-2 font-serif italic transition-colors placeholder:text-zinc-700"
                        />
                    </div>

                    <div className="p-4 md:p-6 bg-core-black/50 rounded-2xl border border-white/5 text-center">
                        <p className="text-xl md:text-3xl font-serif italic text-zinc-200">
                            "{statement}"
                        </p>
                    </div>
                </div>

                <form action={acceptManifesto} className="flex justify-center flex-col items-center gap-4">
                    <input type="hidden" name="identity_statement" value={statement} />
                    <button
                        type="submit"
                        disabled={!name}
                        className="w-full md:w-auto bg-lime-lift text-core-black px-8 md:px-12 py-4 md:py-5 rounded-full font-bold text-base md:text-xl hover:scale-105 transition-all shadow-[0_0_40px_rgba(209,255,116,0.2)] uppercase tracking-widest disabled:opacity-30 disabled:hover:scale-100"
                    >
                        Aceptar Desafío
                    </button>
                    <span className="text-[10px] text-zinc-600 uppercase tracking-widest md:hidden">Reclamar mi tiempo</span>
                </form>
            </motion.div>
        </div>
    );
}

export default function ManifestoPage() {
    return (
        <div className="min-h-screen bg-core-black text-white flex flex-col items-center justify-center p-6 md:p-12">
            <Suspense fallback={<div className="text-zinc-500">Iniciando Manifiesto...</div>}>
                <ManifestoContent />
            </Suspense>
            <div className="fixed bottom-0 left-0 w-full h-32 bg-gradient-to-t from-core-black to-transparent pointer-events-none" />
        </div>
    );
}
