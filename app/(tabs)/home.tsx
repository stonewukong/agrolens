import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useProfile from '@/app/hooks/useProfile';
import { useRouter } from 'expo-router';
import { getDisplayInitial, getDisplayName } from '@/app/utils/nameUtils';

export default function HomeScreen() {
  const { profile, loading } = useProfile();
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Add your refresh logic here
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lima-600">Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="flex-1 bg-gradient-to-b from-white to-lima-50"
      >
        {/* Welcome Section */}
        <View className=" pb-6">
          {/* Background Pattern */}
          <View
            className="absolute inset-0  opacity-50"
            style={{
              backgroundImage:
                'radial-gradient(circle at 2px 2px, #84cc16 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* User Info */}
          <View className="px-6 pt-4 relative">
            <View className="flex-row justify-between items-center">
              {/* User Greeting - with welcome message */}
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-sm text-lima-600">
                    {new Date().toLocaleString('en-US', {
                      hour: 'numeric',
                      hour12: true,
                    }) < '12:00'
                      ? 'Good morning'
                      : new Date().toLocaleString('en-US', {
                          hour: 'numeric',
                          hour12: true,
                        }) < '17:00'
                      ? 'Good afternoon'
                      : 'Good evening'}
                    ,
                  </Text>
                  <Text className="text-sm text-lima-600 ml-1">👋</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-900 mt-1">
                  {getDisplayName(profile?.full_name)}
                </Text>
                <Text className="text-sm text-lima-600 mt-1">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>

              {/* Profile Access */}
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/profile')}
                className="bg-lima-50 p-2 rounded-full"
              >
                <View className="size-10 rounded-full bg-lima-100 items-center justify-center">
                  <Text className="text-lima-700 font-medium text-lg">
                    {getDisplayInitial(profile?.full_name)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Stats */}
          <View className="mt-6 mx-6">
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
              <View className="flex-row gap-3">
                <TouchableOpacity className="flex-1 bg-lima-50 p-4 rounded-2xl border border-lima-100">
                  <View className="bg-white p-2 rounded-xl self-start mb-2">
                    <MaterialCommunityIcons
                      name="leaf-maple"
                      size={24}
                      color="#65a30d"
                    />
                  </View>
                  <Text className="text-lima-700 font-medium">
                    Analyze Crops
                  </Text>
                  <Text className="text-lima-600 text-xs mt-0.5">
                    Quick scan
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-1 bg-blue-50 p-4 rounded-2xl border border-blue-100">
                  <View className="bg-white p-2 rounded-xl self-start mb-2">
                    <MaterialCommunityIcons
                      name="water"
                      size={24}
                      color="#2563eb"
                    />
                  </View>
                  <Text className="text-blue-700 font-medium">Irrigation</Text>
                  <Text className="text-blue-600 text-xs mt-0.5">
                    Check status
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Content Sections */}
        <View className="px-6 -mt-4">
          {/* Weather Card */}
          <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-6">
            <View className="flex-row items-start justify-between mb-4">
              <View className="flex-row items-center justify-between">
                {/* Temperature and Weather */}
                <View className="flex-row items-center gap-3">
                  <Text className="text-3xl font-bold text-gray-900">
                    32°
                    <Text className="text-xl font-normal text-gray-500">C</Text>
                  </Text>
                  <View className="flex-row items-center">
                    <MaterialCommunityIcons
                      name="weather-sunny"
                      size={20}
                      color="#0284c7"
                    />
                    <Text className="text-gray-600 text-base ml-1">Sunny</Text>
                  </View>
                </View>

                {/* Location */}
                <View className="flex-row items-center">
                  <MaterialCommunityIcons
                    name="map-marker"
                    size={16}
                    color="#94a3b8"
                  />
                  <Text className="text-gray-400 text-sm ml-1">Bangalore</Text>
                </View>
              </View>

              {/* Mini Forecast */}
              <View className="bg-sky-50 px-3 py-2 rounded-xl border border-sky-100">
                <Text className="text-sky-600 text-xs">Next Hour</Text>
                <View className="flex-row items-center gap-1 mt-1">
                  <MaterialCommunityIcons
                    name="weather-sunny"
                    size={16}
                    color="#0284c7"
                  />
                  <Text className="text-sky-700 font-medium">33°</Text>
                </View>
              </View>
            </View>

            {/* Weather Details */}
            <View className="flex-row gap-4 mt-4 pt-4 border-t border-gray-100">
              <View className="flex-1 flex-row items-center">
                <View className="bg-sky-50 p-2 rounded-xl mr-3">
                  <MaterialCommunityIcons
                    name="weather-windy"
                    size={20}
                    color="#0284c7"
                  />
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">Wind</Text>
                  <Text className="text-gray-900 font-medium">15 km/h</Text>
                </View>
              </View>

              <View className="flex-1 flex-row items-center">
                <View className="bg-sky-50 p-2 rounded-xl mr-3">
                  <MaterialCommunityIcons
                    name="water-percent"
                    size={20}
                    color="#0284c7"
                  />
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">Humidity</Text>
                  <Text className="text-gray-900 font-medium">65%</Text>
                </View>
              </View>

              <View className="flex-1 flex-row items-center">
                <View className="bg-sky-50 p-2 rounded-xl mr-3">
                  <MaterialCommunityIcons
                    name="weather-rainy"
                    size={20}
                    color="#0284c7"
                  />
                </View>
                <View>
                  <Text className="text-gray-500 text-xs">Rain</Text>
                  <Text className="text-gray-900 font-medium">10%</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Farm Overview */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                Active Farms
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/farms')}
                className="bg-lima-100/70 px-3 py-1 rounded-full"
              >
                <Text className="text-lima-800 text-sm font-medium">
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="gap-4"
            >
              {/* Farm Cards - enhanced with shadows */}
              <View className="bg-white rounded-2xl p-4 border border-green-100 w-60 shadow-sm">
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="text-xl font-bold text-green-700">
                      Wheat
                    </Text>
                    <Text className="text-green-600">2.5 acres</Text>
                  </View>
                  <MaterialCommunityIcons
                    name="grain"
                    size={24}
                    color="#15803d"
                  />
                </View>
                <View className="mt-2 pt-3 border-t border-green-100">
                  <Text className="text-green-600 text-xs">Growth Stage</Text>
                  <Text className="text-green-700 font-medium">45 Days</Text>
                </View>
              </View>

              <View className="bg-white rounded-2xl p-4 border border-yellow-100 w-60 shadow-sm">
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text className="text-xl font-bold text-yellow-700">
                      Rice
                    </Text>
                    <Text className="text-yellow-600">1.8 acres</Text>
                  </View>
                  <MaterialCommunityIcons
                    name="seed"
                    size={24}
                    color="#a16207"
                  />
                </View>
                <View className="mt-2 pt-3 border-t border-yellow-100">
                  <Text className="text-yellow-600 text-xs">Growth Stage</Text>
                  <Text className="text-yellow-700 font-medium">Seedling</Text>
                </View>
              </View>
            </ScrollView>
          </View>

          {/* Quick Actions */}
          <View className="mb-6">
            <View className="gap-3">
              <TouchableOpacity className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <View className="flex-row items-center">
                  <View className="bg-blue-50 p-2 rounded-xl mr-3">
                    <MaterialCommunityIcons
                      name="water"
                      size={24}
                      color="#2563eb"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">
                      Water Wheat Field
                    </Text>
                    <Text className="text-gray-500 text-xs mt-0.5">
                      Scheduled for 4 PM
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color="#4b5563"
                  />
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <View className="flex-row items-center">
                  <View className="bg-purple-50 p-2 rounded-xl mr-3">
                    <MaterialCommunityIcons
                      name="weather-cloudy-alert"
                      size={24}
                      color="#7c3aed"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-gray-900 font-medium">
                      Check Weather Alert
                    </Text>
                    <Text className="text-gray-500 text-xs mt-0.5">
                      Rain expected tomorrow
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color="#4b5563"
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
