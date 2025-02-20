import axios from 'axios';

const BASE_URL = 'http://api.agromonitoring.com/agro/1.0';
const AGRO_API_KEY = process.env.EXPO_PUBLIC_AGRO_API_KEY;
const WEATHER_API_KEY = process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY;

interface PolygonResponse {
  id: string;
  name: string;
  center: [number, number];
  area: number;
  user_id: string;
  created_at: string;
}

interface SoilData {
  t10: number; // Temperature at 10cm depth
  moisture: number; // Soil moisture
  t0: number; // Surface temperature
}

interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
}

interface NDVIData {
  dt: number; // Acquisition date (Unix time, UTC)
  source: string; // Satellite name (Landsat 8, Sentinel 2)
  zoom: number; // Number of zoom level
  dc: number; // Approximate useful area percentage
  cl: number; // Approximate percentage of clouds
  data: {
    std: number; // Standard deviation
    p75: number; // Third quartile value
    min: number; // Minimum value
    max: number; // Maximum value
    median: number; // Median value
    p25: number; // First quartile value
    num: number; // Number of pixels
    mean: number; // Average value
  };
}

interface WeatherAlert {
  dt: number;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface WeatherForecast {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '3h': number;
  };
}

interface AccumulatedTemperature {
  dt: string;
  temp: number;
  count: number;
}

interface AccumulatedPrecipitation {
  dt: string;
  rain: number;
  count: number;
}

export interface SatelliteImageOptions {
  type?: 'ndvi' | 'evi' | 'true' | 'false';
  start?: number;
  end?: number;
  paletteid?: 1 | 2 | 3 | 4; // NDVI palette options from AgroMonitoring API
}

class AgroMonitoringService {
  private api = axios.create({
    baseURL: BASE_URL,
    params: {
      appid: AGRO_API_KEY,
    },
  });

  async createPolygon(
    name: string,
    coordinates: number[][][]
  ): Promise<PolygonResponse> {
    try {
      const response = await this.api.post(
        '/polygons',
        {
          name,
          geo_json: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Polygon',
              coordinates,
            },
          },
        },
        {
          params: {
            duplicated: true,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(
          error.response?.data?.message || 'Failed to create polygon'
        );
      }
      throw error;
    }
  }

  async getSoilData(polygonId: string): Promise<SoilData> {
    try {
      const response = await this.api.get(`/soil?polyid=${polygonId}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to fetch soil data'
        );
      }
      throw error;
    }
  }

  async getWeatherData(lat: number, lon: number): Promise<WeatherData> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY}&units=metric`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  async getVegetationIndex(
    polygonId: string,
    start: number,
    end: number
  ): Promise<NDVIData[]> {
    try {
      const response = await this.api.get(`/ndvi/history`, {
        params: {
          polygon_id: polygonId,
          start,
          end,
        },
      });

      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid NDVI data format received');
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        }
        throw new Error(
          error.response?.data?.message || 'Failed to fetch NDVI data'
        );
      }
      throw error;
    }
  }

  async getUVIndex(polygonId: string): Promise<number> {
    try {
      const response = await this.api.get(`/uvi/${polygonId}`);
      return response.data.uvi;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to fetch UV index'
        );
      }
      throw error;
    }
  }

  async getSatelliteImage(
    polygonId: string,
    options: SatelliteImageOptions = {}
  ): Promise<string> {
    try {
      const {
        type = 'ndvi',
        start = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
        end = Math.floor(Date.now() / 1000),
        paletteid = 1,
      } = options;

      // Step 1: Search for available imagery
      const searchResponse = await this.api.get('/image/search', {
        params: {
          polyid: polygonId,
          start,
          end,
          appid: process.env.EXPO_PUBLIC_AGRO_API_KEY,
        },
      });

      if (
        !searchResponse.data ||
        !Array.isArray(searchResponse.data) ||
        searchResponse.data.length === 0
      ) {
        throw new Error('No satellite images available for this period');
      }

      // Get the most recent image data
      const imageData = searchResponse.data[0];

      // Verify we have image URLs in the response
      if (!imageData.image) {
        throw new Error('No image data available in the response');
      }

      // Get the appropriate image URL based on the requested type
      const imageUrl = imageData.image[type];
      if (!imageUrl) {
        throw new Error(`No ${type} image available`);
      }

      // Add palette parameter for NDVI images
      if (type === 'ndvi') {
        return `${imageUrl}&paletteid=${paletteid}&width=1024&height=768`; // Using high resolution and default green palette
      }

      // Add high resolution parameters for other image types
      return `${imageUrl}&width=1024&height=768`;
    } catch (error) {
      console.error('Satellite image error:', error);
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || error.message;
        throw new Error(`Failed to fetch satellite image: ${message}`);
      }
      throw error;
    }
  }

  async getForecastData(lat: number, lon: number): Promise<WeatherForecast[]> {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        {
          params: {
            lat,
            lon,
            appid: WEATHER_API_KEY,
            units: 'metric',
          },
        }
      );
      return response.data.list;
    } catch (error) {
      console.error('Forecast API Error:', error);
      throw error;
    }
  }

  async getAccumulatedTemperature(
    lat: number,
    lon: number,
    start: number,
    end: number,
    threshold: number = 284
  ): Promise<AccumulatedTemperature[]> {
    try {
      const response = await this.api.get(
        '/weather/history/accumulated_temperature',
        {
          params: {
            lat,
            lon,
            start,
            end,
            threshold,
          },
        }
      );

      if (!Array.isArray(response.data)) {
        throw new Error(
          'Invalid response format for accumulated temperature data'
        );
      }

      return response.data.map((item: any) => ({
        dt: new Date(item.dt * 1000).toISOString(),
        temp: item.temp,
        count: item.count || 1,
      }));
    } catch (error) {
      console.error('Temperature API Error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            'Failed to fetch accumulated temperature data'
        );
      }
      throw error;
    }
  }

  async getAccumulatedPrecipitation(
    lat: number,
    lon: number,
    start: number,
    end: number
  ): Promise<AccumulatedPrecipitation[]> {
    try {
      const response = await this.api.get(
        '/weather/history/accumulated_precipitation',
        {
          params: {
            lat,
            lon,
            start,
            end,
          },
        }
      );

      if (!Array.isArray(response.data)) {
        throw new Error(
          'Invalid response format for accumulated precipitation data'
        );
      }

      return response.data.map((item: any) => ({
        dt: new Date(item.dt * 1000).toISOString(),
        rain: item.rain || 0,
        count: item.count || 1,
      }));
    } catch (error) {
      console.error('Precipitation API Error:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message ||
            'Failed to fetch accumulated precipitation data'
        );
      }
      throw error;
    }
  }
}

export const agroMonitoringService = new AgroMonitoringService();
