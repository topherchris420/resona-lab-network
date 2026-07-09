import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Activity, ArrowRight, Gauge, Waves, Wifi, WifiOff, Zap } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Types                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Shape of the telemetry payload produced by the backend Dynamic Resonance
 * Rooting (DRR) computational engine. In production this arrives over a
 * websocket; here it is derived reactively from the on-screen controls so the
 * card can act as a live UI simulation bridge.
 */
export interface DRRTelemetryData {
  /** Normalized 0.00 → 1.00 measure of how deeply the shock propagates. */
  resonanceDepth: number;
  /** Human readable dominant oscillation frequency, e.g. "0.034 Hz". */
  dominantFrequency: string;
  /** Discrete systemic health classification. */
  systemicStatus: "STABLE" | "COUPLING" | "CRITICAL";
  /** Directional rooting edges ranked by transmission weight. */
  significantEdges: Array<{ source: string; target: string; weight: number }>;
  /** Aggregate bank capital erosion, expressed as a percentage. */
  bankCapitalErosion: number;
}

/* -------------------------------------------------------------------------- */
/*  Status presentation tokens                                                */
/* -------------------------------------------------------------------------- */

const STATUS_TOKENS: Record<
  DRRTelemetryData["systemicStatus"],
  { label: string; dot: string; glow: string; text: string; flashing: boolean }
> = {
  STABLE: {
    label: "STABLE",
    dot: "bg-emerald-400",
    glow: "shadow-[0_0_12px_2px_rgba(52,211,153,0.8)]",
    text: "text-emerald-300",
    flashing: false,
  },
  COUPLING: {
    label: "COUPLING",
    dot: "bg-amber-400",
    glow: "shadow-[0_0_12px_2px_rgba(251,191,36,0.8)]",
    text: "text-amber-300",
    flashing: false,
  },
  CRITICAL: {
    label: "CRITICAL",
    dot: "bg-rose-500",
    glow: "shadow-[0_0_16px_3px_rgba(244,63,94,0.9)]",
    text: "text-rose-300",
    flashing: true,
  },
};

/* -------------------------------------------------------------------------- */
/*  Neon particle field                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Canvas-driven neon particle display. The animation speed scales directly with
 * `resonanceDepth`: the deeper the resonance, the faster the particles drift and
 * the more energetically they connect.
 */
