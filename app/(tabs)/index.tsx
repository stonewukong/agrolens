import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(() => {
    if (!profile?.id) return;
    setRefreshing(true);
    Promise.all([initializeFarms(profile.id), fetchWeather()]).finally(() => {
      setRefreshing(false);
    });
  }, [profile?.id]);

  useEffect(() => {
    if (profile?.id) {
      initializeFarms(profile.id);
      fetchWeather();
    }
  }, [profile?.id]);

  const WelcomeSkeleton = () => (
    <View className="px-6 py-4">
      <Skeleton width={200} height={32} className="mb-2" />
      <Skeleton width={150} height={20} />
    </View>
  );

  const WeatherSkeleton = () => (
    <View className="px-6">
      <Skeleton width={120} height={24} className="mb-4" />
      <View className="bg-white rounded-2xl p-6 shadow-sm border border-lima-100">
        <View className="flex-row items-start">
          <Skeleton width={56} height={56} borderRadius={16} className="mr-4" />
          <View className="flex-1">
            <Skeleton width={140} height={28} className="mb-2" />
            <Skeleton width={100} height={20} />
          </View>
        </View>
        <View className="flex-row mt-6 gap-4">
          <Skeleton width="30%" height={48} borderRadius={12} />
          <Skeleton width="30%" height={48} borderRadius={12} />
          <Skeleton width="30%" height={48} borderRadius={12} />
        </View>
      </View>
    </View>
  );

  const FarmCardSkeleton = ({ index }: { index: number }) => (
    <View
      key={index}
      className="rounded-2xl p-4 border w-72 shadow-sm mr-3 bg-white border-lima-100"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Skeleton width={120} height={24} className="mb-2" />
          <View className="flex-row items-center">
            <Skeleton width={40} height={16} className="mr-2" />
            <Skeleton width={60} height={16} />
          </View>
        </View>
        <Skeleton width={32} height={32} borderRadius={8} />
      </View>
      <View className="mt-3 pt-3 border-t border-lima-100">
        <Skeleton width={100} height={16} className="mb-2" />
        <View className="flex-row items-center">
          <Skeleton width={40} height={20} className="mr-2" borderRadius={12} />
          <Skeleton width={60} height={16} />
        </View>
      </View>
    </View>
  );

  const QuickActionsSkeleton = () => (
    <View className="px-6">
      <Skeleton width={120} height={24} className="mb-4" />
      <View className="flex-row gap-4">
        <Skeleton width="48%" height={120} borderRadius={16} />
        <Skeleton width="48%" height={120} borderRadius={16} />
      </View>
    </View>
  );

  const formatDate = (date: Date) => {
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const months = [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ];

    const dayKey = days[date.getDay()];
    const monthKey = months[date.getMonth()];
    const dayNum = date.getDate();

    return `${t('date.days.' + dayKey)}, ${t(
      'date.short.' + monthKey
    )} ${dayNum}`;
  };

  // Active Farms Section
  const ActiveFarmsSection = () => {
    const { farms } = useFarmStore();
    const router = useRouter();
    const { t } = useTranslation();

    if (farms.length === 0) {
      return (
        <View className="mb-6 w-full">
          <View className="flex-row w-full justify-between items-center mb-4">
            <Text className="text-lg font-semibold text-gray-900">
              {t('home.activeFarms')}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => router.push('/add-farm')}
              className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100 flex-row items-center w-[90vw]"
            >
              <View className="bg-lima-50 p-3 rounded-xl mr-4">
                <MaterialCommunityIcons
                  name="sprout"
                  size={24}
                  color="#4d7c0f"
                />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold mb-1">
                  {t('farms.noFarmsYet')}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {t('farms.addYourFirstFarm')}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#4d7c0f"
              />
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return (
      <View className="mb-6">
        <View className=" flex-row justify-between items-center mb-4">
          <Text className="text-lg font-semibold text-gray-900">
            {t('home.activeFarms')}
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/farms')}
            className="flex-row items-center"
          >
            <Text className="text-lima-600 mr-1">{t('common.viewAll')}</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={20}
              color="#4d7c0f"
            />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {farmsLoading ? (
            <>
              <FarmCardSkeleton index={0} />
              <FarmCardSkeleton index={1} />
            </>
          ) : (
            farms.map((farm) => (
              <TouchableOpacity
                key={farm.id}
                onPress={() =>
                  router.push({
                    pathname: '/[id]',
                    params: { id: farm.id },
                  })
                }
                className={`rounded-2xl p-4 border w-72 shadow-sm mr-3 ${
                  activeFarmId === farm.id
                    ? 'bg-lima-50 border-lima-200'
                    : 'bg-white border-lima-100'
                }`}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View>
                    <Text
                      className={`text-lg font-bold ${
                        activeFarmId === farm.id
                          ? 'text-lima-700'
                          : 'text-gray-900'
                      }`}
                    >
                      {farm.name}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <MaterialCommunityIcons
                        name={farm.icon}
                        size={16}
                        color="#4d7c0f"
                      />
                      <Text className="text-lima-600 text-sm ml-1">
                        {t(`crops.${farm.crop_type}`)}
                      </Text>
                    </View>
                  </View>
                  <View
                    className={`rounded-xl p-2 ${
                      activeFarmId === farm.id ? 'bg-lima-100' : 'bg-lima-50'
                    }`}
                  >
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color="#4d7c0f"
                    />
                  </View>
                </View>
                <View className="mt-3 pt-3 border-t border-lima-100">
                  <View className="flex-row items-center">
                    <View className="bg-lima-100 px-2 py-1 rounded-full mr-2">
                      <Text className="text-lima-700 text-sm font-medium">
                        {farm.area.toFixed(2)}
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-sm">
                      {t('farms.acres')}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    );
  };

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
                <FarmCardSkeleton index={0} />
                <FarmCardSkeleton index={1} />
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#65a30d']} // lima-600 color
            tintColor="#65a30d"
          />
        }
      >
        {/* Welcome Section */}
        <View className="pb-4">
          {/* Background Pattern */}
          <View className="absolute inset-0 opacity-30" />

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
                      ? t('common.goodMorning')
                      : new Date().toLocaleString('en-US', {
                          hour: 'numeric',
                          hour12: true,
                        }) < '17:00'
                      ? t('common.goodAfternoon')
                      : t('common.goodEvening')}
                    ,
                  </Text>
                  <Text className="text-sm text-lima-700 ml-1">👋</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-900 mt-1">
                  {getDisplayName(profile?.full_name)}
                </Text>
                <Text className="text-sm text-lima-600 mt-1">
                  {formatDate(new Date())}
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
              <View className="flex-row items-start justify-between">
                <View>
                  <View className="flex-row items-center gap-2 mb-3">
                    <MaterialCommunityIcons
                      name="map-marker-alert"
                      size={20}
                      color="#ef4444"
                    />
                    <Text className="text-red-500 font-medium">
                      {t('weather.error.locationUnavailable')}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-sm">
                    {t('weather.error.enableLocation')}
                  </Text>
                </View>
                <View className="bg-red-50 p-2.5 rounded-xl">
                  <MaterialCommunityIcons
                    name="map-marker-off"
                    size={24}
                    color="#ef4444"
                  />
                </View>
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
                                {t('weather.windSpeed')}
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
                                {t('weather.humidity')}
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
                                ? t('weather.high')
                                : weather.current.humidity < 30
                                ? t('weather.low')
                                : t('weather.normal')}
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
                                {t('weather.visibility')}
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
          <ActiveFarmsSection />
        </View>

        {/* Quick Stats - Updated Design */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-900 mb-2">
            {t('home.quickActions')}
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
                    {t('home.analyzeCrops')}
                  </Text>
                  <Text className="text-lima-600 text-xs">
                    {t('home.analyzeCropsDesc')}
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
                    {t('home.irrigationStatus')}
                  </Text>
                  <Text className="text-lima-600 text-xs">
                    {t('home.irrigationStatusDesc')}
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
                    {t('home.diseaseDetection')}
                  </Text>
                  <Text className="text-lima-600 text-xs">
                    {t('home.diseaseDetectionDesc')}
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
