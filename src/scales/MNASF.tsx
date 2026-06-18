import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

const ITEMS = [
  {
    key: 'ingesta',
    label: 'A. Ingesta alimentaria',
    question:
      '¿Ha comido menos por falta de apetito, problemas digestivos, dificultad para masticar o tragar en los últimos 3 meses?',
    options: [
      { label: 'Reducción grave', value: 0 },
      { label: 'Reducción moderada', value: 1 },
      { label: 'Sin reducción', value: 2 },
    ],
  },
  {
    key: 'peso',
    label: 'B. Pérdida de peso',
    question: 'Pérdida de peso en los últimos 3 meses',
    options: [
      { label: 'Pérdida > 3 kg', value: 0 },
      { label: 'No lo sabe', value: 1 },
      { label: 'Pérdida 1-3 kg', value: 2 },
      { label: 'Sin pérdida', value: 3 },
    ],
  },
  {
    key: 'movilidad',
    label: 'C. Movilidad',
    options: [
      { label: 'En cama o sillón', value: 0 },
      { label: 'Se levanta pero no sale', value: 1 },
      { label: 'Sale', value: 2 },
    ],
  },
  {
    key: 'estres',
    label: 'D. Enfermedad aguda o estrés psicológico',
    question: '¿Ha sufrido estrés psicológico o enfermedad aguda en los últimos 3 meses?',
    options: [
      { label: 'Sí', value: 0 },
      { label: 'No', value: 2 },
    ],
  },
  {
    key: 'neuropsico',
    label: 'E. Problemas neuropsicológicos',
    options: [
      { label: 'Demencia o depresión grave', value: 0 },
      { label: 'Demencia leve', value: 1 },
      { label: 'Sin problemas', value: 2 },
    ],
  },
  {
    key: 'imc',
    label: 'F. Índice de masa corporal (IMC)',
    question: 'Si no puede calcularse el IMC, usar la circunferencia de pantorrilla',
    options: [
      { label: 'IMC < 19', value: 0 },
      { label: 'IMC 19 – < 21', value: 1 },
      { label: 'IMC 21 – < 23', value: 2 },
      { label: 'IMC ≥ 23', value: 3 },
    ],
  },
] as const;

type ItemKey = (typeof ITEMS)[number]['key'];
type MNAAnswers = Record<ItemKey, number | null>;
const INITIAL: MNAAnswers = {
  ingesta: null,
  peso: null,
  movilidad: null,
  estres: null,
  neuropsico: null,
  imc: null,
};

function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score >= 12) return { text: 'Estado nutricional normal', severity: 'normal' };
  if (score >= 8) return { text: 'Riesgo de malnutrición', severity: 'moderate' };
  return { text: 'Malnutrición', severity: 'severe' };
}

function buildReport(score: number, interp: string, a: MNAAnswers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const detail = ITEMS.map((i) => {
    const val = a[i.key];
    const opt = val !== null ? (i.options.find((o) => o.value === val)?.label ?? '—') : 'N/R';
    return `  ${i.label}: ${opt} (${val ?? 'N/R'})`;
  }).join('\n');
  return `MNA-SF (Mini Nutritional Assessment Short Form) — ${date}
Puntuación total: ${score}/14 — ${interp}

${detail}

Referencia: ≥12 normal · 8-11 riesgo · <8 malnutrición`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function MNASFScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<MNAAnswers>(INITIAL);

  const answered = Object.values(answers).filter((v) => v !== null).length;
  const score = Object.values(answers).reduce((sum: number, v) => sum + (v ?? 0), 0);
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="MNA-SF"
      subtitle="Mini Nutritional Assessment Short Form"
      score={score}
      maxScore={14}
      interpretation={interpText}
      severity={severity}
      onComplete={() =>
        onComplete({
          scaleId: 'mnasf',
          scaleName: 'MNA-SF',
          score,
          maxScore: 14,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, answers),
          timestamp: Date.now(),
          answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v ?? 0])),
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, answers)}
      completeDisabled={answered < 6}
      progress={{ answered, total: 6 }}
      onMarkDirty={onMarkDirty}
    >
      {ITEMS.map((item) => (
        <div key={item.key} className="mb-4">
          <div className="text-sm font-semibold text-slate-800 mb-1">{item.label}</div>
          {'question' in item && (
            <div className="text-xs text-slate-500 mb-2 leading-relaxed">{item.question}</div>
          )}
          <div className="space-y-1.5">
            {item.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnswers((prev) => ({ ...prev, [item.key]: opt.value }))}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                  ${
                    answers[item.key] === opt.value
                      ? 'bg-clinical-600 text-white border-clinical-600'
                      : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                  }`}
              >
                <span className="font-medium text-left">{opt.label}</span>
                <span
                  className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0
                  ${answers[item.key] === opt.value ? 'text-white/70' : 'text-slate-400'}`}
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
