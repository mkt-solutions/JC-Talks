import { createClient } from '@supabase/supabase-js';
import { CONFIG } from '../config';

export const supabase = createClient(
  CONFIG.SUPABASE_URL || 'https://placeholder.supabase.co', 
  CONFIG.SUPABASE_ANON_KEY || 'placeholder'
);
