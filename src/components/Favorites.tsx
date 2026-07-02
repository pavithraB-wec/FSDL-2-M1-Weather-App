import { useEffect, useState } from "react";
import { Star, MapPin } from "lucide-react";
import type { GeoCity } from "../lib/api";
import { codeIcon, fmtTemp, type Unit } from "../lib/weatherUtils";
import WeatherIcon from "./WeatherIcon";

export const FAVORITE_CITIES: GeoCity[] = [
  { id: 5128581, name: "New York", country: "United States", countryCode: "us", latitude: 40.7143, longitude: -74.006 },
  { id: 2643743, name: "London", country: "United Kingdom", countryCode: "gb", latitude: 51.5085, longitude: -0.1257 },
  { id: 1850144, name: "Tokyo", country: "Japan", countryCode: "jp", latitude: 35.6895, longitude: 139.6917 },
  { id: 1264527, name: "Chennai", country: "India", countryCode: "in", latitude: 13.0878, longitude: 80.2785 },
  { id: 1277333, name: "Bangalore", country: "India", countryCode: "in", latitude: 12.9719, longitude: 77.5937 },
  { id: 1259425, name: "Puducherry", country: "India", countryCode: "in", latitude: 11.9333, longitude: 79.8333 },
];

interface Mini { temp: number; code: number; isDay: boolean }

export default function Favorites({
  unit, activeId, onSelect,
}: { unit: Unit; activeId?: number; onSelect: (c: GeoCity) => void }) {
  const [minis, setMinis] = useState<Record<number, Mini>>({});

  useEffect(() => {
    const lats = FAVORITE_CITIES.map((c) => c.latitude).join(",");
    const lons = FAVORITE_CITIES.map((c) => c.longitude).join(",");
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lons}&current=temperature_2m,weather_code,is_day`
    )
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [data];
        const next: Record<number, Mini> = {};
        arr.forEach((d: any, i: number) => {
          if (d?.current) {
            next[FAVORITE_CITIES[i].id] = {
              temp: d.current.temperature_2m,
              code: d.current.weather_code,
              isDay: d.current.is_day === 1,
            };
          }
        });
        setMinis(next);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="anim-fade-up anim-d-5">
      <div className="mb-4 flex items-center gap-2">
        <Star size={18} className="text-amber-400 fill-amber-400" />
        <h2 className="text-lg font-bold text-ink">Favorite Cities</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {FAVORITE_CITIES.map((c) => {
          const m = minis[c.id];
          const active = activeId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className={`card lift ripple-btn flex flex-col items-start gap-2 p-4 text-left transition ${
                active ? "border-primary ring-2 ring-blue-100" : ""
              }`}
            >
              <div className="flex w-full items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-inkmuted">
                  <MapPin size={11} className="text-primary" /> {c.country}
                </span>
                {m && <WeatherIcon icon={codeIcon(m.code, m.isDay)} size={22} />}
              </div>
              <span className="text-sm font-bold text-ink">{c.name}</span>
              <span className="text-xl font-extrabold tracking-tight text-primary">
                {m ? fmtTemp(m.temp, unit) : "· ·"}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
