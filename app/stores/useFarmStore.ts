import { create } from 'zustand';

interface FarmMetrics {
  ndviScore: number;
  waterStress: {
    level: 'Low' | 'Medium' | 'High';
    value: number;
  };
  nitrogen: {
    value: number;
    status: 'Low' | 'Adequate' | 'High';
  };
  diseaseRisk: {
    percentage: number;
    status: 'Low' | 'Moderate' | 'High';
  };
  lastScanDate: Date;
  lastSoilTest: Date;
}

interface GrowthStage {
  days: number;
  stage: 'Seedling' | 'Vegetative' | 'Reproductive' | 'Maturity';
  expectedHarvestDate: Date;
  totalDuration: number; // in days
}

interface Weather {
  temperature: number;
  humidity: number;
  rainfall: number;
  lastUpdated: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  type: 'Irrigation' | 'Fertilization' | 'Pest Control' | 'Harvest' | 'Other';
  status: 'Pending' | 'Completed' | 'Overdue';
  priority: 'Low' | 'Medium' | 'High';
}

interface Farm {
  id: string;
  name: string;
  type: 'Wheat' | 'Rice' | 'Corn' | 'Other';
  area: number; // in acres
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: 'Healthy' | 'Needs Attention' | 'Critical';
  growthStage: GrowthStage;
  metrics: FarmMetrics;
  weather: Weather;
  tasks: Task[];
  lastUpdated: Date;
  nextIrrigation?: Date;
  plantingDate: Date;
  icon: 'grain' | 'sprout' | 'corn' | 'seed';
  notes: string[];
  agroPolygonId?: string; // ID from AgroMonitoring API
}

interface FarmState {
  farms: Farm[];
  activeFarmId: string | null;
  loading: boolean;
  error: string | null;
  setActiveFarm: (farmId: string) => void;
  addFarm: (farm: Omit<Farm, 'id'>) => void;
  updateFarm: (id: string, updates: Partial<Farm>) => void;
  deleteFarm: (id: string) => void;
  getFarmById: (id: string) => Farm | undefined;
  addTask: (farmId: string, task: Omit<Task, 'id'>) => void;
  updateTask: (farmId: string, taskId: string, updates: Partial<Task>) => void;
  deleteTask: (farmId: string, taskId: string) => void;
  updateMetrics: (farmId: string, metrics: Partial<FarmMetrics>) => void;
  updateWeather: (farmId: string, weather: Weather) => void;
  addNote: (farmId: string, note: string) => void;
  initializeFarms: () => Promise<void>;
}

export const useFarmStore = create<FarmState>((set, get) => ({
  farms: [],
  activeFarmId: null,
  loading: false,
  error: null,

  initializeFarms: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 2000));

    set({
      farms: [
        {
          id: '1',
          name: 'Wheat Farm',
          type: 'Wheat',
          area: 2.5,
          location: {
            latitude: 28.6139,
            longitude: 77.209,
            address: 'Delhi, India',
          },
          status: 'Healthy',
          growthStage: {
            days: 45,
            stage: 'Vegetative',
            expectedHarvestDate: new Date('2024-06-15'),
            totalDuration: 120,
          },
          metrics: {
            ndviScore: 0.82,
            waterStress: {
              level: 'Low',
              value: 0.3,
            },
            nitrogen: {
              value: 42,
              status: 'Adequate',
            },
            diseaseRisk: {
              percentage: 12,
              status: 'Low',
            },
            lastScanDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            lastSoilTest: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
          },
          weather: {
            temperature: 28,
            humidity: 65,
            rainfall: 0,
            lastUpdated: new Date(),
          },
          tasks: [
            {
              id: 't1',
              title: 'Scheduled Irrigation',
              description: 'Regular irrigation cycle',
              dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
              type: 'Irrigation',
              status: 'Pending',
              priority: 'Medium',
            },
          ],
          lastUpdated: new Date(),
          nextIrrigation: new Date(Date.now() + 24 * 60 * 60 * 1000),
          plantingDate: new Date('2024-02-01'),
          icon: 'grain',
          notes: [
            'Initial soil preparation completed',
            'First fertilizer application done',
          ],
        },
        {
          id: '2',
          name: 'Rice Farm',
          type: 'Rice',
          area: 1.8,
          location: {
            latitude: 28.6129,
            longitude: 77.2295,
            address: 'Delhi, India',
          },
          status: 'Needs Attention',
          growthStage: {
            days: 15,
            stage: 'Seedling',
            expectedHarvestDate: new Date('2024-07-30'),
            totalDuration: 130,
          },
          metrics: {
            ndviScore: 0.65,
            waterStress: {
              level: 'High',
              value: 0.8,
            },
            nitrogen: {
              value: 35,
              status: 'Low',
            },
            diseaseRisk: {
              percentage: 28,
              status: 'Moderate',
            },
            lastScanDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            lastSoilTest: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          },
          weather: {
            temperature: 30,
            humidity: 70,
            rainfall: 2.5,
            lastUpdated: new Date(),
          },
          tasks: [
            {
              id: 't2',
              title: 'Apply Nitrogen Fertilizer',
              description: 'Address low nitrogen levels',
              dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
              type: 'Fertilization',
              status: 'Pending',
              priority: 'High',
            },
          ],
          lastUpdated: new Date(),
          nextIrrigation: new Date(Date.now() + 12 * 60 * 60 * 1000),
          plantingDate: new Date('2024-03-15'),
          icon: 'sprout',
          notes: [
            'Seedling transplantation completed',
            'Water level needs monitoring',
          ],
        },
      ],
      activeFarmId: '1',
      loading: false,
    });
  },

  setActiveFarm: (farmId) => set({ activeFarmId: farmId }),

  addFarm: (farm) => {
    set((state) => ({
      farms: [
        ...state.farms,
        {
          ...farm,
          id: Math.random().toString(36).substr(2, 9),
        },
      ],
    }));
  },

  updateFarm: (id, updates) => {
    set((state) => ({
      farms: state.farms.map((farm) =>
        farm.id === id ? { ...farm, ...updates, lastUpdated: new Date() } : farm
      ),
    }));
  },

  deleteFarm: (id) => {
    set((state) => ({
      farms: state.farms.filter((farm) => farm.id !== id),
      activeFarmId: state.activeFarmId === id ? null : state.activeFarmId,
    }));
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
}));
