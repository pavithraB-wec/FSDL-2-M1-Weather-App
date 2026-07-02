import { useState } from "react";
import { CloudRain, Cloud, Thermometer, Wind, Map as MapIcon } from "lucide-react";
import type { GeoCity } from "../lib/api";

const LAYERS = [
  { key: "clouds", label: "Clouds", icon: Cloud },
  { key: "rain", label: "Rain", icon: CloudRain },
  { key: "temp", label: "Temperature", icon: Thermometer },
  { key: "wind", label: "Wind", icon: Wind },
] as const;

export default function MapCard({ city }: { city: GeoCity }) {
  const [layer, setLayer] = useState<(typeof LAYERS)[number]["key"]>("clouds");

  const src =
    `https://embed.windy.com/embed2.html?lat=${city.latitude.toFixed(3)}&lon=${city.longitude.toFixed(3)}` +
    `&detailLat=${city.latitude.toFixed(3)}&detailLon=${city.longitude.toFixed(3)}` +
    `&zoom=6&level=surface&overlay=${layer}&product=ecmwf&menu=&message=&marker=true` +
    `&calendar=now&pressure=&type=map&location=coordinates&metricWind=km%2Fh&metricTemp=%C2%B0C&radarRange=-1`;

  return (
    <section className="anim-fade-up anim-d-4 card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-hoverblue text-primary"><MapIcon size={18} /></span>
          <div>
            <h2 className="text-lg font-bold leading-tight text-ink">Interactive Weather Map</h2>
            <p className="text-xs text-inkmuted">Live layers around {city.name}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {LAYERS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLayer(l.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${
                layer === l.key
                  ? "border-primary bg-primary text-white shadow-sm shadow-blue-200"
                  : "border-line bg-white text-inkmuted hover:bg-hoverblue hover:text-primary"
              }`}
            >
              <l.icon size={13} /> {l.label}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[380px] sm:h-[440px] bg-hoverblue">
        <iframe
          key={`${layer}-${city.latitude}-${city.longitude}`}
          title="Weather map"
          src={src}
          className="h-full w-full border-0"
          loading="lazy"
        />
      </div>
    </section>
  );
}
