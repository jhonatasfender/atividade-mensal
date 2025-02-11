import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/clerk-react';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export function useSupabaseClient() {
  "use server";
  const { session } = useSession();

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await session?.getToken({
          template: 'supabase',
        });

        const headers = new Headers(options?.headers);
        headers.set('Authorization', `Bearer ${clerkToken}`);

        return fetch(url, {
          ...options,
          headers,
        });
      },
    },
  });
}