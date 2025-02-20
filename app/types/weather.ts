export interface WeatherData {
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  dt: number;
  sys: {
    country: string;
    sunrise?: number;
    sunset?: number;
  };
  name: string;
}

export interface WeatherForecast extends WeatherData {
  dt_txt: string;
}

export interface AccumulatedTemperature {
  dt: string;
  temp: number;
  count: number;
}

export interface AccumulatedPrecipitation {
  dt: string;
  rain: number;
  count: number;
}
