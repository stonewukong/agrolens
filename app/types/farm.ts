export type CropType =
  | 'rice'
  | 'wheat'
  | 'corn'
  | 'soybean'
  | 'cotton'
  | 'sugarcane'
  | 'other';

export type SoilType =
  | 'clay'
  | 'sandy'
  | 'loamy'
  | 'silty'
  | 'peaty'
  | 'chalky'
  | 'other';

export type IrrigationMethod =
  | 'drip'
  | 'sprinkler'
  | 'flood'
  | 'center_pivot'
  | 'other';

export interface FarmLocation {
  type: 'Feature';
  properties: {
    name: string;
    area: number; // in acres
    agro_polygon_id?: string; // ID from AgroMonitoring API
  };
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface Farm {
  id: string;
  name: string;
  location: FarmLocation;
  crop_type: CropType;
  soil_type: SoilType;
  irrigation_method: IrrigationMethod;
  planting_date: Date;
  area: number;
  status: 'Healthy' | 'Needs Attention' | 'Critical';
  growth_stage: {
    days: number;
    stage: 'Seedling' | 'Vegetative' | 'Reproductive' | 'Maturity';
    expected_harvest_date: Date;
    total_duration: number;
  };
  metrics: {
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
  };
  weather: {
    temperature: number;
    humidity: number;
    rainfall: number;
    last_updated: Date;
  };
  tasks: {
    id: string;
    title: string;
    description: string;
    due_date: Date;
    type: 'Irrigation' | 'Fertilization' | 'Pest Control' | 'Harvest' | 'Other';
    status: 'Pending' | 'Completed' | 'Overdue';
    priority: 'Low' | 'Medium' | 'High';
  }[];
  last_updated?: Date;
  next_irrigation?: Date;
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

export interface Alert {
  id: string;
  type:
    | 'frost'
    | 'heavy_rain'
    | 'high_winds'
    | 'low_soil_moisture'
    | 'disease_risk'
    | 'pest_risk'
    | 'irrigation_needed'
    | 'weather_alert';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  read: boolean;
  farm_id: string;
  created_at: string;
}

export interface NDVIHistory {
  date: Date;
  value: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  alerts: Alert[];
}

export interface DiseaseRisk {
  probability: number;
  diseaseName?: string;
  recommendations?: string[];
}
