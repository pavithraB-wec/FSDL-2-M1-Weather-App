import { CloudSun, Code2, Mail, Globe, Database, Info } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-14 border-t border-line bg-navbar/70">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-cloudblue text-white">
                <CloudSun size={20} />
              </span>
              <span className="text-lg font-bold text-ink">Sky<span className="text-primary">Cast</span></span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-inkmuted">
              A fast, elegant weather platform delivering real-time conditions, hourly &amp; 7-day forecasts,
              air quality and severe weather insights for any city on Earth.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink">Resources</h3>
            <ul className="mt-3 space-y-2 text-sm text-inkmuted">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-2 transition hover:text-primary"><Info size={14} /> About SkyCast</a></li>
              <li><a href="https://open-meteo.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-primary"><Database size={14} /> API Source — Open-Meteo</a></li>
              <li><a href="https://www.windy.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition hover:text-primary"><Globe size={14} /> Map — Windy.com</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold text-ink">Connect</h3>
            <ul className="mt-3 space-y-2 text-sm text-inkmuted">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-2 transition hover:text-primary"><Code2 size={14} /> GitHub</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-2 transition hover:text-primary"><Mail size={14} /> Contact the Developer</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-line pt-6 text-xs text-inkmuted sm:flex-row">
          <p>© {new Date().getFullYear()} SkyCast Weather. All rights reserved.</p>
          <p>Real-time data · No account required · Built for speed</p>
        </div>
      </div>
    </footer>
  );
}
