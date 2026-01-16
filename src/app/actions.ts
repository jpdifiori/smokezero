'use server';

import { createClient } from '@/lib/supabase/server';
import { geminiModel } from '@/lib/ai/gemini';
import { revalidatePath } from 'next/cache';

export async function logSmokeAttempt(data: {
    type: 'VETO' | 'CEDO';
    intensity: number;
    time_to_decision: number;
    mission_text?: string;
    context?: any;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .schema('smokezero')
        .from('smoke_logs')
        .insert({
            user_id: user.id,
            type: data.type,
            intensity: data.intensity,
            time_to_decision: data.time_to_decision,
            mission_text: data.mission_text,
            context_json: data.context || {}
        });

    if (error) {
        console.error('Error logging attempt:', error);
        return { error: error.message };
    }

    // Increment identity votes on VETO
    if (data.type === 'VETO') {
        const { data: config } = await supabase
            .schema('smokezero')
            .from('user_config')
            .select('total_identity_votes')
            .eq('user_id', user.id)
            .single();

        const currentVotes = config?.total_identity_votes || 0;

        await supabase
            .schema('smokezero')
            .from('user_config')
            .update({ total_identity_votes: currentVotes + 1 })
            .eq('user_id', user.id);
    }

    revalidatePath('/dashboard', 'page');
    return { success: true };
}

export async function getUnifiedFocus() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Get Identity Anchor
    const { data: config } = await supabase.schema('smokezero').from('user_config').select('identity_anchor').eq('user_id', user.id).single();
    const identityAnchor = config?.identity_anchor || 'Libre';

    // 2. Sync Identity into Motivations if missing
    // We check if there's a motivation with category 'IDENTITY'
    const { data: identityMotiv } = await supabase
        .schema('smokezero')
        .from('user_motivations')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', 'IDENTITY')
        .single();

    if (!identityMotiv) {
        // Insert it as Top Priority (0 or 1)
        await supabase.schema('smokezero').from('user_motivations').insert({
            user_id: user.id,
            category: 'IDENTITY',
            entity_name: identityAnchor,
            priority: 1
        });
    } else if (identityMotiv.entity_name !== identityAnchor) {
        // Update if anchor changed
        await supabase.schema('smokezero').from('user_motivations').update({ entity_name: identityAnchor }).eq('id', identityMotiv.id);
    }

    // 3. Return all sorted by priority
    let { data: allFocus } = await supabase
        .schema('smokezero')
        .from('user_motivations')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true });

    // 4. Ensure at least 3 items (Auto-Seed)
    if (!allFocus || allFocus.length < 3) {
        const defaults = [
            { category: 'Familia', entity_name: 'Mi Familia', priority: 2 },
            { category: 'Salud', entity_name: 'Pulmones Limpios', priority: 3 }
        ];

        let addedCount = 0;
        for (const def of defaults) {
            if ((allFocus?.length || 0) + addedCount >= 3) break;

            // Check if similar exists to avoid dupe
            const exists = allFocus?.some(f => f.category === def.category);
            if (!exists) {
                await supabase.schema('smokezero').from('user_motivations').insert({
                    user_id: user.id,
                    category: def.category,
                    entity_name: def.entity_name,
                    priority: (allFocus?.length || 1) + addedCount + 1
                });
                addedCount++;
            }
        }

        // Re-fetch to return complete list
        const { data: refetched } = await supabase
            .schema('smokezero')
            .from('user_motivations')
            .select('*')
            .eq('user_id', user.id)
            .order('priority', { ascending: true });

        allFocus = refetched;
    }

    return allFocus || [];
}

export async function updateFocusOrder(items: { id: string, priority: number, category: string, entity_name: string }[]) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    // Bulk update seems tricky with simple RPCS, so we loop or use upsert
    // Upsert is best
    const updates = items.map(item => ({
        id: item.id,
        user_id: user.id, // RLS requirement usually
        priority: item.priority,
        category: item.category,
        entity_name: item.entity_name,
        updated_at: new Date().toISOString()
    }));

    const { error } = await supabase
        .schema('smokezero')
        .from('user_motivations')
        .upsert(updates);

    if (error) {
        console.error('Error updating focus order:', error);
        return { error: error.message };
    }

    return { success: true };
}

