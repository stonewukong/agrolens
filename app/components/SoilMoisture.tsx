import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { agroMonitoringService } from '@/app/services/agroMonitoring';
import { useTranslation } from 'react-i18next';

interface SoilMoistureProps {
  polygonId: string;
  onError?: (error: string) => void;
}

type MoistureLevel = 'veryDry' | 'dry' | 'adequate' | 'moist';
type IrrigationRecommendation = 'irrigateNow' | 'irrigateSoon' | 'noIrrigation';

const getMoistureLevel = (
  moisture: number
): {
  level: MoistureLevel;
  color: string;
  fillPercentage: number;
} => {
  // Moisture values from API are typically between 0-1 (0-100%)
  if (moisture < 0.2) {
    return {
      level: 'veryDry',
      color: '#dc2626', // red-600
      fillPercentage: moisture * 100,
    };
  } else if (moisture < 0.4) {
    return {
      level: 'dry',
      color: '#ea580c', // orange-600
      fillPercentage: moisture * 100,
    };
  } else if (moisture < 0.7) {
    return {
      level: 'adequate',
      color: '#65a30d', // lime-600
      fillPercentage: moisture * 100,
    };
  } else {
    return {
      level: 'moist',
      color: '#0d9488', // teal-600
      fillPercentage: moisture * 100,
    };
  }
};

const getIrrigationRecommendation = (
  moistureLevel: MoistureLevel
): IrrigationRecommendation => {
  switch (moistureLevel) {
    case 'veryDry':
      return 'irrigateNow';
    case 'dry':
      return 'irrigateSoon';
    default:
      return 'noIrrigation';
  }
};

export default function SoilMoisture({
  polygonId,
  onError,
}: SoilMoistureProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moisture, setMoisture] = useState<number | null>(null);
  const { t } = useTranslation();

  const fetchSoilData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await agroMonitoringService.getSoilData(polygonId);
      setMoisture(data.moisture);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch soil data';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoilData();
    // Refresh every 6 hours
    const interval = setInterval(fetchSoilData, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [polygonId]);

  if (loading) {
    return (
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100">
        <ActivityIndicator size="large" color="#4d7c0f" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100">
        <Text className="text-red-600">{error}</Text>
      </View>
    );
  }

  if (moisture === null) {
    return null;
  }

  const moistureInfo = getMoistureLevel(moisture);
  const recommendation = getIrrigationRecommendation(moistureInfo.level);

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <MaterialCommunityIcons
          name="water-percent"
          size={24}
          color="#4d7c0f"
        />
        <Text className="text-lg font-bold text-gray-900 ml-2">
          {t('weather.soilMoisture.title')}
        </Text>
      </View>

      {/* Moisture Gauge */}
      <View className="bg-gray-100 rounded-xl h-6 mb-3">
        <View
          className="h-full rounded-xl"
          style={{
            width: `${moistureInfo.fillPercentage}%`,
            backgroundColor: moistureInfo.color,
          }}
        />
      </View>

      {/* Status and Explanation */}
      <View className="bg-lima-50 rounded-xl p-4 mb-3">
        <Text className="text-lg font-bold text-lima-700 mb-1">
          {t(`weather.soilMoisture.status.${moistureInfo.level}`)}
        </Text>
        <Text className="text-sm text-gray-600">
          {t('weather.soilMoisture.explanation')}
        </Text>
      </View>

      {/* Recommendation */}
      <View
        className="rounded-xl p-3"
        style={{
          backgroundColor:
            recommendation === 'irrigateNow'
              ? '#fee2e2'
              : recommendation === 'irrigateSoon'
              ? '#fef9c3'
              : '#dcfce7',
        }}
      >
        <Text
          className="text-sm font-medium"
          style={{
            color:
              recommendation === 'irrigateNow'
                ? '#dc2626'
                : recommendation === 'irrigateSoon'
                ? '#ca8a04'
                : '#16a34a',
          }}
        >
          {t(`weather.soilMoisture.recommendations.${recommendation}`)}
        </Text>
      </View>
    </View>
  );
}
