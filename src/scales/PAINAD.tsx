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
    key: 'respiracion',
    label: 'Respiración independiente del llanto',
    opts: [
      { label: 'Normal', value: 0 },
      { label: 'Respiración dificultosa ocasional / hiperventilación corta', value: 1 },
      { label: 'Respiración ruidosa dificultosa / hiperventilación larga / Cheyne-Stokes', value: 2 },
    ],
  },
  {
    key: 'vocalizacion',
    label: 'Vocalización negativa',
    opts: [
      { label: 'Ninguna', value: 0 },
      { label: 'Gemidos / quejidos ocasionales · verbalizaciones de desagrado', value: 1 },
      { label: 'Llamadas de angustia repetidas · gemidos en voz alta · llanto', value: 2 },
    ],
  },
  {
    key: 'expresion',
    label: 'Expresión facial',
    opts: [
      { label: 'Sonriente o inexpresivo', value: 0 },
      { label: 'Triste · atemorizado · ceño fruncido', value: 1 },
      { label: 'Muecas faciales', value: 2 },
    ],
  },
  {
    key: 'lenguaje',
    label: 'Lenguaje corporal',
    opts: [
      { label: 'Relajado', value: 0 },
      { label: 'Tenso · angustiado al caminar · inquieto', value: 1 },
      { label: 'Rígido · puños apretados · rodillas flexionadas · tirar o empujar · golpear', value: 2 },
    ],
  },
  {
    key: 'consolabilidad',
    label: 'Consolabilidad',
    opts: [
      { label: 'No necesita consolar', value: 0 },
      { label: 'Se distrae o tranquiliza con voz o toque', value: 1 },
      { label: 'Imposible consolar, distraer o tranquilizar', value: 2 },
    ],
  },
];

function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score === 0) return { text: 'Sin dolor', severity: 'normal' };
  if (score <= 3) return { text: 'Dolor leve', severity: 'mild' };
  if (score <= 6) return { text: 'Dolor moderado', severity: 'moderate' };
  return { text: 'Dolor intenso', severity: 'severe' };
}

function buildReport(score: number, interp: string, answers: Record<string, number>): string {
  const date = new Date().toLocaleDateString('es-ES');
  const detail = ITEMS.map(
    (i) =>
      `  ${i.label}: ${i.opts.find((o) => o.value === (answers[i.key] ?? 0))?.label ?? '—'} (${answers[i.key] ?? 0})`,
  ).join('\n');
  return `PAINAD (Pain Assessment in Advanced Dementia) — ${date}
Puntuación total: ${score}/10 — ${interp}

${detail}

Puntos de corte: 0 sin dolor · 1-3 leve · 4-6 moderado · 7-10 intenso
Referencia: Warden V et al. J Am Med Dir Assoc. 2003;4(1):9-15.`;
}

export function PAINADScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const score = ITEMS.reduce((s, i) => s + (answers[i.key] ?? 0), 0);
  const answered = ITEMS.filter((i) => answers[i.key] !== undefined).length;
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="PAINAD"
      subtitle="Pain Assessment in Advanced Dementia"
      score={score}
      maxScore={10}
      interpretation={interpText}
      severity={severity}
      onComplete={() =>
        onComplete({
          scaleId: 'painad',
          scaleName: 'PAINAD',
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
      reportText={buildReport(score, interpText, answers)}
      completeDisabled={answered < 5}
      progress={{ answered, total: 5 }}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-600 mb-5 p-3 bg-warm-50 rounded-xl leading-relaxed">
        Observar al paciente durante 5 minutos en reposo y/o durante movilización. Puntuar cada dominio de 0 a
        2.
      </div>
      {ITEMS.map((item, idx) => (
        <div key={item.key} className="mb-5">
          <div className="text-sm font-bold text-slate-800 mb-0.5">
            <span className="text-clinical-500 mr-1">{idx + 1}.</span>
            {item.label}
          </div>
          <div className="space-y-1.5 mt-2">
            {item.opts.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setAnswers((prev) => ({ ...prev, [item.key]: opt.value }));
                  onMarkDirty?.();
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-all flex items-center justify-between
                  ${
                    answers[item.key] === opt.value
                      ? opt.value === 0
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : opt.value === 1
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                  }`}
              >
                <span className="font-medium">{opt.label}</span>
                <span
                  className={`text-xs font-bold ml-3 flex-shrink-0 ${answers[item.key] === opt.value ? 'text-white/70' : 'text-slate-300'}`}
                >
                  {opt.value}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="text-xs text-slate-400 text-right mt-1">{answered}/5 dominios valorados</div>
    </ScaleLayout>
  );
}