// Helper function for getSavingsGoals
export async function getUserProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: config } = await supabase
        .schema('smokezero')
        .from('user_config')
        .select('*')
        .eq('user_id', user.id)
        .single();

    return config;
}

export async function updateUserProfile(updates: {
    first_name?: string,
    last_name?: string,
    profession?: string,
    knowledge_base?: any
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .schema('smokezero')
        .from('user_config')
        .update(updates)
        .eq('user_id', user.id);

    if (error) return { error: error.message };

    revalidatePath('/dashboard');
    return { success: true };
}

// --- AI CONTEXT HELPER ---
export async function getSavingsGoals() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: goals, error } = await supabase
        .schema('smokezero')
        .from('savings_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('milestone_days', { ascending: true });

    if (error) return [];

    // Calculate dynamic status based on startDate
    const config = await getUserProfile();
    if (!config || !config.manifesto_accepted_at) return [];

    const startDate = new Date(config.manifesto_accepted_at);
    const now = new Date();
    const daysSinceQuit = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const milestones = [7, 14, 21, 30, 60];
    let foundActive = false;

    return milestones.map(m => {
        const existing = goals?.find(g => g.milestone_days === m);
        let status: 'locked' | 'active' | 'achieved' = 'locked';

        if (daysSinceQuit >= m) {
            status = 'achieved';
        } else if (!foundActive) {
            status = 'active';
            foundActive = true;
        }

        return {
            milestone_days: m,
            goal_name: existing?.goal_name || '',
            target_amount: existing?.target_amount || 0,
            goal_image_url: existing?.goal_image_url || '',
            significance: existing?.significance || '',
            status,
            id: existing?.id,
            user_id: user.id
        };
    });
}

export async function updateSavingsGoal(milestone: number, updates: { goal_name: string, target_amount: number, goal_image_url?: string, significance?: string }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const { error } = await supabase
        .schema('smokezero')
        .from('savings_goals')
        .upsert({
            user_id: user.id,
            milestone_days: milestone,
            ...updates
        }, {
            onConflict: 'user_id, milestone_days'
        });

    revalidatePath('/dashboard');
    return { success: true };
}

// --- AI ADAPTIVE INTELLIGENCE: ANGLE ROTATION ---

type ContextAngle = 'ARCHETYPE' | 'VALUES' | 'REWARD' | 'LEGACY' | 'LOGIC';

async function selectContextAngle(userId: string): Promise<ContextAngle> {
    const supabase = await createClient();
    const { data: history } = await supabase
        .schema('smokezero')
        .from('asked_questions')
        .select('category')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

    const angles: ContextAngle[] = ['ARCHETYPE', 'VALUES', 'REWARD', 'LEGACY', 'LOGIC'];
    const usedAngles = history?.map(h => h.category as ContextAngle) || [];

    // Find first angle not used in the last 2 interactions, or the least used
    const angleCounts = angles.reduce((acc, ang) => {
        acc[ang] = usedAngles.filter(ua => ua === ang).length;
        return acc;
    }, {} as Record<ContextAngle, number>);

    return angles.sort((a, b) => angleCounts[a] - angleCounts[b])[0];
}

