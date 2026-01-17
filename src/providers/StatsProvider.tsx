'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSavingsStats } from '@/app/actions';
import { getUserConfig, type UserConfig } from '@/lib/user-config';
import { usePathname } from 'next/navigation';
import { Paywall } from '@/components/subscription/Paywall';

interface StatsContextType {
    savings: {
        totalVetos: number;
        totalSaved: number;
        totalLifeSaved: number;
        totalIdentityVotes: number;
        startDate?: string;
        cigsPerDay?: number;
    };
    config: UserConfig | null;
    loading: boolean;
    refreshStats: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: React.ReactNode }) {
    const [savings, setSavings] = useState({
        totalVetos: 0,
        totalSaved: 0,
        totalLifeSaved: 0,
        totalIdentityVotes: 0,
    });
    const [config, setConfig] = useState<UserConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const pathname = usePathname();

    const [showPaywall, setShowPaywall] = useState(false);

    const refreshStats = useCallback(async () => {
        const [configData, statsData] = await Promise.all([
            getUserConfig(),
            getSavingsStats(),
        ]);

        console.log('StatsProvider: Refreshed stats');
        setConfig(configData);
        setSavings(statsData as any);
        setLoading(false);

        // Check Access
        if (configData) {
            const isSubscribed = configData.subscription_status === 'active';
            if (isSubscribed) {
                setShowPaywall(false);
                return;
            }

            const createdAt = new Date(configData.created_at || new Date().toISOString());
            const now = new Date();
            const hoursSinceSignup = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);

            if (hoursSinceSignup >= 24) {
                setShowPaywall(true);
            } else {
                setShowPaywall(false);
            }
        }
    }, []);

    useEffect(() => {
        refreshStats();
    }, [refreshStats, pathname]);

    return (
        <StatsContext.Provider value={{ savings, config, loading, refreshStats }}>
            {children}
            {showPaywall && <Paywall />}
        </StatsContext.Provider>
    );
}

export function useStats() {
    const context = useContext(StatsContext);
    if (context === undefined) {
        throw new Error('useStats must be used within a StatsProvider');
    }
    return context;
}
