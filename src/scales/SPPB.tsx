import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

const EQUILIBRIO_OPTS = [
  { label: 'Incapaz / < 10s pies juntos', value: 0 },
  { label: 'Pies juntos ≥10s, semitándem <10s', value: 1 },
  { label: 'Semitándem ≥10s, tándem <3s', value: 2 },
  { label: 'Tándem 3-9s', value: 3 },
  { label: 'Tándem ≥10s', value: 4 },
];

const MARCHA_OPTS = [
  { label: 'No puede / >8,7s', value: 0 },
  { label: '6,21 – 8,70s', value: 1 },
  { label: '4,82 – 6,20s', value: 2 },
  { label: '3,62 – 4,81s', value: 3 },
  { label: '< 3,62s', value: 4 },
];

const SILLA_OPTS = [
  { label: 'Incapaz sin brazos / >60s', value: 0 },
  { label: '>16,7s', value: 1 },
  { label: '13,70 – 16,69s', value: 2 },
  { label: '11,20 – 13,69s', value: 3 },
  { label: '≤11,19s', value: 4 },
];

function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score >= 10) return { text: 'Bajo riesgo / sin limitación', severity: 'normal' };
  if (score >= 7) return { text: 'Limitación leve', severity: 'mild' };
  if (score >= 4) return { text: 'Limitación moderada', severity: 'moderate' };
  return { text: 'Limitación grave / alto riesgo', severity: 'severe' };
}

function buildReport(score: number, interp: string, eq: number, marcha: number, silla: number): string {
  const date = new Date().toLocaleDateString('es-ES');
  return `SPPB (Short Physical Performance Battery) — ${date}
Puntuación total: ${score}/12 — ${interp}

• Equilibrio: ${eq}/4 — ${EQUILIBRIO_OPTS[eq]?.label}
• Velocidad de marcha 4m: ${marcha}/4 — ${MARCHA_OPTS[marcha]?.label}
• Levantarse de la silla ×5: ${silla}/4 — ${SILLA_OPTS[silla]?.label}`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

function OptionGroup({
  label,
  opts,
  value,
  onChange,
}: {
  label: string;
  opts: { label: string; value: number }[];
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-5">
      <div className="text-sm font-semibold text-slate-800 mb-2">{label}</div>
      <div className="space-y-2">
        {opts.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition-all
              ${value === o.value ? 'bg-clinical-600 text-white border-clinical-600' : 'bg-white text-slate-700 border-slate-200'}`}
          >
            <span className="font-semibold mr-2">{o.value}</span>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SPPBScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [eq, setEq] = useState(0);
  const [marcha, setMarcha] = useState(0);
  const [silla, setSilla] = useState(0);
  const score = eq + marcha + silla;
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="SPPB"
      subtitle="Short Physical Performance Battery"
      score={score}
      maxScore={12}
      interpretation={interpText}
      severity={severity}
      onComplete={() =>
        onComplete({
          scaleId: 'sppb',
          scaleName: 'SPPB',
          score,
          maxScore: 12,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, eq, marcha, silla),
          timestamp: Date.now(),
          answers: { equilibrio: eq, marcha, silla },
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, eq, marcha, silla)}
      onMarkDirty={onMarkDirty}
    >
      <OptionGroup
        label="Equilibrio estático (posición de mayor dificultad lograda)"
        opts={EQUILIBRIO_OPTS}
        value={eq}
        onChange={setEq}
      />
      <OptionGroup
        label="Velocidad de marcha 4 metros"
        opts={MARCHA_OPTS}
        value={marcha}
        onChange={setMarcha}
      />
      <OptionGroup
        label="Levantarse de la silla 5 veces"
        opts={SILLA_OPTS}
        value={silla}
        onChange={setSilla}
      />
    </ScaleLayout>
  );
}