export async function getUserComprehensiveContext() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const [config, focusList, traits, recentLogs, goals] = await Promise.all([
        supabase.schema('smokezero').from('user_config').select('*').eq('user_id', user.id).single(),
        getUnifiedFocus(),
        supabase.schema('smokezero').from('progressive_profiling').select('*').eq('user_id', user.id),
        supabase.schema('smokezero').from('smoke_logs').select('type, mission_text, created_at, intensity').eq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
        getSavingsGoals()
    ]);

    const activeGoal = goals.find(g => g.status === 'active');

    // Format traits into a readable string
    const userTraits = traits.data?.map(t => `${t.trait_key}: ${t.trait_value}`).join(', ') || 'sin rasgos específicos';

    // Top Focus Points
    const topFocus = focusList.slice(0, 3);
    const primaryFocus = topFocus[0];

    const focusText = `
        NOMRE: ${config.data?.first_name || 'No especificado'} ${config.data?.last_name || ''}.
        PROFESIÓN: ${config.data?.profession || 'No especificada'}.
        FOCO PRINCIPAL: "${primaryFocus?.entity_name}" (${primaryFocus?.category}).
        APOYOS: ${topFocus.slice(1).map(f => `"${f.entity_name}"`).join(', ')}.
        IDENTIDAD ELEGIDA: ${config.data?.identity_anchor || 'Libre'}.
    `;

    // Knowledge Base (Family)
    const kb = config.data?.knowledge_base || {};
    const kbText = `
        BASE DE CONOCIMIENTO PERSONAL:
        - Cónyuge: ${kb.spouse || 'No especificado'}
        - Madre: ${kb.mother || 'No especificado'}
        - Padre: ${kb.father || 'No especificado'}
        - Hijos: ${kb.children?.map((c: any) => `${c.name} (${c.age} años)`).join(', ') || 'Sin hijos registrados'}
        - Hermanos: ${kb.siblings || 'Sin registrar'}
    `;

    // Behavioral Patterns
    const successRate = recentLogs.data?.length
        ? (recentLogs.data.filter(l => l.type === 'VETO').length / recentLogs.data.length * 100).toFixed(0)
        : '100';

    const historyText = `
        EXITOS RECIENTES: [${recentLogs.data?.filter(l => l.type === 'VETO').map(l => l.mission_text).filter(Boolean).slice(0, 3).join(' | ')}]
        FALLOS RECIENTES: [${recentLogs.data?.filter(l => l.type === 'CEDO').map(l => l.mission_text).filter(Boolean).slice(0, 3).join(' | ')}]
        TASA DE ÉXITO ACTUAL: ${successRate}%
    `;

    const goalContextText = activeGoal ? `
        HITO ACTIVO: "${activeGoal.goal_name}" (Día ${activeGoal.milestone_days}).
        POR QUÉ ES IMPORTANTE: "${activeGoal.significance || 'Sin especificar'}"
    ` : '';

    return {
        user,
        config: config.data,
        focusText,
        kbText,
        userTraits,
        historyText,
        recentLogs: recentLogs.data || [],
        activeGoal,
        goalContextText
    };
}

export async function getAdaptiveMission(context?: {
    actionCapacity: 'MOVEMENT' | 'STATIC';
    socialContext: 'SOLO' | 'PUBLIC' | 'SMOKERS';
    emotion: 'STRESS' | 'BOREDOM' | 'SOCIAL_PRESSURE';
}) {
    const coreContext = await getUserComprehensiveContext();
    if (!coreContext) return "Respira profundo y mantén el control.";

    const angle = await selectContextAngle(coreContext.user.id);

    try {
        const currentContext = context ? `
            SITUACIÓN ACTUAL:
            - Capacidad: ${context.actionCapacity} (Si es STATIC: solo ejercicios mentales/respiración. Si es MOVEMENT: ejercicios físicos rápidos).
            - Entorno: ${context.socialContext}
            - Emoción: ${context.emotion}
        ` : "Contexto desconocido, asume situación estándar.";

        const prompt = `
            Eres un estratega de intervención inmediata para SmokeZero. 
            El usuario está en una crisis y necesita una "Micro-Misión" disruptiva.
            
            HISTORIAL DE COMPORTAMIENTO:
            ${coreContext.historyText}

            ${currentContext}

            ${coreContext.goalContextText}

            Tarea: Genera UNA acción (micro-misión) de máximo 15 palabras partiendo del ENFOQUE PSICOLÓGICO: "${angle}".
            
            GUÍA DE ENFOQUE:
            - ARCHETYPE: Usa el "${coreContext.config?.identity_anchor || 'Libre'}" para dictar la acción.
            - VALUES: Usa "${coreContext.focusText}" para apelar a lo que ama.
            - REWARD: Usa el HITO ACTIVO y POR QUÉ ES IMPORTANTE para dar urgencia emocional.
            - LEGACY: Apela a los minutos de vida ganados y salud.
            - LOGIC: Acción técnica para romper el patrón del disparador "${context?.emotion || 'impulso'}".

            Reglas:
            1. PERSONALIZACIÓN: Sé específico según el perfil.
            2. EVITA REPETICIÓN: No uses frases de los FALLOS RECIENTES.
            3. ADAPTACIÓN FÍSICA: Si Capacidad es STATIC: NO sugieras movimiento. 
            4. TONO: Directo, de comando. 

            Responde ÚNICAMENTE con la frase de la misión.
        `;

        const result = await geminiModel.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('getAdaptiveMission Error:', error);
        return "Respira profundo 4-7-8 y visualiza tu libertad.";
    }
}

