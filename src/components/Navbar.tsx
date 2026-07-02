import { useEffect, useRef, useState } from "react";
import { CloudSun, Search, LocateFixed, RefreshCw, MapPin, Loader2 } from "lucide-react";
import { searchCities, type GeoCity } from "../lib/api";
import type { Unit } from "../lib/weatherUtils";

interface Props {
  unit: Unit;
  onUnitChange: (u: Unit) => void;
  onSelectCity: (c: GeoCity) => void;
  onUseLocation: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  locating: boolean;
}

export default function Navbar({ unit, onUnitChange, onSelectCity, onUseLocation, onRefresh, refreshing, locating }: Props) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<GeoCity[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setSuggestions([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await searchCities(query);
        setSuggestions(res);
        setOpen(true);
        setHighlight(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => window.clearTimeout(debounceRef.current);
  }, [query]);

  const pick = (c: GeoCity) => {
    onSelectCity(c);
    setQuery("");
    setSuggestions([]);
    setOpen(false);
  };

  const submit = async () => {
    if (highlight >= 0 && suggestions[highlight]) return pick(suggestions[highlight]);
    if (suggestions[0]) return pick(suggestions[0]);
    if (query.trim().length >= 2) {
      const res = await searchCities(query);
      if (res[0]) pick(res[0]);
    }
  };

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto max-w-7xl px-3 sm:px-6">
        <div className="rounded-b-3xl border border-t-0 border-line bg-navbar/90 backdrop-blur-md shadow-[0_8px_30px_-12px_rgba(59,130,246,.25)]">
          <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3">
            {/* Logo */}
            <a href="#" className="flex shrink-0 items-center gap-2" onClick={(e) => e.preventDefault()}>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-cloudblue text-white shadow-md shadow-blue-200">
                <CloudSun size={20} strokeWidth={2} />
              </span>
              <span className="hidden sm:block text-lg font-bold tracking-tight text-ink">
                Sky<span className="text-primary">Cast</span>
              </span>
            </a>

            {/* Search */}
            <div ref={boxRef} className="relative mx-auto w-full max-w-xl">
              <div className="flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 shadow-sm transition focus-within:border-secondary focus-within:ring-4 focus-within:ring-blue-100">
                {searching
                  ? <Loader2 size={18} className="shrink-0 animate-spin text-primary" />
                  : <Search size={18} className="shrink-0 text-inkmuted" />}
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => suggestions.length && setOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submit();
                    if (e.key === "ArrowDown") setHighlight((h) => Math.min(h + 1, suggestions.length - 1));
                    if (e.key === "ArrowUp") setHighlight((h) => Math.max(h - 1, -1));
                    if (e.key === "Escape") setOpen(false);
                  }}
                  placeholder="Search city..."
                  className="w-full bg-transparent text-sm text-ink placeholder-inkmuted outline-none"
                  aria-label="Search city"
                />
                <button
                  onClick={submit}
                  className="hidden sm:block shrink-0 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-600 active:scale-95"
                >
                  Search
                </button>
              </div>

              {open && suggestions.length > 0 && (
                <ul className="anim-fade-in absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-2xl border border-line bg-white shadow-xl shadow-blue-100">
                  {suggestions.map((c, i) => (
                    <li key={`${c.id}-${i}`}>
                      <button
                        onClick={() => pick(c)}
                        onMouseEnter={() => setHighlight(i)}
                        className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
                          i === highlight ? "bg-hoverblue" : "hover:bg-hoverblue"
                        }`}
                      >
                        <MapPin size={15} className="shrink-0 text-primary" />
                        <span className="font-medium text-ink">{c.name}</span>
                        <span className="truncate text-xs text-inkmuted">
                          {[c.admin1, c.country].filter(Boolean).join(", ")}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              <button
                onClick={onUseLocation}
                title="Use current location"
                className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-primary transition hover:bg-hoverblue active:scale-95"
              >
                {locating ? <Loader2 size={18} className="animate-spin" /> : <LocateFixed size={18} />}
              </button>

              <div className="flex items-center rounded-full border border-line bg-white p-1 text-xs font-bold">
                {(["c", "f"] as Unit[]).map((u) => (
                  <button
                    key={u}
                    onClick={() => onUnitChange(u)}
                    className={`rounded-full px-2.5 py-1.5 transition ${
                      unit === u ? "bg-primary text-white shadow-sm" : "text-inkmuted hover:text-primary"
                    }`}
                    aria-pressed={unit === u}
                  >
                    °{u.toUpperCase()}
                  </button>
                ))}
              </div>

              <button
                onClick={onRefresh}
                title="Refresh weather"
                className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-primary transition hover:bg-hoverblue active:scale-95"
              >
                <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
