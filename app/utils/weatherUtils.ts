import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WeatherTheme {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const getWeatherTheme = (condition: string): WeatherTheme => {
  const normalizedCondition = condition.toLowerCase();

  // Map weather conditions to themes
  if (normalizedCondition.includes('clear')) {
    return {
      icon: 'weather-sunny',
      color: '#d97706', // amber-600
      bgColor: '#fef3c7', // amber-100
      borderColor: '#fcd34d', // amber-300
    };
  }

  if (normalizedCondition.includes('cloud')) {
    return {
      icon: 'weather-cloudy',
      color: '#475569', // slate-600
      bgColor: '#f1f5f9', // slate-100
      borderColor: '#cbd5e1', // slate-300
    };
  }

  if (
    normalizedCondition.includes('rain') ||
    normalizedCondition.includes('drizzle')
  ) {
    return {
      icon: 'weather-rainy',
      color: '#2563eb', // blue-600
      bgColor: '#dbeafe', // blue-100
      borderColor: '#93c5fd', // blue-300
    };
  }

  if (normalizedCondition.includes('thunder')) {
    return {
      icon: 'weather-lightning',
      color: '#7c3aed', // violet-600
      bgColor: '#ede9fe', // violet-100
      borderColor: '#c4b5fd', // violet-300
    };
  }

  if (normalizedCondition.includes('snow')) {
    return {
      icon: 'weather-snowy',
      color: '#0284c7', // sky-600
      bgColor: '#e0f2fe', // sky-100
      borderColor: '#7dd3fc', // sky-300
    };
  }

  if (
    normalizedCondition.includes('mist') ||
    normalizedCondition.includes('fog')
  ) {
    return {
      icon: 'weather-fog',
      color: '#64748b', // slate-500
      bgColor: '#f8fafc', // slate-50
      borderColor: '#e2e8f0', // slate-200
    };
  }

  // Default theme
  return {
    icon: 'weather-partly-cloudy',
    color: '#0284c7', // sky-600
    bgColor: '#e0f2fe', // sky-100
    borderColor: '#7dd3fc', // sky-300
  };
};

export const getWindSpeedDescription = (speed: number): string => {
  if (speed < 5) return 'Light breeze';
  if (speed < 10) return 'Gentle breeze';
  if (speed < 20) return 'Moderate';
  if (speed < 30) return 'Strong';
  return 'High winds';
};

export const getVisibilityDescription = (visibility: number): string => {
  const visibilityKm = visibility / 1000;
  if (visibilityKm > 10) return 'Excellent';
  if (visibilityKm > 5) return 'Good';
  if (visibilityKm > 2) return 'Moderate';
  return 'Poor';
};
