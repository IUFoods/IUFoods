import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dlizyxujealsakmglvos.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsaXp5eHVqZWFsc2FrbWdsdm9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkxNzk0NzcsImV4cCI6MjEwNDc1NTQ3N30.gTJhkGX0qnd9-slJudxKtP4CPpsVT3n6y9efpAZNVFo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
