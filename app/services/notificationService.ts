import { Platform } from 'react-native';
import { supabase } from '@/utils/SupaLegend';
import * as Notifications from 'expo-notifications';
import { Alert, AlertType } from '@/app/types/alert';

export type WeatherAlertType =
  | 'high_temperature'
  | 'low_temperature'
  | 'heavy_rain'
  | 'strong_winds'
  | 'drought_risk'
  | 'frost_risk';

export interface AlertPreferences {
  frost: boolean;
  heavy_rain: boolean;
  high_winds: boolean;
  low_soil_moisture: boolean;
  disease_risk: boolean;
  pest_risk: boolean;
  irrigation_needed: boolean;
  weather_alert: boolean;
  notification_frequency: 'realtime' | 'daily' | 'weekly';
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

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

class NotificationService {
  constructor() {
    this.configureNotifications();
  }

  private async configureNotifications() {
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('alerts', {
        name: 'Farm Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4d7c0f',
      });
    }
  }

  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  async scheduleAlertNotification(alert: Alert) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('Notification permissions not granted');
      return;
    }

    const severityColor = {
      low: '🟢',
      medium: '🟡',
      high: '🔴',
    } as const;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${severityColor[alert.severity]} Farm Alert: ${alert.type}`,
        body: alert.message,
        data: { alertId: alert.id },
      },
      trigger: null,
    });
  }

  async sendWeatherAlert(
    type: WeatherAlertType,
    message: string,
    severity: 'low' | 'medium' | 'high' = 'medium',
    farmId?: string
  ) {
    const alert: Alert = {
      id: Date.now().toString(),
      type: 'weather_alert',
      message,
      severity,
      timestamp: new Date(),
      read: false,
      farm_id: farmId || '',
      created_at: new Date().toISOString(),
    };

    await this.scheduleAlertNotification(alert);
    return alert;
  }

  async getAlertPreferences(userId: string): Promise<AlertPreferences> {
    try {
      const { data, error } = await supabase
        .from('alert_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return data || DEFAULT_PREFERENCES;
    } catch (error) {
      console.error('Error fetching alert preferences:', error);
      return DEFAULT_PREFERENCES;
    }
  }

  async updateAlertPreferences(
    userId: string,
    preferences: Partial<AlertPreferences>
  ): Promise<void> {
    try {
      const { error } = await supabase.from('alert_preferences').upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating alert preferences:', error);
      throw error;
    }
  }

  async createAlert(
    farmId: string,
    type: AlertType,
    severity: 'low' | 'medium' | 'high',
    message: string
  ): Promise<void> {
    try {
      const { error } = await supabase.from('alerts').insert([
        {
          farm_id: farmId,
          type,
          severity,
          message,
          created_at: new Date().toISOString(),
          read: false,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating alert:', error);
      throw error;
    }
  }

  async getAlerts(farmId: string): Promise<Alert[]> {
    try {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('farm_id', farmId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map((alert) => ({
        ...alert,
        timestamp: new Date(alert.created_at),
      }));
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  }

  async markAlertAsRead(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('alerts')
        .update({ read: true })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking alert as read:', error);
      throw error;
    }
  }

  async deleteAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('alerts')
        .delete()
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting alert:', error);
      throw error;
    }
  }

  // Alert generation methods
  async checkWeatherAlerts(
    farmId: string,
    forecast: any,
    preferences: AlertPreferences
  ): Promise<void> {
    if (!preferences.weather_alert) return;

    // Check for frost risk
    if (preferences.frost && forecast.main.temp < 2) {
      await this.createAlert(
        farmId,
        'frost',
        'high',
        'Frost risk detected! Temperature expected to drop below 2°C'
      );
    }

    // Check for heavy rain
    if (preferences.heavy_rain && forecast.rain?.['3h'] > 10) {
      await this.createAlert(
        farmId,
        'heavy_rain',
        'medium',
        `Heavy rain expected: ${forecast.rain['3h']}mm in next 3 hours`
      );
    }

    // Check for high winds
    if (preferences.high_winds && forecast.wind.speed > 20) {
      await this.createAlert(
        farmId,
        'high_winds',
        'high',
        `High winds expected: ${forecast.wind.speed}m/s`
      );
    }
  }

  async checkSoilMoistureAlert(
    farmId: string,
    soilData: { moisture: number },
    preferences: AlertPreferences
  ): Promise<void> {
    if (!preferences.low_soil_moisture) return;

    if (soilData.moisture < 0.3) {
      await this.createAlert(
        farmId,
        'low_soil_moisture',
        'high',
        'Low soil moisture detected. Consider irrigation.'
      );
    }
  }

  async checkDiseaseRisk(
    farmId: string,
    weather: { humidity: number; temperature: number },
    preferences: AlertPreferences
  ): Promise<void> {
    if (!preferences.disease_risk) return;

    // High humidity and moderate temperature increase disease risk
    if (weather.humidity > 80 && weather.temperature > 20) {
      await this.createAlert(
        farmId,
        'disease_risk',
        'medium',
        'High disease risk due to humid conditions'
      );
    }
  }
}

export const notificationService = new NotificationService();