export async function getDistractionPrompt() {
    const coreContext = await getUserComprehensiveContext();
    if (!coreContext) return "¿Es este impulso más fuerte que tu libertad?";

    const angle = await selectContextAngle(coreContext.user.id);

    try {
        const prompt = `
            HISTORIAL RECIENTE:
            ${coreContext.historyText}

            ${coreContext.goalContextText}

            Tarea: Genera UNA pregunta disruptiva (máximo 15 palabras) bajo el ENFOQUE: "${angle}".
            
            GUÍA DE ENFOQUE:
            - ARCHETYPE: Pregunta si su acción actual es digna de un "${coreContext.config?.identity_anchor || 'Libre'}".
            - VALUES: Pregunta sobre la consecuencia de este fallo en su "${coreContext.focusText}".
            - REWARD: Usa la significancia del HITO ACTIVO ("${coreContext.activeGoal?.significance || 'su meta'}") para cuestionar el valor del cigarrillo.
            - LEGACY: Pregunta sobre el tiempo de vida que está tirando.
            - LOGIC: Cuestiona la irracionalidad del impulso actual.

            Reglas:
            1. Tono: Desafiante, de élite, sin rodeos. 
            2. Evita clichés. Ataca el impulso directamente.

            Responde ÚNICAMENTE con la pregunta.
        `;

        const result = await geminiModel.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('getDistractionPrompt Error:', error);
        return "¿Es este impulso más fuerte que tu libertad?";
    }
}

export async function getSavingsStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { totalVetos: 0, totalSaved: 0, totalLifeSaved: 0, totalIdentityVotes: 0 };
    }

    // 1. Get Baseline Config & Start Date
    const { data: config, error: configError } = await supabase
        .schema('smokezero')
        .from('user_config')
        .select('pack_price, cigs_per_day, pack_size, created_at, total_identity_votes')
        .eq('user_id', user.id)
        .single();

    if (configError) {
        console.error('[getSavingsStats] Config Error:', configError);
    }

    if (!config) {
        console.log('[getSavingsStats] No config found for user:', user.id);
        return { totalVetos: 0, totalSaved: 0, totalLifeSaved: 0, totalIdentityVotes: 0 };
    }

    // 2. Count ACTUAL smoked (CEDO)
    const { count: smokedCount, error: smokedError } = await supabase
        .schema('smokezero')
        .from('smoke_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'CEDO');

    // 3. Count VETOS (for prestige/stats only)
    const { count: vetoCount } = await supabase
        .schema('smokezero')
        .from('smoke_logs')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('type', 'VETO');

    if (smokedError) {
        console.error('Error fetching savings stats:', smokedError);
        return { totalVetos: 0, totalSaved: 0, totalLifeSaved: 0, totalIdentityVotes: 0 };
    }

    // 4. Calculate Time & Potential
    const now = new Date();
    const startDate = new Date(config.created_at); // UTC
    const diffMs = now.getTime() - startDate.getTime();
    const daysSinceStart = Math.max(0, diffMs / (1000 * 60 * 60 * 24)); // Fractional days for live update

    const cigsPerDay = config.cigs_per_day || 20; // Default if missing
    const packPrice = config.pack_price || 0;
    const packSize = config.pack_size || 20;
    const pricePerCig = packPrice / packSize;

    const totalPotentialSmoked = daysSinceStart * cigsPerDay;
    const actualSmoked = smokedCount || 0;

    // STRICT CALCULATION (Per User Request):
    // "Total Savings = (CigsPerDay * UnitPrice) - CostOfSmoked"
    // We only count passive savings based on time passed vs actual usage.
    // gamified "activeSaved" (VETO bonus) is removed from the financial/time total 
    // to match real-world accuracy.
    const passiveSaved = Math.max(0, totalPotentialSmoked - actualSmoked);

    // HYBRID CALCULATION (Per User Request):
    // 1. Passive Savings: Based on time elapsed vs cigarettes per day.
    // 2. Active Savings: Direct reward (+1 Unit Price, +11 Mins) for every VETO.
    const activeSaved = vetoCount || 0;
    const totalSavedCigs = passiveSaved + activeSaved;

    const totalSaved = totalSavedCigs * pricePerCig;
    const totalLifeSaved = totalSavedCigs * 11;

    const totalIdentityVotes = config.total_identity_votes || 0;

    return {
        totalVetos: vetoCount || 0,
        totalSaved,
        totalLifeSaved,
        totalIdentityVotes,
        startDate: config.created_at,
        cigsPerDay
    };
}

