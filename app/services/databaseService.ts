import { supabase } from '@/utils/SupaLegend';
import { Farm } from '@/app/types/farm';

interface StoredFarm extends Farm {
  user_id: string;
  satellite_data?: {
    ndvi_history: Array<{
      date: string;
      value: number;
    }>;
    last_ndvi_image?: string;
    last_satellite_update?: string;
  };
  weather_data?: {
    temperature: number;
    humidity: number;
    rainfall: number;
    wind_speed: number;
    last_update: string;
  };
  soil_data?: {
    moisture: number;
    temperature: number;
    last_update: string;
  };
}

export class DatabaseService {
  private transformFarmData(rawFarm: any): Farm {
    return {
      ...rawFarm,
      metrics: {
        ndvi_score: 0,
        water_stress: {
          level: 'Low',
          value: 0,
        },
        disease_risk: {
          percentage: 0,
          status: 'Low',
        },
        nitrogen: {
          value: 0,
          status: 'Low',
        },
        last_scan_date: new Date(),
        last_soil_test: new Date(),
        ...rawFarm.metrics,
      },
      weather: {
        temperature: 0,
        humidity: 0,
        rainfall: 0,
        last_updated: new Date(),
        ...rawFarm.weather,
      },
      growth_stage: {
        days: 0,
        stage: 'Seedling',
        expected_harvest_date: new Date(),
        total_duration: 0,
        ...rawFarm.growth_stage,
      },
      tasks: rawFarm.tasks || [],
      notes: rawFarm.notes || [],
      status: rawFarm.status || 'Healthy',
      last_updated: rawFarm.last_updated
        ? new Date(rawFarm.last_updated)
        : new Date(),
      planting_date: rawFarm.planting_date
        ? new Date(rawFarm.planting_date)
        : new Date(),
    };
  }

  async createFarm(farm: Omit<Farm, 'id'>, userId: string) {
    try {
      const { data, error } = await supabase
        .from('farms')
        .insert([
          {
            ...farm,
            user_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return this.transformFarmData(data);
    } catch (error) {
      console.error('Error creating farm:', error);
      throw error;
    }
  }

  async updateFarm(farmId: string, updates: Partial<Farm>) {
    try {
      const { data, error } = await supabase
        .from('farms')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', farmId)
        .select()
        .single();

      if (error) throw error;
      return this.transformFarmData(data);
    } catch (error) {
      console.error('Error updating farm:', error);
      throw error;
    }
  }

  async getFarms(userId: string) {
    try {
      const { data, error } = await supabase
        .from('farms')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map((farm) => this.transformFarmData(farm));
    } catch (error) {
      console.error('Error fetching farms:', error);
      throw error;
    }
  }

  async updateSatelliteData(
    farmId: string,
    ndviValue: number,
    ndviImage: string
  ) {
    try {
      const { data: existingData } = await supabase
        .from('farms')
        .select('satellite_data')
        .eq('id', farmId)
        .single();

      const updatedSatelliteData = {
        ...(existingData?.satellite_data || {}),
        ndvi_history: [
          ...(existingData?.satellite_data?.ndvi_history || []),
          {
            date: new Date().toISOString(),
            value: ndviValue,
          },
        ],
        last_ndvi_image: ndviImage,
        last_satellite_update: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('farms')
        .update({
          satellite_data: updatedSatelliteData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', farmId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating satellite data:', error);
      throw error;
    }
  }

  async updateWeatherData(
    farmId: string,
    weatherData: StoredFarm['weather_data']
  ) {
    try {
      const { data, error } = await supabase
        .from('farms')
        .update({
          weather_data: {
            ...weatherData,
            last_update: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', farmId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating weather data:', error);
      throw error;
    }
  }

  async updateSoilData(farmId: string, soilData: StoredFarm['soil_data']) {
    try {
      const { data, error } = await supabase
        .from('farms')
        .update({
          soil_data: {
            ...soilData,
            last_update: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', farmId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating soil data:', error);
      throw error;
    }
  }

  async deleteFarm(farmId: string) {
    try {
      const { error } = await supabase.from('farms').delete().eq('id', farmId);
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting farm:', error);
      throw error;
    }
  }
}

export const databaseService = new DatabaseService();
