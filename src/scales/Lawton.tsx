import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// Lawton-Brody AIVD — puntuación 0-8
// Cada ítem puntúa 1 solo si el paciente alcanza el nivel máximo (independiente).
// Las opciones intermedias describen el nivel pero NO suman punto.

const ITEMS = [
  {
    key: 'telefono',
    label: 'Uso del teléfono',
    opts: ['No usa el teléfono', 'Solo llamadas conocidas', 'Independiente'],
  },
  { key: 'compras', label: 'Hacer la compra', opts: ['Incapaz', 'Necesita acompañante', 'Independiente'] },
  {
    key: 'comida',
    label: 'Preparación de comida',
    opts: ['No prepara comida', 'Prepara con ayuda', 'Prepara y sirve adecuadamente'],
  },
  {
    key: 'casa',
    label: 'Cuidado del hogar',
    opts: [
      'No participa',
      'Ayuda ocasional',
      'Mantiene la casa con ayuda',
      'Cuida la casa con supervisión',
      'Mantiene la casa independientemente',
    ],
  },
  { key: 'lavanderia', label: 'Lavado de ropa', opts: ['Incapaz', 'Lava ropa pequeña', 'Independiente'] },
  {
    key: 'transporte',
    label: 'Medios de transporte',
    opts: ['No viaja solo/a', 'Viaja en taxi o con acompañante', 'Viaja en transporte público'],
  },
  {
    key: 'medicacion',
    label: 'Manejo de medicación',
    opts: ['Incapaz', 'Toma si se la preparan', 'Independiente en dosis y horario'],
  },
  { key: 'dinero', label: 'Manejo del dinero', opts: ['Incapaz', 'Maneja gastos diarios', 'Independiente'] },
] as const;

type ItemKey = (typeof ITEMS)[number]['key'];
type LawtonAnswers = Record<ItemKey, number>;
const INITIAL: LawtonAnswers = Object.fromEntries(ITEMS.map((i) => [i.key, 0])) as LawtonAnswers;
const MAX_IDX: Record<ItemKey, number> = {
  telefono: 2,
  compras: 2,
  comida: 2,
  casa: 4,
  lavanderia: 2,
  transporte: 2,
  medicacion: 2,
  dinero: 2,
};

function getScore(a: LawtonAnswers): number {
  return ITEMS.reduce((sum, item) => sum + (a[item.key] === MAX_IDX[item.key] ? 1 : 0), 0);
}

function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score >= 7) return { text: 'Independiente', severity: 'normal' };
  if (score >= 5) return { text: 'Dependencia leve', severity: 'mild' };
  if (score >= 3) return { text: 'Dependencia moderada', severity: 'moderate' };
  return { text: 'Dependencia grave/total', severity: 'severe' };
}

function buildReport(score: number, interp: string, a: LawtonAnswers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const detail = ITEMS.map((i) => {
    const isIndep = a[i.key] === MAX_IDX[i.key];
    return `  ${i.label}: ${i.opts[a[i.key]]} (${isIndep ? '1 pt' : '0 pt'})`;
  }).join('\n');
  return `Escala de Lawton-Brody — ${date}\nPuntuación total: ${score}/8 — ${interp}\n\n${detail}\n\nNota: puntúa 1 solo la opción de máxima independencia en cada ítem.\nReferencia: Lawton MP, Brody EM. Gerontologist. 1969;9(3):179-186.`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function LawtonScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<LawtonAnswers>(INITIAL);
  const [touchedItems, setTouchedItems] = useState<Set<string>>(new Set());
  const score = getScore(answers);
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="Lawton-Brody"
      subtitle="Actividades instrumentales de la vida diaria"
      score={score}
      maxScore={8}
      interpretation={interpText}
      severity={severity}
      progress={{ answered: touchedItems.size, total: 8 }}
      onComplete={() =>
        onComplete({
          scaleId: 'lawton',
          scaleName: 'Lawton-Brody',
          score,
          maxScore: 8,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, answers),
          timestamp: Date.now(),
          answers: answers as Record<string, number>,
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, answers)}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl leading-relaxed">
        Puntúa <strong>1 punto</strong> únicamente la opción marcada con{' '}
        <span className="text-emerald-600 font-bold">+1</span> (máxima independencia). Las opciones
        intermedias describen el nivel pero no suman.
      </div>

      {ITEMS.map((item) => (
        <div key={item.key} className="mb-5">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-sm font-semibold text-slate-800">{item.label}</span>
            <span className="text-xs text-slate-400">
              {answers[item.key] === MAX_IDX[item.key] ? (
                <span className="text-emerald-600 font-bold">1 pt</span>
              ) : (
                <span className="text-slate-300">0 pt</span>
              )}
            </span>
          </div>
          <div className="space-y-1.5">
            {item.opts.map((opt, idx) => {
              const isMax = idx === MAX_IDX[item.key];
              const isSelected = answers[item.key] === idx && touchedItems.has(item.key);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    setAnswers((prev) => ({ ...prev, [item.key]: idx }));
                    setTouchedItems((prev) => {
                      const s = new Set(prev);
                      s.add(item.key);
                      return s;
                    });
                    onMarkDirty?.();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm border transition-all
                    ${
                      isSelected
                        ? isMax
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-clinical-600 text-white border-clinical-600'
                        : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                    }`}
                >
                  <span className="text-left leading-snug">{opt}</span>
                  {isMax && (
                    <span
                      className={`ml-3 flex-shrink-0 text-xs font-bold px-1.5 py-0.5 rounded
                      ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}
                    >
                      +1
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </ScaleLayout>
  );
}