export async function saveMotivation(text: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    try {
        const prompt = `
            Eres un analista de psicología conductual de SmokeZero.
            El usuario ha escrito: "${text}"
            Tu tarea es extraer:
            1. Categoría: Puede ser 'Familia', 'Deporte' o 'Negocio'. Si no encaja, usa 'Personal'.
            2. Entidad: El nombre específico (ej: 'Nathalia', 'Maratón', 'Empresa X').
            
            Devuelve ÚNICAMENTE un JSON válido con este formato:
            { "category": "Categoría", "entity_name": "Nombre" }
        `;

        const result = await geminiModel.generateContent(prompt);
        const aiResponse = result.response.text();
        const jsonStr = aiResponse.match(/\{.*\}/)?.[0];
        if (!jsonStr) throw new Error("No se pudo extraer JSON de la respuesta de IA");

        const { category, entity_name } = JSON.parse(jsonStr);

        // RPC o lógica de upsert con incremento de prioridad
        // Usaremos una lógica manual de upsert por ahora
        const { data: existing } = await supabase
            .schema('smokezero')
            .from('user_motivations')
            .select('id, priority')
            .eq('user_id', user.id)
            .eq('entity_name', entity_name)
            .single();

        if (existing) {
            await supabase
                .schema('smokezero')
                .from('user_motivations')
                .update({
                    priority: (existing.priority || 1) + 1,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id);
        } else {
            await supabase
                .schema('smokezero')
                .from('user_motivations')
                .insert({
                    user_id: user.id,
                    category,
                    entity_name,
                    raw_text: text,
                    priority: 1 // New motivations start high? Or low? Let's say 1 to be aggressive.
                });
        }

        return { success: true, category, entity_name };
    } catch (error) {
        console.error('saveMotivation Error:', error);
        return { error: 'Error al procesar motivación' };
    }
}

export async function getPriorityMotivation() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .schema('smokezero')
        .from('user_motivations')
        .select('*')
        .eq('user_id', user.id)
        .order('priority', { ascending: true }) // 1 is top priority
        .limit(1)
        .single();

    if (error) return null;
    return data;
}

