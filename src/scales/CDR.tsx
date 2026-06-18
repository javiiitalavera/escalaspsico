import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// CDR — Clinical Dementia Rating (Sum of Boxes)
// Morris JC. Neurology. 1993;43(11):2412-2414.

const DOMAINS = [
  {
    key: 'memoria',
    label: 'Memoria',
    desc: 'Dominio principal. Evalúa fallos de memoria reciente con repercusión en la vida diaria.',
    opts: [
      { value: 0, label: 'Sin pérdida de memoria o olvidos leves e inconsistentes' },
      { value: 0.5, label: 'Olvidos leves consistentes; recuerdo parcial de eventos; "olvidos benignos"' },
      {
        value: 1,
        label: 'Pérdida de memoria moderada; mayor para eventos recientes; interfiere en actividades',
      },
      {
        value: 2,
        label: 'Pérdida de memoria grave; solo retiene material muy aprendido; olvida rápido lo nuevo',
      },
      { value: 3, label: 'Pérdida de memoria muy grave; solo fragmentos residuales' },
    ],
  },
  {
    key: 'orientacion',
    label: 'Orientación',
    desc: 'Orientación temporal, espacial y personal.',
    opts: [
      { value: 0, label: 'Completamente orientado' },
      { value: 0.5, label: 'Leve dificultad con relaciones temporales; orientado en lugar y persona' },
      {
        value: 1,
        label: 'Dificultad moderada con relaciones temporales; orientado geográficamente en el examen',
      },
      {
        value: 2,
        label: 'Dificultad grave con relaciones temporales; suele desorientarse en tiempo y lugar',
      },
      { value: 3, label: 'Solo orientado en persona' },
    ],
  },
  {
    key: 'juicio',
    label: 'Juicio y resolución de problemas',
    desc: 'Capacidad para resolver problemas, similitudes/diferencias, juicio social.',
    opts: [
      { value: 0, label: 'Resuelve bien los problemas cotidianos; juicio adecuado' },
      { value: 0.5, label: 'Leve dificultad para resolver problemas complejos' },
      { value: 1, label: 'Dificultad moderada para resolver problemas; juicio social mantenido' },
      { value: 2, label: 'Dificultad grave; juicio social habitualmente deteriorado' },
      { value: 3, label: 'Incapaz de resolver problemas; juicio social muy deteriorado' },
    ],
  },
  {
    key: 'social',
    label: 'Vida social y comunitaria',
    desc: 'Participación en actividades fuera del hogar (trabajo, compras, grupos, etc.).',
    opts: [
      {
        value: 0,
        label: 'Actividad habitual independiente en trabajo, compras, voluntariado y grupos sociales',
      },
      { value: 0.5, label: 'Leve deterioro en estas actividades' },
      {
        value: 1,
        label: 'Incapaz de actuar independientemente, aunque puede participar; parece normal a simple vista',
      },
      {
        value: 2,
        label:
          'No hay pretensión de actividad independiente fuera del hogar; aparenta estar bien para llevarle fuera',
      },
      {
        value: 3,
        label:
          'No hay pretensión de actividad independiente fuera del hogar; aparenta demasiado enfermo para llevarle',
      },
    ],
  },
  {
    key: 'hogar',
    label: 'Hogar y aficiones',
    desc: 'Funcionamiento en el hogar, pasatiempos e intereses intelectuales.',
    opts: [
      { value: 0, label: 'Vida en el hogar, aficiones e intereses intelectuales bien mantenidos' },
      { value: 0.5, label: 'Vida en el hogar, aficiones e intereses ligeramente deteriorados' },
      {
        value: 1,
        label: 'Deterioro leve en el hogar; abandona las tareas más complicadas; aficiones más sencillas',
      },
      { value: 2, label: 'Solo tareas sencillas; intereses muy limitados y poco mantenidos' },
      { value: 3, label: 'Sin función significativa en el hogar' },
    ],
  },
  {
    key: 'cuidado',
    label: 'Cuidado personal',
    desc: 'Higiene, vestido, alimentación y control de esfínteres.',
    opts: [
      { value: 0, label: 'Totalmente capaz de cuidarse' },
      { value: 0.5, label: 'No aplica (este dominio no tiene puntuación 0.5)' },
      { value: 1, label: 'Necesita ocasionalmente que le recuerden' },
      { value: 2, label: 'Necesita asistencia para vestirse, higiene y mantenimiento personal' },
      { value: 3, label: 'Necesita mucha ayuda para el cuidado personal; incontinencia frecuente' },
    ],
  },
] as const;

