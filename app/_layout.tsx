import { Stack } from 'expo-router';
import './global.css';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    setTimeout(SplashScreen.hideAsync, 4000);
  }, []);
  return <Stack />;
}
