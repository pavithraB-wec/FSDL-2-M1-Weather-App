import { useEffect, useState } from "react";
import { MapPin, Droplets, Wind, Gauge, Eye, Sun as SunIcon, Sunrise, Sunset, Thermometer, Clock } from "lucide-react";
import type { WeatherBundle } from "../lib/api";
import {
  cityNow, codeIcon, codeLabel, fmtClock, fmtDate, fmtTemp, isoToClock, next24Hours, type Unit,
} from "../lib/weatherUtils";
import WeatherIcon from "./WeatherIcon";

export default function Hero({ bundle, unit }: { bundle: WeatherBundle; unit: Unit }) {
  const { city, current, daily } = bundle;
  const [now, setNow] = useState(() => cityNow(bundle.utcOffsetSeconds));

  useEffect(() => {
    setNow(cityNow(bundle.utcOffsetSeconds));
    const t = setInterval(() => setNow(cityNow(bundle.utcOffsetSeconds)), 30_000);
    return () => clearInterval(t);
  }, [bundle]);

  const uvNow = next24Hours(bundle)[0]?.uvIndex ?? 0;
  const visKm = (next24Hours(bundle)[0]?.visibility ?? 0) / 1000;

  const stats = [
    { icon: Thermometer, label: "Feels Like", value: fmtTemp(current.apparentTemperature, unit) },
    { icon: Droplets, label: "Humidity", value: `${current.humidity}%` },
    { icon: Wind, label: "Wind", value: `${Math.round(current.windSpeed)} km/h` },
    { icon: Gauge, label: "Pressure", value: `${Math.round(current.pressure)} hPa` },
    { icon: Eye, label: "Visibility", value: `${visKm.toFixed(visKm < 10 ? 1 : 0)} km` },
    { icon: SunIcon, label: "UV Index", value: uvNow.toFixed(1) },
    { icon: Sunrise, label: "Sunrise", value: isoToClock(daily[0].sunrise) },
    { icon: Sunset, label: "Sunset", value: isoToClock(daily[0].sunset) },
  ];

  return (
    <section className="anim-fade-up card relative overflow-hidden p-6 sm:p-8 lg:p-10">
      {/* decorative gradient */}
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background: current.isDay
            ? "linear-gradient(115deg, rgba(224,242,254,.9) 0%, rgba(255,255,255,0) 55%), radial-gradient(circle at 90% -10%, rgba(186,230,253,.8), transparent 45%)"
            : "linear-gradient(115deg, rgba(224,231,255,.8) 0%, rgba(255,255,255,0) 55%), radial-gradient(circle at 90% -10%, rgba(199,210,254,.7), transparent 45%)",
        }}
      />
      <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        {/* Left — main reading */}
        <div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-inkmuted">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-hoverblue px-3 py-1 font-medium text-primary">
              <MapPin size={14} /> {city.name}{city.country ? `, ${city.country}` : ""}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock size={14} /> {fmtClock(now)}
            </span>
            <span>{fmtDate(now)}</span>
          </div>

          <div className="mt-5 flex items-center gap-4 sm:gap-7">
            <div className="floaty">
              <WeatherIcon icon={codeIcon(current.weatherCode, current.isDay)} size={104} strokeWidth={1.4} />
            </div>
            <div>
              <div className="text-6xl sm:text-7xl lg:text-8xl font-extralight leading-none tracking-tighter text-ink">
                {fmtTemp(current.temperature, unit)}
                <span className="align-top text-3xl font-light text-inkmuted">{unit === "c" ? "C" : "F"}</span>
              </div>
              <p className="mt-2 text-lg font-medium capitalize text-ink">{codeLabel(current.weatherCode)}</p>
              <p className="text-sm text-inkmuted">
                H: <span className="font-semibold text-ink">{fmtTemp(daily[0].tempMax, unit)}</span>
                <span className="mx-2 text-line">|</span>
                L: <span className="font-semibold text-ink">{fmtTemp(daily[0].tempMin, unit)}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right — stat grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 content-center">
          {stats.map((s) => (
            <div key={s.label} className="lift rounded-2xl border border-line bg-white/80 px-3.5 py-3 backdrop-blur-sm">
              <div className="flex items-center gap-1.5 text-inkmuted">
                <s.icon size={14} className="text-secondary" />
                <span className="text-[11px] font-medium uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="mt-1 text-base font-semibold text-ink">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
