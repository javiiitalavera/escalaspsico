import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

const LEVELS = [
  {
    score: 1,
    label: 'Muy en forma',
    description:
      'Robusto, activo, enérgico y motivado. Hace ejercicio regularmente. Se encuentra entre los más en forma para su edad.',
    severity: 'normal' as const,
  },
  {
    score: 2,
    label: 'En forma',
    description:
      'Sin enfermedad activa, pero menos en forma que la categoría 1. Hace ejercicio ocasionalmente o es muy activo de forma estacional.',
    severity: 'normal' as const,
  },
  {
    score: 3,
    label: 'Manejando bien',
    description:
      'Enfermedad médica bien controlada. No es activo regularmente más allá de un paseo rutinario.',
    severity: 'normal' as const,
  },
  {
    score: 4,
    label: 'Vulnerable',
    description:
      'No depende de otros para actividades diarias, pero los síntomas limitan la actividad. Se queja de estar "enlentecido" o cansado durante el día.',
    severity: 'mild' as const,
  },
  {
    score: 5,
    label: 'Levemente frágil',
    description:
      'Depende de otros para AIVD (finanzas, transporte, trabajo doméstico pesado, medicación). Típicamente deterioro en compras, paseos en exterior, preparación de comidas, trabajo en casa.',
    severity: 'mild' as const,
  },
  {
    score: 6,
    label: 'Moderadamente frágil',
    description:
      'Necesita ayuda para ABVD y algunas AIVD. A veces requiere recordatorios, ayuda para vestirse o con higiene.',
    severity: 'moderate' as const,
  },
  {
    score: 7,
    label: 'Gravemente frágil',
    description:
      'Completamente dependiente para el cuidado personal, cualquiera que sea la causa (física o cognitiva). Aun así, parece estable y sin riesgo alto de muerte en los próximos 6 meses.',
    severity: 'severe' as const,
  },
  {
    score: 8,
    label: 'Muy gravemente frágil',
    description:
      'Completamente dependiente, acercándose al final de la vida. Típicamente no se recupera ni de enfermedades menores.',
    severity: 'severe' as const,
  },
  {
    score: 9,
    label: 'Enfermedad terminal',
    description:
      'Aproximándose al final de la vida. Esta categoría se aplica a personas con esperanza de vida <6 meses que no presentan evidencia de fragilidad.',
    severity: 'severe' as const,
  },
] as const;

export const ROCKWOOD_LEVELS = LEVELS;

export function rockwoodInterpret(
  score: number,
): { label: string; severity: ScaleResult['severity'] } | null {
  const level = LEVELS.find((l) => l.score === score);
  if (!level) return null;
  return { label: level.label, severity: level.severity };
}

function buildReport(level: (typeof LEVELS)[number]): string {
  const date = new Date().toLocaleDateString('es-ES');
  return `Clinical Frailty Scale (Rockwood) — ${date}
Nivel: ${level.score}/9 — ${level.label}

Descripción clínica:
${level.description}`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function RockwoodScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const level = LEVELS.find((l) => l.score === selected);

  return (
    <ScaleLayout
      title="CFS"
      subtitle="Clinical Frailty Scale — Rockwood"
      score={selected ?? '—'}
      maxScore={9}
      interpretation={level?.label ?? 'Selecciona nivel'}
      severity={level?.severity ?? 'info'}
      onComplete={() => {
        if (!level) return;
        onComplete({
          scaleId: 'rockwood',
          scaleName: 'CFS Rockwood',
          score: level.score,
          maxScore: 9,
          interpretation: level.label,
          severity: level.severity,
          reportText: buildReport(level),
          timestamp: Date.now(),
          answers: { level: level.score },
        });
      }}
      onBack={onBack}
      reportText={level ? buildReport(level) : ''}
      completeDisabled={!selected}
      onMarkDirty={onMarkDirty}
    >
      <div className="space-y-2">
        {LEVELS.map((l) => {
          const colors = {
            normal:
              selected === l.score
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'border-emerald-200 bg-white',
            mild:
              selected === l.score ? 'bg-amber-500 text-white border-amber-500' : 'border-amber-200 bg-white',
            moderate:
              selected === l.score
                ? 'bg-orange-500 text-white border-orange-500'
                : 'border-orange-200 bg-white',
            severe: selected === l.score ? 'bg-red-500 text-white border-red-500' : 'border-red-200 bg-white',
            info: 'border-slate-200 bg-white',
          };
          const isSelected = selected === l.score;
          return (
            <button
              key={l.score}
              onClick={() => setSelected(l.score)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${colors[l.severity]}`}
            >
              <div className="flex items-center gap-3 mb-1">
                <span
                  className={`text-lg font-bold tabular-nums w-6 ${isSelected ? 'text-white' : 'text-slate-400'}`}
                >
                  {l.score}
                </span>
                <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {l.label}
                </span>
              </div>
              <div
                className={`text-xs leading-relaxed ml-9 ${isSelected ? 'text-white/85' : 'text-slate-500'}`}
              >
                {l.description}
              </div>
            </button>
          );
        })}
      </div>
    </ScaleLayout>
  );
}
