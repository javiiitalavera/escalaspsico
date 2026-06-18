import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

const ITEMS = [
  {
    key: 'comer',
    label: 'Alimentación',
    options: [
      { label: 'Independiente', value: 10 },
      { label: 'Necesita ayuda', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'banyo',
    label: 'Baño / Ducha',
    options: [
      { label: 'Independiente', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'aseo',
    label: 'Aseo personal',
    options: [
      { label: 'Independiente', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'vestido',
    label: 'Vestido',
    options: [
      { label: 'Independiente', value: 10 },
      { label: 'Necesita ayuda', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'heces',
    label: 'Control intestinal (heces)',
    options: [
      { label: 'Continente', value: 10 },
      { label: 'Accidente ocasional', value: 5 },
      { label: 'Incontinente', value: 0 },
    ],
  },
  {
    key: 'orina',
    label: 'Control vesical (orina)',
    options: [
      { label: 'Continente', value: 10 },
      { label: 'Accidente ocasional', value: 5 },
      { label: 'Incontinente', value: 0 },
    ],
  },
  {
    key: 'retrete',
    label: 'Uso del retrete',
    options: [
      { label: 'Independiente', value: 10 },
      { label: 'Necesita ayuda', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'traslado',
    label: 'Traslado cama-sillón',
    options: [
      { label: 'Independiente', value: 15 },
      { label: 'Mínima ayuda', value: 10 },
      { label: 'Gran ayuda', value: 5 },
      { label: 'Dependiente', value: 0 },
    ],
  },
  {
    key: 'deambulacion',
    label: 'Deambulación',
    options: [
      { label: 'Independiente ≥50m', value: 15 },
      { label: 'Ayuda ≥50m', value: 10 },
      { label: 'Silla de ruedas ≥50m', value: 5 },
      { label: 'Inmóvil', value: 0 },
    ],
  },
  {
    key: 'escaleras',
    label: 'Subir y bajar escaleras',
    options: [
      { label: 'Independiente', value: 10 },
      { label: 'Necesita ayuda', value: 5 },
      { label: 'Incapaz', value: 0 },
    ],
  },
] as const;

type ItemKey = (typeof ITEMS)[number]['key'];
type Answers = Record<ItemKey, number>;
const INITIAL: Answers = Object.fromEntries(ITEMS.map((i) => [i.key, 0])) as Answers;

export function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score === 100) return { text: 'Independiente', severity: 'normal' };
  if (score >= 91) return { text: 'Dependencia leve', severity: 'mild' };
  if (score >= 61) return { text: 'Dependencia moderada', severity: 'moderate' };
  if (score >= 21) return { text: 'Dependencia grave', severity: 'severe' };
  return { text: 'Dependencia total', severity: 'severe' };
}

function buildReport(score: number, interp: string, a: Answers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const detail = ITEMS.map((i) => {
    const opt = i.options.find((o) => o.value === a[i.key]);
    return `  ${i.label}: ${a[i.key]} — ${opt?.label ?? ''}`;
  }).join('\n');
  return `Índice de Barthel — ${date}\nPuntuación total: ${score}/100 — ${interp}\n\n${detail}\n\nReferencia: 100 independiente · 91-99 leve · 61-90 moderada · 21-60 grave · 0-20 total`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function BarthelBasicoScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const [touchedItems, setTouchedItems] = useState<Set<string>>(new Set());
  const score = Object.values(answers).reduce((a, b) => a + b, 0);
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="Barthel"
      subtitle="Índice de Barthel"
      score={score}
      maxScore={100}
      interpretation={interpText}
      severity={severity}
      progress={{ answered: touchedItems.size, total: 10 }}
      onComplete={() =>
        onComplete({
          scaleId: 'barthelbasico',
          scaleName: 'Índice de Barthel',
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
                <span className="font-medium text-left">{opt.label}</span>
                <span
                  className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0 ${answers[item.key] === opt.value && touchedItems.has(item.key) ? 'text-white/70' : 'text-slate-400'}`}
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
