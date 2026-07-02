import { useMemo } from "react";
import type { Scene } from "../lib/weatherUtils";

/** Subtle full-page animated weather scene rendered behind the app. */
export default function WeatherBackground({ scene }: { scene: Scene }) {
  const rain = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        height: 44 + ((i * 13) % 40),
        duration: 0.85 + ((i * 7) % 10) / 14,
        delay: -((i * 11) % 20) / 10,
      })),
    []
  );
  const snow = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${(i * 41) % 100}%`,
        size: 4 + ((i * 5) % 6),
        duration: 6 + ((i * 3) % 6),
        delay: -((i * 13) % 60) / 10,
      })),
    []
  );
  const stars = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        left: `${(i * 53) % 100}%`,
        top: `${(i * 29) % 55}%`,
        size: 1.5 + ((i * 7) % 5) / 2,
        duration: 2 + ((i * 3) % 5),
        delay: ((i * 11) % 30) / 10,
      })),
    []
  );

  const gradient: Record<Scene, string> = {
    sunny: "linear-gradient(180deg,#DBF1FF 0%,#F5FBFF 45%,#F5FBFF 100%)",
    cloudy: "linear-gradient(180deg,#E3EFFB 0%,#F5FBFF 55%,#F5FBFF 100%)",
    rain: "linear-gradient(180deg,#D9E8F7 0%,#EDF6FE 55%,#F5FBFF 100%)",
    storm: "linear-gradient(180deg,#CBDCEF 0%,#E7F1FB 55%,#F5FBFF 100%)",
    snow: "linear-gradient(180deg,#EAF4FD 0%,#F7FCFF 55%,#F5FBFF 100%)",
    fog: "linear-gradient(180deg,#E8EFF6 0%,#F3F9FE 55%,#F5FBFF 100%)",
    night: "linear-gradient(180deg,#DCE7F8 0%,#EDF4FD 55%,#F5FBFF 100%)",
  };

  const showClouds = scene === "cloudy" || scene === "rain" || scene === "storm" || scene === "fog";

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" style={{ background: gradient[scene] }} aria-hidden>
      {/* Sun glow */}
      {scene === "sunny" && (
        <>
          <div className="sun-glow absolute -top-24 -right-24 h-96 w-96 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(253,224,71,.45) 0%, rgba(253,224,71,0) 70%)" }} />
          <div className="absolute top-10 right-10 h-24 w-24 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(251,191,36,.55) 0%, rgba(251,191,36,0) 72%)" }} />
        </>
      )}

      {/* Moon & stars */}
      {scene === "night" && (
        <>
          <div className="absolute top-14 right-16 h-16 w-16 rounded-full"
            style={{ background: "radial-gradient(circle at 35% 35%, #FEF9C3, #E0E7FF 70%)", boxShadow: "0 0 60px 18px rgba(199,210,254,.7)" }} />
          {stars.map((s, i) => (
            <span key={i} className="star" style={{
              left: s.left, top: s.top, width: s.size, height: s.size,
              animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`,
            }} />
          ))}
        </>
      )}

      {/* Drifting clouds */}
      {(showClouds || scene === "snow" || scene === "sunny") && (
        <>
          <CloudBlob top="6%" scale={1.1} duration={95} delay={-30} opacity={showClouds ? 0.9 : 0.5} />
          <CloudBlob top="16%" scale={0.75} duration={120} delay={-80} opacity={showClouds ? 0.75 : 0.4} />
          <CloudBlob top="27%" scale={0.9} duration={140} delay={-10} opacity={showClouds ? 0.6 : 0.3} />
        </>
      )}

      {/* Rain */}
      {(scene === "rain" || scene === "storm") &&
        rain.map((r, i) => (
          <span key={i} className="raindrop" style={{
            left: r.left, height: r.height,
            animationDuration: `${r.duration}s`, animationDelay: `${r.delay}s`,
          }} />
        ))}

      {/* Snow */}
      {scene === "snow" &&
        snow.map((s, i) => (
          <span key={i} className="snowflake" style={{
            left: s.left, width: s.size, height: s.size,
            animationDuration: `${s.duration}s`, animationDelay: `${s.delay}s`,
          }} />
        ))}

      {/* Lightning */}
      {scene === "storm" && <div className="lightning" />}

      {/* Fog layers */}
      {scene === "fog" && (
        <>
          <div className="absolute inset-x-0 top-1/4 h-32 blur-2xl" style={{ background: "rgba(226,232,240,.65)" }} />
          <div className="absolute inset-x-0 top-1/2 h-40 blur-3xl" style={{ background: "rgba(203,213,225,.5)" }} />
        </>
      )}
    </div>
  );
}

function CloudBlob({ top, scale, duration, delay, opacity }: {
  top: string; scale: number; duration: number; delay: number; opacity: number;
}) {
  return (
    <div className="cloud" style={{ top, animationDuration: `${duration}s`, animationDelay: `${delay}s`, opacity }}>
      <svg width={220 * scale} height={80 * scale} viewBox="0 0 220 80" fill="none">
        <ellipse cx="60" cy="52" rx="52" ry="26" fill="white" />
        <ellipse cx="120" cy="40" rx="58" ry="32" fill="white" />
        <ellipse cx="172" cy="54" rx="44" ry="22" fill="white" />
      </svg>
    </div>
  );
}
