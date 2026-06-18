import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

interface Props {
  onComplete: (r: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

const SECTIONS = [
  {
    name: 'A. Signos relacionados con el humor',
    items: [
      { key: 'ansiedad', label: 'Ansiedad', desc: 'Expresión ansiosa, rumiación, preocupación excesiva' },
      { key: 'tristeza', label: 'Tristeza', desc: 'Voz triste, expresión de tristeza, llanto' },
      {
        key: 'carencia',
        label: 'Falta de reacciones a eventos agradables',
        desc: 'No reacciona a hechos placenteros',
      },
      {
        key: 'irritabilidad',
        label: 'Irritabilidad',
        desc: 'Se molesta fácilmente, de mal humor, impaciente',
      },
    ],
  },
  {
    name: 'B. Alteraciones del comportamiento',
    items: [
      { key: 'agitacion', label: 'Agitación', desc: 'Inquietud, manos, arrancarse ropa' },
      { key: 'retardo', label: 'Retardo motor', desc: 'Movimientos lentos, habla lenta' },
      { key: 'quejas', label: 'Quejas físicas múltiples', desc: 'Excluir síntomas GI solamente' },
      {
        key: 'perdida_interes',
        label: 'Pérdida de interés',
        desc: 'Menos implicado en actividades habituales',
      },
    ],
  },
  {
    name: 'C. Signos físicos',
    items: [
      { key: 'apetito', label: 'Pérdida de apetito', desc: 'Come menos que antes' },
      { key: 'peso', label: 'Pérdida de peso', desc: 'Si se desconoce: 0' },
      {
        key: 'energia',
        label: 'Falta de energía',
        desc: 'Se fatiga fácilmente, incapaz de mantener actividades',
      },
    ],
  },
  {
    name: 'D. Funciones cíclicas',
    items: [
      { key: 'variacion', label: 'Variación diurna del humor', desc: 'Síntomas peor por la mañana' },
      { key: 'insomnio', label: 'Dificultad para conciliar el sueño', desc: 'Más tarde de lo habitual' },
      { key: 'despertar', label: 'Despertar nocturno frecuente', desc: 'Excluir si por necesidad urinaria' },
      { key: 'madrugada', label: 'Despertar precoz', desc: 'Antes de lo habitual' },
    ],
  },
  {
    name: 'E. Alteraciones del pensamiento',
    items: [
      {
        key: 'suicidio',
        label: 'Suicidio / Pensamientos de muerte',
        desc: 'Sentir que la vida no merece la pena, deseos de muerte',
      },
      { key: 'autoestima', label: 'Baja autoestima', desc: 'Autocrítica, se culpa, se infravalora' },
      { key: 'pesimismo', label: 'Pesimismo', desc: 'Anticipa lo peor' },
      {
        key: 'delirio',
        label: 'Humor delirante congruente',
        desc: 'Delirios de pobreza, enfermedad, pérdida',
      },
    ],
  },
];

const OPTS = [
  { label: 'Incapaz de valorar', value: -1 },
  { label: 'Ausente', value: 0 },
  { label: 'Leve/intermitente', value: 1 },
  { label: 'Grave', value: 2 },
];

function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score <= 7) return { text: 'Sin depresión significativa', severity: 'normal' };
  if (score <= 12) return { text: 'Depresión leve', severity: 'mild' };
  return { text: 'Depresión moderada-grave', severity: 'severe' };
}

function buildReport(score: number, interp: string, answers: Record<string, number>): string {
  const date = new Date().toLocaleDateString('es-ES');
  const detail = SECTIONS.map(
    (sec) =>
      `${sec.name}\n` +
      sec.items
        .map(
          (i) =>
            `  ${i.label}: ${answers[i.key] === -1 ? 'No valorable' : answers[i.key] === 0 ? 'Ausente' : answers[i.key] === 1 ? 'Leve' : 'Grave'}`,
        )
        .join('\n'),
  ).join('\n\n');
  return `Cornell Scale for Depression in Dementia — ${date}
Puntuación total: ${score}/38 — ${interp}

${detail}

Puntos de corte: ≤7 sin depresión · 8-12 depresión leve · ≥13 depresión moderada-grave
Referencia: Alexopoulos GS et al. Biol Psychiatry. 1988;23(3):271-284.`;
}

export function CornellScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const allItems = SECTIONS.flatMap((s) => s.items);
  const answered = allItems.filter((i) => answers[i.key] !== undefined).length;
  const score = Object.values(answers).reduce((s, v) => s + (v > 0 ? v : 0), 0);
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="Cornell"
      subtitle="Cornell Scale for Depression in Dementia"
      score={score}
      maxScore={38}
      interpretation={interpText}
      severity={severity}
      onComplete={() =>
        onComplete({
          scaleId: 'cornell',
          scaleName: 'Cornell',
          score,
          maxScore: 38,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, answers),
          timestamp: Date.now(),
          answers,
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, answers)}
      completeDisabled={answered < allItems.length}
      progress={{ answered: answered, total: allItems.length }}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-600 mb-5 p-3 bg-warm-50 rounded-xl leading-relaxed">
        Valorar basándose en observación del paciente y entrevista con el cuidador. Período de valoración:
        última semana. Los ítems «No valorable» no suman puntuación.
      </div>

      {SECTIONS.map((sec) => (
        <section key={sec.name} className="mb-6">
          <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">
            {sec.name}
          </div>
          {sec.items.map((item) => (
            <div key={item.key} className="mb-4">
              <div className="text-sm font-semibold text-slate-800 mb-0.5">{item.label}</div>
              <div className="text-xs text-slate-400 mb-2">{item.desc}</div>
              <div className="flex gap-2 flex-wrap">
                {OPTS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setAnswers((prev) => ({ ...prev, [item.key]: opt.value }));
                      onMarkDirty?.();
                    }}
                    className={`flex-1 min-w-[5rem] px-3 py-2.5 rounded-xl border text-xs font-semibold transition-all
                      ${
                        answers[item.key] === opt.value
                          ? opt.value <= 0
                            ? 'bg-slate-600 text-white border-slate-600'
                            : opt.value === 1
                              ? 'bg-amber-500 text-white border-amber-500'
                              : 'bg-red-500 text-white border-red-500'
                          : 'bg-white text-slate-600 border-slate-200 active:bg-slate-50'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      ))}
      <div className="text-xs text-slate-400 text-right">
        {answered}/{allItems.length} ítems valorados
      </div>
    </ScaleLayout>
  );
}
