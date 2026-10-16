import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase não configurado: crie um arquivo .env (veja .env.example) com REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY. ' +
      'O app funciona normalmente sem isso, mas o acervo compartilhado e o comparador de preços ficam desativados.'
  );
}

// createClient() exige uma URL válida mesmo quando não vamos usá-la de verdade;
// usamos um placeholder para o app não quebrar quando o .env ainda não existe.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
