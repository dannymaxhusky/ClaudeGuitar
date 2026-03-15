"use client";

import { getChordDiagram } from "@/data/chordDiagrams";

const STRING_COUNT = 6;
const FRET_COUNT = 4;
const STRING_SPACING = 18;
const FRET_SPACING = 20;
const MARGIN_TOP = 28;
const MARGIN_LEFT = 16;
const DOT_RADIUS = 7;

const WIDTH = MARGIN_LEFT * 2 + STRING_SPACING * (STRING_COUNT - 1);
const HEIGHT = MARGIN_TOP + FRET_SPACING * FRET_COUNT + 16;

interface Props {
  chordName: string;
  size?: "sm" | "md";
}

export default function ChordDiagram({ chordName, size = "md" }: Props) {
  const data = getChordDiagram(chordName);
  const scale = size === "sm" ? 0.75 : 1;

  if (!data) {
    return (
      <div
        className="flex items-center justify-center rounded bg-stone-100 text-stone-400 text-xs"
        style={{ width: WIDTH * scale, height: HEIGHT * scale }}
      >
        暂无指法
      </div>
    );
  }

  const baseFret = data.baseFret ?? 1;
  const showNut = baseFret === 1;

  const elements: React.ReactNode[] = [];

  // Nut (thick line at top when baseFret=1)
  if (showNut) {
    elements.push(
      <rect
        key="nut"
        x={MARGIN_LEFT}
        y={MARGIN_TOP - 4}
        width={STRING_SPACING * (STRING_COUNT - 1)}
        height={4}
        fill="#334155"
      />
    );
  } else {
    // Show base fret number
    elements.push(
      <text key="basefret" x={MARGIN_LEFT - 4} y={MARGIN_TOP + FRET_SPACING * 0.6}
        textAnchor="end" fontSize={10} fill="#6b7280">
        {baseFret}fr
      </text>
    );
  }

  // Fret lines
  for (let f = 0; f <= FRET_COUNT; f++) {
    const y = MARGIN_TOP + f * FRET_SPACING;
    elements.push(
      <line key={`fret-${f}`} x1={MARGIN_LEFT} y1={y}
        x2={MARGIN_LEFT + STRING_SPACING * (STRING_COUNT - 1)} y2={y}
        stroke="#94a3b8" strokeWidth={1} />
    );
  }

  // String lines
  for (let s = 0; s < STRING_COUNT; s++) {
    const x = MARGIN_LEFT + s * STRING_SPACING;
    elements.push(
      <line key={`str-${s}`} x1={x} y1={MARGIN_TOP} x2={x}
        y2={MARGIN_TOP + FRET_COUNT * FRET_SPACING}
        stroke="#94a3b8" strokeWidth={1} />
    );
  }

  // Barre
  if (data.barre) {
    const { fret, from, to } = data.barre;
    const y = MARGIN_TOP + (fret - baseFret + 0.5) * FRET_SPACING;
    const x1 = MARGIN_LEFT + from * STRING_SPACING;
    const x2 = MARGIN_LEFT + to * STRING_SPACING;
    elements.push(
      <rect key="barre" x={x1} y={y - DOT_RADIUS} width={x2 - x1}
        height={DOT_RADIUS * 2} rx={DOT_RADIUS} fill="#6366f1" />
    );
  }

  // Fret dots + open/muted markers
  data.frets.forEach((fret, stringIdx) => {
    // stringIdx 0 = low E (left side of diagram)
    const x = MARGIN_LEFT + stringIdx * STRING_SPACING;

    if (fret === null) {
      // Muted ×
      elements.push(
        <text key={`m-${stringIdx}`} x={x} y={MARGIN_TOP - 10}
          textAnchor="middle" fontSize={12} fill="#ef4444" fontWeight="bold">×</text>
      );
    } else if (fret === 0) {
      // Open ○
      elements.push(
        <circle key={`o-${stringIdx}`} cx={x} cy={MARGIN_TOP - 10}
          r={5} fill="none" stroke="#9ca3af" strokeWidth={1.5} />
      );
    } else {
      // Skip if covered by barre
      const isBarre = data.barre &&
        fret === data.barre.fret &&
        stringIdx >= data.barre.from &&
        stringIdx <= data.barre.to;
      if (!isBarre) {
        const y = MARGIN_TOP + (fret - baseFret + 0.5) * FRET_SPACING;
        elements.push(
          <circle key={`d-${stringIdx}`} cx={x} cy={y} r={DOT_RADIUS} fill="#6366f1" />
        );
        // Finger number
        const finger = data.fingers[stringIdx];
        if (finger) {
          elements.push(
            <text key={`f-${stringIdx}`} x={x} y={y + 4}
              textAnchor="middle" fontSize={9} fill="white" fontWeight="bold">
              {finger}
            </text>
          );
        }
      }
    }
  });

  return (
    <svg
      width={WIDTH * scale}
      height={HEIGHT * scale}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="block"
    >
      {elements}
    </svg>
  );
}
