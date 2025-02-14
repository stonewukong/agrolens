import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFarmStore } from '@/app/stores/useFarmStore';
import { agroMonitoringService } from '@/app/services/agroMonitoring';
import { useTranslation } from 'react-i18next';

type SatelliteType = 'ndvi' | 'evi' | 'true' | 'false';

interface ImageData {
  type: SatelliteType;
  url: string | null;
  loading: boolean;
}

export default function SatelliteViewScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getFarmById } = useFarmStore();
  const farm = getFarmById(id as string);
  const { t } = useTranslation();

  const [selectedType, setSelectedType] = useState<SatelliteType>('ndvi');
  const [images, setImages] = useState<Record<SatelliteType, ImageData>>({
    ndvi: { type: 'ndvi', url: null, loading: true },
    evi: { type: 'evi', url: null, loading: false },
    true: { type: 'true', url: null, loading: false },
    false: { type: 'false', url: null, loading: false },
  });

  const loadImage = async (type: SatelliteType) => {
    if (!farm?.agroPolygonId || images[type].loading || images[type].url)
      return;

    setImages((prev) => ({
      ...prev,
      [type]: { ...prev[type], loading: true },
    }));

    try {
      const imageUrl = await agroMonitoringService.getSatelliteImage(
        farm.agroPolygonId,
        { type }
      );
      setImages((prev) => ({
        ...prev,
        [type]: { ...prev[type], url: imageUrl, loading: false },
      }));
    } catch (error) {
      console.error(`Failed to load ${type} image:`, error);
      setImages((prev) => ({
        ...prev,
        [type]: { ...prev[type], loading: false },
      }));
    }
  };

  useEffect(() => {
    loadImage(selectedType);
  }, [selectedType, farm?.agroPolygonId]);

  if (!farm) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">{t('farms.notFound')}</Text>
      </View>
    );
  }

  const imageTypes: { type: SatelliteType; label: string; icon: string }[] = [
    { type: 'ndvi', label: t('farms.satellite.ndvi'), icon: 'leaf' },
    { type: 'evi', label: t('farms.satellite.evi'), icon: 'sprout' },
    { type: 'true', label: t('farms.satellite.true'), icon: 'earth' },
    {
      type: 'false',
      label: t('farms.satellite.false'),
      icon: 'satellite-variant',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" backgroundColor="transparent" />
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-2">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <MaterialCommunityIcons
                name="arrow-left"
                size={24}
                color="#4d7c0f"
              />
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-900">
                {t('farms.satellite.title')}
              </Text>
              <Text className="text-sm text-lima-600 mt-1">{farm.name}</Text>
            </View>
          </View>

          {/* Image Type Selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {imageTypes.map(({ type, label, icon }) => (
              <TouchableOpacity
                key={type}
                className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
                  selectedType === type ? 'bg-lima-600' : 'bg-lima-100'
                }`}
                onPress={() => setSelectedType(type)}
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={18}
                  color={selectedType === type ? '#ffffff' : '#4d7c0f'}
                />
                <Text
                  className={`ml-2 font-medium ${
                    selectedType === type ? 'text-white' : 'text-lima-700'
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Image Display */}
        <View className="flex-1 px-6">
          {images[selectedType].loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#4d7c0f" />
              <Text className="text-lima-600 mt-2">
                {t('farms.satellite.loading')}
              </Text>
            </View>
          ) : images[selectedType].url ? (
            <View className="flex-1">
              <Image
                source={{ uri: images[selectedType].url }}
                className="flex-1 rounded-xl"
                resizeMode="contain"
              />
              <View className="absolute bottom-4 left-4 bg-black/50 px-3 py-2 rounded-lg">
                <Text className="text-white font-medium">
                  {imageTypes.find((it) => it.type === selectedType)?.label}
                </Text>
              </View>
            </View>
          ) : (
            <View className="flex-1 items-center justify-center">
              <MaterialCommunityIcons
                name="satellite-variant"
                size={48}
                color="#9ca3af"
              />
              <Text className="text-gray-500 text-base mt-2">
                {t('farms.satellite.noImageAvailable')}
              </Text>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
