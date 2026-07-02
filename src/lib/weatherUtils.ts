import type { WeatherBundle } from "./api";

// ---------------- WMO weather code mapping ----------------
export type IconKey =
  | "sun" | "moon" | "cloud-sun" | "cloud-moon" | "cloud" | "clouds"
  | "fog" | "drizzle" | "rain" | "heavy-rain" | "snow" | "sleet" | "storm";

export type Scene = "sunny" | "night" | "cloudy" | "rain" | "storm" | "snow" | "fog";

interface CodeInfo {
  label: string;
  day: IconKey;
  night: IconKey;
  scene: Scene;
}

const CODES: Record<number, CodeInfo> = {
  0:  { label: "Clear sky",             day: "sun",       night: "moon",       scene: "sunny" },
  1:  { label: "Mainly clear",          day: "sun",       night: "moon",       scene: "sunny" },
  2:  { label: "Partly cloudy",         day: "cloud-sun", night: "cloud-moon", scene: "cloudy" },
  3:  { label: "Overcast",              day: "clouds",    night: "clouds",     scene: "cloudy" },
  45: { label: "Fog",                   day: "fog",       night: "fog",        scene: "fog" },
  48: { label: "Depositing rime fog",   day: "fog",       night: "fog",        scene: "fog" },
  51: { label: "Light drizzle",         day: "drizzle",   night: "drizzle",    scene: "rain" },
  53: { label: "Moderate drizzle",      day: "drizzle",   night: "drizzle",    scene: "rain" },
  55: { label: "Dense drizzle",         day: "drizzle",   night: "drizzle",    scene: "rain" },
  56: { label: "Freezing drizzle",      day: "sleet",     night: "sleet",      scene: "rain" },
  57: { label: "Dense freezing drizzle",day: "sleet",     night: "sleet",      scene: "rain" },
  61: { label: "Light rain",            day: "rain",      night: "rain",       scene: "rain" },
  63: { label: "Moderate rain",         day: "rain",      night: "rain",       scene: "rain" },
  65: { label: "Heavy rain",            day: "heavy-rain",night: "heavy-rain", scene: "rain" },
  66: { label: "Freezing rain",         day: "sleet",     night: "sleet",      scene: "rain" },
  67: { label: "Heavy freezing rain",   day: "sleet",     night: "sleet",      scene: "rain" },
  71: { label: "Light snowfall",        day: "snow",      night: "snow",       scene: "snow" },
  73: { label: "Moderate snowfall",     day: "snow",      night: "snow",       scene: "snow" },
  75: { label: "Heavy snowfall",        day: "snow",      night: "snow",       scene: "snow" },
  77: { label: "Snow grains",           day: "snow",      night: "snow",       scene: "snow" },
  80: { label: "Light rain showers",    day: "rain",      night: "rain",       scene: "rain" },
  81: { label: "Rain showers",          day: "rain",      night: "rain",       scene: "rain" },
  82: { label: "Violent rain showers",  day: "heavy-rain",night: "heavy-rain", scene: "rain" },
  85: { label: "Snow showers",          day: "snow",      night: "snow",       scene: "snow" },
  86: { label: "Heavy snow showers",    day: "snow",      night: "snow",       scene: "snow" },
  95: { label: "Thunderstorm",          day: "storm",     night: "storm",      scene: "storm" },
  96: { label: "Thunderstorm, light hail", day: "storm",  night: "storm",      scene: "storm" },
  99: { label: "Thunderstorm, heavy hail", day: "storm",  night: "storm",      scene: "storm" },
};

export function codeInfo(code: number) {
  return CODES[code] ?? CODES[3];
}
export function codeLabel(code: number) {
  return codeInfo(code).label;
}
export function codeIcon(code: number, isDay: boolean): IconKey {
  const c = codeInfo(code);
  return isDay ? c.day : c.night;
}
export function sceneFor(code: number, isDay: boolean): Scene {
  const s = codeInfo(code).scene;
  if (!isDay && (s === "sunny" || s === "cloudy")) return "night";
  return s;
}

// ---------------- Units ----------------
export type Unit = "c" | "f";
export const toF = (c: number) => (c * 9) / 5 + 32;
export function fmtTemp(c: number, unit: Unit, withUnit = false) {
  const v = unit === "c" ? c : toF(c);
  return `${Math.round(v)}°${withUnit ? unit.toUpperCase() : ""}`;
}

// ---------------- Wind ----------------
const DIRS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
export function windCompass(deg: number) {
  return DIRS[Math.round(deg / 22.5) % 16];
}

// ---------------- UV ----------------
export function uvInfo(uv: number) {
  if (uv < 3)  return { level: "Low",       color: "#22C55E" };
  if (uv < 6)  return { level: "Moderate",  color: "#F59E0B" };
  if (uv < 8)  return { level: "High",      color: "#F97316" };
  if (uv < 11) return { level: "Very High", color: "#EF4444" };
  return { level: "Extreme", color: "#7C3AED" };
}

