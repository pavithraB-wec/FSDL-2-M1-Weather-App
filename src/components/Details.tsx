import {
  Droplets, Navigation2, Gauge, Cloud, Eye, CloudDrizzle, Thermometer, Sunrise, Sunset,
} from "lucide-react";
import type { WeatherBundle } from "../lib/api";
import { fmtTemp, isoToClock, moonPhase, next24Hours, windCompass, type Unit } from "../lib/weatherUtils";

export default function Details({ bundle, unit }: { bundle: WeatherBundle; unit: Unit }) {
  const { current, daily } = bundle;
  const h0 = next24Hours(bundle)[0];
  const moon = moonPhase();

  const items = [
    { icon: Droplets, label: "Humidity", value: `${current.humidity}%`, sub: "Relative humidity" },
    {
      icon: Navigation2, label: "Wind Direction",
      value: windCompass(current.windDirection), sub: `${Math.round(current.windDirection)}° bearing`,
      rotate: current.windDirection,
    },
    { icon: Gauge, label: "Pressure", value: `${Math.round(current.pressure)} hPa`, sub: "Sea level" },
    { icon: Cloud, label: "Cloud Coverage", value: `${current.cloudCover}%`, sub: current.cloudCover > 70 ? "Mostly cloudy" : current.cloudCover > 30 ? "Partly cloudy" : "Mostly clear" },
    { icon: Eye, label: "Visibility", value: `${((h0?.visibility ?? 0) / 1000).toFixed(1)} km`, sub: "Horizontal range" },
    { icon: CloudDrizzle, label: "Dew Point", value: fmtTemp(h0?.dewPoint ?? 0, unit, true), sub: "Moisture saturation" },
    { icon: Thermometer, label: "Feels Like", value: fmtTemp(current.apparentTemperature, unit, true), sub: "Apparent temperature" },
    { icon: Sunrise, label: "Sunrise", value: isoToClock(daily[0].sunrise), sub: "Local time" },
    { icon: Sunset, label: "Sunset", value: isoToClock(daily[0].sunset), sub: "Local time" },
    { icon: null, label: "Moon Phase", value: moon.name, sub: `${moon.illumination}% illuminated`, emoji: moon.emoji },
  ];

  return (
    <section className="anim-fade-up anim-d-3">
      <h2 className="mb-4 text-lg font-bold text-ink">Weather Details</h2>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
        {items.map((it) => (
          <div key={it.label} className="card lift flex flex-col p-4">
            <div className="flex items-center gap-2 text-inkmuted">
              {it.icon ? (
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-hoverblue text-primary">
                  <it.icon
                    size={16}
                    style={"rotate" in it && it.rotate != null ? { transform: `rotate(${it.rotate}deg)` } : undefined}
                  />
                </span>
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-hoverblue text-base">{(it as any).emoji}</span>
              )}
              <span className="text-xs font-medium">{it.label}</span>
            </div>
            <p className="mt-3 text-lg font-bold text-ink">{it.value}</p>
            <p className="mt-0.5 text-[11px] text-inkmuted">{it.sub}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
