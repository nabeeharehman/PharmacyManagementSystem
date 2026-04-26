import { useEffect } from 'react';
import { supabase } from './lib/supabase';

export default function App() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase
        .from('profiles') // or any table you created
        .select('*')
        .limit(1);

      console.log('Supabase data:', data);
      console.log('Supabase error:', error);
    };

    testConnection();
  }, []);

  return <div>Check console</div>;
}

const testAuth = async () => {
  const { data, error } = await supabase.auth.getSession();

  console.log('Session:', data);
  console.log('Auth error:', error);
};