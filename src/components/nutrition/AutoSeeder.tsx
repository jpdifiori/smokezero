'use client'

import { useEffect, useState } from 'react'
import { seedNutritionPlan } from '@/app/actions/nutrition'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export function AutoSeeder() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const init = async () => {
            await seedNutritionPlan()
            router.refresh()
            setLoading(false)
        }
        init()
    }, [router])

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-core-black text-white gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-lime-lift" />
            <p className="text-zinc-400 text-sm animate-pulse">Inicializando Plan de Alimentación...</p>
        </div>
    )
}
