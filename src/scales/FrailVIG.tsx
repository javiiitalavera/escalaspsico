import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// FRAIL-VIG — Amblàs-Novellas et al. Aten Primaria 2017
// 10 ítems, puntuación 0-10

const ITEMS = [
  {
    key: 'abvd',
    label: 'Dependencia en ABVD',
    description: 'Índice de Barthel ≤ 60 puntos',
    options: [
      { label: 'No (Barthel > 60)', value: 0 },
      { label: 'Sí (Barthel ≤ 60)', value: 1 },
    ],
  },
  {
    key: 'aivd',
    label: 'Dependencia en AIVD',
    description: 'Lawton-Brody ≤ 4 puntos (en mujeres), ≤ 2 (en hombres)',
    options: [
      { label: 'No', value: 0 },
      { label: 'Sí', value: 1 },
    ],
  },
  {
    key: 'mms',
    label: 'Deterioro cognitivo moderado-grave',
    description: 'MMSE ≤ 18 puntos (o GDS 5-7)',
    options: [
      { label: 'No', value: 0 },
      { label: 'Sí', value: 1 },
    ],
  },
  {
    key: 'ups',
    label: 'Úlceras por presión',
    description: 'Presencia de úlceras por presión activas (grado II o superior)',
    options: [
      { label: 'No', value: 0 },
      { label: 'Sí', value: 1 },
    ],
  },
  {
    key: 'multimorbilidad',
    label: 'Multimorbilidad',
    description: '3 o más enfermedades crónicas activas',
    options: [
      { label: 'No (< 3)', value: 0 },
      { label: 'Sí (≥ 3)', value: 1 },
    ],
  },
  {
    key: 'hospitalizacion',
    label: 'Hospitalización reciente',
    description: 'Ingreso hospitalario en los últimos 3 meses',
    options: [
      { label: 'No', value: 0 },
      { label: 'Sí', value: 1 },
    ],
  },
  {
    key: 'dispnea',
    label: 'Disnea',
    description: 'Disnea de moderados esfuerzos (MRC ≥ 3)',
    options: [
      { label: 'No', value: 0 },
      { label: 'Sí', value: 1 },
    ],
  },
  {
    key: 'anorexia',
    label: 'Anorexia / Pérdida de peso',
    description: 'Pérdida de peso > 5% en los últimos 3 meses o anorexia marcada',
    options: [
      { label: 'No', value: 0 },
      { label: 'Sí', value: 1 },
    ],
  },
  {
    key: 'delirium',
    label: 'Delirium de repetición',
    description: 'Dos o más episodios de delirium en el último año',
    options: [
      { label: 'No', value: 0 },
      { label: 'Sí', value: 1 },
    ],
  },
  {
    key: 'sintomas',
    label: 'Síntomas difíciles de controlar',
    description: 'Dolor, disnea, agitación u otros síntomas de difícil control',
    options: [
      { label: 'No', value: 0 },
      { label: 'Sí', value: 1 },
    ],
  },
] as const;

type ItemKey = (typeof ITEMS)[number]['key'];
type Answers = Partial<Record<ItemKey, number>>;

function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score <= 2) return { text: 'Situación de no fragilidad', severity: 'normal' };
  if (score <= 4) return { text: 'Fragilidad leve', severity: 'mild' };
  if (score <= 6) return { text: 'Fragilidad moderada', severity: 'moderate' };
  return { text: 'Fragilidad grave', severity: 'severe' };
}

function buildReport(score: number, interp: string, answers: Answers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const detail = ITEMS.map((i) => {
    const val = answers[i.key];
    const opt = i.options.find((o) => o.value === val);
    return `  ${i.label}: ${opt ? opt.label : 'No valorado'}`;
  }).join('\n');
  return `Índice FRAIL-VIG — ${date}
Puntuación: ${score}/10 — ${interp}

${detail}

Puntos de corte:
  0-2: No fragilidad
  3-4: Fragilidad leve
  5-6: Fragilidad moderada
  7-10: Fragilidad grave

Referencia: Amblàs-Novellas J et al. Aten Primaria. 2017;49(3):137-144.`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function FrailVIGScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const score = Object.values(answers).reduce((a, b) => a + (b ?? 0), 0);
  const { text: interpText, severity } = interpret(score);
  const answered = Object.keys(answers).length;

  return (
    <ScaleLayout
      title="FRAIL-VIG"
      subtitle="Índice FRAIL-VIG"
      score={score}
      maxScore={10}
      interpretation={interpText}
      severity={severity}
      onComplete={() =>
        onComplete({
          scaleId: 'frailvig',
          scaleName: 'FRAIL-VIG',
          score,
          maxScore: 10,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, answers),
          timestamp: Date.now(),
          answers: answers as Record<string, number>,
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, answers)}
      completeDisabled={answered < 10}
      progress={{ answered, total: 10 }}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-4 p-3 bg-warm-50 rounded-xl leading-relaxed">
        Instrumento de cribado de fragilidad avanzada. 10 ítems dicotómicos. Validado en población española.
        Amblàs-Novellas et al., Aten Primaria 2017.
      </div>

      {ITEMS.map((item, idx) => (
        <div key={item.key} className="mb-4">
          <div className="text-sm font-semibold text-slate-800 mb-0.5">
            <span className="text-clinical-600 mr-1">{idx + 1}.</span>
            {item.label}
          </div>
          <div className="text-xs text-slate-400 mb-2 leading-relaxed">{item.description}</div>
          <div className="flex gap-2">
            {item.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnswers((prev) => ({ ...prev, [item.key]: opt.value }))}
                className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                  ${
                    answers[item.key] === opt.value
                      ? opt.value === 1
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                  }`}
              >
                <span className="font-medium">{opt.label}</span>
                {opt.value === 1 && (
                  <span
                    className={`text-xs font-bold ml-2 ${answers[item.key] === 1 ? 'text-white/70' : 'text-slate-400'}`}
                  >
                    +1
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Progreso */}
      <div className="mt-2 mb-2 text-xs text-slate-400 text-right">{answered}/10 ítems respondidos</div>

      {/* Resumen cuando hay suficientes respuestas */}
      {answered >= 5 && (
        <div
          className={`mt-2 rounded-2xl border-2 p-4 text-center
          ${
            severity === 'normal'
              ? 'bg-emerald-50 border-emerald-200'
              : severity === 'mild'
                ? 'bg-yellow-50 border-yellow-200'
                : severity === 'moderate'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="text-2xl font-bold text-slate-800">
            {score}
            <span className="text-base font-normal text-slate-400">/10</span>
          </div>
          <div className="text-sm text-slate-600 mt-0.5">{interpText}</div>
        </div>
      )}
    </ScaleLayout>
  );
}