export async function getProfilingQuestion() {
    const coreContext = await getUserComprehensiveContext();
    if (!coreContext) return { question: "¿Qué es lo que más valoras de tu libertad?", category: 'Personal' };

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { question: "¿Qué es lo que más valoras de tu libertad?", category: 'Personal' };

    // 1. Get history of questions and categories
    const { data: history } = await supabase
        .schema('smokezero')
        .from('asked_questions')
        .select('category, question_text')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

    const askedCategories = history?.map(h => h.category) || [];
    const recentQuestions = history?.map(h => h.question_text).filter(Boolean).slice(0, 5) || [];

    const angle = await selectContextAngle(user.id);

    // Pick the one with the lowest count
    const targetAngle = angle;

    try {
        const goalContext = coreContext.activeGoal ? `
            PRÓXIMA META: "${coreContext.activeGoal.goal_name}" (Día ${coreContext.activeGoal.milestone_days}).
        ` : "";

        const prompt = `
            Eres un experto en psicología del comportamiento de SmokeZero.
            Tu misión es perfilar al usuario para personalizar su éxito.

            IDENTIDAD Y FOCO:
            ${coreContext.focusText}
            ${coreContext.goalContextText}

            PERFIL (Rasgos ya conocidos):
            [${coreContext.userTraits}]

            HISTORIAL RECIENTE (NO REPETIR TEMAS):
            ${recentQuestions.length > 0 ? recentQuestions.join(' | ') : 'Sin preguntas previas.'}

            Tarea: Genera UNA pregunta de perfilado progresivo bajo el ángulo psicológico: "${targetAngle}".
            
            ÁNGULOS DE REFERENCIA:
            - ARCHETYPE: Identidad y esencia profunda.
            - VALUES: Prioridades y personas amadas.
            - REWARD: Metas físicas y recompensa financiera.
            - LEGACY: Salud a largo plazo y tiempo recuperado.
            - LOGIC: Patrones de consumo y disparadores de rutina.

            Reglas de ORO:
            1. FOCO ESTRICTO: Si el ángulo es 'LEGACY', NO hables de dinero. Si es 'REWARD', NO hables de salud.
            2. NO REPETIR: Evita temas ya preguntados o rasgos ya conocidos.
            3. DINAMISMO: No menciones siempre el hito (ej: cena familiar) a menos que el ángulo sea 'REWARD'.
            4. PROFUNDIDAD: Pregunta sobre situaciones específicas, disparadores emocionales o sabotajes.
            5. Tono: Inspirador, pero de alta exigencia mental.
            6. Máximo 15 palabras.

            Devuelve ÚNICAMENTE un JSON:
            { "question": "La pregunta...", "category": "${targetAngle}" }
        `;

        const result = await geminiModel.generateContent(prompt);
        const aiResponse = result.response.text();
        const jsonStr = aiResponse.match(/\{[\s\S]*\}/)?.[0];
        if (!jsonStr) throw new Error("No JSON in AI response");

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error('getProfilingQuestion Error:', error);
        return { question: "¿Sobre qué área de tu vida te gustaría reflexionar hoy?", category: 'Personal' };
    }
}

