export type NutritionPlan = {
    id: string;
    code: string;
    name: string;
    description: string;
    created_by?: string;
    is_public: boolean;
    parent_plan_id?: string;
    tags?: string[];
    templates?: NutritionTemplate[];
}

export type NutritionTemplate = {
    id: string;
    plan_id: string;
    code: string; // 'A' | 'B'
    name: string;
    moments?: NutritionMoment[];
}

export type NutritionMoment = {
    id: string;
    template_id: string;
    day_of_week: number;
    code: string; // 'M1'...'M8'
    name: string;
    order: number;
    options?: NutritionOption[];
}

export type NutritionOption = {
    id: string;
    moment_id: string;
    description: string;
    is_recommended: boolean;
}

export type UserDayCheckin = {
    id: string;
    user_id: string;
    plan_id: string;
    day_index: number;
    did_comply: boolean;
    notes?: string;
    updated_at: string;
}

export type NutritionSelection = {
    id: string;
    user_id: string;
    plan_id: string;
    day_index: number;
    moment_id: string;
    option_id: string;
    created_at: string;
}
