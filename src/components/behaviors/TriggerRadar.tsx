'use strict';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface TriggerRadarProps {
    data: { subject: string; A: number; fullMark: number }[];
}

export function TriggerRadar({ data }: TriggerRadarProps) {
    if (!data || data.length === 0) {
        return <div className="text-zinc-500 text-sm">No hay suficientes datos.</div>;
    }

    // Custom Tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 border border-zinc-700 p-2 rounded shadow-xl text-xs">
                    <p className="font-bold text-white">{payload[0].payload.subject}</p>
                    <p className="text-zinc-400">Intensidad: {payload[0].value}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-[300px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                    <PolarGrid stroke="#E2E8F0" strokeOpacity={0.2} />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 150]}
                        tick={false}
                        axisLine={false}
                    />
                    <Radar
                        name="Disparadores"
                        dataKey="A"
                        stroke="#FFB273" // Orange Pulse
                        strokeWidth={2}
                        fill="#FFB273"
                        fillOpacity={0.3}
                    />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
