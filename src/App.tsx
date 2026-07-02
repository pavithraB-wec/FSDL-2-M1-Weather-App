import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, Loader2 } from "lucide-react";
import { fetchWeatherBundle, reverseGeocode, type GeoCity, type WeatherBundle } from "./lib/api";
import { sceneFor, type Unit } from "./lib/weatherUtils";
import WeatherBackground from "./components/WeatherBackground";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Highlights from "./components/Highlights";
import Hourly from "./components/Hourly";
import Daily from "./components/Daily";
import Details from "./components/Details";
import { AirQualityCard, AlertsCard } from "./components/AirAlerts";
import MapCard from "./components/MapCard";
import Favorites from "./components/Favorites";
import Footer from "./components/Footer";
import { LoadingSkeleton, EmptyState, ErrorState } from "./components/States";

type Status = "idle" | "loading" | "ready" | "error";

export default function App() {
  const [unit, setUnit] = useState<Unit>(() => (localStorage.getItem("skycast-unit") as Unit) || "c");
  const [status, setStatus] = useState<Status>("idle");
  const [bundle, setBundle] = useState<WeatherBundle | null>(null);
  const [city, setCity] = useState<GeoCity | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [pull, setPull] = useState(0);
  const pullStart = useRef<number | null>(null);

  useEffect(() => localStorage.setItem("skycast-unit", unit), [unit]);

  const load = useCallback(async (c: GeoCity, soft = false) => {
    setCity(c);
    if (!soft) setStatus("loading");
    else setRefreshing(true);
    try {
      const b = await fetchWeatherBundle(c);
      setBundle(b);
      setStatus("ready");
    } catch {
      if (!soft) setStatus("error");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const useLocation = useCallback((silent = false) => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const c = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        load(c);
      },
      () => {
        setLocating(false);
        if (!silent) setStatus((s) => (s === "idle" ? "idle" : s));
      },
      { timeout: 8000, maximumAge: 300000 }
    );
  }, [load]);

  // Try current location silently on first visit
  useEffect(() => {
    const last = localStorage.getItem("skycast-last-city");
    if (last) {
      try {
        load(JSON.parse(last));
        return;
      } catch { /* fall through */ }
    }
    useLocation(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (city) localStorage.setItem("skycast-last-city", JSON.stringify(city));
  }, [city]);

  const refresh = useCallback(() => {
    if (city) load(city, true);
  }, [city, load]);

  // Auto refresh every 10 min
  useEffect(() => {
    const t = setInterval(() => refresh(), 10 * 60 * 1000);
    return () => clearInterval(t);
  }, [refresh]);

  // ---- Pull to refresh (touch) ----
  useEffect(() => {
    const onStart = (e: TouchEvent) => {
      if (window.scrollY <= 2) pullStart.current = e.touches[0].clientY;
      else pullStart.current = null;
    };
    const onMove = (e: TouchEvent) => {
      if (pullStart.current == null) return;
      const dy = e.touches[0].clientY - pullStart.current;
      if (dy > 0 && window.scrollY <= 2) setPull(Math.min(dy * 0.45, 90));
    };
    const onEnd = () => {
      if (pull >= 70) refresh();
      setPull(0);
      pullStart.current = null;
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend", onEnd);
    return () => {
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [pull, refresh]);

  const scene = bundle ? sceneFor(bundle.current.weatherCode, bundle.current.isDay) : "sunny";

  return (
    <div className="min-h-screen">
      <WeatherBackground scene={scene} />

      {/* Pull-to-refresh indicator */}
      <div
        className="pointer-events-none fixed left-1/2 top-2 z-50 -translate-x-1/2 transition-all"
        style={{ opacity: pull > 6 || refreshing ? 1 : 0, transform: `translate(-50%, ${Math.min(pull, 60)}px)` }}
      >
        <span className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white shadow-lg shadow-blue-100">
          {refreshing
            ? <Loader2 size={18} className="animate-spin text-primary" />
            : <ArrowDown size={18} className="text-primary transition-transform" style={{ transform: pull >= 70 ? "rotate(180deg)" : "none" }} />}
        </span>
      </div>

      <Navbar
        unit={unit}
        onUnitChange={setUnit}
        onSelectCity={(c) => load(c)}
        onUseLocation={() => useLocation(false)}
        onRefresh={refresh}
        refreshing={refreshing}
        locating={locating}
      />

      <main className="mx-auto max-w-7xl space-y-8 px-4 pb-4 pt-6 sm:px-6 sm:pt-8">
        {status === "loading" && <LoadingSkeleton />}
        {status === "error" && <ErrorState onRetry={() => (city ? load(city) : setStatus("idle"))} />}
        {status === "idle" && <EmptyState />}

        {status === "ready" && bundle && (
          <div key={`${bundle.city.latitude}-${bundle.city.longitude}-${bundle.fetchedAt}`} className="space-y-8">
            <Hero bundle={bundle} unit={unit} />
            <Highlights bundle={bundle} />
            <Hourly bundle={bundle} unit={unit} />
            <div className="grid gap-8 lg:grid-cols-2">
              <Daily bundle={bundle} unit={unit} />
              <div className="grid gap-8 content-start">
                <AirQualityCard bundle={bundle} />
                <AlertsCard bundle={bundle} />
              </div>
            </div>
            <Details bundle={bundle} unit={unit} />
            <MapCard city={bundle.city} />
          </div>
        )}

        <Favorites unit={unit} activeId={bundle?.city.id} onSelect={(c) => load(c)} />
      </main>

      <Footer />
    </div>
  );
}
