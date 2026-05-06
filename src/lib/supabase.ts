import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';

export const supabase = createClient(
  CONFIG.SUPABASE_URL || 'https://placeholder.supabase.co', 
  CONFIG.SUPABASE_ANON_KEY || 'placeholder'
);

if (!CONFIG.SUPABASE_URL || CONFIG.SUPABASE_URL === 'https://placeholder.supabase.co') {
  console.error("ERRO: URL do Supabase não encontrada! Verifique se você adicionou SUPABASE_URL nas Variáveis de Ambiente da Vercel e fez um novo Deploy.");
}