export async function saveProfilingAnswer(category: string, answer: string, questionText?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    try {
        const coreContext = await getUserComprehensiveContext();
        const identityBias = coreContext ? `\nCONTEXTO RELEVANTE: ${coreContext.focusText}\n` : '';

        console.log(`[Profiling] Processing answer for category: ${category}`);
        const prompt = `
            El usuario respondió: "${answer}" a una pregunta de la categoría "${category}".
            ${identityBias}
            Extrae UN trait clave en formato clave-valor.
            IMPORTANT: Adapta la clave al contexto del usuario si es posible. 
            Ej: Si su foco es 'Atleta' y habla de cansancio, usa 'performance_drain' en lugar de un genérico 'tired'.

            Devuelve ÚNICAMENTE un JSON:
            { "trait_key": "snake_case_key", "trait_value": "valor_en_español" }
        `;

        const result = await geminiModel.generateContent(prompt);
        const aiResponse = result.response.text();
        console.log(`[Profiling] AI Response: ${aiResponse}`);

        const jsonStr = aiResponse.match(/\{[\s\S]*\}/)?.[0];
        if (!jsonStr) throw new Error("No se pudo extraer JSON de la respuesta de la IA");

        const { trait_key, trait_value } = JSON.parse(jsonStr);
        console.log(`[Profiling] Extracted: ${trait_key} = ${trait_value}`);

        const results = await Promise.allSettled([
            // Guardar rasgo
            supabase.schema('smokezero').from('progressive_profiling').upsert({
                user_id: user.id,
                trait_key,
                trait_value,
                category,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,trait_key' }),
            // Registrar categoría y pregunta
            supabase.schema('smokezero').from('asked_questions').insert({
                user_id: user.id,
                category,
                question_text: questionText
            })
        ]);

        results.forEach((res, i) => {
            if (res.status === 'rejected') {
                console.error(`[Profiling] DB Op ${i} failed:`, res.reason);
            }
        });

        if (results.some(res => res.status === 'rejected')) {
            throw new Error("Error al guardar en la base de datos. Verifica la consola.");
        }

        return { success: true };
    } catch (error: any) {
        console.error('saveProfilingAnswer Error:', error);
        return { error: error.message || 'Error al procesar respuesta' };
    }
}

export async function getBehaviorAnalytics() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch last 30 days of logs for density analysis
    const { data: logs, error } = await supabase
        .schema('smokezero')
        .from('smoke_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: true });

    if (error || !logs) return null;

    // --- 1. Radar Calculation (Axes: Social, Químico, Emocional, Rutina, Entorno) ---
    const radarAxes = {
        Social: { count: 0, totalIntensity: 0 },
        Químico: { count: 0, totalIntensity: 0 },
        Emocional: { count: 0, totalIntensity: 0 },
        Rutina: { count: 0, totalIntensity: 0 },
        Entorno: { count: 0, totalIntensity: 0 }
    } as Record<string, { count: number, totalIntensity: number }>;

    // Helper to categorize log
    const categorizeLog = (log: any) => {
        const ctx = log.context_json || {};
        const emotion = ctx.emotion || '';
        const social = ctx.socialContext || '';

        if (social === 'SMOKERS' || social === 'PUBLIC') return 'Social';
        if (emotion === 'STRESS' || emotion === 'ANXIETY') return 'Emocional';
        if (ctx.trigger === 'coffee' || ctx.trigger === 'alcohol') return 'Químico';
        if (ctx.trigger === 'after_meal') return 'Rutina';
        return 'Entorno'; // Default fallback
    };

    logs.forEach(log => {
        const category = categorizeLog(log);
        if (radarAxes[category]) {
            radarAxes[category].count++;
            radarAxes[category].totalIntensity += (log.intensity || 0);
        }
    });

    const radarData = Object.keys(radarAxes).map(subject => {
        const data = radarAxes[subject];
        const calculated = Math.round(data.totalIntensity);
        return { subject, A: calculated, fullMark: 150 };
    });


    // --- 2. Chrono-Density (Timeline) ---
    const timeBuckets = new Array(48).fill(0).map((_, i) => {
        const hour = Math.floor(i / 2);
        const min = (i % 2) * 30;
        return {
            time: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
            intensity: 0,
            count: 0
        };
    });

    logs.forEach(log => {
        const date = new Date(log.created_at);
        const hour = date.getHours();
        const min = date.getMinutes();
        const bucketIndex = (hour * 2) + (min >= 30 ? 1 : 0);

        timeBuckets[bucketIndex].count++;
        timeBuckets[bucketIndex].intensity += (log.intensity || 0);
    });

    const timelineData = timeBuckets.map(bucket => ({
        time: bucket.time,
        intensity: bucket.intensity,
        status: bucket.intensity > 15 ? 'danger' : (bucket.intensity > 0 ? 'safe' : 'neutral')
    }));

    // --- 3. AI Prediction (The Oracle) ---
    let aiPrediction = "Aún no tengo suficientes datos. Sigue registrando.";

    if (logs.length > 5) {
        const worstTrigger = radarData.reduce((prev, current) => (prev.A > current.A) ? prev : current);
        const worstTime = timelineData.reduce((prev, current) => (prev.intensity > current.intensity) ? prev : current);

        const prompt = `
            Analiza estos datos de comportamiento de fumar:
            1. Mayor Disparador: ${worstTrigger.subject} (Intensidad: ${worstTrigger.A}).
            2. Hora más crítica: ${worstTime.time} (Densidad: ${worstTime.intensity}).
            
            Genera un "Insight Predictivo" corto (máx 20 palabras) para el usuario.
            Formato: "Tu mayor riesgo es [Causa]. Mañana activaremos escudos a las [Hora - 15min]."
        `;

        try {
            const aiRes = await geminiModel.generateContent(prompt);
            aiPrediction = aiRes.response.text().trim();
        } catch (e) {
            console.error("AI Insight Error", e);
        }
    }

    return {
        radarData,
        timelineData,
        aiPrediction
    };
}

// --- GUARDIAN AI ACTIONS ---

export async function saveGuardianMessage(role: 'user' | 'assistant', content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Unauthorized' };

    const { error } = await supabase
        .schema('smokezero')
        .from('guardian_messages')
        .insert({ user_id: user.id, role, content });

    if (error) return { error: error.message };
    return { success: true };
}

export async function getGuardianMessages() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: messages, error } = await supabase
        .schema('smokezero')
        .from('guardian_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

    if (error) return [];
    return messages;
}

export async function getHealthRegeneration() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: config } = await supabase
        .schema('smokezero')
        .from('user_config')
        .select('manifesto_accepted_at')
        .eq('user_id', user.id)
        .single();

    if (!config?.manifesto_accepted_at) return [];

    const quitDate = new Date(config.manifesto_accepted_at);
    const now = new Date();
    const diffHours = (now.getTime() - quitDate.getTime()) / (1000 * 60 * 60);

    return [
        { label: 'Sentidos Olfato/Gusto', value: Math.min(100, Math.round((diffHours / 48) * 100)), description: 'Regeneración nerviosa' },
        { label: 'Función Pulmonar', value: Math.min(100, Math.round((diffHours / 72) * 100)), description: 'Relajación de bronquios' },
        { label: 'Riesgo Coronario', value: Math.min(100, Math.round((diffHours / (24 * 365)) * 100)), description: 'Reducción al 50%' }
    ];
}

