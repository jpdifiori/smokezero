'use strict';

import { Sparkles } from 'lucide-react';

interface AIInsightCardProps {
    prediction: string;
}

export function AIInsightCard({ prediction }: AIInsightCardProps) {
    return (
        <div className="mt-6 bg-zinc-950 border border-[#D1FF74] rounded-2xl p-6 relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D1FF74]/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D1FF74]/10 flex items-center justify-center shrink-0 border border-[#D1FF74]/20 shadow-[0_0_15px_rgba(209,255,116,0.1)]">
                    <Sparkles className="w-5 h-5 text-[#D1FF74]" />
                </div>

                <div className="flex-1">
                    <h3 className="font-serif text-white text-lg leading-none mb-2">Oráculo</h3>
                    <p className="text-zinc-300 text-sm leading-relaxed font-light">
                        {prediction}
                    </p>
                </div>
            </div>
        </div>
    );
}
