import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useFarmStore } from '@/app/stores/useFarmStore';
import Skeleton from '@/app/components/Skeleton';
import { useTranslation } from 'react-i18next';

export default function FarmsScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const router = useRouter();
  const { farms } = useFarmStore();
  const [loading, setLoading] = React.useState(false);
  const { t } = useTranslation();

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  const FarmListSkeleton = () => (
    <View className="px-6">
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100 mb-4"
        >
          <View className="flex-row items-start">
            <Skeleton
              width={48}
              height={48}
              borderRadius={12}
              className="mr-4"
            />
            <View className="flex-1">
              <View className="flex-row justify-between items-start">
                <View>
                  <Skeleton width={120} height={24} className="mb-2" />
                  <Skeleton width={80} height={16} />
                </View>
                <Skeleton width={60} height={24} borderRadius={20} />
              </View>
              <View className="flex-row mt-4 gap-4">
                <Skeleton width="30%" height={40} borderRadius={8} />
                <Skeleton width="30%" height={40} borderRadius={8} />
                <Skeleton width="30%" height={40} borderRadius={8} />
              </View>
              <View className="flex-row gap-2 mt-4">
                <Skeleton width="48%" height={36} borderRadius={8} />
                <Skeleton width="48%" height={36} borderRadius={8} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <SafeAreaView className="flex-1">
      <StatusBar style="dark" backgroundColor="transparent" />
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="flex-1 bg-white"
        contentContainerStyle={{
          paddingBottom: 80,
        }}
      >
        {/* Header with Add Farm Button */}
        <View className="pb-4">
          {/* Background Pattern */}
          <View className="absolute inset-0 opacity-30" />
          <View className="px-6 pt-4 pb-2 relative">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-2xl font-bold text-gray-900">
                  {t('farms.myFarms')}
                </Text>
                <Text className="text-sm text-lima-600 mt-1">
                  {farms.length > 0
                    ? t('farms.managing', { count: farms.length })
                    : t('farms.noActiveFarms')}
                </Text>
              </View>
              <TouchableOpacity
                className="bg-lima-700 p-2 rounded-xl"
                onPress={() => router.push('/add-farm')}
              >
                <MaterialCommunityIcons name="plus" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Farm List */}
        {loading ? (
          <FarmListSkeleton />
        ) : farms.length === 0 ? (
          <View className="px-6 py-12 items-center">
            <View className="bg-lima-50 p-4 rounded-full mb-4">
              <MaterialCommunityIcons name="sprout" size={32} color="#4d7c0f" />
            </View>
            <Text className="text-gray-900 text-lg font-semibold text-center mb-2">
              {t('farms.noFarmsYet')}
            </Text>
            <Text className="text-gray-600 text-center mb-6">
              {t('farms.addYourFirstFarm')}
            </Text>
            <TouchableOpacity
              className="bg-lima-700 px-6 py-3 rounded-xl flex-row items-center"
              onPress={() => router.push('/add-farm')}
            >
              <MaterialCommunityIcons name="plus" size={20} color="white" />
              <Text className="text-white font-medium ml-2">
                {t('farms.addFarm')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="px-6">
            {farms.map((farm) => (
              <TouchableOpacity
                key={farm.id}
                className="bg-white rounded-2xl mb-4 overflow-hidden border border-lima-100/50 shadow-sm"
                onPress={() =>
                  router.push({
                    pathname: '/[id]',
                    params: { id: farm.id },
                  })
                }
              >
                {/* Header Section */}
                <View className="p-4 border-b border-lima-100/30">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <View className="bg-lima-50 p-2.5 rounded-xl mr-3">
                        <MaterialCommunityIcons
                          name={farm.icon}
                          size={22}
                          color="#4d7c0f"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-base font-bold text-gray-900 mb-0.5">
                          {farm.name}
                        </Text>
                        <Text className="text-xs text-lima-600">
                          {farm.area.toFixed(1)} {t('farms.acres')}
                        </Text>
                      </View>
                    </View>
                    <View
                      className={`px-3 py-1.5 rounded-full ${
                        farm.status === 'Healthy'
                          ? 'bg-lime-50 border border-lime-200'
                          : farm.status === 'Needs Attention'
                          ? 'bg-amber-50 border border-amber-200'
                          : 'bg-red-50 border border-red-200'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          farm.status === 'Healthy'
                            ? 'text-lime-700'
                            : farm.status === 'Needs Attention'
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}
                      >
                        {t(
                          `farms.status.${farm.status
                            .toLowerCase()
                            .replace(' ', '')}`
                        )}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Growth Stage Indicator */}
                <View className="px-4 py-4 bg-lima-50/30">
                  {/* Growth Info Cards */}
                  <View className="flex-row w-full justify-between mb-4">
                    {/* Days Counter */}
                    <View className="bg-white/60  rounded-lg">
                      <View className="flex-row items-center">
                        <MaterialCommunityIcons
                          name="calendar-range"
                          size={14}
                          color="#4d7c0f"
                        />
                        <Text className="text-xs font-medium text-lima-700 ml-1.5">
                          {farm.growth_stage?.days} {t('home.days')}
                        </Text>
                      </View>
                    </View>

                    {/* Expected Harvest */}
                    {farm.growth_stage?.expected_harvest_date && (
                      <View className="bg-white/60  rounded-lg">
                        <View className="flex-row items-center">
                          <MaterialCommunityIcons
                            name="calendar-check"
                            size={14}
                            color="#4d7c0f"
                          />
                          <Text className="text-xs font-medium text-lima-700 ml-1.5">
                            {t('farms.growthTimeline.expectedHarvest')}:{' '}
                            {new Date(
                              farm.growth_stage.expected_harvest_date
                            ).toLocaleDateString()}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Growth Timeline */}
                  <View className="mt-2">
                    {/* Progress Bar */}
                    <View className="h-2.5 bg-lima-100 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-gradient-to-r from-lima-500 to-lima-600 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((new Date().getTime() -
                              new Date(farm.planting_date).getTime()) /
                              (new Date(
                                farm.growth_stage?.expected_harvest_date
                              ).getTime() -
                                new Date(farm.planting_date).getTime())) *
                              100,
                            100
                          )}%`,
                        }}
                      />
                    </View>

                    {/* Stage Markers */}
                    <View className="flex-row justify-between mt-2">
                      {[
                        'Seedling',
                        'Vegetative',
                        'Reproductive',
                        'Maturity',
                      ].map((stage, index) => {
                        const isCurrentStage =
                          farm.growth_stage?.stage === stage;
                        const isPastStage =
                          [
                            'Seedling',
                            'Vegetative',
                            'Reproductive',
                            'Maturity',
                          ].indexOf(farm.growth_stage?.stage) > index;

                        return (
                          <View
                            key={stage}
                            className="items-center"
                            style={{ width: '25%' }}
                          >
                            <View
                              className={`size-2 rounded-full mb-1.5 ${
                                isCurrentStage
                                  ? 'bg-lima-600 ring-2 ring-lima-200'
                                  : isPastStage
                                  ? 'bg-lima-600'
                                  : 'bg-lima-200'
                              }`}
                            />
                            <Text
                              className={`text-[10px] ${
                                isCurrentStage
                                  ? 'text-lima-700 font-medium'
                                  : 'text-lima-500'
                              }`}
                            >
                              {t(`farms.stages.${stage.toLowerCase()}`)}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                </View>

                {/* Quick Stats Grid */}
                <View className="p-4 flex-row gap-2">
                  {/* NDVI Score */}
                  <View className="bg-white p-3 rounded-xl border border-lima-100/50">
                    <View className="flex-row items-center mb-1.5">
                      <MaterialCommunityIcons
                        name="leaf"
                        size={14}
                        color="#4d7c0f"
                      />
                      <Text className="text-xs text-lima-600 ml-1">
                        {t('farms.metrics.ndviScore')}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-lima-700">
                      {farm.satellite_data?.ndvi_history?.[0]?.value?.toFixed(
                        2
                      ) ?? 'N/A'}
                    </Text>
                  </View>

                  {/* Temperature */}
                  <View className="bg-white p-3 rounded-xl border border-lima-100/50">
                    <View className="flex-row items-center mb-1.5">
                      <MaterialCommunityIcons
                        name="thermometer"
                        size={14}
                        color="#4d7c0f"
                      />
                      <Text className="text-xs text-lima-600 ml-1">
                        {t('weather.current')}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-lima-700">
                      {farm.weather_data?.temperature
                        ? `${farm.weather_data.temperature}°C`
                        : 'N/A'}
                    </Text>
                  </View>

                  {/* Soil Moisture */}
                  <View className="bg-white p-3 rounded-xl border border-lima-100/50">
                    <View className="flex-row items-center mb-1.5">
                      <MaterialCommunityIcons
                        name="water-percent"
                        size={14}
                        color="#4d7c0f"
                      />
                      <Text className="text-xs text-lima-600 ml-1">
                        {t('weather.soilMoisture.title')}
                      </Text>
                    </View>
                    <Text className="text-sm font-semibold text-lima-700">
                      {farm.soil_data?.moisture
                        ? `${(farm.soil_data.moisture * 100).toFixed(0)}%`
                        : 'N/A'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