export async function getGuardianResponse(message: string, history: { role: string, content: string }[]) {
    const ctx = await getUserComprehensiveContext();
    if (!ctx) return { error: 'No context found' };

    const savings = await getSavingsStats();
    const daysSmokeFree = (savings as any).startDate
        ? Math.floor((new Date().getTime() - new Date((savings as any).startDate).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

    const masterPrompt = `
        Eres el “Guardián de Libertad” de SmokeZero.
        Tu misión es ayudar al usuario a dejar de fumar con intervenciones rápidas y efectivas.
        Actúas como un coach de élite: empático, claro y firme.
        Te basas en neurociencia, psicología conductual y técnicas prácticas para superar cravings, ansiedad y recaídas.
        
        FUNDAMENTOS PSICOLÓGICOS:
        1. Judson Brewer: Fomentá la curiosidad sobre el "Urge" (antojo). Usá la técnica RAIN (Reconocer, Aceptar, Investigar la sensación en el cuerpo, Nutrir con autocompasión).
        2. James Clear: Reforzá la identidad ("Sos un no fumador"). Cada decisión es un "voto de identidad". 
        3. Beck/Ellis (TCC): Identificá distorsiones cognitivas (ej: "solo uno no hace nada") y debatilas con lógica racional y socrática.
        
        CONTEXTO DEL USUARIO:
        - NOMBRE/PROFESIÓN: ${ctx.config?.first_name || 'Juan Pablo'}, ${ctx.config?.profession || 'Especialista'}.
        - FOCO PRINCIPAL: ${ctx.focusText}
        - IDENTIDAD ELEGIDA: ${ctx.config?.identity_anchor || 'Atleta'}.
        - MOTIVACIONES FAMILIARES: ${ctx.kbText}
        - PROGRESO FINANCIERO: $${(savings as any).totalSaved.toLocaleString()} ahorrados.
        - TIEMPO SMOKE-FREE: ${daysSmokeFree} días libre de humo.
        - VIDA GANADA: ${Math.floor((savings as any).totalLifeSaved / 60)} horas y ${(savings as any).totalLifeSaved % 60} minutos recuperados.
        - META ACTIVA: "${ctx.activeGoal?.goal_name || 'Próximo hito'}"
        - SIGNIFICANCIA: "${ctx.activeGoal?.significance || 'Tu libertad'}"
        
        REGLAS DE ORO:
        1. Tono: Coach de elite. Usá siempre el VOSEO Argentino (vós, tenés, sentís, hacé).
        2. Autoridad: No pidas permiso para aconsejar. Sos el guardián de su identidad.
        3. Dominio: Sos experto en tabaquismo y longevidad. Volvé siempre al foco con autoridad.
        4. Acción: Si el usuario está en crisis, recordale su Meta y quién lo espera en casa.
        
        HISTORIAL DE LA SESIÓN:
        ${history.slice(-5).map(h => `${h.role}: ${h.content}`).join('\n')}
        
        INPUT DEL USUARIO: "${message}"
        
        Respuesta CORTA, CLARA y EMOCIONAL. Máximo 2-3 frases potentes que disparen dopamina por logro o refozen la identidad no fumadora:
    `;

    try {
        const result = await geminiModel.generateContent(masterPrompt);
        const responseText = result.response.text();
        return { response: responseText };
    } catch (e) {
        console.error('Guardian AI Error:', e);
        return { error: 'El Guardián está meditando. Intentá de nuevo.' };
    }
}

