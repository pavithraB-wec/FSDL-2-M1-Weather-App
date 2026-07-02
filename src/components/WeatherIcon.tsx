import {
  Sun, Moon, CloudSun, CloudMoon, Cloud, Cloudy, CloudFog,
  CloudDrizzle, CloudRain, CloudRainWind, CloudSnow, CloudHail, CloudLightning,
} from "lucide-react";
import type { IconKey } from "../lib/weatherUtils";

const MAP: Record<IconKey, { Icon: any; color: string }> = {
  "sun":        { Icon: Sun,            color: "#F59E0B" },
  "moon":       { Icon: Moon,           color: "#818CF8" },
  "cloud-sun":  { Icon: CloudSun,       color: "#60A5FA" },
  "cloud-moon": { Icon: CloudMoon,      color: "#818CF8" },
  "cloud":      { Icon: Cloud,          color: "#7DD3FC" },
  "clouds":     { Icon: Cloudy,         color: "#94A3B8" },
  "fog":        { Icon: CloudFog,       color: "#94A3B8" },
  "drizzle":    { Icon: CloudDrizzle,   color: "#60A5FA" },
  "rain":       { Icon: CloudRain,      color: "#3B82F6" },
  "heavy-rain": { Icon: CloudRainWind,  color: "#2563EB" },
  "snow":       { Icon: CloudSnow,      color: "#7DD3FC" },
  "sleet":      { Icon: CloudHail,      color: "#60A5FA" },
  "storm":      { Icon: CloudLightning, color: "#F59E0B" },
};

export default function WeatherIcon({
  icon,
  size = 24,
  className = "",
  strokeWidth = 1.8,
}: {
  icon: IconKey;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const { Icon, color } = MAP[icon] ?? MAP["cloud"];
  return <Icon size={size} strokeWidth={strokeWidth} color={color} className={className} aria-hidden />;
}
