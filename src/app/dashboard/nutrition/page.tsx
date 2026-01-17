import { getNutritionPlan, getUserCheckins } from "@/app/actions/nutrition"
import { NutritionCalendar } from "@/components/nutrition/NutritionCalendar"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const revalidate = 0;

export default async function NutritionPage() {
    // Standard plan code for SmokeZero
    const PLAN_CODE = 'smokezero_30d_v2';
    const plan = await getNutritionPlan(PLAN_CODE);

    // In the unlikely event it's not found, show a clean message
    if (!plan) {
        return (
            <div className="min-h-screen bg-core-black text-white p-8 flex flex-col items-center justify-center">
                <h1 className="text-2xl font-bold mb-4">Plan de Alimentación</h1>
                <p className="text-zinc-500 mb-8 max-w-md text-center">
                    No se encontró el plan especificado. Por favor contacta a soporte.
                </p>
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 text-lime-lift hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
                </Link>
            </div>
        )
    }

    const checkins = await getUserCheckins(plan.id);
    const { getUserSelections } = await import("@/app/actions/nutrition")
    const { getUserProfile } = await import("@/app/actions")

    const [selections, profile] = await Promise.all([
        getUserSelections(plan.id),
        getUserProfile()
    ]);

    // Calculate current day based on manifesto_accepted_at
    let initialDay = 1;
    if (profile?.manifesto_accepted_at) {
        const start = new Date(profile.manifesto_accepted_at);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - start.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        initialDay = Math.min(30, Math.max(1, diffDays + 1));
    }

    return (
        <div className="min-h-screen bg-core-black text-white flex flex-col h-screen overflow-hidden pb-10 relative">
            {/* Minimal Header */}
            <div className="flex items-center gap-4 p-4 border-b border-white/5 bg-zinc-900/50">
                <Link href="/dashboard" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-zinc-400" />
                </Link>
                <div>
                    <h1 className="text-lg font-bold tracking-tight text-white">{plan.name}</h1>
                    <p className="text-xs text-zinc-500 line-clamp-1">{plan.description}</p>
                </div>
            </div>

            {/* Calendar & Content */}
            <div className="flex-1 min-h-0">
                <NutritionCalendar
                    plan={plan}
                    checkins={checkins}
                    selections={selections}
                    initialDay={initialDay}
                />
            </div>
        </div>
    )
}
