import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// PHQ-9 — Patient Health Questionnaire-9
// Kroenke K, Spitzer RL. Psychiatr Ann. 2002;32:509-515.

const ITEMS = [
  { key: 'i1', label: 'Poco interés o placer en hacer las cosas' },
  { key: 'i2', label: 'Se ha sentido decaído/a, deprimido/a o sin esperanza' },
  { key: 'i3', label: 'Ha tenido dificultad para dormir, mantenerse dormido/a o ha dormido demasiado' },
  { key: 'i4', label: 'Se ha sentido cansado/a o con poca energía' },
  { key: 'i5', label: 'Ha tenido poco apetito o ha comido en exceso' },
  { key: 'i6', label: 'Se ha sentido mal consigo mismo/a, o que ha fallado a sí mismo/a o a su familia' },
  {
    key: 'i7',
    label: 'Ha tenido dificultad para concentrarse en cosas como leer el periódico o ver la televisión',
  },
  {
    key: 'i8',
    label: 'Se ha movido o hablado tan despacio que otras personas podrían haberlo notado, o lo contrario',
  },
  {
    key: 'i9',
    label: 'Ha tenido pensamientos de que estaría mejor muerto/a, o de hacerse daño de alguna manera',
  },
] as const;

type ItemKey = (typeof ITEMS)[number]['key'];
type Answers = Record<ItemKey, number | null>;

const INITIAL: Answers = Object.fromEntries(ITEMS.map((i) => [i.key, null])) as Answers;

const FREQ_LABELS = ['Nunca', 'Varios días', 'Más de la mitad de los días', 'Casi todos los días'];

export function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score <= 4) return { text: 'Depresión mínima o ausente', severity: 'normal' };
  if (score <= 9) return { text: 'Depresión leve', severity: 'mild' };
  if (score <= 14) return { text: 'Depresión moderada', severity: 'moderate' };
  if (score <= 19) return { text: 'Depresión moderadamente grave', severity: 'severe' };
  return { text: 'Depresión grave', severity: 'severe' };
}

function buildReport(score: number, interp: string, a: Answers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const lines = ITEMS.map((item, i) => {
    const v = a[item.key];
    return `  ${i + 1}. ${item.label}: ${v !== null ? FREQ_LABELS[v] + ` (${v} pts)` : '—'}`;
  }).join('\n');
  const i9val = a.i9;
  const i9warn =
    i9val !== null && i9val > 0
      ? '\n⚠ ATENCIÓN: El paciente ha referido pensamientos de autolesión o muerte (ítem 9). Valorar riesgo.'
      : '';
  return `PHQ-9 — Patient Health Questionnaire — ${date}
Puntuación total: ${score}/27 — ${interp}

${lines}

Puntos de corte: 0-4 mínima · 5-9 leve · 10-14 moderada · 15-19 mod. grave · 20-27 grave
${i9warn}
Referencia: Kroenke K, Spitzer RL. Psychiatr Ann. 2002;32:509-515.`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function PHQ9Scale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const answeredCount = Object.values(answers).filter((v) => v !== null).length;
  const score = Object.values(answers).reduce<number>((acc, v) => acc + (v ?? 0), 0);
  const { text: interpText, severity } = interpret(score);

  const set = (k: ItemKey, v: number) => {
    setAnswers((prev) => ({ ...prev, [k]: v }));
    onMarkDirty?.();
  };

  return (
    <ScaleLayout
      title="PHQ-9"
      subtitle="Patient Health Questionnaire"
      score={score}
      maxScore={27}
      interpretation={interpText}
      severity={severity}
      progress={{ answered: answeredCount, total: 9 }}
      onComplete={() =>
        onComplete({
          scaleId: 'phq9',
          scaleName: 'PHQ-9',
          score,
          maxScore: 27,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, answers),
          timestamp: Date.now(),
          answers: Object.fromEntries(ITEMS.map((i) => [i.key, answers[i.key] ?? 0])),
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, answers)}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-5 p-3 bg-warm-50 rounded-xl leading-relaxed">
        Durante las <strong>últimas 2 semanas</strong>, ¿con qué frecuencia le han molestado los siguientes
        problemas?
      </div>

      {ITEMS.map((item, idx) => {
        const isLast = idx === ITEMS.length - 1;
        return (
          <div key={item.key} className={`mb-4 ${isLast ? 'border-t border-amber-200 pt-4 mt-2' : ''}`}>
            {isLast && (
              <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3 leading-relaxed">
                ⚠ Ítem de seguridad — registrar y valorar clínicamente si puntúa &gt;0
              </div>
            )}
            <div className="text-sm font-semibold text-slate-800 mb-2">
              <span className="text-slate-400 mr-1.5">{idx + 1}.</span>
              {item.label}
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {FREQ_LABELS.map((label, val) => (
                <button
                  key={val}
                  onClick={() => set(item.key, val)}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-semibold text-left transition-all leading-snug
                    ${
                      answers[item.key] === val
                        ? val === 0
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : val === 1
                            ? 'bg-amber-400 text-white border-amber-400'
                            : val === 2
                              ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                    }`}
                >
                  <span>{label}</span>
                  <span
                    className={`block text-[10px] mt-0.5 ${answers[item.key] === val ? 'text-white/70' : 'text-slate-400'}`}
                  >
                    {val} pts
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </ScaleLayout>
  );
}
