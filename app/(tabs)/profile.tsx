import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import useProfile from '@/app/hooks/useProfile';
import { supabase } from '@/utils/SupaLegend';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { profile, user, loading, error } = useProfile();
  const router = useRouter();

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

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-red-600">Error: {error}</Text>
      </View>
    );
  }

  if (!profile || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lima-600">No profile data available</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <ScrollView className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6 border-b border-gray-100">
          <Text className="text-2xl font-bold text-gray-900">Profile</Text>
        </View>

        {/* Stats Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-6"
        >
          <View className="flex-row gap-4">
            <View className="bg-lima-50 p-4 rounded-2xl w-36">
              <MaterialCommunityIcons name="sprout" size={24} color="#65a30d" />
              <Text className="text-2xl font-bold text-lima-700 mt-2">24</Text>
              <Text className="text-sm text-lima-600">Crops Tracked</Text>
            </View>

            <View className="bg-lime-50 p-4 rounded-2xl w-36">
              <MaterialCommunityIcons
                name="weather-sunny"
                size={24}
                color="#65a30d"
              />
              <Text className="text-2xl font-bold text-lima-700 mt-2">156</Text>
              <Text className="text-sm text-lima-600">Weather Alerts</Text>
            </View>

            <View className="bg-green-50 p-4 rounded-2xl w-36">
              <MaterialCommunityIcons
                name="chart-line"
                size={24}
                color="#65a30d"
              />
              <Text className="text-2xl font-bold text-lima-700 mt-2">85%</Text>
              <Text className="text-sm text-lima-600">Yield Rate</Text>
            </View>
          </View>
        </ScrollView>

        {/* Main Content */}
        <View className="px-6 py-4">
          {/* Profile Section */}
          <View className="mb-8">
            <View className="flex-row items-center justify-between mb-6">
              <View>
                <Text className="text-lg font-semibold text-gray-900">
                  {profile?.email?.split('@')[0]}
                </Text>
                <Text className="text-sm text-gray-500">{profile?.email}</Text>
              </View>
              <TouchableOpacity
                className="bg-lima-50 p-2 rounded-full"
                onPress={() => {
                  /* Add edit profile handler */
                }}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={20}
                  color="#65a30d"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Actions */}
          <Text className="text-base font-semibold text-gray-900 mb-4">
            Quick Actions
          </Text>
          <View className="gap-3">
            <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
              <View className="flex-row items-center gap-3">
                <MaterialCommunityIcons name="cog" size={20} color="#374151" />
                <Text className="text-gray-700">Settings</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#374151"
              />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
              <View className="flex-row items-center gap-3">
                <MaterialCommunityIcons
                  name="help-circle"
                  size={20}
                  color="#374151"
                />
                <Text className="text-gray-700">Help & Support</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#374151"
              />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-4 bg-gray-50 rounded-xl">
              <View className="flex-row items-center gap-3">
                <MaterialCommunityIcons
                  name="shield-check"
                  size={20}
                  color="#374151"
                />
                <Text className="text-gray-700">Privacy Policy</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#374151"
              />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleSignOut}
              className="flex-row items-center justify-between p-4 bg-red-50 rounded-xl mt-4"
            >
              <View className="flex-row items-center gap-3">
                <MaterialCommunityIcons
                  name="logout"
                  size={20}
                  color="#dc2626"
                />
                <Text className="text-red-600">Sign Out</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={20}
                color="#dc2626"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
