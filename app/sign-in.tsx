import { Link, router } from 'expo-router';
import React, { useState } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  React.useEffect(() => {
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

  const handleSignIn = () => {
    console.log('Sign in pressed');
    router.push('/(root)/(tabs)');
  };

  return (
    <SafeAreaView className="flex-1 bg-lima-600">
      <ImageBackground
        source={require('../assets/images/texture2.jpg')}
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
              source={require('../assets/images/logo-rounded.png')}
              className="aspect-video size-28"
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Bottom Sheet Style Container */}
        <View className="rounded-t-[64px] bg-white  shadow-2xl shadow-black/15">
          <View className="pt-10 px-8 pb-6">
            {/* Header Text */}
            <View className="mb-10 text-center">
              <Text className="text-3xl tracking-tight text-center font-bold text-lima-700 mb-2">
                Get Started 🌿
              </Text>
              <Text className="text-lima-600 text-sm text-center leading-relaxed">
                Sign in to continue your journey
              </Text>
            </View>

            {/* Form Section */}
            <View className="gap-4">
              {/* Email Input */}
              <View className="gap-2">
                <Text className="text-[13px] font-medium text-lima-700 ml-0.5">
                  Email address
                </Text>
                <View className="bg-lima-50 rounded-xl border border-lima-100  shadow-sm">
                  <TextInput
                    className="w-full px-4 py-3.5 bg-transparent placeholder:text-lima-700   "
                    placeholder="name@example.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="gap-2">
                <Text className="text-[13px] font-medium text-lima-700 ml-0.5">
                  Password
                </Text>
                <View className="bg-lima-50 rounded-xl border border-lima-100 shadow-sm">
                  <TextInput
                    className="w-full px-4 py-3.5 bg-transparent  placeholder:text-lima-700 "
                    placeholder="********"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    placeholderTextColor="#94a3b8"
                  />
                </View>
              </View>

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={handleSignIn}
                className="mt-2 overflow-hidden rounded-xl shadow-lg shadow-lima-600/20"
              >
                <LinearGradient
                  colors={['#8cc342', '#78ad35']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-3.5 items-center"
                >
                  <Text className="text-white font-semibold text-[15px]">
                    Sign in
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Social Sign In */}
              <View className="mt-4">
                <View className="flex-row items-center gap-4 mb-4">
                  <View className="flex-1 h-[1px] bg-lima-200" />
                  <Text className="text-lima-600 text-sm font-medium">
                    or continue with
                  </Text>
                  <View className="flex-1 h-[1px] bg-lima-200" />
                </View>

                <TouchableOpacity
                  className="w-full h-12 flex-row gap-2 bg-lima-50/90 rounded-xl 
                    items-center justify-center border border-lima-100"
                >
                  <Image
                    source={require('../assets/images/google.png')}
                    className="w-5 h-5"
                    resizeMode="contain"
                  />
                  <Text className="font-medium text-lima-800 text-base">
                    Google
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View className="flex-row justify-center items-center mt-6">
                <Text className="text-lima-600 text-[15px] mr-1">
                  New to AgroLens?
                </Text>
                <TouchableOpacity>
                  <Text className="text-lima-700 underline font-semibold text-[15px]">
                    Create an account
                  </Text>
                </TouchableOpacity>
              </View>
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
