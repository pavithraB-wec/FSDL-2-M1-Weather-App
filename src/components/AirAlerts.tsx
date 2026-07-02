import { AlertTriangle, Leaf, ShieldCheck, Siren } from "lucide-react";
import type { WeatherBundle } from "../lib/api";
import { aqiInfo, deriveAlerts } from "../lib/weatherUtils";

export function AirQualityCard({ bundle }: { bundle: WeatherBundle }) {
  const { air } = bundle;
  const has = air.usAqi != null;
  const info = has ? aqiInfo(air.usAqi!) : null;
  const pct = has ? Math.min((air.usAqi! / 300) * 100, 100) : 0;

  return (
    <section className="anim-fade-up anim-d-4 card p-5 sm:p-6 h-full">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-hoverblue text-primary"><Leaf size={18} /></span>
        <div>
          <h2 className="text-lg font-bold leading-tight text-ink">Air Quality</h2>
          <p className="text-xs text-inkmuted">US AQI · {bundle.city.name}</p>
        </div>
      </div>

      {has ? (
        <>
          <div className="flex items-end gap-3">
            <span className="text-5xl font-extrabold tracking-tight" style={{ color: info!.color }}>
              {Math.round(air.usAqi!)}
            </span>
            <span
              className="mb-1.5 rounded-full px-3 py-1 text-xs font-bold text-white"
              style={{ background: info!.color }}
            >
              {info!.level}
            </span>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full"
            style={{ background: "linear-gradient(90deg,#22C55E,#F59E0B,#F97316,#EF4444,#A855F7)" }}>
            <div className="relative h-full">
              <span
                className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 -translate-x-1/2 rounded-full border-2 border-white bg-ink shadow"
                style={{ left: `${pct}%` }}
              />
            </div>
          </div>

          <p className="mt-4 flex items-start gap-2 rounded-xl bg-hoverblue/70 p-3 text-xs leading-relaxed text-ink">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-primary" />
            {info!.advice}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
            {[
              ["PM2.5", air.pm25], ["PM10", air.pm10], ["O₃", air.ozone], ["NO₂", air.no2],
            ].map(([k, v]) => (
              <div key={k as string} className="rounded-xl border border-line bg-white px-2 py-2">
                <p className="text-[10px] font-medium uppercase tracking-wide text-inkmuted">{k as string}</p>
                <p className="text-sm font-bold text-ink">{v != null ? (v as number).toFixed(1) : "—"}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-inkmuted">Air quality data is unavailable for this location.</p>
      )}
    </section>
  );
}

export function AlertsCard({ bundle }: { bundle: WeatherBundle }) {
  const alerts = deriveAlerts(bundle);

  return (
    <section className="anim-fade-up anim-d-4 card p-5 sm:p-6 h-full">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-500"><Siren size={18} /></span>
        <div>
          <h2 className="text-lg font-bold leading-tight text-ink">Weather Alerts</h2>
          <p className="text-xs text-inkmuted">Conditions monitored for {bundle.city.name}</p>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50/70 p-4">
          <ShieldCheck size={22} className="shrink-0 text-green-500" />
          <div>
            <p className="text-sm font-semibold text-ink">No active alerts</p>
            <p className="text-xs text-inkmuted">Conditions look calm — no severe weather expected right now.</p>
          </div>
        </div>
      ) : (
        <ul className="space-y-3">
          {alerts.map((a) => (
            <li
              key={a.title}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                a.severity === "danger" ? "border-red-100 bg-red-50/70" : "border-amber-100 bg-amber-50/70"
              }`}
            >
              <AlertTriangle
                size={20}
                className={`mt-0.5 shrink-0 ${a.severity === "danger" ? "text-red-500" : "text-amber-500"}`}
              />
              <div>
                <p className="text-sm font-bold text-ink">{a.title}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-inkmuted">{a.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
