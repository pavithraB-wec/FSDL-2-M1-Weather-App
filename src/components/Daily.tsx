import { Umbrella } from "lucide-react";
import type { WeatherBundle } from "../lib/api";
import { codeIcon, codeLabel, fmtTemp, isoToDayName, toF, type Unit } from "../lib/weatherUtils";
import WeatherIcon from "./WeatherIcon";

export default function Daily({ bundle, unit }: { bundle: WeatherBundle; unit: Unit }) {
  const days = bundle.daily.slice(0, 7);
  const globalMin = Math.min(...days.map((d) => d.tempMin));
  const globalMax = Math.max(...days.map((d) => d.tempMax));
  const span = Math.max(globalMax - globalMin, 1);

  return (
    <section className="anim-fade-up anim-d-3 card p-5 sm:p-6 h-full">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-bold text-ink">7-Day Forecast</h2>
        <span className="text-xs text-inkmuted">{unit === "c" ? "°Celsius" : "°Fahrenheit"}</span>
      </div>
      <ul className="divide-y divide-line">
        {days.map((d, i) => {
          const left = ((d.tempMin - globalMin) / span) * 100;
          const width = ((d.tempMax - d.tempMin) / span) * 100;
          return (
            <li key={d.date} className="group flex items-center gap-3 py-3 transition rounded-xl px-2 -mx-2 hover:bg-hoverblue/60">
              <span className={`w-[86px] shrink-0 text-sm font-semibold ${i === 0 ? "text-primary" : "text-ink"}`}>
                {isoToDayName(d.date, i)}
              </span>
              <WeatherIcon icon={codeIcon(d.weatherCode, true)} size={26} className="shrink-0" />
              <div className="hidden min-w-0 flex-1 sm:block">
                <p className="truncate text-xs text-inkmuted capitalize">{codeLabel(d.weatherCode)}</p>
              </div>
              <span className="inline-flex w-[52px] shrink-0 items-center gap-1 text-[11px] font-medium text-primary">
                <Umbrella size={11} /> {Math.round(d.precipProbability)}%
              </span>
              <span className="w-9 shrink-0 text-right text-sm font-medium text-inkmuted">
                {Math.round(unit === "c" ? d.tempMin : toF(d.tempMin))}°
              </span>
              <div className="relative hidden h-1.5 w-20 shrink-0 rounded-full bg-hoverblue md:block">
                <div
                  className="absolute h-full rounded-full bg-gradient-to-r from-cloudblue to-primary"
                  style={{ left: `${left}%`, width: `${Math.max(width, 8)}%` }}
                />
              </div>
              <span className="w-9 shrink-0 text-right text-sm font-bold text-ink">
                {fmtTemp(d.tempMax, unit)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
