import { Wind, Droplets, Gauge, Eye, Sun, Leaf, Navigation2 } from "lucide-react";
import type { WeatherBundle } from "../lib/api";
import { aqiInfo, next24Hours, uvInfo, windCompass } from "../lib/weatherUtils";

export default function Highlights({ bundle }: { bundle: WeatherBundle }) {
  const { current, air } = bundle;
  const h0 = next24Hours(bundle)[0];
  const uv = h0?.uvIndex ?? 0;
  const visKm = (h0?.visibility ?? 0) / 1000;
  const uvi = uvInfo(uv);
  const aqi = air.usAqi != null ? aqiInfo(air.usAqi) : null;

  const cards = [
    {
      icon: Wind, title: "Wind Speed",
      value: `${Math.round(current.windSpeed)}`, unit: "km/h",
      foot: (
        <span className="inline-flex items-center gap-1">
          <Navigation2 size={12} style={{ transform: `rotate(${current.windDirection}deg)` }} className="text-primary" />
          {windCompass(current.windDirection)} · gusts {Math.round(current.windGusts)} km/h
        </span>
      ),
    },
    {
      icon: Droplets, title: "Humidity",
      value: `${current.humidity}`, unit: "%",
      foot: current.humidity > 70 ? "Humid — may feel muggy" : current.humidity < 30 ? "Dry air" : "Comfortable range",
      bar: { pct: current.humidity, color: "#3B82F6" },
    },
    {
      icon: Gauge, title: "Pressure",
      value: `${Math.round(current.pressure)}`, unit: "hPa",
      foot: current.pressure >= 1013 ? "High pressure — settled" : "Low pressure — changeable",
    },
    {
      icon: Eye, title: "Visibility",
      value: visKm.toFixed(visKm < 10 ? 1 : 0), unit: "km",
      foot: visKm >= 10 ? "Excellent visibility" : visKm >= 4 ? "Moderate visibility" : "Poor visibility",
    },
    {
      icon: Sun, title: "UV Index",
      value: uv.toFixed(1), unit: uvi.level,
      unitColor: uvi.color,
      foot: uv < 3 ? "No protection needed" : uv < 6 ? "Wear sunscreen outdoors" : "Seek shade at midday",
      bar: { pct: Math.min((uv / 11) * 100, 100), color: uvi.color },
    },
    {
      icon: Leaf, title: "Air Quality",
      value: air.usAqi != null ? `${Math.round(air.usAqi)}` : "—",
      unit: aqi ? aqi.level : "AQI",
      unitColor: aqi?.color,
      foot: air.pm25 != null ? `PM2.5 ${air.pm25.toFixed(1)} µg/m³` : "US AQI",
      bar: air.usAqi != null ? { pct: Math.min((air.usAqi / 300) * 100, 100), color: aqi!.color } : undefined,
    },
  ];

  return (
    <section className="anim-fade-up anim-d-1">
      <h2 className="mb-4 text-lg font-bold text-ink">Today's Highlights</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((c) => (
          <div key={c.title} className="card lift p-4 sm:p-5">
            <div className="flex items-center gap-2 text-inkmuted">
              <span className="grid h-8 w-8 place-items-center rounded-xl bg-hoverblue text-primary">
                <c.icon size={16} />
              </span>
              <span className="text-xs font-medium">{c.title}</span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-ink">{c.value}</span>
              <span className="text-xs font-semibold" style={{ color: (c as any).unitColor ?? "#64748B" }}>
                {c.unit}
              </span>
            </div>
            {"bar" in c && c.bar && (
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-hoverblue">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${c.bar.pct}%`, background: c.bar.color }} />
              </div>
            )}
            <p className="mt-2 text-[11px] leading-snug text-inkmuted">{c.foot}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
