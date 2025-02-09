import axios from 'axios';

const AGRO_API_KEY = process.env.EXPO_PUBLIC_AGRO_API_KEY;
const BASE_URL = 'http://api.agromonitoring.com/agro/1.0';

interface GeoJSON {
  type: 'Feature';
  properties: Record<string, any>;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

interface PolygonResponse {
  id: string;
  geo_json: GeoJSON;
  name: string;
  center: [number, number];
  area: number;
  user_id: string;
}

interface NDVIData {
  dt: number;
  dc: number;
  cl: number;
  value: number;
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
      const geoJSON: GeoJSON = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates,
        },
      };

      const response = await this.api.post<PolygonResponse>('/polygons', {
        name,
        geo_json: geoJSON,
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

  async getVegetationIndex(
    polygonId: string,
    start: number,
    end: number
  ): Promise<NDVIData[]> {
    try {
      const response = await this.api.get<NDVIData[]>(
        `/ndvi/history/${polygonId}`,
        {
          params: {
            start,
            end,
          },
        }
      );

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

  async getWeatherAlerts(polygonId: string): Promise<WeatherAlert[]> {
    try {
      const response = await this.api.get<WeatherAlert[]>(
        `/weather/alerts/${polygonId}`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.message || 'Failed to fetch weather alerts'
        );
      }
      throw error;
    }
  }

  public async getSatelliteImage(
    polygonId: string,
    options: SatelliteImageOptions = {}
  ): Promise<string> {
    try {
      const { type = 'ndvi', start, end } = options;
      const response = await this.api.get(`/image/search/${polygonId}`, {
        params: {
          type,
          ...(start && { start }),
          ...(end && { end }),
        },
      });
      return response.data.image_url;
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
