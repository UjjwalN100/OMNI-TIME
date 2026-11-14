import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fzqjfakyrlwgbwgfxzha.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_2avWs2XvJN3FuDZr4UcV2A_FmVtS8jG';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface DbAgendaItem {
  id: string;
  user_id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  type: 'event' | 'task';
  category: string;
  is_completed: boolean;
  description?: string;
  created_at?: string;
}

export interface DbDocument {
  id: string;
  user_id: string;
  item_id?: string;
  date?: string;
  name: string;
  size: string;
  type: 'upload' | 'omni_space';
  url?: string;
  created_at?: string;
}
