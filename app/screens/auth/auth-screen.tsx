import { router, Link, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  StatusBar,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/SupaLegend';

type AuthScreenProps = {
  isSignUp: boolean;
};

export default function AuthScreen({ isSignUp }: AuthScreenProps) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Sign up with email and password
        const { data: authData, error: authError } = await supabase.auth.signUp(
          {
            email,
            password,
            options: {
              data: {
                email: email,
              },
              emailRedirectTo: undefined, // Remove email redirect
            },
          }
        );

        if (authError) throw authError;

        if (authData.user) {
          // Insert into profiles table
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: authData.user.id,
                email: email,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();

          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw profileError;
          }

          // After signup, immediately sign in
          const { error: signInError } = await supabase.auth.signInWithPassword(
            {
              email,
              password,
            }
          );

          if (signInError) throw signInError;

          console.log('Signed up and logged in successfully:', authData.user);
          router.push('/(tabs)');
        }
      } else {
        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Successfully signed in
          console.log('Signed in:', data.user);
          router.push('/(tabs)');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      alert(
        error instanceof Error ? error.message : 'An unknown error occurred'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (route: '/(auth)/sign-in' | '/(auth)/sign-up') => {
    router.push(route);
  };

  return (
    <SafeAreaView className="flex-1 bg-lima-600">
      <ImageBackground
        source={require('@/assets/images/texture.jpg')}
        className="absolute w-full h-full opacity-70"
        resizeMode="cover"
      />
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Top Logo Section */}
        <View className="flex-1 items-center justify-center">
          <View className="relative">
            <Image
              source={require('@/assets/images/logo-rounded.png')}
              className={`aspect-video size-28 ${
                isKeyboardVisible ? 'hidden' : ''
              }`}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Bottom Sheet Style Container */}
        <View className="rounded-t-[64px] bg-white shadow-2xl shadow-black/15">
          <View className="pt-10 px-8 pb-6">
            {/* Header Text */}
            <View className="mb-10 text-center">
              <Text className="text-3xl tracking-tight text-center font-bold text-lima-700 mb-2">
                {isSignUp ? 'Create Account 🌿' : 'Get Started 🌿'}
              </Text>
              <Text className="text-lima-600 text-sm text-center leading-relaxed">
                {isSignUp
                  ? 'Sign up to start your journey'
                  : 'Sign in to continue your journey'}
              </Text>
            </View>

            {/* Form Section */}
            <View className="gap-4">
              {/* Email Input */}
              <View className="gap-2">
                <Text className="text-[13px] font-medium text-lima-700 ml-0.5">
                  Email Address
                </Text>
                <View className="bg-lima-50 rounded-xl border border-lima-100 shadow-sm">
                  <TextInput
                    className="w-full px-4 py-3.5 bg-transparent text-lima-900"
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    placeholderTextColor="#476a21"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="gap-2">
                <Text className="text-[13px] font-medium text-lima-700 ml-0.5">
                  Password
                </Text>
                <View className="bg-lima-50 rounded-xl border border-lima-100 shadow-sm flex-row items-center">
                  <TextInput
                    className="flex-1 px-4 py-3.5 bg-transparent text-lima-900"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    placeholderTextColor="#476a21"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="px-4"
                  >
                    <Text className="text-lima-700">
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                onPress={handleAuth}
                disabled={loading}
                activeOpacity={0.8}
                className="mt-2 bg-lima-500 py-3.5 items-center overflow-hidden rounded-xl shadow-lg shadow-lima-600/20"
              >
                <Text className="text-white font-semibold text-[15px]">
                  {loading
                    ? 'Please wait...'
                    : isSignUp
                    ? 'Sign up'
                    : 'Sign in'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up/Sign In Link */}
            <View className="flex-row justify-center items-center mt-6">
              <Text className="text-lima-600 text-[15px] mr-1">
                {isSignUp ? 'Already have an account?' : 'New to AgroLens?'}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  handleNavigation(
                    isSignUp ? '/(auth)/sign-in' : '/(auth)/sign-up'
                  )
                }
              >
                <Text className="text-lima-700 underline font-semibold text-[15px]">
                  {isSignUp ? 'Sign in' : 'Create an account'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Terms and Privacy */}
            <Text className="text-xs text-center text-lima-500 leading-relaxed mt-6">
              By continuing, you agree to our{' '}
              <Text className="text-lima-700 font-medium">
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text className="text-lima-700 font-medium">Privacy Policy</Text>
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
