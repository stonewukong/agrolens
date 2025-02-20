import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { agroMonitoringService } from '@/app/services/agroMonitoring';
import WeatherForecast from './WeatherForecast';
import { notificationService } from '@/app/services/notificationService';

interface WeatherCardProps {
  latitude: number;
  longitude: number;
  onError?: (error: any) => void;
}

interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
}

interface WeatherAlert {
  type: 'wind' | 'frost' | 'heat' | 'rain';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

export default function WeatherCard({
  latitude,
  longitude,
  onError,
}: WeatherCardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const { t } = useTranslation();

  const getWeatherIcon = (condition: string): string => {
    const normalizedCondition = condition.toLowerCase();
    if (normalizedCondition.includes('clear')) return 'weather-sunny';
    if (normalizedCondition.includes('cloud')) return 'weather-cloudy';
    if (normalizedCondition.includes('rain')) return 'weather-rainy';
    if (normalizedCondition.includes('thunder')) return 'weather-lightning';
    if (normalizedCondition.includes('snow')) return 'weather-snowy';
    if (
      normalizedCondition.includes('mist') ||
      normalizedCondition.includes('fog')
    )
      return 'weather-fog';
    return 'weather-partly-cloudy';
  };

  const getWeatherDescription = (data: WeatherData): string => {
    let description = '';

    // Temperature description
    if (data.temperature < 10) description += t('weather.cold');
    else if (data.temperature < 20) description += t('weather.mild');
    else if (data.temperature < 30) description += t('weather.warm');
    else description += t('weather.hot');

    // Weather condition
    description += ' ' + t('weather.and') + ' ';
    if (data.condition.toLowerCase().includes('clear'))
      description += t('weather.sunny');
    else if (data.condition.toLowerCase().includes('cloud'))
      description += t('weather.cloudy');
    else if (data.condition.toLowerCase().includes('rain'))
      description += t('weather.rainy');
    else description += data.description.toLowerCase();

    return description;
  };

  const generateAlerts = (data: WeatherData): WeatherAlert[] => {
    const newAlerts: WeatherAlert[] = [];

    // High wind alert
    if (data.windSpeed > 20) {
      newAlerts.push({
        type: 'wind',
        severity: data.windSpeed > 30 ? 'high' : 'medium',
        message: t('weather.alerts.highWind', {
          speed: Math.round(data.windSpeed),
        }),
      });
    }

    // Frost alert (temperature below 2°C)
    if (data.temperature < 2) {
      newAlerts.push({
        type: 'frost',
        severity: 'high',
        message: t('weather.alerts.frost'),
      });
    }

    // Heat alert (temperature above 35°C)
    if (data.temperature > 35) {
      newAlerts.push({
        type: 'heat',
        severity: 'high',
        message: t('weather.alerts.heat'),
      });
    }

    return newAlerts;
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await agroMonitoringService.getWeatherData(
        latitude,
        longitude
      );

      const weatherData: WeatherData = {
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        windSpeed: data.wind.speed,
        condition: data.weather[0].main,
        description: data.weather[0].description,
      };

      setWeather(weatherData);
      setAlerts(generateAlerts(weatherData));

      // Check for extreme weather conditions
      if (data.main.temp > 35) {
        await notificationService.sendWeatherAlert(
          'high_temperature',
          t('alerts.weather.highTemperature', {
            temp: Math.round(data.main.temp),
          }),
          'high'
        );
      } else if (data.main.temp < 5) {
        await notificationService.sendWeatherAlert(
          'low_temperature',
          t('alerts.weather.lowTemperature', {
            temp: Math.round(data.main.temp),
          }),
          'medium'
        );
      }

      if (data.rain?.['1h'] && data.rain['1h'] > 10) {
        await notificationService.sendWeatherAlert(
          'heavy_rain',
          t('alerts.weather.heavyRain', {
            amount: Math.round(data.rain['1h']),
          }),
          'high'
        );
      }

      if (data.wind.speed > 10) {
        await notificationService.sendWeatherAlert(
          'strong_winds',
          t('alerts.weather.strongWinds', {
            speed: Math.round(data.wind.speed),
          }),
          'medium'
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch weather data';
      setError(errorMessage);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
    // Refresh weather data every 30 minutes
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  if (loading) {
    return (
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100">
        <View className="items-center justify-center py-8">
          <ActivityIndicator size="large" color="#4d7c0f" />
          <Text className="text-lima-600 mt-2">{t('weather.loading')}</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100">
        <View className="items-center justify-center py-8">
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#dc2626"
          />
          <Text className="text-red-600 mt-2 text-center">{error}</Text>
          <TouchableOpacity
            onPress={fetchWeatherData}
            className="mt-4 bg-lima-50 px-4 py-2 rounded-lg flex-row items-center"
          >
            <MaterialCommunityIcons name="refresh" size={20} color="#4d7c0f" />
            <Text className="text-lima-700 ml-2">{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!weather) return null;

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100">
      {/* Header */}
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-lg font-bold text-gray-900">
            {t('weather.currentConditions')}
          </Text>
          <Text className="text-sm text-lima-600">
            {getWeatherDescription(weather)}
          </Text>
        </View>
        <TouchableOpacity
          onPress={fetchWeatherData}
          className="bg-lima-50 p-2 rounded-lg"
        >
          <MaterialCommunityIcons name="refresh" size={24} color="#4d7c0f" />
        </TouchableOpacity>
      </View>

      {/* Main Weather Display */}
      <View className="flex-row items-center mb-6">
        <View className="flex-1 items-center">
          <MaterialCommunityIcons
            name={
              getWeatherIcon(
                weather.condition
              ) as keyof typeof MaterialCommunityIcons.glyphMap
            }
            size={64}
            color="#4d7c0f"
          />
          <View className="flex-row items-end mt-2">
            <Text className="text-3xl font-bold text-gray-900">
              {Math.round(weather.temperature)}
            </Text>
            <Text className="text-lg font-medium text-lima-600 ml-1 mb-1">
              °C
            </Text>
          </View>
          <Text className="text-sm text-lima-600">
            {t('weather.feelsLike', {
              temp: Math.round(weather.feelsLike),
              unit: 'C',
            })}
          </Text>
        </View>
      </View>

      {/* Weather Details */}
      <View className="flex-row justify-between mb-4">
        <View className="flex-1 items-center">
          <MaterialCommunityIcons name="water" size={24} color="#4d7c0f" />
          <Text className="text-sm font-medium text-gray-900 mt-1">
            {weather.humidity}%
          </Text>
          <Text className="text-xs text-lima-600">{t('weather.humidity')}</Text>
        </View>
        <View className="flex-1 items-center">
          <MaterialCommunityIcons
            name="weather-windy"
            size={24}
            color="#4d7c0f"
          />
          <Text className="text-sm font-medium text-gray-900 mt-1">
            {Math.round(weather.windSpeed)} {t('weather.windSpeedUnit')}
          </Text>
          <Text className="text-xs text-lima-600">
            {t('weather.windSpeed')}
          </Text>
        </View>
      </View>

      {/* Weather Forecast */}
      <WeatherForecast
        latitude={latitude}
        longitude={longitude}
        onError={onError}
      />

      {/* Weather Alerts */}
      {alerts.length > 0 && (
        <View className="mt-4">
          {alerts.map((alert, index) => (
            <View
              key={index}
              className={`p-3 rounded-lg mb-2 flex-row items-center ${
                alert.severity === 'high'
                  ? 'bg-red-100'
                  : alert.severity === 'medium'
                  ? 'bg-yellow-100'
                  : 'bg-blue-100'
              }`}
            >
              <MaterialCommunityIcons
                name={
                  alert.type === 'wind'
                    ? 'weather-windy'
                    : alert.type === 'frost'
                    ? 'snowflake'
                    : 'thermometer-high'
                }
                size={24}
                color={
                  alert.severity === 'high'
                    ? '#dc2626'
                    : alert.severity === 'medium'
                    ? '#d97706'
                    : '#2563eb'
                }
              />
              <Text
                className={`ml-2 font-medium ${
                  alert.severity === 'high'
                    ? 'text-red-700'
                    : alert.severity === 'medium'
                    ? 'text-yellow-700'
                    : 'text-blue-700'
                }`}
              >
                {alert.message}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
