// Supabase configuration
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Initialize Supabase Admin client
export const supabase: SupabaseClient = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to check if AI generation is enabled
export async function isGenerationEnabled(): Promise<boolean> {
    const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'ai_generation_enabled')
        .single();

    // Default to true if missing, but strictly check for string 'false'
    return data?.value !== 'false';
}
