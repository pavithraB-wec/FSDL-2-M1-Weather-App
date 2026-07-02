import { CloudSun, CloudOff, Search } from "lucide-react";

export function LoadingSkeleton() {
  return (
    <div className="anim-fade-in space-y-8" aria-busy>
      {/* Hero skeleton */}
      <div className="card p-6 sm:p-8">
        <div className="skeleton h-6 w-64" />
        <div className="mt-6 flex items-center gap-6">
          <div className="skeleton h-24 w-24 rounded-3xl" />
          <div className="space-y-3">
            <div className="skeleton h-16 w-48" />
            <div className="skeleton h-4 w-36" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton h-16" />)}
        </div>
      </div>
      {/* Highlights skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-32" />)}
      </div>
      {/* Hourly skeleton */}
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 10 }).map((_, i) => <div key={i} className="skeleton h-40 w-[104px] shrink-0" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="skeleton h-80" />
        <div className="skeleton h-80" />
      </div>
    </div>
  );
}

export function EmptyState() {
  return (
    <div className="anim-fade-up card flex flex-col items-center px-6 py-16 text-center sm:py-24">
      <div className="relative">
        <div className="floaty grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-hoverblue to-skyblue">
          <CloudSun size={56} className="text-primary" strokeWidth={1.4} />
        </div>
        <span className="absolute -bottom-1 -right-1 grid h-10 w-10 place-items-center rounded-full border-4 border-white bg-primary text-white">
          <Search size={16} />
        </span>
      </div>
      <h2 className="mt-7 text-xl font-bold text-ink">Welcome to SkyCast</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-inkmuted">
        Search for a city to view the latest weather forecast.
      </p>
    </div>
  );
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="anim-fade-up card flex flex-col items-center px-6 py-16 text-center sm:py-24">
      <div className="floaty grid h-28 w-28 place-items-center rounded-full bg-red-50">
        <CloudOff size={56} className="text-red-400" strokeWidth={1.4} />
      </div>
      <h2 className="mt-7 text-xl font-bold text-ink">Oops! We couldn't find that city.</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-inkmuted">
        Try another location, or check your spelling and internet connection.
      </p>
      <button
        onClick={onRetry}
        className="ripple-btn mt-6 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-600 active:scale-95"
      >
        Try Again
      </button>
    </div>
  );
}