function ParticleField({ intensity }: { intensity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Keep the latest intensity in a ref so the RAF loop reads live values
  // without being torn down and rebuilt on every slider tick.
  const intensityRef = useRef(intensity);
  intensityRef.current = intensity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const rect = canvas.getBoundingClientRect();
    const COUNT = 46;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5),
      vy: (Math.random() - 0.5),
      r: Math.random() * 1.6 + 0.6,
    }));

    // Cyan → Violet → Silver palette from the Resona system.
    const palette = ["6, 182, 212", "139, 92, 246", "203, 213, 225"];

    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      // Speed multiplier grows non-linearly with resonance depth.
      const speed = 0.35 + intensityRef.current * intensityRef.current * 3.2;

      ctx.clearRect(0, 0, w, h);

      particles.forEach((p, i) => {
        p.x += p.vx * speed;
        p.y += p.vy * speed;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        const color = palette[i % palette.length];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color}, ${0.5 + intensityRef.current * 0.4})`;
        ctx.shadowBlur = 8 + intensityRef.current * 14;
        ctx.shadowColor = `rgba(${color}, 0.9)`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Connective filaments — density rises with resonance depth.
      const linkDist = 70 + intensityRef.current * 60;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * (0.15 + intensityRef.current * 0.4);
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      aria-hidden
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Resonance Depth radial dial                                                */
/* -------------------------------------------------------------------------- */

/** Pure SVG radial ring that maps the exact resonance depth (0 → 1). */
function ResonanceDial({ value }: { value: number }) {
  const size = 132;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(1, value));
  const offset = circumference * (1 - clamped);

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="drrDialGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="55%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#drrDialGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 0.4s ease-out",
            filter: "drop-shadow(0 0 6px rgba(139,92,246,0.6))",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-semibold tracking-tight text-slate-100">
          {clamped.toFixed(2)}
        </span>
        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
          Depth
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Small presentational helpers                                              */
/* -------------------------------------------------------------------------- */

function MetricCell({
  icon,
  label,
  value,
  accent = "text-cyan-300",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 shadow-[inset_0_0_20px_-14px_rgba(6,182,212,0.6)]">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">
        {icon}
        {label}
      </div>
      <div className={`mt-1 text-lg font-semibold tracking-tight ${accent}`}>
        {value}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Main component                                                             */
/* -------------------------------------------------------------------------- */

/**
 * MacroTelemetryCard — a live UI simulation bridge for the "Macro Stability
 * Track". Positioning the Treasury Term-Premium shock slider (and toggling
 * AOCI inclusion) reactively rewrites the DRR telemetry state in real time.
 */
export default function MacroTelemetryCard() {
  /* ------------------------------ Controls ------------------------------ */
  const [termPremiumShock, setTermPremiumShock] = useState<number>(45); // bps
  const [aociInclusion, setAociInclusion] = useState<boolean>(true);

  /* --------------------------- Derived state ---------------------------- */
  const [telemetry, setTelemetry] = useState<DRRTelemetryData>({
    resonanceDepth: 0.24,
    dominantFrequency: "0.034 Hz",
    systemicStatus: "STABLE",
    significantEdges: [],
    bankCapitalErosion: 3.1,
  });

  // Static edge topology whose weights breathe with the shock magnitude.
  const baseEdges = useMemo(
    () => [
      { source: "U.S. 10Y Term Premium", target: "FX Swap Basis Spreads" },
      { source: "AOCI Unrealized Losses", target: "Tier-1 Capital Ratio" },
      { source: "Wholesale Funding Cost", target: "LFBO Liquidity Buffer" },
      { source: "MBS Duration Gap", target: "Deposit Beta Sensitivity" },
      { source: "Repo Haircut Spiral", target: "Interbank Contagion Index" },
    ],
    []
  );

  /**
   * Reactive DRR engine simulation. Any change to the term-premium shock or the
   * AOCI inclusion switch mathematically re-derives the full telemetry payload.
   */
  useEffect(() => {
    const shockNorm = termPremiumShock / 300; // 0 → 1
    const aociFactor = aociInclusion ? 1 : 0.6;

    // Resonance depth grows non-linearly with the shock, amplified by AOCI.
    let resonanceDepth = Math.min(
      1,
      0.15 + Math.pow(shockNorm, 1.4) * 0.85 * aociFactor
    );

    // Capital erosion deepens with the shock magnitude.
    let bankCapitalErosion = 2.4 + shockNorm * 6.5 * aociFactor;

    // Dominant frequency drifts upward as the system tightens.
    const dominantFrequency = `${(0.021 + shockNorm * 0.058 * aociFactor).toFixed(3)} Hz`;

    // Classify systemic status.
    let systemicStatus: DRRTelemetryData["systemicStatus"] = "STABLE";
    if (resonanceDepth > 0.55) systemicStatus = "COUPLING";

    // Critical override: heavy shock while AOCI losses are recognized.
    if (termPremiumShock > 150 && aociInclusion) {
      systemicStatus = "CRITICAL";
      resonanceDepth = Math.max(resonanceDepth, 0.82);
      // Under a mark-to-market cliff, recognized erosion re-rates below 6.5%.
      bankCapitalErosion = Math.min(bankCapitalErosion, 6.4);
    }

    const significantEdges = baseEdges
      .map((edge, i) => ({
        ...edge,
        weight: Math.min(
          0.99,
          0.32 + shockNorm * 0.6 * aociFactor + (baseEdges.length - i) * 0.03
        ),
      }))
      .sort((a, b) => b.weight - a.weight);

    setTelemetry({
      resonanceDepth,
      dominantFrequency,
      systemicStatus,
      significantEdges,
      bankCapitalErosion,
    });
  }, [termPremiumShock, aociInclusion, baseEdges]);

  const status = STATUS_TOKENS[telemetry.systemicStatus];

  return (
    <div
      className="relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-slate-950/40 p-6 shadow-[0_0_50px_-12px_rgba(6,182,212,0.15)] backdrop-blur-xl"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Neon particle backdrop — accelerates with resonance depth */}
      <ParticleField intensity={telemetry.resonanceDepth} />

      {/* Ambient gradient wash */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/[0.06] via-transparent to-violet-500/[0.08]" />

      <div className="relative">
        {/* ------------------------------ Header ------------------------------ */}
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                {status.flashing && (
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full ${status.dot} opacity-75`}
                  />
                )}
                <span
                  className={`relative inline-flex h-3 w-3 rounded-full ${status.dot} ${status.glow}`}
                />
              </span>
              <h2 className="text-lg font-semibold tracking-tight text-slate-100">
                DRR Systemic Core Matrix
              </h2>
            </div>
            <p className="mt-1 text-xs tracking-wide text-slate-400">
              Target Array: LFBO Wholesale Funding Nodes
            </p>
          </div>
          <div
            className={`flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold tracking-[0.14em] ${status.text}`}
          >
            <Activity className="h-3.5 w-3.5" />
            {status.label}
          </div>
        </header>

        {/* ------------------------------ Body ------------------------------- */}
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {/* Left: Telemetry metrics */}
          <section className="space-y-4">
            <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <ResonanceDial value={telemetry.resonanceDepth} />
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                  Resonance Depth
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  Normalized propagation of the term-premium shock across the
                  wholesale funding lattice.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <MetricCell
                icon={<Waves className="h-3 w-3" />}
                label="Dominant Freq."
                value={telemetry.dominantFrequency}
                accent="text-cyan-300"
              />
              <MetricCell
                icon={<Gauge className="h-3 w-3" />}
                label="Capital Erosion"
                value={`${telemetry.bankCapitalErosion.toFixed(1)}%`}
                accent="text-violet-300"
              />
            </div>
          </section>

          {/* Right: Directional rooting edge list */}
          <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">
              <Zap className="h-3 w-3" />
              Directional Rooting Edges
            </div>
            <ul className="mt-3 space-y-2">
              {telemetry.significantEdges.map((edge, i) => (
                <li
                  key={i}
                  className="group flex items-center justify-between gap-2 rounded-lg border border-white/[0.06] bg-slate-950/30 px-3 py-2 text-xs transition-colors hover:border-cyan-400/30"
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span className="truncate text-cyan-200/90">{edge.source}</span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-violet-400" />
                    <span className="truncate text-slate-300">{edge.target}</span>
                  </span>
                  <span className="shrink-0 rounded-md bg-violet-500/15 px-1.5 py-0.5 font-mono text-[11px] text-violet-200">
                    {edge.weight.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ---------------------------- Footer controls ---------------------- */}
        <footer className="mt-5 grid gap-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 md:grid-cols-2">
          {/* Term-premium shock slider */}
          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-200">
                Treasury Term-Premium Shock
              </label>
              <span className="font-mono text-xs text-cyan-300">
                {termPremiumShock} bps
              </span>
            </div>
            <Slider
              className="mt-3"
              value={[termPremiumShock]}
              min={0}
              max={300}
              step={1}
              onValueChange={(v) => setTermPremiumShock(v[0])}
            />
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              Simulated upward repricing of the risk-free curve's term premium,
              driving mark-to-market stress through duration-heavy books.
            </p>
          </div>

          {/* AOCI inclusion switch */}
          <div className="flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-200">
                AOCI Inclusion Mode
              </label>
              <Switch
                checked={aociInclusion}
                onCheckedChange={setAociInclusion}
              />
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              When enabled, accumulated other comprehensive income losses are
              recognized against regulatory capital — surfacing latent
              unrealized securities depreciation.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
