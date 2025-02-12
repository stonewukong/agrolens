import axios from 'axios';

const AGRO_API_KEY = process.env.EXPO_PUBLIC_AGRO_API_KEY;
const BASE_URL = 'http://api.agromonitoring.com/agro/1.0';

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
    humidity: number;
    pressure: number;
  };
  wind: {
    speed: number;
    deg: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
}

interface NDVIData {
  dt: number; // Timestamp
  dc: number; // Cloud coverage percentage
  cl: number; // Confidence level
  value: number; // NDVI value
}

interface WeatherAlert {
  dt: number;
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

export interface SatelliteImageOptions {
  type?: 'ndvi' | 'evi' | 'true' | 'false';
  start?: number;
  end?: number;
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
      const response = await this.api.post('/polygons', {
        name,
        geo_json: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates,
          },
        },
      });

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

  async getWeatherData(polygonId: string): Promise<WeatherData> {
    try {
      const response = await this.api.get(`/weather`, {
        params: {
          polyid: polygonId,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to fetch weather data'
        );
      }
      throw error;
    }
  }

  async getVegetationIndex(
    polygonId: string,
    start: number,
    end: number
  ): Promise<NDVIData[]> {
    try {
      const response = await this.api.get(`/ndvi/history/${polygonId}`, {
        params: { start, end },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
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
    options: {
      type?: 'ndvi' | 'evi' | 'true' | 'false';
      start?: number;
      end?: number;
    } = {}
  ): Promise<string> {
    try {
      const { type = 'ndvi', start, end } = options;
      const params: Record<string, any> = { type };
      if (start) params.start = start;
      if (end) params.end = end;

      const response = await this.api.get(`/image/search/${polygonId}`, {
        params,
      });
      if (!response.data?.[0]?.image?.ndvi) {
        throw new Error('No satellite image available');
      }
      return response.data[0].image.ndvi;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to fetch satellite image'
        );
      }
      throw error;
    }
  }
}

export const agroMonitoringService = new AgroMonitoringService();
