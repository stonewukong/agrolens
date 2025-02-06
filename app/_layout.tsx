import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { supabase } from '@/utils/SupaLegend';
import './global.css';

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) throw error;

        if (!session) {
          router.replace('/(auth)/sign-in');
        } else {
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        router.replace('/(auth)/sign-in');
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!session) {
        router.replace('/(auth)/sign-in');
      } else {
        router.replace('/(tabs)');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Stack>
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
