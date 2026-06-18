import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

interface Props {
  onComplete: (r: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

const ITEMS = [
  {
    key: 'esfera',
    label: 'Esfera del reloj',
    desc: 'Dibuja un círculo cerrado',
    max: 2,
    opts: [
      '0 — No dibuja esfera o irreconocible',
      '1 — Esfera incompleta o con distorsión significativa',
      '2 — Esfera correcta y cerrada',
    ],
  },
  {
    key: 'numeros',
    label: 'Números',
    desc: 'Presencia, secuencia y disposición espacial de los 12 números',
    max: 4,
    opts: [
      '0 — Sin números o menos de 4',
      '1 — Algunos números, posición incorrecta',
      '2 — Todos los números, posición incorrecta',
      '3 — Todos los números, posición aproximada',
      '4 — Todos los números en posición correcta',
    ],
  },
  {
    key: 'manecillas',
    label: 'Manecillas',
    desc: 'Presencia, proporciones y posición (instrucción: marcar las 11 horas y 10 minutos)',
    max: 4,
    opts: [
      '0 — Sin manecillas o irreconocibles',
      '1 — Una sola manecilla o marca puntual',
      '2 — Dos manecillas sin diferenciar largo/corto',
      '3 — Manecillas diferenciadas pero hora incorrecta',
      '4 — Manecillas correctas marcando las 11h 10min',
    ],
  },
];

function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score >= 9) return { text: 'Normal', severity: 'normal' };
  if (score >= 7) return { text: 'Alteración leve', severity: 'mild' };
  if (score >= 4) return { text: 'Alteración moderada', severity: 'moderate' };
  return { text: 'Alteración grave', severity: 'severe' };
}

function buildReport(score: number, interp: string, answers: Record<string, number>): string {
  const date = new Date().toLocaleDateString('es-ES');
  return `Test del Reloj (versión Cacho) — ${date}
Puntuación total: ${score}/10 — ${interp}

• Esfera: ${answers.esfera ?? 0}/2
• Números: ${answers.numeros ?? 0}/4
• Manecillas (11h 10min): ${answers.manecillas ?? 0}/4

Puntos de corte: 9-10 normal · 7-8 alteración leve · 4-6 moderada · 0-3 grave
Referencia: Cacho J et al. Rev Neurol. 1999;28(7):648-655.
DOI: https://doi.org/10.33588/rn.2807.98295`;
}

// Clock face figure — blank circle for the examiner to show patient
function ClockFigure() {
  return (
    <div className="mb-4 flex items-start gap-4 flex-wrap">
      <div className="flex flex-col items-center">
        <div className="p-3 bg-white border border-slate-200 rounded-xl">
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="55" cy="55" r="48" stroke="#334155" strokeWidth="1.5" fill="white" />
            <circle cx="55" cy="55" r="2" fill="#334155" />
            {/* Hour markers */}
            {Array.from({ length: 12 }, (_, i) => {
              const angle = ((i * 30 - 90) * Math.PI) / 180;
              const x1 = 55 + 42 * Math.cos(angle);
              const y1 = 55 + 42 * Math.sin(angle);
              const x2 = 55 + 46 * Math.cos(angle);
              const y2 = 55 + 46 * Math.sin(angle);
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1.5" />;
            })}
          </svg>
        </div>
        <div className="text-[9px] text-slate-400 text-center mt-1 max-w-[110px]">
          Plantilla para el paciente
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div className="p-3 bg-white border border-slate-200 rounded-xl">
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="55" cy="55" r="48" stroke="#334155" strokeWidth="1.5" fill="white" />
            <circle cx="55" cy="55" r="2" fill="#334155" />
            {/* Numbers */}
            {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n, i) => {
              const angle = ((i * 30 - 90) * Math.PI) / 180;
              const x = 55 + 38 * Math.cos(angle);
              const y = 55 + 38 * Math.sin(angle);
              return (
                <text
                  key={n}
                  x={x}
                  y={y + 3.5}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="500"
                  fill="#334155"
                >
                  {n}
                </text>
              );
            })}
            {/* Hour hand: 11 */}
            <line
              x1="55"
              y1="55"
              x2={55 + 28 * Math.cos(((11 * 30 - 90) * Math.PI) / 180)}
              y2={55 + 28 * Math.sin(((11 * 30 - 90) * Math.PI) / 180)}
              stroke="#1e293b"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Minute hand: 10 (pointing to 2 = 60min? no — 10min = 60deg from 12 = pointing to 2) */}
            <line
              x1="55"
              y1="55"
              x2={55 + 35 * Math.cos(((60 - 90) * Math.PI) / 180)}
              y2={55 + 35 * Math.sin(((60 - 90) * Math.PI) / 180)}
              stroke="#1e293b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="text-[9px] text-slate-400 text-center mt-1 max-w-[110px]">
          Ejemplo correcto (11h 10min)
        </div>
      </div>
    </div>
  );
}

type Answers = Record<string, number>;
const INITIAL: Answers = { esfera: -1, numeros: -1, manecillas: -1 };

export function TestRelojScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const score = Object.values(answers).reduce((s, v) => s + (v >= 0 ? v : 0), 0);
  const { text: interpText, severity } = interpret(score);
  const allAnswered = Object.values(answers).every((v) => v >= 0);

  return (
    <ScaleLayout
      title="Test del Reloj"
      subtitle="Versión Cacho — Cribado visuoespacial"
      score={allAnswered ? score : '—'}
      maxScore={10}
      interpretation={allAnswered ? interpText : 'Sin completar'}
      severity={allAnswered ? severity : 'info'}
      onComplete={() =>
        onComplete({
          scaleId: 'reloj',
          scaleName: 'Test del Reloj',
          score,
          maxScore: 10,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, answers),
          timestamp: Date.now(),
          answers,
        })
      }
      onBack={onBack}
      reportText={allAnswered ? buildReport(score, interpText, answers) : ''}
      completeDisabled={!allAnswered}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-600 mb-3 p-3 bg-warm-50 rounded-xl leading-relaxed">
        Entregar al paciente un papel con el círculo dibujado. Pedir que escriba los números del reloj y
        marque las <strong>11 horas y 10 minutos</strong>. Puntuar cada sección por separado.
      </div>

      <ClockFigure />

      {ITEMS.map((item) => (
        <div key={item.key} className="mb-5">
          <div className="text-sm font-bold text-slate-800 mb-0.5">{item.label}</div>
          <div className="text-xs text-slate-400 mb-2">{item.desc}</div>
          <div className="space-y-1.5">
            {item.opts.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, [item.key]: i }));
                  onMarkDirty?.();
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all flex items-center justify-between
                  ${
                    answers[item.key] === i
                      ? 'bg-clinical-600 text-white border-clinical-600'
                      : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                  }`}
              >
                <span className="font-medium">{opt}</span>
                <span
                  className={`text-xs font-bold ml-3 flex-shrink-0 ${answers[item.key] === i ? 'text-white/70' : 'text-slate-300'}`}
                >
                  {i}/{item.max}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </ScaleLayout>
  );
}
