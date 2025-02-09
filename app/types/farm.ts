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
  cropType: CropType;
  soilType: SoilType;
  irrigationMethod: IrrigationMethod;
  plantingDate: Date;
  agroPolygonId?: string; // ID from AgroMonitoring API
  lastNDVI?: number;
  lastUpdated?: Date;
  alerts?: Alert[];
}

export interface Alert {
  id: string;
  type: 'ndvi' | 'weather' | 'disease';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
  read: boolean;
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
