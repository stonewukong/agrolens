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
import { notificationService } from '@/app/services/notificationService';
import { useFarmStore } from '@/app/stores/useFarmStore';
import VegetationHealthAlert from '../components/VegetationHealthAlert';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/app/hooks/useAuth';
import { Alert } from '@/app/types/farm';

export default function NotificationsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const { farms } = useFarmStore();
  const { t } = useTranslation();
  const { user } = useAuth();

  const loadAlerts = async () => {
    try {
      const allAlerts = await Promise.all(
        farms.map((farm) => notificationService.getAlerts(farm.id))
      );
      setAlerts(
        allAlerts
          .flat()
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      );
    } catch (error) {
      console.error('Error loading alerts:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadAlerts();
    setRefreshing(false);
  }, [farms]);

  useEffect(() => {
    loadAlerts();
  }, [farms]);

  const handleMarkAllAsRead = async () => {
    try {
      await Promise.all(
        alerts
          .filter((alert) => !alert.read)
          .map((alert) => notificationService.markAlertAsRead(alert.id))
      );
      await loadAlerts();
    } catch (error) {
      console.error('Error marking alerts as read:', error);
    }
  };

  const handleDismissAlert = async (alertId: string) => {
    try {
      await notificationService.deleteAlert(alertId);
      await loadAlerts();
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 pt-4 pb-6 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold text-gray-900">
              {t('notifications.title')}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">
              {t('notifications.unreadCount', {
                count: alerts.filter((a) => !a.read).length,
              })}
            </Text>
          </View>
          {alerts.some((a) => !a.read) && (
            <TouchableOpacity
              className="bg-lima-600 p-2 rounded-xl"
              onPress={handleMarkAllAsRead}
            >
              <MaterialCommunityIcons
                name="check-all"
                size={24}
                color="white"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Vegetation Health Monitors */}
        {farms.map(
          (farm) =>
            farm.agro_polygon_id && (
              <VegetationHealthAlert
                key={farm.id}
                farmId={farm.id}
                polygonId={farm.agro_polygon_id}
              />
            )
        )}

        {/* Alerts List */}
        {alerts.length > 0 ? (
          <View className="px-6">
            {alerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                className={`bg-white rounded-2xl border mb-3 ${
                  alert.severity === 'high'
                    ? 'border-red-100'
                    : alert.severity === 'medium'
                    ? 'border-yellow-100'
                    : 'border-blue-100'
                }`}
              >
                <View className="flex-row p-4">
                  <View
                    className={`p-1 rounded-xl ${
                      alert.severity === 'high'
                        ? 'bg-red-50'
                        : alert.severity === 'medium'
                        ? 'bg-yellow-50'
                        : 'bg-blue-50'
                    }`}
                  >
                    <MaterialCommunityIcons
                      name={
                        alert.type === 'frost'
                          ? 'snowflake'
                          : alert.type === 'heavy_rain'
                          ? 'weather-pouring'
                          : alert.type === 'high_winds'
                          ? 'weather-windy'
                          : alert.type === 'low_soil_moisture'
                          ? 'water-percent'
                          : alert.type === 'disease_risk'
                          ? 'bug'
                          : 'alert'
                      }
                      size={24}
                      color={
                        alert.severity === 'high'
                          ? '#dc2626'
                          : alert.severity === 'medium'
                          ? '#a16207'
                          : '#2563eb'
                      }
                    />
                  </View>
                  <View className="flex-1 ml-3">
                    <View className="flex-row justify-between items-center">
                      <View className="flex-row items-center gap-2">
                        <Text className="text-gray-900 font-medium">
                          {t(`alerts.types.${alert.type}`)}
                        </Text>
                        <View
                          className={`px-2 py-0.5 rounded-full ${
                            alert.severity === 'high'
                              ? 'bg-red-100'
                              : alert.severity === 'medium'
                              ? 'bg-yellow-100'
                              : 'bg-blue-100'
                          }`}
                        >
                          <Text
                            className={
                              alert.severity === 'high'
                                ? 'text-red-700'
                                : alert.severity === 'medium'
                                ? 'text-yellow-700'
                                : 'text-blue-700' + ' text-xs'
                            }
                          >
                            {t(`alerts.severity.${alert.severity}`)}
                          </Text>
                        </View>
                      </View>
                      <Text className="text-gray-400 text-xs">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                    <Text className="text-gray-600 text-sm mt-1">
                      {alert.message}
                    </Text>
                    <View className="flex-row mt-3 gap-2">
                      <TouchableOpacity
                        className={`px-3 py-1.5 rounded-lg flex-row items-center ${
                          alert.severity === 'high'
                            ? 'bg-red-600'
                            : alert.severity === 'medium'
                            ? 'bg-yellow-600'
                            : 'bg-blue-600'
                        }`}
                      >
                        <MaterialCommunityIcons
                          name="alert"
                          size={16}
                          color="white"
                        />
                        <Text className="text-white text-sm font-medium ml-1">
                          {t('alerts.actions.view')}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className="bg-gray-100 px-3 py-1.5 rounded-lg"
                        onPress={() => handleDismissAlert(alert.id)}
                      >
                        <Text className="text-gray-600 text-sm">
                          {t('alerts.actions.dismiss')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="px-6 py-12 items-center">
            <View className="bg-lima-50 p-4 rounded-full mb-4">
              <MaterialCommunityIcons name="bell" size={32} color="#4d7c0f" />
            </View>
            <Text className="text-gray-900 text-lg font-semibold text-center mb-2">
              {t('notifications.noAlerts')}
            </Text>
            <Text className="text-gray-600 text-center">
              {t('notifications.allClear')}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
