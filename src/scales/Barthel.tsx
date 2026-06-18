import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// Barthel Modificado por Shah et al. (1989)
// Mismos 10 ítems, 5 niveles por ítem, total 0-100
const ITEMS = [
  {
    key: 'comer',
    label: 'Alimentación',
    options: [
      { label: 'Incapaz — necesita ser alimentado', value: 0 },
      { label: 'Necesita ayuda importante (cortar, etc.)', value: 2 },
      { label: 'Necesita ayuda moderada', value: 5 },
      { label: 'Necesita ayuda mínima (preparar bandeja)', value: 8 },
      { label: 'Independiente', value: 10 },
    ],
  },
  {
    key: 'banyo',
    label: 'Baño / Ducha',
    options: [
      { label: 'Dependiente', value: 0 },
      { label: 'Necesita ayuda importante', value: 1 },
      { label: 'Necesita ayuda moderada', value: 3 },
      { label: 'Necesita ayuda mínima', value: 4 },
      { label: 'Independiente', value: 5 },
    ],
  },
  {
    key: 'aseo',
    label: 'Aseo personal',
    options: [
      { label: 'Necesita ayuda completa', value: 0 },
      { label: 'Necesita ayuda importante', value: 1 },
      { label: 'Necesita ayuda moderada', value: 3 },
      { label: 'Necesita ayuda mínima', value: 4 },
      { label: 'Independiente (cara, pelo, dientes)', value: 5 },
    ],
  },
  {
    key: 'vestido',
    label: 'Vestido',
    options: [
      { label: 'Dependiente', value: 0 },
      { label: 'Necesita ayuda importante', value: 2 },
      { label: 'Necesita ayuda moderada', value: 5 },
      { label: 'Necesita ayuda mínima', value: 8 },
      { label: 'Independiente (incluye botones, cremallera)', value: 10 },
    ],
  },
  {
    key: 'heces',
    label: 'Control intestinal (heces)',
    options: [
      { label: 'Incontinente', value: 0 },
      { label: 'Accidente frecuente (≥1/semana)', value: 2 },
      { label: 'Accidente ocasional (< 1/semana)', value: 5 },
      { label: 'Mínimos accidentes (enemas/supositorios)', value: 8 },
      { label: 'Continente', value: 10 },
    ],
  },
  {
    key: 'orina',
    label: 'Control vesical (orina)',
    options: [
      { label: 'Incontinente o sondado', value: 0 },
      { label: 'Incontinente frecuente (≥1/día)', value: 2 },
      { label: 'Incontinente ocasional (< 1/día)', value: 5 },
      { label: 'Mínimos accidentes / necesita ayuda', value: 8 },
      { label: 'Continente', value: 10 },
    ],
  },
  {
    key: 'retrete',
    label: 'Uso del retrete',
    options: [
      { label: 'Dependiente', value: 0 },
      { label: 'Necesita ayuda importante', value: 2 },
      { label: 'Necesita ayuda moderada', value: 5 },
      { label: 'Necesita ayuda mínima', value: 8 },
      { label: 'Independiente', value: 10 },
    ],
  },
  {
    key: 'traslado',
    label: 'Traslado cama-sillón',
    options: [
      { label: 'Imposible — no puede sentarse', value: 0 },
      { label: 'Necesita ayuda de 2 personas', value: 3 },
      { label: 'Necesita ayuda de 1 persona', value: 8 },
      { label: 'Necesita supervisión / ayuda menor', value: 12 },
      { label: 'Independiente', value: 15 },
    ],
  },
  {
    key: 'deambulacion',
    label: 'Deambulación',
    options: [
      { label: 'Inmóvil', value: 0 },
      { label: 'Independiente en silla de ruedas ≥50m', value: 3 },
      { label: 'Camina con ayuda de 1 persona ≥50m', value: 8 },
      { label: 'Camina solo con ayuda técnica ≥50m', value: 12 },
      { label: 'Independiente ≥50m (puede usar bastón)', value: 15 },
    ],
  },
  {
    key: 'escaleras',
    label: 'Subir y bajar escaleras',
    options: [
      { label: 'Incapaz', value: 0 },
      { label: 'Necesita ayuda importante', value: 2 },
      { label: 'Necesita ayuda moderada', value: 5 },
      { label: 'Necesita ayuda mínima / supervisión', value: 8 },
      { label: 'Independiente (puede usar bastón)', value: 10 },
    ],
  },
] as const;

type ItemKey = (typeof ITEMS)[number]['key'];
type BarthelAnswers = Record<ItemKey, number>;
const INITIAL: BarthelAnswers = Object.fromEntries(ITEMS.map((i) => [i.key, 0])) as BarthelAnswers;

export function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score === 100) return { text: 'Independiente', severity: 'normal' };
  if (score >= 91) return { text: 'Dependencia leve', severity: 'mild' };
  if (score >= 61) return { text: 'Dependencia moderada', severity: 'moderate' };
  if (score >= 21) return { text: 'Dependencia grave', severity: 'severe' };
  return { text: 'Dependencia total', severity: 'severe' };
}

function buildReport(score: number, interp: string, a: BarthelAnswers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const detail = ITEMS.map((i) => {
    const opt = i.options.find((o) => o.value === a[i.key]);
    return `  ${i.label}: ${a[i.key]} — ${opt?.label ?? ''}`;
  }).join('\n');
  return `Índice de Barthel Modificado (Shah) — ${date}
Puntuación total: ${score}/100 — ${interp}

${detail}

Referencia: 100 independiente · 91-99 leve · 61-90 moderada · 21-60 grave · 0-20 total`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function BarthelScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<BarthelAnswers>(INITIAL);
  const [touchedItems, setTouchedItems] = useState<Set<string>>(new Set());
  const score = Object.values(answers).reduce((a, b) => a + b, 0);
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="Barthel-Shah"
      subtitle="Índice de Barthel Modificado (Shah)"
      score={score}
      maxScore={100}
      interpretation={interpText}
      severity={severity}
      progress={{ answered: touchedItems.size, total: 10 }}
      onComplete={() =>
        onComplete({
          scaleId: 'barthel',
          scaleName: 'Barthel-Shah',
          score,
          maxScore: 100,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, answers),
          timestamp: Date.now(),
          answers: answers as Record<string, number>,
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, answers)}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-4 p-3 bg-warm-50 rounded-xl">
        Versión modificada de Shah et al. (1989). 5 niveles por ítem, mayor sensibilidad al cambio. Total
        0-100.
      </div>
      {ITEMS.map((item) => (
        <div key={item.key} className="mb-4">
          <div className="text-sm font-semibold text-slate-800 mb-2">{item.label}</div>
          <div className="space-y-1.5">
            {item.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, [item.key]: opt.value }));
                  setTouchedItems((prev) => {
                    const s = new Set(prev);
                    s.add(item.key);
                    return s;
                  });
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                  ${
                    answers[item.key] === opt.value && touchedItems.has(item.key)
                      ? 'bg-clinical-600 text-white border-clinical-600'
                      : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                  }`}
              >
                <span className="font-medium text-left leading-snug">{opt.label}</span>
                <span
                  className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0
                  ${answers[item.key] === opt.value && touchedItems.has(item.key) ? 'text-white/70' : 'text-slate-400'}`}
                >
                  {opt.value} pts
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </ScaleLayout>
  );
}
