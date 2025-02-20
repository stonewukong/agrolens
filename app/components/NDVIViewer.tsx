import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { agroMonitoringService } from '@/app/services/agroMonitoring';
import { databaseService } from '@/app/services/databaseService';
import { useTranslation } from 'react-i18next';
import { useFarmStore } from '@/app/stores/useFarmStore';
import { LinearGradient } from 'expo-linear-gradient';

interface NDVIViewerProps {
  polygonId: string;
  farmId: string;
  onError?: (error: string) => void;
}

export default function NDVIViewer({
  polygonId,
  farmId,
  onError,
}: NDVIViewerProps) {
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);
  const [ndviImage, setNdviImage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();
  const { refreshFarmData } = useFarmStore();

  const fetchNDVIData = async () => {
    try {
      setLoading(true);
      setError(null);

      const imageUrl = await agroMonitoringService.getSatelliteImage(
        polygonId,
        {
          type: 'ndvi',
          paletteid: 1, // Using the default green NDVI palette
        }
      );

      if (imageUrl) {
        setNdviImage(imageUrl);
        setLastUpdated(new Date());

        // Update the database with new NDVI data
        await databaseService.updateSatelliteData(
          farmId,
          0.75, // You might want to calculate this from the image
          imageUrl
        );

        // Refresh farm data in the store
        await refreshFarmData(farmId);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch NDVI data';
      console.error('Error fetching NDVI data:', errorMessage);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNDVIData();

    // Set up auto-refresh every 24 hours
    const refreshInterval = setInterval(() => {
      fetchNDVIData();
    }, 24 * 60 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [polygonId]);

  const handleManualRefresh = () => {
    fetchNDVIData();
  };

  const NDVILegend = () => (
    <View className="bg-white rounded-xl p-4 mt-4 border border-lima-100">
      <Text className="text-sm font-medium text-gray-900 mb-3">
        {t('farms.satellite.ndviLegend')}
      </Text>
      <View className="h-3 rounded-full overflow-hidden mb-3">
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          colors={[
            '#d7191c', // Very low NDVI (-1.0 to 0.0)
            '#fdae61', // Low NDVI (0.0 to 0.2)
            '#ffffbf', // Moderate NDVI (0.2 to 0.4)
            '#a6d96a', // High NDVI (0.4 to 0.6)
            '#1a9641', // Very high NDVI (0.6 to 1.0)
          ]}
          className="w-full h-full"
        />
      </View>
      <View className="flex-row justify-between">
        <Text className="text-xs text-gray-600">-1.0</Text>
        <Text className="text-xs text-gray-600">0.0</Text>
        <Text className="text-xs text-gray-600">0.2</Text>
        <Text className="text-xs text-gray-600">0.4</Text>
        <Text className="text-xs text-gray-600">0.6</Text>
        <Text className="text-xs text-gray-600">1.0</Text>
      </View>
      <View className="flex-row justify-between mt-2">
        <View className="items-center">
          <Text className="text-xs text-gray-500">{t('weather.low')}</Text>
          <Text className="text-xs text-gray-400">
            {t('farms.satellite.unhealthy')}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-xs text-gray-500">{t('weather.moderate')}</Text>
          <Text className="text-xs text-gray-400">
            {t('farms.satellite.moderate')}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-xs text-gray-500">{t('weather.high')}</Text>
          <Text className="text-xs text-gray-400">
            {t('farms.satellite.healthy')}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100">
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#4d7c0f" />
          <Text className="text-lima-600 mt-2">
            {t('farms.satellite.loading')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-lg font-bold text-gray-900">
            {t('farms.satellite.ndviDesc')}
          </Text>
          <Text className="text-sm text-lima-600">
            {lastUpdated
              ? t('farms.actions.lastScan', {
                  time: lastUpdated.toLocaleString(),
                })
              : t('farms.satellite.noImageAvailable')}
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleManualRefresh}
          className="bg-lima-50 p-2 rounded-lg"
          disabled={loading || imageLoading}
        >
          <MaterialCommunityIcons
            name="refresh"
            size={24}
            color={loading || imageLoading ? '#9ca3af' : '#4d7c0f'}
          />
        </TouchableOpacity>
      </View>

      {/* NDVI Image */}
      {error ? (
        <View className="items-center justify-center py-8">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#dc2626"
          />
          <Text className="text-red-600 mt-2 text-center">{error}</Text>
          <TouchableOpacity
            onPress={fetchNDVIData}
            className="mt-4 bg-lima-50 px-4 py-2 rounded-lg flex-row items-center"
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#4d7c0f" />
            <Text className="text-lima-700 ml-2">{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : ndviImage ? (
        <View>
          <View className="relative">
            <Image
              source={{ uri: ndviImage }}
              className="w-full aspect-[16/9] rounded-lg mb-4"
              resizeMode="contain"
              onLoadStart={() => setImageLoading(true)}
              onLoadEnd={() => setImageLoading(false)}
              style={{ minHeight: 200 }}
            />
            {imageLoading && (
              <View className="absolute inset-0 items-center justify-center bg-gray-900/10 rounded-lg">
                <ActivityIndicator size="large" color="#4d7c0f" />
              </View>
            )}
          </View>

          {/* NDVI Legend */}
          <NDVILegend />
        </View>
      ) : (
        <View className="items-center justify-center py-8">
          <MaterialCommunityIcons
            name="satellite-variant"
            size={48}
            color="#9ca3af"
          />
          <Text className="text-gray-500 mt-2">
            {t('farms.satellite.noImageAvailable')}
          </Text>
          <TouchableOpacity
            onPress={fetchNDVIData}
            className="mt-4 bg-lima-50 px-4 py-2 rounded-lg flex-row items-center"
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#4d7c0f" />
            <Text className="text-lima-700 ml-2">{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
