import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

const test = async () => {
  console.log('Testing Supabase connection...');

  const { data, error } = await supabase.auth.getSession();

  console.log('DATA:', data);
  console.log('ERROR:', error);
};

test();