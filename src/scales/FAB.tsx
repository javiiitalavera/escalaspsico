import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

interface Props {
  onComplete: (r: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

const SUBTESTS = [
  {
    key: 's1',
    name: 'Similitudes',
    desc: 'Conceptualización — ¿En qué se parecen el plátano y la naranja? (fruta); la mesa y la silla (mueble); el tulipán, la rosa y el margarita (flores). 3=3 correctas, 2=2, 1=1, 0=ninguna o respuesta concreta.',
    max: 3,
  },
  {
    key: 's2',
    name: 'Fluidez léxica',
    desc: 'Flexibilidad mental — «Diga el mayor número posible de palabras que empiecen por "S", pero no nombres propios ni derivados». 1 min. 3=≥9, 2=6-8, 1=3-5, 0=<3.',
    max: 3,
  },
  {
    key: 's3',
    name: 'Serie motora',
    desc: 'Programación — «Aprenda esta secuencia: puño, canto, palma». Demostrar 3 veces, luego el paciente repite. 3=6 correctas solo, 2=≥3 solo, 1=solo con imitación, 0=incapaz.',
    max: 3,
  },
  {
    key: 's4',
    name: 'Instrucciones conflictivas',
    desc: 'Sensibilidad a interferencia — «Golpee una vez cuando yo golpee dos, y dos veces cuando yo golpee una». 10 secuencias. 3=sin errores, 2=1-2 errores, 1=>2 errores pero no siempre imita, 0=imita siempre.',
    max: 3,
  },
  {
    key: 's5',
    name: 'Go/No-Go',
    desc: 'Control inhibitorio — «Golpee cuando diga 1, no golpee cuando diga 2». Secuencia 1-1-2-1-2-2-2-1-1-2. 3=sin errores, 2=1-2 errores, 1=>2 errores pero no siempre, 0=golpea siempre con 2.',
    max: 3,
  },
  {
    key: 's6',
    name: 'Comportamiento de prensión',
    desc: 'Autonomía ambiental — Examinar palmas sin decir nada. Si agarra: «No agarre mis manos», volver a ofrecer. 3=no agarra, 2=duda, 1=agarra sin instrucción, 0=agarra incluso con instrucción.',
    max: 3,
  },
];

function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score >= 16) return { text: 'Normal', severity: 'normal' };
  if (score >= 13) return { text: 'Disfunción frontal leve', severity: 'mild' };
  if (score >= 10) return { text: 'Disfunción frontal moderada', severity: 'moderate' };
  return { text: 'Disfunción frontal grave', severity: 'severe' };
}

function buildReport(score: number, interp: string, answers: Record<string, number>): string {
  const date = new Date().toLocaleDateString('es-ES');
  const detail = SUBTESTS.map((s) => `  ${s.name}: ${answers[s.key] ?? 0}/3`).join('\n');
  return `FAB (Frontal Assessment Battery) — ${date}
Puntuación total: ${score}/18 — ${interp}

${detail}

Puntos de corte: ≥16 normal · 13-15 leve · 10-12 moderado · <10 grave
Referencia: Dubois B et al. Neurology. 2000;55(11):1621-1626.`;
}

export function FABScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const score = SUBTESTS.reduce((s, t) => s + (answers[t.key] ?? 0), 0);
  const answered = Object.keys(answers).length;
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="FAB"
      subtitle="Frontal Assessment Battery"
      score={score}
      maxScore={18}
      interpretation={interpText}
      severity={severity}
      onComplete={() =>
        onComplete({
          scaleId: 'fab',
          scaleName: 'FAB',
          score,
          maxScore: 18,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, answers),
          timestamp: Date.now(),
          answers,
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, answers)}
      completeDisabled={answered < 6}
      progress={{ answered: answered, total: 6 }}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-600 mb-5 p-3 bg-warm-50 rounded-xl leading-relaxed">
        6 subtests de función frontal. Cada uno puntúa 0-3. Administrar en orden.
      </div>
      {SUBTESTS.map((sub, idx) => (
        <div key={sub.key} className="mb-5">
          <div className="text-sm font-bold text-slate-800 mb-0.5">
            <span className="text-clinical-500 mr-1">{idx + 1}.</span>
            {sub.name}
          </div>
          <div className="text-xs text-slate-500 mb-3 leading-relaxed">{sub.desc}</div>
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, [sub.key]: v }));
                  onMarkDirty?.();
                }}
                className={`flex-1 h-11 rounded-xl text-sm font-semibold border transition-all
                  ${answers[sub.key] === v ? 'bg-clinical-600 text-white border-clinical-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 active:bg-slate-50'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="text-xs text-slate-400 text-right mt-1">{answered}/6 subtests completados</div>
    </ScaleLayout>
  );
}
