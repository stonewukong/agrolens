import { useEffect, useState } from 'react';
import { supabase } from '@/utils/SupaLegend';
import { Session, User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

interface ProfileData {
  profile: Profile | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export default function useProfile(): ProfileData {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        // important
        // console.log('Session:', session);

        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (!session?.user) {
          console.log('No authenticated user found');
          setLoading(false);
          return;
        }

        // Set authenticated user
        setUser(session.user);
        // important
        // console.log('Authenticated user:', session.user);

        // Fetch profile data
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // important
        // console.log('Profile data:', data);

        if (profileError) {
          console.error('Profile error:', profileError);
          throw profileError;
        }

        setProfile(data);
      } catch (err) {
        console.error('Profile fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // important
      // console.log('Auth state changed:', event, session?.user);
      if (session?.user) {
        setUser(session.user);
        fetchProfile();
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    profile,
    user,
    loading,
    error,
  };
}
