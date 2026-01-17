'use client'

import { useState, useRef, useEffect } from "react"
import { NutritionPlan, UserDayCheckin, NutritionSelection } from "@/lib/nutrition/types"
import { DayView } from "./DayView"
import { motion } from "framer-motion"
import { ChevronRight, Calendar } from "lucide-react"

interface NutritionCalendarProps {
    plan: NutritionPlan;
    checkins: UserDayCheckin[];
    selections: NutritionSelection[];
    initialDay?: number;
}

export function NutritionCalendar({ plan, checkins, selections, initialDay = 1 }: NutritionCalendarProps) {
    const [selectedDay, setSelectedDay] = useState(initialDay);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll to the selected day on mount
    useEffect(() => {
        if (scrollRef.current && initialDay > 1) {
            const container = scrollRef.current;
            const button = container.querySelector(`[data-day="${initialDay}"]`);
            if (button) {
                const scrollLeft = (button as HTMLElement).offsetLeft - container.offsetWidth / 2 + (button as HTMLElement).offsetWidth / 2;
                container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
            }
        }
    }, [initialDay]);

    // Auto-scroll to selected day on mount (optional, or stick to 1)

    const days = Array.from({ length: 30 }, (_, i) => i + 1);

    return (
        <div className="flex flex-col h-full">
            {/* Calendar Strip */}
            <div className="relative z-10 bg-core-black/95 backdrop-blur-md border-b border-white/5 pt-4">
                {/* Edge Fades for scroll indication */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-core-black to-transparent z-20 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-core-black to-transparent z-20 pointer-events-none" />

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-3 px-8 pb-6 scrollbar-hide snap-x touch-pan-x overscroll-contain cursor-grab active:cursor-grabbing"
                >
                    {days.map((day) => {
                        const isSelected = selectedDay === day;
                        const isCompleted = checkins.some(c => c.day_index === day && c.did_comply);

                        return (
                            <button
                                key={day}
                                data-day={day}
                                onClick={() => setSelectedDay(day)}
                                className={`
                                    relative flex-shrink-0 w-14 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 snap-center
                                    ${isSelected
                                        ? 'bg-lime-lift text-core-black scale-110 shadow-[0_0_20px_rgba(209,255,116,0.2)]'
                                        : 'bg-zinc-900/50 text-zinc-500 border border-white/5 hover:border-white/10 hover:text-white'
                                    }
                                `}
                            >
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'opacity-100' : 'opacity-50'}`}>Día</span>
                                <span className="text-xl font-bold font-mono">{day}</span>

                                {isCompleted && (
                                    <div className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-black' : 'bg-lime-lift'}`} />
                                )}
                            </button>
                        )
                    })}

                    {/* Padding for end of scroll */}
                    <div className="w-4 flex-shrink-0" />
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto min-h-0 bg-core-black">
                <DayView
                    dayIndex={selectedDay}
                    plan={plan}
                    checkin={checkins.find(c => c.day_index === selectedDay)}
                    initialSelections={selections.filter(s => s.day_index === selectedDay)}
                />
            </div>
        </div>
    )
}
