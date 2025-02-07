import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useProfile from '@/app/hooks/useProfile';
import { useRouter } from 'expo-router';
import { getDisplayInitial, getDisplayName } from '@/app/utils/nameUtils';
import { StatusBar } from 'expo-status-bar';
import { useWeatherStore } from '@/app/stores/useWeatherStore';
import { useFarmStore } from '@/app/stores/useFarmStore';
import {
  getWeatherTheme,
  getWindSpeedDescription,
  getVisibilityDescription,
} from '@/app/utils/weatherUtils';
import Skeleton from '@/app/components/Skeleton';
import { useLanguageStore } from '@/app/stores/useLanguageStore';

export default function HomeScreen() {
  const { profile, loading: profileLoading } = useProfile();
  const router = useRouter();
  const {
    farms,
    activeFarmId,
    setActiveFarm,
    loading: farmsLoading,
    initializeFarms,
  } = useFarmStore();
  const {
    data: weather,
    loading: weatherLoading,
    error: weatherError,
    fetchWeather,
  } = useWeatherStore();
  const { translations } = useLanguageStore();

  useEffect(() => {
    initializeFarms();
    fetchWeather();
  }, []);

  const WelcomeSkeleton = () => (
    <View className="pb-4">
      <View className="px-6 pt-4 pb-2">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Skeleton width={80} height={16} className="mb-2" />
            <Skeleton width={180} height={28} className="mb-2" />
            <Skeleton width={120} height={16} />
          </View>
          <View className="bg-lima-50 p-2 rounded-full">
            <Skeleton width={40} height={40} borderRadius={20} />
          </View>
        </View>
      </View>
    </View>
  );

  const WeatherSkeleton = () => (
    <View className="bg-white rounded-2xl p-4 shadow-md border border-lima-100 mb-6">
      <View className="flex-row items-start justify-between">
        <View>
          <Skeleton width={100} height={16} className="mb-2" />
          <View className="flex-row items-center">
            <Skeleton width={60} height={32} className="mr-2" />
            <Skeleton width={80} height={16} />
          </View>
        </View>
        <Skeleton width={40} height={40} borderRadius={12} />
      </View>
      <View className="mt-4 pt-4 border-t border-gray-100">
        <View className="mb-3">
          <Skeleton width="100%" height={48} borderRadius={12} />
        </View>
        <View className="mb-3">
          <Skeleton width="100%" height={48} borderRadius={12} />
        </View>
        <Skeleton width="100%" height={48} borderRadius={12} />
      </View>
    </View>
  );

  const FarmCardSkeleton = () => (
    <View className="rounded-2xl p-4 border w-60 shadow-sm mr-3 bg-white border-lima-100">
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Skeleton width={100} height={24} className="mb-2" />
          <Skeleton width={60} height={16} />
        </View>
        <Skeleton width={24} height={24} borderRadius={6} />
      </View>
      <View className="mt-2 pt-3 border-t border-lima-100">
        <Skeleton width={80} height={12} className="mb-1" />
        <Skeleton width={60} height={16} />
      </View>
    </View>
  );

  const QuickActionsSkeleton = () => (
    <View className="gap-3">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="bg-white p-4 rounded-2xl border border-lima-100 shadow-sm"
        >
          <View className="flex-row items-center">
            <Skeleton width={40} height={40} borderRadius={12} />
            <View className="flex-1 ml-3">
              <Skeleton width={120} height={20} className="mb-1" />
              <Skeleton width={160} height={14} />
            </View>
            <Skeleton width={24} height={24} borderRadius={6} />
          </View>
        </View>
      ))}
    </View>
  );

  if (profileLoading || farmsLoading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <StatusBar style="dark" backgroundColor="transparent" />
        <ScrollView
          className="flex-1"
          contentContainerStyle={{
            paddingBottom: 80,
          }}
        >
          <WelcomeSkeleton />

          <View className="px-6">
            <WeatherSkeleton />

            {/* Farm Overview Skeleton */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Skeleton width={120} height={24} />
                <Skeleton width={80} height={24} borderRadius={20} />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 24 }}
              >
                <FarmCardSkeleton />
                <FarmCardSkeleton />
              </ScrollView>
            </View>

            {/* Quick Actions Skeleton */}
            <View className="mb-6">
              <Skeleton width={120} height={24} className="mb-3" />
              <QuickActionsSkeleton />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="dark" backgroundColor="transparent" />

      <ScrollView
        className="flex-1 bg-white"
        contentContainerStyle={{
          paddingBottom: 10, // Add extra padding at bottom
        }}
      >
        {/* Welcome Section */}
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

          {/* User Info */}
          <View className="px-6 pt-4 pb-2 relative">
            <View className="flex-row justify-between items-center">
              {/* User Greeting - with welcome message */}
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="text-sm text-lima-700">
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
                  <Text className="text-sm text-lima-700 ml-1">👋</Text>
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
                className="bg-lima-100 p-2 rounded-full"
              >
                <View className="size-10 rounded-full bg-lima-200 items-center justify-center">
                  <Text className="text-lima-800 font-medium text-lg">
                    {getDisplayInitial(profile?.full_name)}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Content Container */}
        <View className="px-6">
          {/* Weather Card */}
          {weatherLoading ? (
            <WeatherSkeleton />
          ) : weatherError ? (
            <View className="bg-white rounded-2xl p-4 shadow-md border border-lima-200 mb-6">
              <View className="items-center py-4">
                <Text className="text-red-500">{weatherError}</Text>
              </View>
            </View>
          ) : weather ? (
            <View className="bg-white rounded-2xl p-4 shadow-md border border-lima-200 mb-6">
              {/* Main Weather Info */}
              {(() => {
                const theme = getWeatherTheme(
                  weather.current.weather[0].description
                );
                return (
                  <>
                    <View className="flex-row items-start justify-between">
                      <View>
                        <View className="flex-row items-center mt-2">
                          <MaterialCommunityIcons
                            name="map-marker"
                            size={14}
                            color="#94a3b8"
                          />
                          <Text className="text-gray-500 text-sm ml-1">
                            {weather.location}
                          </Text>
                        </View>
                        <View className="flex-row items-center">
                          <Text className="text-3xl font-bold text-gray-900">
                            {weather.current.temp}°
                          </Text>
                          <View className="ml-2">
                            <View className="flex-row items-center mt-0.5">
                              <MaterialCommunityIcons
                                name={theme.icon}
                                size={14}
                                color={theme.color}
                              />
                              <Text className="text-gray-600 text-xs ml-1 capitalize">
                                {weather.current.weather[0].description}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </View>

                      {/* Weather Icon */}
                      <View
                        className={`p-2.5 rounded-xl bg-lima-100`}
                        style={{ backgroundColor: theme.bgColor }}
                      >
                        <MaterialCommunityIcons
                          name={theme.icon}
                          size={28}
                          color={theme.color}
                        />
                      </View>
                    </View>

                    {/* Weather Details */}
                    <View className="mt-4 pt-4 border-t border-gray-100">
                      {/* Wind */}
                      <View className="flex-row items-center mb-3">
                        <View
                          className={`p-2 rounded-xl mr-3`}
                          style={{ backgroundColor: theme.bgColor }}
                        >
                          <MaterialCommunityIcons
                            name="weather-windy"
                            size={20}
                            color={theme.color}
                          />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between">
                            <View>
                              <Text className="text-gray-500 text-xs">
                                {translations.weather.windSpeed}
                              </Text>
                              <Text className="text-gray-900 font-medium">
                                {weather.current.wind_speed} km/h
                              </Text>
                            </View>
                            <Text className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
                              {getWindSpeedDescription(
                                weather.current.wind_speed
                              )}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Humidity */}
                      <View className="flex-row items-center mb-3">
                        <View
                          className={`p-2 rounded-xl mr-3`}
                          style={{ backgroundColor: theme.bgColor }}
                        >
                          <MaterialCommunityIcons
                            name="water-percent"
                            size={20}
                            color={theme.color}
                          />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between">
                            <View>
                              <Text className="text-gray-500 text-xs">
                                {translations.weather.humidity}
                              </Text>
                              <Text className="text-gray-900 font-medium">
                                {weather.current.humidity}%
                              </Text>
                            </View>
                            <Text
                              className={`text-xs px-2 py-1 rounded-full ${
                                weather.current.humidity > 70
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : weather.current.humidity < 30
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-green-50 text-green-700'
                              }`}
                            >
                              {weather.current.humidity > 70
                                ? translations.weather.high
                                : weather.current.humidity < 30
                                ? translations.weather.low
                                : translations.weather.normal}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Visibility */}
                      <View className="flex-row items-center">
                        <View
                          className={`p-2 rounded-xl mr-3`}
                          style={{ backgroundColor: theme.bgColor }}
                        >
                          <MaterialCommunityIcons
                            name="eye-outline"
                            size={20}
                            color={theme.color}
                          />
                        </View>
                        <View className="flex-1">
                          <View className="flex-row items-center justify-between">
                            <View>
                              <Text className="text-gray-500 text-xs">
                                {translations.weather.visibility}
                              </Text>
                              <Text className="text-gray-900 font-medium">
                                {(weather.current.visibility / 1000).toFixed(1)}{' '}
                                km
                              </Text>
                            </View>
                            <Text
                              className={`text-xs px-2 py-1 rounded-full ${
                                weather.current.visibility > 10000
                                  ? 'bg-green-50 text-green-700'
                                  : weather.current.visibility > 5000
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-yellow-50 text-yellow-700'
                              }`}
                            >
                              {getVisibilityDescription(
                                weather.current.visibility
                              )}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </>
                );
              })()}
            </View>
          ) : null}

          {/* Farm Overview */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-semibold text-gray-900">
                {translations.home.activeFarms}
              </Text>
              <TouchableOpacity
                onPress={() => router.push('/(tabs)/farms')}
                className="bg-lima-200 px-3 py-1 rounded-full"
              >
                <Text className="text-lima-800 text-sm font-medium">
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 24 }}
            >
              {farmsLoading ? (
                <>
                  <FarmCardSkeleton />
                  <FarmCardSkeleton />
                </>
              ) : (
                farms.map((farm) => (
                  <TouchableOpacity
                    key={farm.id}
                    onPress={() => setActiveFarm(farm.id)}
                    className={`rounded-2xl p-4 border w-60 shadow-sm mr-3 ${
                      activeFarmId === farm.id
                        ? 'bg-lima-100 border-lima-200'
                        : 'bg-white border-lima-200'
                    }`}
                  >
                    <View className="flex-row justify-between items-start mb-3">
                      <View>
                        <Text
                          className={`text-xl font-bold ${
                            activeFarmId === farm.id
                              ? 'text-lima-700'
                              : 'text-lima-800'
                          }`}
                        >
                          {farm.name}
                        </Text>
                        <Text
                          className={
                            activeFarmId === farm.id
                              ? 'text-lima-600'
                              : 'text-lima-700'
                          }
                        >
                          {farm.area} acres
                        </Text>
                      </View>
                      <MaterialCommunityIcons
                        name={farm.icon}
                        size={24}
                        color={activeFarmId === farm.id ? '#3f6212' : '#3f6212'}
                      />
                    </View>
                    <View
                      className={`mt-2 pt-3 border-t ${
                        activeFarmId === farm.id
                          ? 'border-lima-200'
                          : 'border-lima-100'
                      }`}
                    >
                      <Text
                        className={
                          activeFarmId === farm.id
                            ? 'text-lima-600'
                            : 'text-lima-700'
                        }
                        style={{ fontSize: 12 }}
                      >
                        Growth Stage
                      </Text>
                      <Text
                        className={`font-medium ${
                          activeFarmId === farm.id
                            ? 'text-lima-700'
                            : 'text-lima-800'
                        }`}
                      >
                        {farm.growthStage.days} Days
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>

        {/* Quick Stats - Updated Design */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            {translations.home.quickActions}
          </Text>
          <View className="gap-2">
            {/* Analyze Crops */}
            <TouchableOpacity className="bg-white p-3 rounded-xl border border-lima-200 shadow-sm">
              <View className="flex-row items-center">
                <View className="bg-lima-100 p-2 rounded-lg">
                  <MaterialCommunityIcons
                    name="leaf-maple"
                    size={20}
                    color="#3f6212"
                  />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-medium text-sm">
                    {translations.home.analyzeCrops}
                  </Text>
                  <Text className="text-lima-600 text-xs">
                    {translations.home.analyzeCropsDesc}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#3f6212"
                />
              </View>
            </TouchableOpacity>

            {/* Irrigation Status */}
            <TouchableOpacity className="bg-white p-3 rounded-xl border border-lima-200 shadow-sm">
              <View className="flex-row items-center">
                <View className="bg-lima-100 p-2 rounded-lg">
                  <MaterialCommunityIcons
                    name="water"
                    size={20}
                    color="#3f6212"
                  />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-medium text-sm">
                    {translations.home.irrigationStatus}
                  </Text>
                  <Text className="text-lima-600 text-xs">
                    {translations.home.irrigationStatusDesc}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#3f6212"
                />
              </View>
            </TouchableOpacity>

            {/* Disease Detection */}
            <TouchableOpacity className="bg-white p-3 rounded-xl border border-lima-200 shadow-sm">
              <View className="flex-row items-center">
                <View className="bg-lima-100 p-2 rounded-lg">
                  <MaterialCommunityIcons
                    name="microscope"
                    size={20}
                    color="#3f6212"
                  />
                </View>
                <View className="flex-1 ml-3">
                  <Text className="text-gray-900 font-medium text-sm">
                    {translations.home.diseaseDetection}
                  </Text>
                  <Text className="text-lima-600 text-xs">
                    {translations.home.diseaseDetectionDesc}
                  </Text>
                </View>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={20}
                  color="#3f6212"
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
