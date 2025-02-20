import React, { useEffect, useState } from 'react';
import { View, Text, Switch, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  notificationService,
  AlertPreferences,
} from '@/app/services/notificationService';
import { useAuth } from '@/app/hooks/useAuth';
import { Picker } from '@react-native-picker/picker';

const DEFAULT_PREFERENCES: AlertPreferences = {
  frost: true,
  heavy_rain: true,
  high_winds: true,
  low_soil_moisture: true,
  disease_risk: true,
  pest_risk: true,
  irrigation_needed: true,
  weather_alert: true,
  notification_frequency: 'realtime',
};

export default function AlertPreferencesScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [preferences, setPreferences] =
    useState<AlertPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const prefs = await notificationService.getAlertPreferences(user!.id);
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof AlertPreferences) => {
    if (typeof preferences[key] === 'boolean') {
      const updatedPreferences = {
        ...preferences,
        [key]: !preferences[key],
      };
      setPreferences(updatedPreferences);
      try {
        await notificationService.updateAlertPreferences(user!.id, {
          [key]: !preferences[key],
        });
      } catch (error) {
        console.error('Error updating preference:', error);
      }
    }
  };

  const handleFrequencyChange = async (frequency: string) => {
    const updatedPreferences = {
      ...preferences,
      notification_frequency:
        frequency as AlertPreferences['notification_frequency'],
    };
    setPreferences(updatedPreferences);
    try {
      await notificationService.updateAlertPreferences(user!.id, {
        notification_frequency:
          frequency as AlertPreferences['notification_frequency'],
      });
    } catch (error) {
      console.error('Error updating frequency:', error);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="p-4">
        <Text className="text-xl font-bold mb-4">
          {t('notifications.preferences.title')}
        </Text>

        {/* Alert Types */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold mb-3">
            {t('notifications.preferences.alertTypes')}
          </Text>

          <PreferenceItem
            label={t('notifications.preferences.frost')}
            value={preferences.frost}
            onToggle={() => handleToggle('frost')}
          />

          <PreferenceItem
            label={t('notifications.preferences.heavyRain')}
            value={preferences.heavy_rain}
            onToggle={() => handleToggle('heavy_rain')}
          />

          <PreferenceItem
            label={t('notifications.preferences.highWinds')}
            value={preferences.high_winds}
            onToggle={() => handleToggle('high_winds')}
          />

          <PreferenceItem
            label={t('notifications.preferences.lowSoilMoisture')}
            value={preferences.low_soil_moisture}
            onToggle={() => handleToggle('low_soil_moisture')}
          />

          <PreferenceItem
            label={t('notifications.preferences.diseaseRisk')}
            value={preferences.disease_risk}
            onToggle={() => handleToggle('disease_risk')}
          />

          <PreferenceItem
            label={t('notifications.preferences.pestRisk')}
            value={preferences.pest_risk}
            onToggle={() => handleToggle('pest_risk')}
          />

          <PreferenceItem
            label={t('notifications.preferences.irrigationNeeded')}
            value={preferences.irrigation_needed}
            onToggle={() => handleToggle('irrigation_needed')}
          />
        </View>

        {/* Notification Frequency */}
        <View className="bg-gray-50 rounded-xl p-4 mb-4">
          <Text className="text-lg font-semibold mb-3">
            {t('notifications.preferences.frequency')}
          </Text>

          <View className="border border-gray-200 rounded-lg overflow-hidden">
            <Picker
              selectedValue={preferences.notification_frequency}
              onValueChange={handleFrequencyChange}
              mode="dropdown"
            >
              <Picker.Item
                label={t('notifications.preferences.realtime')}
                value="realtime"
              />
              <Picker.Item
                label={t('notifications.preferences.daily')}
                value="daily"
              />
              <Picker.Item
                label={t('notifications.preferences.weekly')}
                value="weekly"
              />
            </Picker>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

interface PreferenceItemProps {
  label: string;
  value: boolean;
  onToggle: () => void;
}

function PreferenceItem({ label, value, onToggle }: PreferenceItemProps) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-gray-700">{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#d1d5db', true: '#84cc16' }}
        thumbColor={value ? '#4d7c0f' : '#f4f4f5'}
      />
    </View>
  );
}
