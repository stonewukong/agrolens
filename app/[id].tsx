import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useFarmStore } from '@/app/stores/useFarmStore';
import { useTranslation } from 'react-i18next';
import { agroMonitoringService } from '@/app/services/agroMonitoring';

export default function FarmDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getFarmById } = useFarmStore();
  const farm = getFarmById(id as string);
  const [refreshing, setRefreshing] = React.useState(false);
  const [satelliteImage, setSatelliteImage] = React.useState<string | null>(
    null
  );
  const { t } = useTranslation();

  useEffect(() => {
    const loadSatelliteImage = async () => {
      if (farm?.agroPolygonId) {
        try {
          const imageUrl = await agroMonitoringService.getSatelliteImage(
            farm.agroPolygonId
          );
          setSatelliteImage(imageUrl);
        } catch (error) {
          console.error('Failed to load satellite image:', error);
        }
      }
    };
    loadSatelliteImage();
  }, [farm?.agroPolygonId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  if (!farm) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">{t('farms.notFound')}</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
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
          {/* Header */}
          <View className="pb-4">
            <View className="px-6 pt-4 pb-2">
              <View className="flex-row items-center mb-4">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="mr-3"
                >
                  <MaterialCommunityIcons
                    name="arrow-left"
                    size={24}
                    color="#4d7c0f"
                  />
                </TouchableOpacity>
                <View className="flex-1">
                  <Text className="text-2xl font-bold text-gray-900">
                    {farm.name}
                  </Text>
                  <Text className="text-sm text-lima-600 mt-1">
                    {farm.area} {t('farms.acres')} •{' '}
                    {t('farms.growthTimeline.currentStage', {
                      stage: t(
                        `farms.stages.${farm.growthStage.stage.toLowerCase()}`
                      ),
                    })}
                  </Text>
                </View>
                <View
                  className={`px-3 py-1 rounded-full ${
                    farm.status === 'Healthy'
                      ? 'bg-lima-100'
                      : farm.status === 'Needs Attention'
                      ? 'bg-yellow-100'
                      : 'bg-red-100'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
                      farm.status === 'Healthy'
                        ? 'text-lima-700'
                        : farm.status === 'Needs Attention'
                        ? 'text-yellow-700'
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
          </View>

          {/* Content */}
          <View className="px-6">
            {/* Key Metrics */}
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100 mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                {t('farms.metrics.title')}
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {/* NDVI Score */}
                <View className="flex-1 min-w-[45%] bg-lima-50 p-3 rounded-xl">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-lima-700 font-medium">
                      {t('farms.metrics.ndviScore')}
                    </Text>
                    <MaterialCommunityIcons
                      name="leaf"
                      size={20}
                      color="#4d7c0f"
                    />
                  </View>
                  <Text className="text-2xl font-bold text-lima-700">
                    {farm.metrics.ndviScore}
                  </Text>
                  <Text className="text-lima-600 text-xs mt-1">
                    {farm.metrics.ndviScore > 0.8
                      ? t('farms.metrics.excellentHealth')
                      : farm.metrics.ndviScore > 0.6
                      ? t('farms.metrics.goodHealth')
                      : t('farms.metrics.needsAttention')}
                  </Text>
                </View>

                {/* Water Stress */}
                <View className="flex-1 min-w-[45%] bg-blue-50 p-3 rounded-xl">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-blue-700 font-medium">
                      {t('farms.metrics.waterStress')}
                    </Text>
                    <MaterialCommunityIcons
                      name={
                        farm.metrics.waterStress.level === 'High'
                          ? 'water-alert'
                          : 'water'
                      }
                      size={20}
                      color="#2563eb"
                    />
                  </View>
                  <Text className="text-2xl font-bold text-blue-700">
                    {t(
                      `weather.${farm.metrics.waterStress.level.toLowerCase()}`
                    )}
                  </Text>
                  <Text className="text-blue-600 text-xs mt-1">
                    {farm.metrics.waterStress.value.toFixed(2)}{' '}
                    {t('farms.metrics.index')}
                  </Text>
                </View>

                {/* Nitrogen Levels */}
                <View className="flex-1 min-w-[45%] bg-purple-50 p-3 rounded-xl">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-purple-700 font-medium">
                      {t('farms.metrics.nitrogen')}
                    </Text>
                    <MaterialCommunityIcons
                      name="molecule"
                      size={20}
                      color="#7c3aed"
                    />
                  </View>
                  <Text className="text-2xl font-bold text-purple-700">
                    {farm.metrics.nitrogen.value}
                  </Text>
                  <Text className="text-purple-600 text-xs mt-1">
                    {t('farms.metrics.kgPerHa')} •{' '}
                    {t(
                      `farms.metrics.${farm.metrics.nitrogen.status.toLowerCase()}`
                    )}
                  </Text>
                </View>

                {/* Disease Risk */}
                <View className="flex-1 min-w-[45%] bg-yellow-50 p-3 rounded-xl">
                  <View className="flex-row justify-between items-start mb-2">
                    <Text className="text-yellow-700 font-medium">
                      {t('farms.metrics.diseaseRisk')}
                    </Text>
                    <MaterialCommunityIcons
                      name={
                        farm.metrics.diseaseRisk.status === 'Low'
                          ? 'shield-check'
                          : 'shield-alert'
                      }
                      size={20}
                      color="#a16207"
                    />
                  </View>
                  <Text className="text-2xl font-bold text-yellow-700">
                    {farm.metrics.diseaseRisk.percentage}%
                  </Text>
                  <Text className="text-yellow-600 text-xs mt-1">
                    {t(
                      `weather.${farm.metrics.diseaseRisk.status.toLowerCase()}`
                    )}{' '}
                    {t('farms.metrics.riskLevel')}
                  </Text>
                </View>
              </View>
            </View>

            {/* Growth Timeline */}
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100 mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                {t('farms.growthTimeline.title')}
              </Text>
              <View className="flex-row items-center mb-2">
                <View className="h-1 flex-1 bg-lima-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-lima-600 rounded-full"
                    style={{
                      width: `${(farm.growthStage.days / 120) * 100}%`,
                    }}
                  />
                </View>
                <Text className="ml-3 text-lima-700 font-medium">
                  {t('farms.growthTimeline.daysOld', {
                    days: farm.growthStage.days,
                  })}
                </Text>
              </View>
              <Text className="text-sm text-lima-600">
                {t('farms.growthTimeline.currentStage', {
                  stage: t(
                    `farms.stages.${farm.growthStage.stage.toLowerCase()}`
                  ),
                })}
              </Text>
            </View>

            {/* After Growth Timeline section */}
            {farm?.agroPolygonId && (
              <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100 mb-4">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-base font-semibold text-gray-900">
                    {t('farms.satellite.title')}
                  </Text>
                  <TouchableOpacity
                    className="flex-row items-center"
                    onPress={() =>
                      router.push({
                        pathname: '/satellite-view',
                        params: { id: farm.id },
                      })
                    }
                  >
                    <Text className="text-lima-600 text-sm mr-1">
                      {t('common.viewAll')}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={20}
                      color="#4d7c0f"
                    />
                  </TouchableOpacity>
                </View>

                {satelliteImage ? (
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: '/satellite-view',
                        params: { id: farm.id },
                      })
                    }
                  >
                    <Image
                      source={{ uri: satelliteImage }}
                      className="w-full h-48 rounded-xl"
                      resizeMode="cover"
                    />
                    <View className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded-lg">
                      <Text className="text-white text-xs">NDVI</Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <View className="w-full h-48 rounded-xl bg-gray-100 items-center justify-center">
                    <MaterialCommunityIcons
                      name="satellite-variant"
                      size={32}
                      color="#9ca3af"
                    />
                    <Text className="text-gray-500 text-sm mt-2">
                      {t('farms.satellite.loading')}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Next Actions */}
            <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100 mb-4">
              <Text className="text-base font-semibold text-gray-900 mb-3">
                {t('farms.actions.nextActions')}
              </Text>
              <View className="gap-3">
                {farm.nextIrrigation && (
                  <TouchableOpacity className="flex-row items-center bg-blue-50 p-3 rounded-xl">
                    <MaterialCommunityIcons
                      name="timer-outline"
                      size={24}
                      color="#2563eb"
                    />
                    <View className="flex-1 ml-3">
                      <Text className="text-blue-900 font-medium">
                        {t('farms.actions.scheduledIrrigation')}
                      </Text>
                      <Text className="text-blue-600 text-sm">
                        {new Date(farm.nextIrrigation).toLocaleDateString(
                          'en-US',
                          {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          }
                        )}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={24}
                      color="#2563eb"
                    />
                  </TouchableOpacity>
                )}

                <TouchableOpacity className="flex-row items-center bg-lima-50 p-3 rounded-xl">
                  <MaterialCommunityIcons
                    name="camera"
                    size={24}
                    color="#4d7c0f"
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-lima-900 font-medium">
                      {t('farms.actions.scanCropHealth')}
                    </Text>
                    <Text className="text-lima-600 text-sm">
                      {t('farms.actions.lastScan', { time: '2 days ago' })}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color="#4d7c0f"
                  />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center bg-purple-50 p-3 rounded-xl">
                  <MaterialCommunityIcons
                    name="test-tube"
                    size={24}
                    color="#7c3aed"
                  />
                  <View className="flex-1 ml-3">
                    <Text className="text-purple-900 font-medium">
                      {t('farms.actions.soilAnalysis')}
                    </Text>
                    <Text className="text-purple-600 text-sm">
                      {t('farms.actions.scheduleTest')}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color="#7c3aed"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
