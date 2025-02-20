export type AlertType =
  | 'frost'
  | 'heavy_rain'
  | 'high_winds'
  | 'low_soil_moisture'
  | 'disease_risk'
  | 'pest_risk'
  | 'irrigation_needed'
  | 'weather_alert';

export type AlertSeverity = 'low' | 'medium' | 'high';

export interface Alert {
  id: string;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  timestamp: Date;
  read: boolean;
  farm_id: string;
  created_at: string;
}
