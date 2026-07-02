// ------------------------------------------------------------------
// SkyCast API layer — real-time data via Open-Meteo (no key required)
// Geocoding:  geocoding-api.open-meteo.com
// Forecast:   api.open-meteo.com
// Air:        air-quality-api.open-meteo.com
// Reverse:    api.bigdatacloud.net (free client reverse geocode)
// ------------------------------------------------------------------

export interface GeoCity {
  id: number;
  name: string;
  country: string;
  countryCode: string;
  admin1?: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  cloudCover: number;
  precipitation: number;
  weatherCode: number;
  isDay: boolean;
  time: string;
}

export interface HourPoint {
  time: string;
  temperature: number;
  weatherCode: number;
  precipProbability: number;
  windSpeed: number;
  isDay: boolean;
  uvIndex: number;
  visibility: number;
  dewPoint: number;
  humidity: number;
}

export interface DayPoint {
  date: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  sunrise: string;
  sunset: string;
  precipProbability: number;
  uvIndexMax: number;
  windMax: number;
}

export interface AirQuality {
  usAqi: number | null;
  pm25: number | null;
  pm10: number | null;
  ozone: number | null;
  no2: number | null;
}

export interface WeatherBundle {
  city: GeoCity;
  current: CurrentWeather;
  hourly: HourPoint[];
  daily: DayPoint[];
  air: AirQuality;
  timezone: string;
  utcOffsetSeconds: number;
  fetchedAt: number;
}

const GEO = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST = "https://api.open-meteo.com/v1/forecast";
const AIR = "https://air-quality-api.open-meteo.com/v1/air-quality";

export async function searchCities(query: string, count = 6): Promise<GeoCity[]> {
  if (!query.trim()) return [];
  const url = `${GEO}?name=${encodeURIComponent(query.trim())}&count=${count}&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  if (!data.results) return [];
  return data.results.map((r: any) => ({
    id: r.id,
    name: r.name,
    country: r.country ?? "",
    countryCode: r.country_code ?? "",
    admin1: r.admin1,
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeoCity> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    const d = await res.json();
    return {
      id: Math.round(lat * 1000 + lon),
      name: d.city || d.locality || d.principalSubdivision || "My Location",
      country: d.countryName || "",
      countryCode: (d.countryCode || "").toLowerCase(),
      admin1: d.principalSubdivision,
      latitude: lat,
      longitude: lon,
    };
  } catch {
    return {
      id: Math.round(lat * 1000 + lon),
      name: "My Location",
      country: "",
      countryCode: "",
      latitude: lat,
      longitude: lon,
    };
  }
}

export async function fetchWeatherBundle(city: GeoCity): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    hourly:
      "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,is_day,uv_index,visibility,dew_point_2m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max,wind_speed_10m_max",
    timezone: "auto",
    forecast_days: "8",
  });

  const airParams = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current: "us_aqi,pm2_5,pm10,ozone,nitrogen_dioxide",
    timezone: "auto",
  });

  const [wRes, aRes] = await Promise.all([
    fetch(`${FORECAST}?${params}`),
    fetch(`${AIR}?${airParams}`).catch(() => null),
  ]);

  if (!wRes.ok) throw new Error("Weather fetch failed");
  const w = await wRes.json();

  let air: AirQuality = { usAqi: null, pm25: null, pm10: null, ozone: null, no2: null };
  if (aRes && aRes.ok) {
    try {
      const a = await aRes.json();
      air = {
        usAqi: a.current?.us_aqi ?? null,
        pm25: a.current?.pm2_5 ?? null,
        pm10: a.current?.pm10 ?? null,
        ozone: a.current?.ozone ?? null,
        no2: a.current?.nitrogen_dioxide ?? null,
      };
    } catch {
      /* air optional */
    }
  }

  const current: CurrentWeather = {
    temperature: w.current.temperature_2m,
    apparentTemperature: w.current.apparent_temperature,
    humidity: w.current.relative_humidity_2m,
    pressure: w.current.pressure_msl,
    windSpeed: w.current.wind_speed_10m,
    windDirection: w.current.wind_direction_10m,
    windGusts: w.current.wind_gusts_10m,
    cloudCover: w.current.cloud_cover,
    precipitation: w.current.precipitation,
    weatherCode: w.current.weather_code,
    isDay: w.current.is_day === 1,
    time: w.current.time,
  };

  const hourly: HourPoint[] = w.hourly.time.map((t: string, i: number) => ({
    time: t,
    temperature: w.hourly.temperature_2m[i],
    weatherCode: w.hourly.weather_code[i],
    precipProbability: w.hourly.precipitation_probability?.[i] ?? 0,
    windSpeed: w.hourly.wind_speed_10m[i],
    isDay: w.hourly.is_day[i] === 1,
    uvIndex: w.hourly.uv_index?.[i] ?? 0,
    visibility: w.hourly.visibility?.[i] ?? 0,
    dewPoint: w.hourly.dew_point_2m?.[i] ?? 0,
    humidity: w.hourly.relative_humidity_2m?.[i] ?? 0,
  }));

  const daily: DayPoint[] = w.daily.time.map((t: string, i: number) => ({
    date: t,
    weatherCode: w.daily.weather_code[i],
    tempMax: w.daily.temperature_2m_max[i],
    tempMin: w.daily.temperature_2m_min[i],
    sunrise: w.daily.sunrise[i],
    sunset: w.daily.sunset[i],
    precipProbability: w.daily.precipitation_probability_max?.[i] ?? 0,
    uvIndexMax: w.daily.uv_index_max?.[i] ?? 0,
    windMax: w.daily.wind_speed_10m_max?.[i] ?? 0,
  }));

  return {
    city,
    current,
    hourly,
    daily,
    air,
    timezone: w.timezone,
    utcOffsetSeconds: w.utc_offset_seconds,
    fetchedAt: Date.now(),
  };
}
