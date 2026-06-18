import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

const ITEMS = [
  {
    key: 'fatigue',
    label: 'Fatiga',
    question: '¿Se ha sentido cansado/a la mayor parte del tiempo durante las últimas 4 semanas?',
    yes: 1,
    no: 0,
  },
  {
    key: 'resistance',
    label: 'Resistencia',
    question: '¿Tiene dificultad para subir un tramo de escaleras sin descansar?',
    yes: 1,
    no: 0,
  },
  {
    key: 'ambulation',
    label: 'Deambulación',
    question: '¿Tiene dificultad para caminar 100 metros sin descansar?',
    yes: 1,
    no: 0,
  },
  {
    key: 'illness',
    label: 'Enfermedades',
    question: '¿Tiene 5 o más enfermedades crónicas diagnosticadas?',
    yes: 1,
    no: 0,
  },
  {
    key: 'loss',
    label: 'Pérdida de peso',
    question: '¿Ha perdido más del 5% de su peso corporal en el último año?',
    yes: 1,
    no: 0,
  },
] as const;

type ItemKey = (typeof ITEMS)[number]['key'];
type FRAILAnswers = Record<ItemKey, number | null>;
const INITIAL: FRAILAnswers = {
  fatigue: null,
  resistance: null,
  ambulation: null,
  illness: null,
  loss: null,
};

export function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score === 0) return { text: 'Robusto', severity: 'normal' };
  if (score <= 2) return { text: 'Pre-frágil', severity: 'mild' };
  return { text: 'Frágil', severity: 'severe' };
}

function buildReport(score: number, interp: string, a: FRAILAnswers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const detail = ITEMS.map(
    (i) => `  ${i.label}: ${a[i.key] === null ? 'N/R' : a[i.key] === 1 ? 'Sí' : 'No'}`,
  ).join('\n');
  return `FRAIL Scale — ${date}
Puntuación total: ${score}/5 — ${interp}

${detail}

Referencia: 0 = Robusto · 1-2 = Pre-frágil · 3-5 = Frágil`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function FRAILScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<FRAILAnswers>(INITIAL);

  const answered = Object.values(answers).filter((v) => v !== null).length;
  const score = Object.values(answers).reduce((sum: number, v) => sum + (v ?? 0), 0);
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="FRAIL"
      subtitle="Frailty Scale"
      score={score}
      maxScore={5}
      interpretation={interpText}
      severity={severity}
      onComplete={() =>
        onComplete({
          scaleId: 'frail',
          scaleName: 'FRAIL',
          score,
          maxScore: 5,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, answers),
          timestamp: Date.now(),
          answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v ?? 0])),
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, answers)}
      completeDisabled={answered < 5}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-4 p-3 bg-warm-50 rounded-xl">
        Autoadministrado o por entrevista. Cada ítem positivo suma 1 punto.
      </div>

      {ITEMS.map((item) => (
        <div key={item.key} className="mb-3">
          <div className="text-sm font-semibold text-slate-800 mb-1">{item.label}</div>
          <div className="text-xs text-slate-500 mb-2 leading-relaxed">{item.question}</div>
          <div className="flex gap-2">
            {[
              { label: 'No', value: 0 },
              { label: 'Sí', value: 1 },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAnswers((prev) => ({ ...prev, [item.key]: opt.value }))}
                className={`flex-1 h-12 rounded-xl text-sm font-semibold border transition-all
                  ${
                    answers[item.key] === opt.value
                      ? opt.value === 1
                        ? 'bg-clinical-600 text-white border-clinical-600'
                        : 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-white text-slate-600 border-slate-200 active:bg-slate-50'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </ScaleLayout>
  );
}
