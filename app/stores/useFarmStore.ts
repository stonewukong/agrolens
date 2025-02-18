import { create } from 'zustand';
import { databaseService } from '@/app/services/databaseService';
import { agroMonitoringService } from '@/app/services/agroMonitoring';
import type {
  CropType,
  SoilType,
  IrrigationMethod,
  FarmLocation,
} from '@/app/types/farm';

interface FarmMetrics {
  ndvi_score: number;
  water_stress: {
    level: 'Low' | 'Medium' | 'High';
    value: number;
  };
  nitrogen: {
    value: number;
    status: 'Low' | 'Adequate' | 'High';
  };
  disease_risk: {
    percentage: number;
    status: 'Low' | 'Moderate' | 'High';
  };
  last_scan_date: Date;
  last_soil_test: Date;
}

interface GrowthStage {
  days: number;
  stage: 'Seedling' | 'Vegetative' | 'Reproductive' | 'Maturity';
  expected_harvest_date: Date;
  total_duration: number; // in days
}

interface Weather {
  temperature: number;
  humidity: number;
  rainfall: number;
  last_updated: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: Date;
  type: 'Irrigation' | 'Fertilization' | 'Pest Control' | 'Harvest' | 'Other';
  status: 'Pending' | 'Completed' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High';
}

interface Farm {
  id: string;
  name: string;
  crop_type: CropType;
  soil_type: SoilType;
  irrigation_method: IrrigationMethod;
  area: number;
  location: FarmLocation;
  status: 'Healthy' | 'Needs Attention' | 'Critical';
  growth_stage: GrowthStage;
  metrics: FarmMetrics;
  weather: Weather;
  tasks: Task[];
  last_updated: Date;
  next_irrigation?: Date;
  planting_date: Date;
  icon: 'grain' | 'sprout' | 'corn' | 'seed';
  notes: string[];
  agro_polygon_id?: string;
  user_id?: string;
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
  created_at?: string;
  updated_at?: string;
}

