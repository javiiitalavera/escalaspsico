import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

const ITEMS = [
  'Siente que su familiar le pide más ayuda de la que realmente necesita',
  'Siente que, a causa del tiempo que dedica a su familiar, no tiene suficiente tiempo para usted',
  'Se siente agobiado/a al tener que cuidar a su familiar y tener que atender otras responsabilidades',
  'Siente vergüenza por la conducta de su familiar',
  'Se siente irritado/a cuando está cerca de su familiar',
  'Cree que la situación actual afecta negativamente a su relación con amigos u otros familiares',
  'Siente temor por el futuro que le espera a su familiar',
  'Siente que su familiar depende de usted',
  'Se siente tenso/a cuando está cerca de su familiar',
  'Siente que su salud se ha visto afectada por tener que cuidar a su familiar',
  'Siente que no tiene tanta intimidad como le gustaría a causa de su familiar',
  'Siente que su vida social se ha visto afectada negativamente por tener que cuidar a su familiar',
  'No se siente a gusto por haber dejado a su familiar en casa de otros',
  'Siente que su familiar le considera la única persona que le puede cuidar',
  'Cree que no tiene suficiente dinero para cuidar a su familiar, además de sus otros gastos',
  'Siente que no será capaz de cuidar a su familiar por mucho más tiempo',
  'Siente que ha perdido el control de su vida desde que empezó la enfermedad de su familiar',
  'Desearía poder dejar el cuidado de su familiar a otra persona',
  'Se siente inseguro/a sobre lo que debe hacer con su familiar',
  'Siente que debería hacer más por su familiar',
  'Cree que podría cuidar mejor a su familiar',
  'Globalmente, ¿qué grado de carga experimenta por el hecho de cuidar a su familiar?',
];

const OPTIONS = [
  { label: 'Nunca', value: 0 },
  { label: 'Casi nunca', value: 1 },
  { label: 'A veces', value: 2 },
  { label: 'Bastante a menudo', value: 3 },
  { label: 'Casi siempre', value: 4 },
];

export function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score < 22) return { text: 'Sin sobrecarga', severity: 'normal' };
  if (score <= 46) return { text: 'Sobrecarga leve', severity: 'mild' };
  return { text: 'Sobrecarga intensa', severity: 'severe' };
}

function buildReport(score: number, interp: string, answers: (number | null)[]): string {
  const date = new Date().toLocaleDateString('es-ES');
  const detail = ITEMS.map((item, i) => {
    const val = answers[i] ?? 0;
    const opt = OPTIONS.find((o) => o.value === val);
    return `  ${i + 1}. ${item.substring(0, 50)}...: ${val} (${opt?.label ?? ''})`;
  }).join('\n');
  return `Escala de Zarit (Sobrecarga del Cuidador) — ${date}\nPuntuación: ${score}/88 — ${interp}\n\n${detail}\n\nReferencia: <22 sin sobrecarga · 22-46 sobrecarga leve · ≥47 sobrecarga intensa`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function ZaritScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(22).fill(null));
  const answeredCount = answers.filter((v) => v !== null).length;
  const score = answers.reduce((a, b) => (a as number) + (b ?? 0), 0) as number;
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="Zarit"
      subtitle="Escala de Sobrecarga del Cuidador"
      score={score}
      maxScore={88}
      interpretation={interpText}
      severity={severity}
      onComplete={() =>
        onComplete({
          scaleId: 'zarit',
          scaleName: 'Zarit',
          score,
          maxScore: 88,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, answers),
          timestamp: Date.now(),
          answers: Object.fromEntries(answers.map((v, i) => [i, v ?? 0])),
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, answers)}
      completeDisabled={answers.some((v) => v === null)}
      progress={{ answered: answeredCount, total: 22 }}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-4 p-3 bg-warm-50 rounded-xl">
        Evalúa la sobrecarga subjetiva del cuidador principal. 22 ítems, escala 0-4 cada uno. Total 0-88.
      </div>
      {ITEMS.map((item, i) => (
        <div key={i} className="mb-5">
          <div className="text-sm font-semibold text-slate-800 mb-1">
            <span className="text-clinical-600 mr-1">{i + 1}.</span>
            {item}
          </div>
          <div className="space-y-1.5">
            {OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() =>
                  setAnswers((prev) => {
                    const n = [...prev];
                    n[i] = opt.value;
                    return n;
                  })
                }
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all text-sm
                  ${
                    answers[i] === opt.value
                      ? 'bg-clinical-600 text-white border-clinical-600'
                      : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                  }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span
                  className={`text-xs font-bold tabular-nums ml-3 ${answers[i] === opt.value ? 'text-white/70' : 'text-slate-400'}`}
                >
                  {opt.value}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </ScaleLayout>
  );
}
