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
      const response = await this.api.get(`/ndvi/history`, {
        params: {
          polyid: polygonId,
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
    options: {
      type?: 'ndvi' | 'evi' | 'true' | 'false';
      start?: number;
      end?: number;
    } = {}
  ): Promise<string> {
    try {
      const {
        type = 'ndvi',
        start = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60,
        end = Math.floor(Date.now() / 1000),
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
        return `${imageUrl}&paletteid=1&width=1024&height=768`; // Using high resolution and default green palette
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
}

export const agroMonitoringService = new AgroMonitoringService();
