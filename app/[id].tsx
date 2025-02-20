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
import NDVIViewer from '@/app/components/NDVIViewer';
import WeatherCard from '@/app/components/WeatherCard';
import SoilMoisture from '@/app/components/SoilMoisture';

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
      if (farm?.agro_polygon_id) {
        try {
          const imageUrl = await agroMonitoringService.getSatelliteImage(
            farm.agro_polygon_id
          );
          setSatelliteImage(imageUrl);
        } catch (error) {
          console.error('Failed to load satellite image:', error);
        }
      }
    };
    loadSatelliteImage();
  }, [farm?.agro_polygon_id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  }, []);

  if (!farm) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <MaterialCommunityIcons name="alert" size={48} color="#dc2626" />
        <Text className="text-gray-500 mt-4 text-lg">
          {t('farms.notFound')}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-lima-50 px-6 py-3 rounded-xl flex-row items-center"
        >
          <MaterialCommunityIcons name="arrow-left" size={20} color="#4d7c0f" />
          <Text className="text-lima-700 font-medium ml-2">
            {t('common.back')}
          </Text>
        </TouchableOpacity>
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
          <View className="pb-4 bg-lima-50">
            <View className="px-6 pt-4 pb-6">
              <View className="flex-row items-center mb-4">
                <TouchableOpacity
                  onPress={() => router.back()}
                  className="mr-3 bg-white p-2 rounded-full shadow-sm"
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
                    {farm.area.toFixed(2)} {t('farms.acres')} •{' '}
                    {t('farms.growthTimeline.currentStage', {
                      stage: t(
                        `farms.stages.${farm.growth_stage.stage.toLowerCase()}`
                      ),
                    })}
                  </Text>
                </View>
                <View
                  className={`px-4 py-2 rounded-full shadow-sm ${
                    farm.status === 'Healthy'
                      ? 'bg-lime-100'
                      : farm.status === 'Needs Attention'
                      ? 'bg-amber-100'
                      : 'bg-red-100'
                  }`}
                >
                  <Text
                    className={`text-sm font-medium ${
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
          </View>

          {/* Content */}
          <View className="px-6 -mt-6">
            {/* NDVI Viewer */}
            {farm?.agro_polygon_id && (
              <View className="mb-6">
                <NDVIViewer
                  polygonId={farm.agro_polygon_id}
                  farmId={farm.id}
                  onError={(error) => {
                    console.error('NDVI Error:', error);
                  }}
                />
              </View>
            )}

            {/* Weather Section */}
            <View className="mb-6">
              <WeatherCard
                latitude={farm.location.geometry.coordinates[0][0][1]}
                longitude={farm.location.geometry.coordinates[0][0][0]}
                onError={(error) => {
                  console.error('Weather Error:', error);
                }}
              />
            </View>

            {/* Soil Moisture */}
            {farm.agro_polygon_id && (
              <View className="mb-6">
                <SoilMoisture
                  polygonId={farm.agro_polygon_id}
                  onError={(error) => {
                    console.error('Soil Moisture Error:', error);
                  }}
                />
              </View>
            )}

            {/* Growth Timeline */}
            {/* <View className="bg-white rounded-2xl p-6 shadow-sm border border-lima-100 mb-6">
              <Text className="text-lg font-semibold text-gray-900 mb-4">
                {t('farms.growthTimeline.title')}
              </Text>
              <View className="flex-row items-center mb-3">
                <View className="h-2 flex-1 bg-lima-100 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-lima-600 rounded-full"
                    style={{
                      width: `${(farm.growth_stage.days / 120) * 100}%`,
                    }}
                  />
                </View>
                <Text className="ml-4 text-lima-700 font-medium">
                  {t('farms.growthTimeline.daysOld', {
                    days: farm.growth_stage.days,
                  })}
                </Text>
              </View>
              <View className="flex-row items-center justify-between mt-4">
                <View className="items-center">
                  <Text className="text-xs text-gray-500">Start</Text>
                  <Text className="text-sm font-medium text-gray-700 mt-1">
                    {new Date(farm.planting_date).toLocaleDateString()}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-xs text-gray-500">
                    Expected Harvest
                  </Text>
                  <Text className="text-sm font-medium text-gray-700 mt-1">
                    {new Date(
                      farm.growth_stage.expected_harvest_date
                    ).toLocaleDateString()}
                  </Text>
                </View>
              </View>
              <View className="mt-4 bg-lima-50 rounded-xl p-4">
                <Text className="text-sm text-lima-700">
                  {t('farms.growthTimeline.currentStage', {
                    stage: t(
                      `farms.stages.${farm.growth_stage.stage.toLowerCase()}`
                    ),
                  })}
                </Text>
              </View>
            </View> */}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
