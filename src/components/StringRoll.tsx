"use client";

// Guitar strings from 6 (low E) to 1 (high e)
const STRINGS = [
  { num: 6, label: "E", color: "#ef4444", thickness: 3 },
  { num: 5, label: "A", color: "#f97316", thickness: 2.4 },
  { num: 4, label: "D", color: "#eab308", thickness: 1.8 },
  { num: 3, label: "G", color: "#4ade80", thickness: 1.4 },
  { num: 2, label: "B", color: "#60a5fa", thickness: 1.1 },
  { num: 1, label: "e", color: "#c084fc", thickness: 0.8 },
];

interface Props {
  pattern: string;       // "6 4 3 2 1 2" or "↓ ↓↑ ↑ ↓↑"
  currentStep?: number;  // animated highlight; -1 or undefined = static
  size?: "sm" | "md";
}

export default function StringRoll({ pattern, currentStep = -1, size = "md" }: Props) {
  const steps = pattern.trim().split(/\s+/).filter(Boolean);
  const isArpeggio = steps.every((s) => /^\d+$/.test(s));

  // ── Strum pattern: arrow labels ──────────────────────────────────────────
  if (!isArpeggio) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs text-stone-400 shrink-0">节奏</span>
        {steps.map((step, i) => (
          <span key={i}
            className={`inline-flex items-center justify-center min-w-[1.5rem] px-1 py-0.5 rounded text-xs font-bold font-mono transition-all duration-75 ${
              i === currentStep
                ? "bg-amber-500 text-white scale-125 shadow-lg shadow-amber-400/50"
                : "bg-stone-100 text-amber-700 border border-stone-200"
            }`}>
            {step}
          </span>
        ))}
      </div>
    );
  }

  // ── Arpeggio: string roll visualization ──────────────────────────────────
  const stepW = size === "sm" ? 22 : 30;
  const dotR = size === "sm" ? 5 : 7;
  const rowH = size === "sm" ? 18 : 24;

  return (
    <div className="space-y-0.5">
      {/* Step numbers header */}
      <div className="flex" style={{ paddingLeft: size === "sm" ? 28 : 36 }}>
        {steps.map((_, si) => (
          <div key={si}
            className={`text-center tabular-nums transition-colors duration-75 ${
              si === currentStep ? "text-amber-500 font-bold" : "text-stone-400"
            }`}
            style={{ width: stepW, fontSize: size === "sm" ? 9 : 10 }}>
            {si + 1}
          </div>
        ))}
      </div>

      {/* String rows */}
      {STRINGS.map(({ num, label, color, thickness }) => {
        const pluckedSteps = steps.reduce<number[]>((acc, s, i) => {
          if (parseInt(s) === num) acc.push(i);
          return acc;
        }, []);
        const hasPluck = pluckedSteps.length > 0;

        return (
          <div key={num} className="flex items-center">
            {/* Label */}
            <div className="text-right font-mono shrink-0"
              style={{
                width: size === "sm" ? 28 : 36,
                fontSize: size === "sm" ? 9 : 11,
                color,
                opacity: hasPluck ? 1 : 0.25,
                paddingRight: 4,
              }}>
              {num}{label}
            </div>

            {/* String line + dots */}
            <div className="relative flex items-center" style={{ height: rowH }}>
              {/* String line */}
              <div className="absolute inset-x-0"
                style={{
                  top: "50%",
                  transform: "translateY(-50%)",
                  height: thickness,
                  backgroundColor: color,
                  opacity: hasPluck ? 0.35 : 0.15,
                  width: steps.length * stepW,
                  borderRadius: 99,
                }}
              />
              {/* Step cells */}
              {steps.map((s, si) => {
                const hit = parseInt(s) === num;
                const active = hit && si === currentStep;
                return (
                  <div key={si}
                    className="relative flex items-center justify-center shrink-0"
                    style={{ width: stepW, height: rowH }}>
                    {hit && (
                      <div
                        className="rounded-full transition-all duration-75"
                        style={{
                          width: dotR * 2,
                          height: dotR * 2,
                          backgroundColor: color,
                          opacity: active ? 1 : 0.65,
                          transform: active ? "scale(1.5)" : "scale(1)",
                          boxShadow: active ? `0 0 10px 2px ${color}80` : "none",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