interface FarmState {
  farms: Farm[];
  activeFarmId: string | null;
  loading: boolean;
  error: string | null;
  setActiveFarm: (farmId: string) => void;
  addFarm: (farm: Omit<Farm, 'id'>, userId: string) => Promise<void>;
  updateFarm: (id: string, updates: Partial<Farm>) => Promise<void>;
  deleteFarm: (id: string) => Promise<void>;
  getFarmById: (id: string) => Farm | undefined;
  addTask: (farmId: string, task: Omit<Task, 'id'>) => void;
  updateTask: (farmId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (farmId: string, taskId: string) => void;
  updateMetrics: (farmId: string, metrics: Partial<FarmMetrics>) => void;
  updateWeather: (farmId: string, weather: Weather) => void;
  addNote: (farmId: string, note: string) => void;
  refreshFarmData: (farmId: string) => Promise<void>;
  initializeFarms: (userId: string) => Promise<void>;
}

export const useFarmStore = create<FarmState>((set, get) => ({
  farms: [],
  activeFarmId: null,
  loading: false,
  error: null,

  initializeFarms: async (userId: string) => {
    try {
      set({ loading: true, error: null });
      const farms = await databaseService.getFarms(userId);
      // Ensure last_updated is not undefined by providing a default Date
      const farmsWithDefaultDate = farms.map((farm) => ({
        ...farm,
        last_updated: farm.last_updated || new Date(),
      }));
      set({ farms: farmsWithDefaultDate, loading: false });
    } catch (error) {
      set({ error: 'Failed to load farms', loading: false });
    }
  },

  setActiveFarm: (farmId) => set({ activeFarmId: farmId }),

  addFarm: async (farm: Omit<Farm, 'id'>, userId: string) => {
    try {
      set({ loading: true, error: null });
      const newFarm = await databaseService.createFarm(
        {
          ...farm,
          location: {
            type: 'Feature',
            properties: {
              name: farm.name,
              area: farm.area,
            },
            geometry: {
              type: 'Polygon',
              coordinates: farm.location.geometry.coordinates,
            },
          },
        },
        userId
      );

      set((state) => {
        const updatedFarms = [newFarm, ...state.farms].map((farm) => ({
          ...farm,
          last_updated: farm.last_updated || new Date(),
        }));
        return {
          ...state,
          farms: updatedFarms,
          loading: false,
        };
      });
    } catch (error) {
      console.error('Error adding farm:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to add farm',
        loading: false,
      });
    }
  },

  updateFarm: async (id: string, updates: Partial<Farm>) => {
    try {
      set({ loading: true, error: null });
      const updatedFarm = await databaseService.updateFarm(id, {
        ...updates,
        location: updates.location
          ? {
              type: 'Feature',
              properties: {
                name: updates.name || '',
                area: updates.area || 0,
              },
              geometry: updates.location.geometry,
            }
          : undefined,
      });

      set((state) => ({
        farms: state.farms.map((farm) =>
          farm.id === id ? { ...farm, ...updatedFarm } : farm
        ),
        loading: false,
      }));
    } catch (error) {
      console.error('Error updating farm:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update farm',
        loading: false,
      });
    }
  },

  deleteFarm: async (id) => {
    try {
      set({ loading: true, error: null });
      await databaseService.deleteFarm(id);
      set((state) => ({
        farms: state.farms.filter((farm) => farm.id !== id),
        activeFarmId: state.activeFarmId === id ? null : state.activeFarmId,
        loading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete farm', loading: false });
      throw error;
    }
  },

  getFarmById: (id) => {
    return get().farms.find((farm) => farm.id === id);
  },

  addTask: (farmId, task) => {
    set((state) => ({
      farms: state.farms.map((farm) =>
        farm.id === farmId
          ? {
              ...farm,
              tasks: [
                ...farm.tasks,
                { ...task, id: Math.random().toString(36).substr(2, 9) },
              ],
              lastUpdated: new Date(),
            }
          : farm
      ),
    }));
  },

  updateTask: (farmId, taskId, updates) => {
    set((state) => ({
      farms: state.farms.map((farm) =>
        farm.id === farmId
          ? {
              ...farm,
              tasks: farm.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updates } : task
              ),
              lastUpdated: new Date(),
            }
          : farm
      ),
    }));
  },

  deleteTask: (farmId, taskId) => {
    set((state) => ({
      farms: state.farms.map((farm) =>
        farm.id === farmId
          ? {
              ...farm,
              tasks: farm.tasks.filter((task) => task.id !== taskId),
              lastUpdated: new Date(),
            }
          : farm
      ),
    }));
  },

  updateMetrics: (farmId, metrics) => {
    set((state) => ({
      farms: state.farms.map((farm) =>
        farm.id === farmId
          ? {
              ...farm,
              metrics: { ...farm.metrics, ...metrics },
              lastUpdated: new Date(),
            }
          : farm
      ),
    }));
  },

  updateWeather: (farmId, weather) => {
    set((state) => ({
      farms: state.farms.map((farm) =>
        farm.id === farmId
          ? {
              ...farm,
              weather,
              lastUpdated: new Date(),
            }
          : farm
      ),
    }));
  },

  addNote: (farmId, note) => {
    set((state) => ({
      farms: state.farms.map((farm) =>
        farm.id === farmId
          ? {
              ...farm,
              notes: [...farm.notes, note],
              lastUpdated: new Date(),
            }
          : farm
      ),
    }));
  },

  refreshFarmData: async (farmId: string) => {
    try {
      const farm = get().farms.find((f) => f.id === farmId);
      if (!farm || !farm.agro_polygon_id || !farm.user_id) {
        throw new Error('Farm not found or missing required data');
      }

      // Fetch and update satellite data
      const [ndviData, weatherData, soilData] = await Promise.all([
        agroMonitoringService.getSatelliteImage(farm.agro_polygon_id, {
          type: 'ndvi',
        }),
        agroMonitoringService.getWeatherData(farm.agro_polygon_id),
        agroMonitoringService.getSoilData(farm.agro_polygon_id),
      ]);

      // Update satellite data in database
      if (ndviData) {
        await databaseService.updateSatelliteData(
          farmId,
          0.75, // You might want to calculate this from the image or get it from the API
          ndviData
        );
      }

      // Update weather data in database
      if (weatherData) {
        await databaseService.updateWeatherData(farmId, {
          temperature: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          rainfall: 0, // You might want to calculate this from weather data
          wind_speed: weatherData.wind.speed,
          last_update: new Date().toISOString(),
        });
      }

      // Update soil data in database
      if (soilData) {
        await databaseService.updateSoilData(farmId, {
          moisture: soilData.moisture,
          temperature: soilData.t0,
          last_update: new Date().toISOString(),
        });
      }

      // Refresh farms data
      const updatedFarms = await databaseService.getFarms(farm.user_id);
      set({
        farms: updatedFarms.map((farm) => ({
          ...farm,
          last_updated: farm.last_updated || new Date(), // Ensure last_updated is never undefined
        })),
      });
    } catch (error) {
      console.error('Error refreshing farm data:', error);
      throw error;
    }
  },
}));
