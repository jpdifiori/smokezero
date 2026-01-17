'use client'

import { NutritionMoment } from "@/lib/nutrition/types"
import { motion } from "framer-motion"
import { Check, Clock, Utensils } from "lucide-react"

interface MomentCardProps {
    moment: NutritionMoment;
    index: number;
    selectedOptionId?: string;
    onSelect: (optionId: string) => void;
}

export function MomentCard({ moment, index, selectedOptionId, onSelect }: MomentCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative overflow-hidden rounded-2xl bg-zinc-900/40 border border-white/5 p-5 hover:bg-zinc-900/60 transition-colors"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-lime-lift/10 flex items-center justify-center text-lime-lift">
                        <span className="text-xs font-bold font-mono">{moment.code}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{moment.name}</h3>
                </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
                {moment.options?.map((option, idx) => {
                    const isSelected = selectedOptionId === option.id;
                    return (
                        <button
                            key={option.id}
                            onClick={() => onSelect(option.id)}
                            className={`
                                w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 text-left
                                ${isSelected
                                    ? 'bg-lime-lift/20 border-lime-lift/50 text-white shadow-[0_0_15px_rgba(209,255,116,0.1)]'
                                    : 'bg-black/20 border-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                                }
                                border
                            `}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isSelected ? 'bg-lime-lift' : 'bg-zinc-700'}`} />
                            <p className="text-sm leading-relaxed">
                                {option.description}
                            </p>
                            {isSelected && (
                                <div className="ml-auto">
                                    <Check className="w-4 h-4 text-lime-lift" />
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Decorative Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-lift/5 blur-[50px] rounded-full pointer-events-none -mr-16 -mt-16" />
        </motion.div>
    )
}
