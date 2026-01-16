'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MasterButton } from '@/components/intervention/MasterButton';
import { ResistanceTimer } from '@/components/intervention/ResistanceTimer';
import { DistractionPrompt } from '@/components/intervention/DistractionPrompt';
import { logSmokeAttempt, getDistractionPrompt, getAdaptiveMission } from '@/app/actions';
import { useRouter } from 'next/navigation';
import { LifeTimer } from '@/components/dashboard/LifeTimer';
import { useStats } from '@/providers/StatsProvider';
import { DollarSign } from 'lucide-react';
import { CrisisInput, CrisisContext } from '@/components/intervention/CrisisInput';
import { ProfilingCard } from '@/components/dashboard/ProfilingCard';

type InterventionState = 'IDLE' | 'AI_INTERVENTION' | 'TIMER' | 'SUCCESS' | 'FAILED';

export default function Home() {
  const [state, setState] = useState<InterventionState>('IDLE');
  const [aiQuestion, setAiQuestion] = useState("");
  const [currentMission, setCurrentMission] = useState("");
  const [context, setContext] = useState<CrisisContext | null>(null);
  const [isLoadingMission, setIsLoadingMission] = useState(false);
  const [profilingQuestion, setProfilingQuestion] = useState<{ question: string, category: string } | null>(null);

  const { savings, config, loading, refreshStats } = useStats();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!config || !config.setup_completed)) {
      router.push('/setup');
    } else if (!loading && config && !config.identity_type) {
      router.push('/identity');
    } else if (!loading && config && !config.manifesto_accepted) {
      router.push(`/manifesto?type=${config.identity_type}`);
    }
  }, [config, loading, router]);

  const startIntervention = async () => {
    setState('AI_INTERVENTION');
    // Pre-fetch both cognitive disruption and profiling question for stability
    const [question, prefetchedQuestion] = await Promise.all([
      getDistractionPrompt(),
      import('@/app/actions').then(m => m.getProfilingQuestion())
    ]);
    setAiQuestion(question);
    setProfilingQuestion(prefetchedQuestion);
  };

  const handleContextConfirm = async (ctx: CrisisContext) => {
    setContext(ctx);
    setIsLoadingMission(true);
    const mission = await getAdaptiveMission(ctx);
    setCurrentMission(mission);
    setIsLoadingMission(false);
    setState('TIMER');
  };

  const handleTimerComplete = async () => {
    setState('SUCCESS');
    await logSmokeAttempt({
      type: 'VETO',
      intensity: context?.emotion === 'STRESS' ? 10 : 5,
      time_to_decision: 10,
      mission_text: currentMission,
      context: context || {}
    });
    await refreshStats();
  };

  const handleGiveUp = async () => {
    setState('FAILED');
    await logSmokeAttempt({
      type: 'CEDO',
      intensity: context?.emotion === 'STRESS' ? 10 : 5,
      time_to_decision: 60,
      mission_text: currentMission,
      context: context || {}
    });
    setTimeout(() => setState('IDLE'), 3000);
  };

  const handleReset = () => {
    setState('IDLE');
  };

  if (loading) {
    return <div className="min-h-screen bg-core-black text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-core-black text-white px-4 pt-24 pb-4 overflow-hidden relative">

      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900/50 to-core-black z-0 pointer-events-none" />

      <div className="z-10 w-full max-w-4xl px-4 flex flex-col items-center">

        <AnimatePresence mode="wait">
          {state === 'IDLE' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="flex flex-col items-center w-full"
            >


              {/* Top Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
                <LifeTimer
                  minutes={savings.totalLifeSaved}
                  cigsPerDay={savings.cigsPerDay}
                />

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-zinc-900/40 backdrop-blur-sm border border-white/5 py-4 px-6 rounded-[24px] flex items-center gap-4 group hover:border-lime-lift/20 transition-colors"
                >
                  <div className="w-10 h-10 min-w-10 bg-lime-lift/10 rounded-full flex items-center justify-center">
                    <DollarSign className="text-lime-lift w-5 h-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Libertad</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-white text-xl font-mono font-bold">
                        ${savings.totalSaved.toFixed(0)}
                      </span>
                      <span className="text-[10px] text-zinc-600 uppercase">Ahorrado</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              <MasterButton onClick={startIntervention} />
            </motion.div>
          )}

          {state === 'AI_INTERVENTION' && (
            <motion.div
              key="ai"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <DistractionPrompt question={aiQuestion || "Analizando impulso..."} />

              <div className="mt-4">
                {isLoadingMission ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-lime-lift rounded-full animate-spin mb-4" />
                    <span className="text-xs text-zinc-500 uppercase tracking-widest animate-pulse">Generando Estrategia...</span>
                  </div>
                ) : (
                  <CrisisInput onConfirm={handleContextConfirm} />
                )}
              </div>
            </motion.div>
          )}

          {state === 'TIMER' && (
            <motion.div
              key="timer"
              className="w-full flex flex-col items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <ResistanceTimer
                duration={10}
                onComplete={handleTimerComplete}
                initialMission={currentMission}
              />
              <button
                onClick={handleGiveUp}
                className="mt-12 text-zinc-600 text-xs uppercase tracking-widest hover:text-red-500 transition-colors"
              >
                Ceder al impulso
              </button>
            </motion.div>
          )}

          {state === 'SUCCESS' && (
            <motion.div
              key="success"
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-32 h-32 rounded-full bg-lime-lift flex items-center justify-center mx-auto mb-6 shadow-[0_0_50px_rgba(209,255,116,0.3)]">
                <svg className="w-16 h-16 text-core-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">¡VETO CONFIRMADO!</h2>
              <p className="text-zinc-400 mb-8">Has recuperado el control.</p>

              <div className="mb-12">
                <ProfilingCard
                  onComplete={handleReset}
                  preFetchedData={profilingQuestion}
                />
              </div>

              <div className="flex gap-4 justify-center mb-8 opacity-90">
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                  <p className="text-lime-lift text-lg font-mono font-bold">
                    + ${config ? (config.pack_price / 20).toFixed(0) : '0'}
                  </p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">Ahorrado</p>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-lg border border-white/5">
                  <p className="text-orange-pulse text-lg font-mono font-bold">
                    + 11 MIN
                  </p>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider">De Vida</p>
                </div>
              </div>
            </motion.div>
          )}

          {state === 'FAILED' && (
            <motion.div
              key="failed"
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2 className="text-3xl font-bold text-red-500 mb-2">RECARGA Y SIGUE</h2>
              <p className="text-zinc-400 mb-8">Cada batalla es un aprendizaje. No te detengas.</p>
              <div className="w-16 h-16 border-2 border-red-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <div className="w-8 h-8 bg-red-500 rounded-full blur-sm" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}