type DomainKey = (typeof DOMAINS)[number]['key'];
type Answers = Record<DomainKey, number | null>;
const INITIAL: Answers = Object.fromEntries(DOMAINS.map((d) => [d.key, null])) as Answers;

function getSB(a: Answers): number {
  return Object.values(a).reduce<number>((acc, v) => acc + (v ?? 0), 0);
}

function interpret(sb: number): { text: string; severity: ScaleResult['severity'] } {
  if (sb === 0) return { text: 'Normal', severity: 'normal' };
  if (sb <= 4) return { text: 'Deterioro muy leve', severity: 'mild' };
  if (sb <= 9) return { text: 'Deterioro leve', severity: 'mild' };
  if (sb <= 15.5) return { text: 'Deterioro moderado', severity: 'moderate' };
  return { text: 'Deterioro grave', severity: 'severe' };
}

function buildReport(sb: number, interp: string, a: Answers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const lines = DOMAINS.map((d) => {
    const v = a[d.key];
    const opt = d.opts.find((o) => o.value === v);
    return `  ${d.label}: ${v ?? '—'} — ${opt?.label ?? '—'}`;
  }).join('\n');
  return `CDR (Clinical Dementia Rating) — Sum of Boxes — ${date}
CDR-SB: ${sb}/18 — ${interp}

Dominios:
${lines}

Puntos de corte CDR-SB: 0 normal · 0.5-4 muy leve · 4.5-9 leve · 9.5-15.5 moderado · 16-18 grave
Referencia: Morris JC. Neurology. 1993;43(11):2412-2414.`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function CDRScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<Answers>(INITIAL);
  const answeredCount = Object.values(answers).filter((v) => v !== null).length;
  const sb = getSB(answers);
  const { text: interpText, severity } = interpret(sb);

  const set = (k: DomainKey, v: number) => {
    setAnswers((prev) => ({ ...prev, [k]: v }));
    onMarkDirty?.();
  };

  return (
    <ScaleLayout
      title="CDR-SB"
      subtitle="Clinical Dementia Rating — Sum of Boxes"
      score={sb}
      maxScore={18}
      interpretation={interpText}
      severity={severity}
      progress={{ answered: answeredCount, total: 6 }}
      onComplete={() =>
        onComplete({
          scaleId: 'cdr',
          scaleName: 'CDR-SB',
          score: sb,
          maxScore: 18,
          interpretation: interpText,
          severity,
          reportText: buildReport(sb, interpText, answers),
          timestamp: Date.now(),
          answers: Object.fromEntries(DOMAINS.map((d) => [d.key, answers[d.key] ?? 0])),
        })
      }
      onBack={onBack}
      reportText={buildReport(sb, interpText, answers)}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-5 p-3 bg-warm-50 rounded-xl leading-relaxed">
        Basado en entrevista con el paciente <strong>y</strong> un informante fiable. Seleccionar el nivel que
        mejor describe el funcionamiento habitual, no el peor día.
      </div>

      {DOMAINS.map((domain) => (
        <div key={domain.key} className="mb-6">
          <div className="text-sm font-semibold text-slate-800 mb-0.5">{domain.label}</div>
          <div className="text-xs text-slate-400 mb-3 leading-relaxed">{domain.desc}</div>
          <div className="space-y-1.5">
            {domain.opts
              .filter((opt) => !(domain.key === 'cuidado' && opt.value === 0.5))
              .map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => set(domain.key, opt.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all
                    ${
                      answers[domain.key] === opt.value
                        ? 'bg-clinical-600 text-white border-clinical-600'
                        : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                    }`}
                >
                  <span className="font-medium text-left leading-snug">{opt.label}</span>
                  <span
                    className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0 ${answers[domain.key] === opt.value ? 'text-white/70' : 'text-slate-400'}`}
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
