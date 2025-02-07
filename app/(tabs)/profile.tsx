import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useProfile from '@/app/hooks/useProfile';
import { supabase } from '@/utils/SupaLegend';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getDisplayInitial, getDisplayName } from '@/app/utils/nameUtils';
import { StatusBar } from 'expo-status-bar';
import LanguageSelector from '@/app/components/LanguageSelector';
import { useLanguageStore } from '@/app/stores/useLanguageStore';

export default function ProfileScreen() {
  const { profile, loading } = useProfile();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const { translations } = useLanguageStore();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/sign-in');
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" backgroundColor="transparent" />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 0 }}
      >
        {/* Profile Header */}
        <View className="pb-4">
          {/* Background Pattern */}
          <View
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, #65a30d 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />
          <View className="px-6 pt-4">
            <Text className="text-2xl font-bold text-gray-900">
              {translations.profile.profile}
            </Text>
            <View className="items-center mt-6">
              <View className="size-24 rounded-full bg-lima-100 items-center justify-center mb-4">
                <Text className="text-lima-800 font-bold text-4xl">
                  {getDisplayInitial(profile?.full_name)}
                </Text>
              </View>
              <Text className="text-xl font-semibold text-gray-900">
                {getDisplayName(profile?.full_name)}
              </Text>
              <Text className="text-sm text-lima-600 mt-1">
                {profile?.email}
              </Text>
              <Text className="text-xs text-lima-600 mt-2">
                Member since{' '}
                {new Date(profile?.created_at || '').toLocaleDateString(
                  'en-US',
                  {
                    month: 'long',
                    year: 'numeric',
                  }
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        <View className="px-6">
          {/* Account Settings */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-2">
              {translations.profile.accountSettings}
            </Text>
            <View className="gap-2">
              <TouchableOpacity className="flex-row items-center justify-between p-3 bg-white rounded-xl border border-lima-200">
                <View className="flex-row items-center gap-3">
                  <View className="bg-lima-100 p-2 rounded-lg">
                    <MaterialCommunityIcons
                      name="account-edit"
                      size={20}
                      color="#3f6212"
                    />
                  </View>
                  <Text className="text-gray-900 font-medium text-sm">
                    {translations.profile.editProfile}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#3f6212"
                />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between p-3 bg-white rounded-xl border border-lima-200">
                <View className="flex-row items-center gap-3">
                  <View className="bg-lima-100 p-2 rounded-lg">
                    <MaterialCommunityIcons
                      name="lock"
                      size={20}
                      color="#3f6212"
                    />
                  </View>
                  <Text className="text-gray-900 font-medium text-sm">
                    {translations.profile.changePassword}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#3f6212"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences */}
          <View className="mb-6">
            <Text className="text-base font-semibold text-gray-900 mb-2">
              {translations.profile.preferences}
            </Text>
            <View className="gap-2">
              <TouchableOpacity className="flex-row items-center justify-between p-3 bg-white rounded-xl border border-lima-200">
                <View className="flex-row items-center gap-3">
                  <View className="bg-lima-100 p-2 rounded-lg">
                    <MaterialCommunityIcons
                      name="bell"
                      size={20}
                      color="#3f6212"
                    />
                  </View>
                  <Text className="text-gray-900 font-medium text-sm">
                    Notifications
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#3f6212"
                />
              </TouchableOpacity>

              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-900 mb-2">
                  {translations.profile.language}
                </Text>
                <LanguageSelector />
              </View>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="flex-row items-center justify-center p-3 bg-red-50 rounded-xl border border-red-100"
          >
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color="#dc2626"
              style={{ marginRight: 8 }}
            />
            <Text className="text-red-600 font-medium text-sm">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
