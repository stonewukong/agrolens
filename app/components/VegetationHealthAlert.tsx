import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { agroMonitoringService } from '@/app/services/agroMonitoring';
import { notificationService } from '@/app/services/notificationService';
import { useTranslation } from 'react-i18next';

interface VegetationHealthAlertProps {
  polygonId: string;
  farmId: string;
  onError?: (error: string) => void;
}

export default function VegetationHealthAlert({
  polygonId,
  farmId,
  onError,
}: VegetationHealthAlertProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const checkVegetationHealth = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get current date and 7 days ago for comparison
      const now = Math.floor(Date.now() / 1000);
      const sevenDaysAgo = now - 7 * 24 * 60 * 60;

      const ndviData = await agroMonitoringService.getVegetationIndex(
        polygonId,
        sevenDaysAgo,
        now
      );

      if (ndviData.length > 0) {
        const latestNDVI = ndviData[ndviData.length - 1].data.mean;
        const previousNDVI = ndviData[0].data.mean;

        // Check for significant decrease in vegetation health
        if (latestNDVI < 0.3) {
          await notificationService.createAlert(
            farmId,
            'disease_risk',
            'high',
            t('alerts.vegetation.lowNDVI', { value: latestNDVI.toFixed(2) })
          );
        } else if (latestNDVI < previousNDVI * 0.8) {
          // 20% or more decrease
          await notificationService.createAlert(
            farmId,
            'disease_risk',
            'medium',
            t('alerts.vegetation.decreasing', {
              percent: (
                ((previousNDVI - latestNDVI) / previousNDVI) *
                100
              ).toFixed(0),
            })
          );
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to check vegetation health';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (polygonId && farmId) {
      checkVegetationHealth();
      // Check vegetation health every 12 hours
      const interval = setInterval(checkVegetationHealth, 12 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [polygonId, farmId]);

  if (error) {
    return (
      <View className="bg-red-50 rounded-xl p-4 mb-4">
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="alert-circle"
            size={24}
            color="#dc2626"
          />
          <Text className="text-red-600 ml-2">{error}</Text>
        </View>
      </View>
    );
  }

  return null; // This component only generates alerts, doesn't render UI normally
}
