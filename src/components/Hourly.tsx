import { Umbrella, Wind } from "lucide-react";
import type { WeatherBundle } from "../lib/api";
import { codeIcon, fmtTemp, isoToHourLabel, next24Hours, type Unit } from "../lib/weatherUtils";
import WeatherIcon from "./WeatherIcon";

export default function Hourly({ bundle, unit }: { bundle: WeatherBundle; unit: Unit }) {
  const hours = next24Hours(bundle);

  return (
    <section className="anim-fade-up anim-d-2">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-ink">Hourly Forecast</h2>
        <span className="text-xs text-inkmuted">Next 24 hours</span>
      </div>
      <div className="scroll-x -mx-1 flex gap-3 overflow-x-auto px-1 pb-3">
        {hours.map((h, i) => (
          <div
            key={h.time}
            className={`card lift flex min-w-[104px] shrink-0 flex-col items-center gap-2 px-3 py-4 ${
              i === 0 ? "border-secondary ring-2 ring-blue-100" : ""
            }`}
          >
            <span className={`text-xs font-semibold ${i === 0 ? "text-primary" : "text-inkmuted"}`}>
              {i === 0 ? "Now" : isoToHourLabel(h.time)}
            </span>
            <WeatherIcon icon={codeIcon(h.weatherCode, h.isDay)} size={34} />
            <span className="text-lg font-bold text-ink">{fmtTemp(h.temperature, unit)}</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
              <Umbrella size={11} /> {Math.round(h.precipProbability)}%
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-inkmuted">
              <Wind size={11} /> {Math.round(h.windSpeed)} km/h
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
