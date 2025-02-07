import { create } from 'zustand';
import * as Location from 'expo-location';

interface WeatherData {
  current: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    weather: {
      main: string;
      description: string;
      icon: string;
    }[];
    visibility: number;
  };
  location: string;
}

interface WeatherState {
  data: WeatherData | null;
  loading: boolean;
  error: string | null;
  fetchWeather: () => Promise<void>;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  data: null,
  loading: false,
  error: null,

  fetchWeather: async () => {
    set({ loading: true, error: null });
    try {
      // Add artificial delay
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
      }

      const location = await Location.getCurrentPositionAsync({});

      const response = await fetch(
        `http://api.openweathermap.org/data/2.5/weather?lat=${location.coords.latitude}&lon=${location.coords.longitude}&appid=${process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const weatherData = await response.json();

      console.log(weatherData);

      // Get location name
      const [placemark] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      set({
        data: {
          current: {
            temp: Math.round(weatherData.main.temp),
            feels_like: Math.round(weatherData.main.feels_like),
            humidity: weatherData.main.humidity,
            wind_speed: Math.round(weatherData.wind.speed),
            weather: weatherData.weather,
            visibility: weatherData.visibility,
          },
          location: weatherData.name || placemark?.city || 'Unknown Location',
        },
        loading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch weather',
        loading: false,
      });
    }
  },
}));
