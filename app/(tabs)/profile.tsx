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

export default function ProfileScreen() {
  const { profile, user, loading } = useProfile();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/sign-in');
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lima-600">Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="flex-1"
      >
        {/* Profile Header */}
        <View className="px-6 pt-4 pb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Profile</Text>
          <View className="items-center">
            <View className="size-24 rounded-full bg-gray-100 items-center justify-center mb-4">
              <Text className="text-gray-700 font-bold text-4xl">
                {getDisplayInitial(profile?.full_name)}
              </Text>
            </View>
            <Text className="text-xl font-semibold text-gray-900">
              {getDisplayName(profile?.full_name)}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">{profile?.email}</Text>
            <Text className="text-xs text-gray-500 mt-2">
              Member since{' '}
              {new Date(profile?.created_at || '').toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>
        </View>

        {/* Stats Overview */}
        <View className="px-6 mb-8">
          <View className="flex-row gap-4">
            <View className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-3xl font-bold text-gray-900">24</Text>
                  <Text className="text-sm text-gray-600">Days Active</Text>
                </View>
                <View className="bg-white p-2 rounded-xl shadow-sm">
                  <MaterialCommunityIcons
                    name="calendar-check"
                    size={24}
                    color="#4b5563"
                  />
                </View>
              </View>
            </View>
            <View className="flex-1 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <View className="flex-row justify-between items-start">
                <View>
                  <Text className="text-3xl font-bold text-gray-900">85%</Text>
                  <Text className="text-sm text-gray-600">Success Rate</Text>
                </View>
                <View className="bg-white p-2 rounded-xl shadow-sm">
                  <MaterialCommunityIcons
                    name="trending-up"
                    size={24}
                    color="#4b5563"
                  />
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Sections */}
        <View className="px-6">
          {/* Account Settings */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-gray-900 mb-4">
              Account Settings
            </Text>
            <View className="gap-3">
              <TouchableOpacity className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                <View className="flex-row items-center gap-3">
                  <MaterialCommunityIcons
                    name="account-edit"
                    size={20}
                    color="#4b5563"
                  />
                  <Text className="text-gray-700">Edit Profile</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#4b5563"
                />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                <View className="flex-row items-center gap-3">
                  <MaterialCommunityIcons
                    name="lock"
                    size={20}
                    color="#4b5563"
                  />
                  <Text className="text-gray-700">Change Password</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#4b5563"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Preferences */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-gray-900 mb-4">
              Preferences
            </Text>
            <View className="gap-3">
              <TouchableOpacity className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                <View className="flex-row items-center gap-3">
                  <MaterialCommunityIcons
                    name="bell"
                    size={20}
                    color="#4b5563"
                  />
                  <Text className="text-gray-700">Notifications</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#4b5563"
                />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                <View className="flex-row items-center gap-3">
                  <MaterialCommunityIcons
                    name="translate"
                    size={20}
                    color="#4b5563"
                  />
                  <Text className="text-gray-700">Language</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#4b5563"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Support */}
          <View className="mb-8">
            <Text className="text-base font-semibold text-gray-900 mb-4">
              Support
            </Text>
            <View className="gap-3">
              <TouchableOpacity className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                <View className="flex-row items-center gap-3">
                  <MaterialCommunityIcons
                    name="help-circle"
                    size={20}
                    color="#4b5563"
                  />
                  <Text className="text-gray-700">Help Center</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#4b5563"
                />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-gray-100">
                <View className="flex-row items-center gap-3">
                  <MaterialCommunityIcons
                    name="shield-check"
                    size={20}
                    color="#4b5563"
                  />
                  <Text className="text-gray-700">Privacy Policy</Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#4b5563"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Out Button */}
          <TouchableOpacity
            onPress={handleSignOut}
            className="mb-8 flex-row items-center justify-center p-4 bg-red-50 rounded-xl border border-red-100"
          >
            <MaterialCommunityIcons
              name="logout"
              size={20}
              color="#dc2626"
              style={{ marginRight: 8 }}
            />
            <Text className="text-red-600 font-medium">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
