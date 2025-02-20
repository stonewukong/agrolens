import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { agroMonitoringService } from '@/app/services/agroMonitoring';
import { useTranslation } from 'react-i18next';

interface WeatherForecastProps {
  latitude: number;
  longitude: number;
  onError?: (error: string) => void;
}

interface ForecastDay {
  date: Date;
  temp_max: number;
  temp_min: number;
  condition: string;
  description: string;
  rainProbability: number;
  icon: string;
}

const getWeatherIcon = (
  condition: string
): keyof typeof MaterialCommunityIcons.glyphMap => {
  const normalizedCondition = condition.toLowerCase();
  switch (normalizedCondition) {
    case 'clear':
      return 'weather-sunny';
    case 'clouds':
      return 'weather-cloudy';
    case 'rain':
      return 'weather-rainy';
    case 'drizzle':
      return 'weather-rainy';
    case 'thunderstorm':
      return 'weather-lightning';
    case 'snow':
      return 'weather-snowy';
    case 'mist':
      return 'weather-fog';
    default:
      return 'weather-partly-cloudy';
  }
};

export default function WeatherForecast({
  latitude,
  longitude,
  onError,
}: WeatherForecastProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const { t } = useTranslation();

  const fetchForecast = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await agroMonitoringService.getForecastData(
        latitude,
        longitude
      );

      // Process and group forecast data by day
      const dailyForecast = data.reduce((acc: ForecastDay[], curr) => {
        const date = new Date(curr.dt * 1000);
        const existingDay = acc.find(
          (day) => day.date.toDateString() === date.toDateString()
        );

        if (!existingDay && acc.length < 5) {
          acc.push({
            date,
            temp_max: curr.main.temp_max,
            temp_min: curr.main.temp_min,
            condition: curr.weather[0].main,
            description: curr.weather[0].description,
            rainProbability: curr.rain ? 100 * (curr.rain['3h'] / 3) : 0,
            icon: curr.weather[0].icon,
          });
        }

        return acc;
      }, []);

      setForecast(dailyForecast);

      // Check for alerts
      checkForAlerts(dailyForecast);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch forecast';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkForAlerts = (forecastData: ForecastDay[]) => {
    forecastData.forEach((day) => {
      // Alert for high temperatures (above 35°C)
      if (day.temp_max > 35) {
        // Trigger high temperature alert
        console.log('High temperature alert:', day.date);
      }

      // Alert for heavy rain (probability > 70%)
      if (day.rainProbability > 70) {
        // Trigger heavy rain alert
        console.log('Heavy rain alert:', day.date);
      }
    });
  };

  const getForecastSummary = (forecastData: ForecastDay[]): string => {
    const conditions = forecastData.map((day) => day.condition.toLowerCase());
    const uniqueConditions = [...new Set(conditions)];

    let summary = t('weather.forecast.nextFiveDays') + ': ';

    if (uniqueConditions.length === 1) {
      summary += t(`weather.conditions.${uniqueConditions[0].toLowerCase()}`);
    } else {
      const rainDays = conditions.filter((c) => c.includes('rain')).length;
      if (rainDays > 0) {
        summary += t('weather.forecast.chanceOfRain', { days: rainDays });
      }
    }

    return summary;
  };

  useEffect(() => {
    fetchForecast();
    // Refresh forecast every 3 hours
    const interval = setInterval(fetchForecast, 3 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [latitude, longitude]);

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

  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm border border-lima-100">
      <Text className="text-lg font-bold text-gray-900 mb-2">
        {t('weather.forecast.title')}
      </Text>
      <Text className="text-sm text-lima-600 mb-4">
        {getForecastSummary(forecast)}
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row gap-2"
      >
        {forecast.map((day) => (
          <View
            key={day.date.toISOString()}
            className="items-center bg-lima-50 rounded-xl mr-3 p-3 min-w-[100]"
          >
            <Text className="text-sm font-medium text-gray-900">
              {day.date.toLocaleDateString(undefined, { weekday: 'short' })}
            </Text>
            <MaterialCommunityIcons
              name={getWeatherIcon(day.condition)}
              size={32}
              color="#4d7c0f"
              className="my-2"
            />
            <View className="flex-row items-center gap-1">
              <Text className="text-sm font-bold text-gray-900">
                {Math.round(day.temp_max)}°
              </Text>
              <Text className="text-sm text-gray-500">
                {Math.round(day.temp_min)}°
              </Text>
            </View>
            {day.rainProbability > 0 && (
              <View className="flex-row items-center mt-1">
                <MaterialCommunityIcons
                  name="water-percent"
                  size={16}
                  color="#4d7c0f"
                />
                <Text className="text-xs text-lima-600 ml-1">
                  {Math.round(day.rainProbability)}%
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
