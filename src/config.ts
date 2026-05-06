export const CONFIG = {
  // @ts-ignore
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || "",
  // @ts-ignore
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || "",
  // @ts-ignore
  GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || ""
};

if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
  console.warn("Faltam configurações do Supabase. Verifique as Variáveis de Ambiente na Vercel.");
}