// ---------------- AQI (US) ----------------
export function aqiInfo(aqi: number) {
  if (aqi <= 50)  return { level: "Good",              color: "#22C55E", advice: "Air quality is excellent — a great day for outdoor activities." };
  if (aqi <= 100) return { level: "Moderate",          color: "#F59E0B", advice: "Acceptable air quality. Unusually sensitive people should take care." };
  if (aqi <= 150) return { level: "Unhealthy (Sens.)", color: "#F97316", advice: "Sensitive groups should reduce prolonged outdoor exertion." };
  if (aqi <= 200) return { level: "Unhealthy",         color: "#EF4444", advice: "Everyone may begin to experience health effects. Limit outdoor time." };
  if (aqi <= 300) return { level: "Very Unhealthy",    color: "#A855F7", advice: "Health alert — avoid outdoor exertion and keep windows closed." };
  return { level: "Hazardous", color: "#7F1D1D", advice: "Emergency conditions. Stay indoors with air purification if possible." };
}

// ---------------- Moon phase ----------------
export function moonPhase(date = new Date()) {
  // Synodic month approximation from a known new moon (2000-01-06 18:14 UTC)
  const synodic = 29.53058867;
  const known = Date.UTC(2000, 0, 6, 18, 14);
  const days = (date.getTime() - known) / 86400000;
  const phase = ((days % synodic) + synodic) % synodic;
  const idx = Math.floor((phase / synodic) * 8 + 0.5) % 8;
  const names = [
    "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
    "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent",
  ];
  const emojis = ["🌑","🌒","🌓","🌔","🌕","🌖","🌗","🌘"];
  const illumination = Math.round((1 - Math.cos((2 * Math.PI * phase) / synodic)) / 2 * 100);
  return { name: names[idx], emoji: emojis[idx], illumination };
}

// ---------------- Time helpers (respect location timezone) ----------------
export function cityNow(offsetSeconds: number) {
  const utc = Date.now() + new Date().getTimezoneOffset() * 60000;
  return new Date(utc + offsetSeconds * 1000);
}
export function fmtClock(d: Date) {
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}
export function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}
export function isoToClock(iso: string) {
  const [, t] = iso.split("T");
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, "0")} ${ampm}`;
}
export function isoToHourLabel(iso: string) {
  const h = Number(iso.split("T")[1].split(":")[0]);
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh} ${ampm}`;
}
export function isoToDayName(iso: string, index: number) {
  if (index === 0) return "Today";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long" });
}

// ---------------- Derived weather alerts ----------------
export interface WeatherAlert {
  title: string;
  detail: string;
  severity: "warning" | "danger";
}

export function deriveAlerts(b: WeatherBundle): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];
  const c = b.current;
  const today = b.daily[0];

  if ([95, 96, 99].includes(c.weatherCode) || b.hourly.slice(0, 12).some(h => [95, 96, 99].includes(h.weatherCode))) {
    alerts.push({ title: "Thunderstorm Warning", detail: "Thunderstorms expected within the next 12 hours. Stay indoors and avoid open areas.", severity: "danger" });
  }
  if ([65, 82].includes(c.weatherCode) || (today && today.precipProbability >= 80 && [61, 63, 65, 80, 81, 82].includes(today.weatherCode))) {
    alerts.push({ title: "Heavy Rain Warning", detail: "Heavy rainfall likely today. Watch for localized flooding and reduced visibility.", severity: "warning" });
  }
  if (today && today.tempMax >= 40) {
    alerts.push({ title: "Heatwave Alert", detail: `Temperatures reaching ${Math.round(today.tempMax)}°C today. Stay hydrated and avoid midday sun.`, severity: "danger" });
  } else if (today && today.tempMax >= 35) {
    alerts.push({ title: "High Temperature Advisory", detail: "Very warm conditions expected. Limit strenuous outdoor activity in the afternoon.", severity: "warning" });
  }
  if (c.windGusts >= 60) {
    alerts.push({ title: "Strong Wind Advisory", detail: `Wind gusts up to ${Math.round(c.windGusts)} km/h. Secure loose outdoor items.`, severity: "warning" });
  }
  if ([75, 86].includes(c.weatherCode)) {
    alerts.push({ title: "Heavy Snow Warning", detail: "Heavy snowfall in progress. Travel may be hazardous — drive carefully.", severity: "warning" });
  }
  if (today && today.tempMin <= -10) {
    alerts.push({ title: "Extreme Cold Alert", detail: `Lows near ${Math.round(today.tempMin)}°C. Dress in layers and limit exposure.`, severity: "warning" });
  }
  return alerts;
}

// ---------------- Hourly slice starting at current local hour ----------------
export function next24Hours(b: WeatherBundle) {
  const nowIso = b.current.time.slice(0, 13); // "YYYY-MM-DDTHH"
  let start = b.hourly.findIndex(h => h.time.slice(0, 13) >= nowIso);
  if (start < 0) start = 0;
  return b.hourly.slice(start, start + 24);
}
