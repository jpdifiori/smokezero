'use client'

import { NutritionPlan, NutritionTemplate, UserDayCheckin, NutritionSelection } from "@/lib/nutrition/types"
import { toggleDayCompliance, saveMealSelection } from "@/app/actions/nutrition"
import { MomentCard } from "./MomentCard"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2, Circle } from "lucide-react"
import { useState, useEffect } from "react"
import confetti from "canvas-confetti"

interface DayViewProps {
    dayIndex: number;
    plan: NutritionPlan;
    checkin?: UserDayCheckin;
    initialSelections: NutritionSelection[];
}

export function DayView({ dayIndex, plan, checkin, initialSelections }: DayViewProps) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [selections, setSelections] = useState<Record<string, string>>({}); // momentId -> optionId

    useEffect(() => {
        setIsCompleted(checkin?.did_comply || false);
    }, [checkin]);

    useEffect(() => {
        const selMap: Record<string, string> = {};
        initialSelections.forEach(s => {
            selMap[s.moment_id] = s.option_id;
        });
        setSelections(selMap);
    }, [initialSelections]);

    const handleSelectOption = async (momentId: string, optionId: string) => {
        setSelections(prev => ({ ...prev, [momentId]: optionId })); // Optimistic
        await saveMealSelection(plan.id, dayIndex, momentId, optionId);
    }

    // Rotation Logic: 
    // W1 (1-7): A, W2 (8-14): B, W3 (15-21): A, W4 (22-30): B
    const getTemplateCode = (day: number) => {
        if (day <= 7) return 'A';
        if (day <= 14) return 'B';
        if (day <= 21) return 'A';
        return 'B';
    }

    const templateCode = getTemplateCode(dayIndex);
    const dayOfWeek = ((dayIndex - 1) % 7) + 1;
    const template = plan.templates?.find(t => t.code === templateCode);

    // Filter moments for this specific day of the week
    const moments = template?.moments?.filter(m => m.day_of_week === dayOfWeek) || [];

    // Sort moments by order
    moments.sort((a, b) => a.order - b.order);

    const handleToggle = async () => {
        const newState = !isCompleted;
        setIsCompleted(newState); // Optimistic

        if (newState) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.8 },
                colors: ['#D1FF74', '#ffffff']
            });
        }

        setIsSaving(true);
        await toggleDayCompliance(plan.id, dayIndex, newState);
        setIsSaving(false);
    }

    if (!template || moments.length === 0) {
        return (
            <div className="text-center py-20 text-zinc-500">
                <p>No hay plan detallado asignado para este día ({dayOfWeek}).</p>
                <p className="text-xs mt-2">Plantilla {templateCode}</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Info */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-lime-lift uppercase tracking-widest mb-1">
                        Día {dayIndex} • Semana {Math.ceil(dayIndex / 7)}
                    </h2>
                    <p className="text-2xl font-bold text-white">
                        {templateCode === 'A' ? 'Plan Base' : 'Plan Alternativo'}
                    </p>
                </div>

                <button
                    onClick={handleToggle}
                    disabled={isSaving}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-300 ${isCompleted
                        ? 'bg-lime-lift text-core-black border-lime-lift shadow-[0_0_20px_rgba(209,255,116,0.3)]'
                        : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-lime-lift/50 hover:text-white'
                        }`}
                >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    <span className="font-bold uppercase tracking-wide text-xs">
                        {isCompleted ? 'Día Cumplido' : 'Marcar Cumplido'}
                    </span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                {moments.map((moment, idx) => (
                    <MomentCard
                        key={moment.id}
                        moment={moment}
                        index={idx}
                        selectedOptionId={selections[moment.id]}
                        onSelect={(optionId: string) => handleSelectOption(moment.id, optionId)}
                    />
                ))}
            </div>
        </div>
    )
}
