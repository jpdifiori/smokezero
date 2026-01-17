'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GuardianContextType {
    isGuardianOpen: boolean;
    openGuardian: () => void;
    closeGuardian: () => void;
    toggleGuardian: () => void;
}

const GuardianContext = createContext<GuardianContextType | undefined>(undefined);

export function GuardianProvider({ children }: { children: ReactNode }) {
    const [isGuardianOpen, setIsGuardianOpen] = useState(false);

    const openGuardian = () => setIsGuardianOpen(true);
    const closeGuardian = () => setIsGuardianOpen(false);
    const toggleGuardian = () => setIsGuardianOpen(prev => !prev);

    return (
        <GuardianContext.Provider value={{ isGuardianOpen, openGuardian, closeGuardian, toggleGuardian }}>
            {children}
        </GuardianContext.Provider>
    );
}

export function useGuardian() {
    const context = useContext(GuardianContext);
    if (context === undefined) {
        throw new Error('useGuardian must be used within a GuardianProvider');
    }
    return context;
}
