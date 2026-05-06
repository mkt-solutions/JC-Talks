export const CONFIG = {
  SUPABASE_URL: (import.meta as any).env.VITE_SUPABASE_URL || (import.meta as any).env.SUPABASE_URL || "",
  SUPABASE_ANON_KEY: (import.meta as any).env.VITE_SUPABASE_ANON_KEY || (import.meta as any).env.SUPABASE_ANON_KEY || "",
  GEMINI_API_KEY: (import.meta as any).env.VITE_GEMINI_API_KEY || (import.meta as any).env.GEMINI_API_KEY || ""
};

if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
  console.warn("Faltam configurações do Supabase. Verifique as Variáveis de Ambiente na Vercel.");
}
