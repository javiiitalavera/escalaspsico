import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// AD8 — Ascertain Dementia 8-item Informant Questionnaire
// Galvin JE et al. Neurology. 2005;65(4):559-564.

const ITEMS = [
  {
    key: 'juicio',
    label: 'Problemas con el juicio (p. ej., tomar malas decisiones, ser víctima de engaños)',
  },
  { key: 'actividad', label: 'Menor interés en aficiones o actividades habituales' },
  { key: 'repetir', label: 'Repite las mismas preguntas, relatos o comentarios' },
  {
    key: 'aprender',
    label: 'Dificultad para aprender a usar nuevos aparatos (mando a distancia, microondas, etc.)',
  },
  { key: 'fecha', label: 'Olvida el mes o el año en que estamos' },
  { key: 'finanzas', label: 'Dificultad para gestionar asuntos económicos (pagar facturas, llevar cuentas)' },
  { key: 'citas', label: 'Dificultad para recordar compromisos y citas' },
  { key: 'memoria', label: 'Problemas cotidianos de memoria y pensamiento' },
] as const;

type ItemKey = (typeof ITEMS)[number]['key'];
type Answer = 'si' | 'no' | 'nolo' | null;
type Answers = Record<ItemKey, Answer>;

const INITIAL: Answers = Object.fromEntries(ITEMS.map((i) => [i.key, null])) as Answers;

function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score <= 1) return { text: 'Deterioro cognitivo improbable', severity: 'normal' };
  return { text: 'Deterioro cognitivo probable', severity: 'moderate' };
}

function buildReport(score: number, interp: string, a: Answers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const labelMap: Record<string, string> = { si: 'Sí, ha cambiado', no: 'No ha cambiado', nolo: 'No lo sé' };
  const lines = ITEMS.map(
    (item, i) => `  ${i + 1}. ${item.label}: ${a[item.key] ? labelMap[a[item.key]!] : '—'}`,
  ).join('\n');
  return `AD8 — Cribado de deterioro cognitivo (informante) — ${date}
Puntuación: ${score}/8 — ${interp}
(Puntúan 1 los ítems respondidos "Sí, ha cambiado")

${lines}

Puntos de corte: 0-1 deterioro improbable · ≥2 deterioro probable
Referencia: Galvin JE et al. Neurology. 2005;65(4):559-564.`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function AD8Scale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const answeredCount = Object.values(answers).filter((v) => v !== null).length;
  const score = Object.values(answers).filter((v) => v === 'si').length;
  const { text: interpText, severity } = interpret(score);

  const set = (k: ItemKey, v: Answer) => {
    setAnswers((prev) => ({ ...prev, [k]: v }));
    onMarkDirty?.();
  };

  return (
    <ScaleLayout
      title="AD8"
      subtitle="Cribado de deterioro cognitivo — informante"
      score={score}
      maxScore={8}
      interpretation={interpText}
      severity={severity}
      progress={{ answered: answeredCount, total: 8 }}
      onComplete={() =>
        onComplete({
          scaleId: 'ad8',
          scaleName: 'AD8',
          score,
          maxScore: 8,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, answers),
          timestamp: Date.now(),
          answers: Object.fromEntries(ITEMS.map((i) => [i.key, answers[i.key] === 'si' ? 1 : 0])),
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, answers)}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-5 p-3 bg-warm-50 rounded-xl leading-relaxed">
        Completar con un <strong>familiar o cuidador</strong> que conozca bien al paciente. Preguntar si ha
        habido cambios respecto a cómo era hace unos años.
      </div>
      {ITEMS.map((item, idx) => (
        <div key={item.key} className="mb-4">
          <div className="text-sm font-semibold text-slate-800 mb-2">
            <span className="text-slate-400 mr-1.5">{idx + 1}.</span>
            {item.label}
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                value: 'si' as const,
                label: 'Sí, ha cambiado',
                color:
                  answers[item.key] === 'si'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-700 border-slate-200',
              },
              {
                value: 'no' as const,
                label: 'No ha cambiado',
                color:
                  answers[item.key] === 'no'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-slate-700 border-slate-200',
              },
              {
                value: 'nolo' as const,
                label: 'No lo sé',
                color:
                  answers[item.key] === 'nolo'
                    ? 'bg-slate-400 text-white border-slate-400'
                    : 'bg-white text-slate-500 border-slate-200',
              },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => set(item.key, opt.value)}
                className={`py-3 px-2 rounded-xl border text-xs font-semibold text-center transition-all active:opacity-80 ${opt.color}`}
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
