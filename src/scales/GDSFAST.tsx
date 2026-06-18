import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';
import { ChevronDown } from 'lucide-react';

export const GDS_STAGES = [
  {
    id: '1',
    gds: 1,
    label: 'GDS 1 — Normal',
    description: 'Sin deterioro cognitivo subjetivo ni objetivo. Rendimiento normal en entrevista clínica.',
    severity: 'normal' as const,
  },
  {
    id: '2',
    gds: 2,
    label: 'GDS 2 — Deterioro muy leve',
    description:
      'Quejas subjetivas de memoria (olvidos de nombres, dónde dejó objetos). Sin evidencia objetiva ni repercusión funcional.',
    severity: 'normal' as const,
  },
  {
    id: '3',
    gds: 3,
    label: 'GDS 3 — Deterioro leve',
    description:
      'Primeros déficits claros: olvida nombre de conocidos, se pierde en ruta no familiar, déficit en trabajo. Puede negar. Duración media: 7 años.',
    severity: 'mild' as const,
  },
  {
    id: '4',
    gds: 4,
    label: 'GDS 4 — Moderado',
    description:
      'Olvida eventos recientes, dificultad en cálculo y manejo de dinero, no recuerda historia personal. IADL afectadas. Duración media: 2 años.',
    severity: 'mild' as const,
  },
  {
    id: '5',
    gds: 5,
    label: 'GDS 5 — Moderadamente grave',
    description:
      'No recuerda dirección, no selecciona ropa adecuada. Puede recordar su nombre y el de familiares. Requiere supervisión para ABVD. Duración media: 1,5 años.',
    severity: 'moderate' as const,
  },
  {
    id: '6a',
    gds: 6,
    substage: 'A',
    label: 'GDS 6A — Grave',
    description: 'Se viste con asistencia. Ocasionalmente necesita ayuda para ponerse la ropa correctamente.',
    severity: 'moderate' as const,
  },
  {
    id: '6b',
    gds: 6,
    substage: 'B',
    label: 'GDS 6B',
    description: 'Requiere asistencia para bañarse. Puede aparecer miedo al baño.',
    severity: 'moderate' as const,
  },
  {
    id: '6c',
    gds: 6,
    substage: 'C',
    label: 'GDS 6C',
    description: 'Requiere ayuda para los cuidados del retrete (limpieza, tirar de la cadena, ropa).',
    severity: 'moderate' as const,
  },
  {
    id: '6d',
    gds: 6,
    substage: 'D',
    label: 'GDS 6D',
    description: 'Incontinencia urinaria. Ocasional o frecuente.',
    severity: 'severe' as const,
  },
  {
    id: '6e',
    gds: 6,
    substage: 'E',
    label: 'GDS 6E',
    description: 'Incontinencia fecal. Ocasional o frecuente.',
    severity: 'severe' as const,
  },
  {
    id: '7a',
    gds: 7,
    substage: 'A',
    label: 'GDS 7A — Muy grave',
    description: 'Vocabulario de 1 a 5 palabras. Habla muy limitada.',
    severity: 'severe' as const,
  },
  {
    id: '7b',
    gds: 7,
    substage: 'B',
    label: 'GDS 7B',
    description: 'Jerga o una sola palabra inteligible.',
    severity: 'severe' as const,
  },
  {
    id: '7c',
    gds: 7,
    substage: 'C',
    label: 'GDS 7C',
    description: 'Pérdida de la deambulación independiente. Requiere asistencia para caminar.',
    severity: 'severe' as const,
  },
  {
    id: '7d',
    gds: 7,
    substage: 'D',
    label: 'GDS 7D',
    description: 'Pérdida de la capacidad de sentarse sin ayuda.',
    severity: 'severe' as const,
  },
  {
    id: '7e',
    gds: 7,
    substage: 'E',
    label: 'GDS 7E',
    description: 'Pérdida de la sonrisa. Expresión facial reducida.',
    severity: 'severe' as const,
  },
  {
    id: '7f',
    gds: 7,
    substage: 'F',
    label: 'GDS 7F',
    description: 'Pérdida de la capacidad de sostener la cabeza. Estado vegetativo.',
    severity: 'severe' as const,
  },
];

// Group by GDS level
const GDS_LEVELS = [
  {
    gds: 1,
    title: 'GDS 1 — Normal',
    severity: 'normal' as const,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    gds: 2,
    title: 'GDS 2 — Deterioro muy leve',
    severity: 'normal' as const,
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    gds: 3,
    title: 'GDS 3 — Deterioro leve',
    severity: 'mild' as const,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    gds: 4,
    title: 'GDS 4 — Moderado',
    severity: 'mild' as const,
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    gds: 5,
    title: 'GDS 5 — Moderadamente grave',
    severity: 'moderate' as const,
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
  },
  {
    gds: 6,
    title: 'GDS 6 — Grave',
    severity: 'moderate' as const,
    color: '#ea580c',
    bg: '#fff7ed',
    border: '#fed7aa',
  },
  {
    gds: 7,
    title: 'GDS 7 — Muy grave',
    severity: 'severe' as const,
    color: '#dc2626',
    bg: '#fef2f2',
    border: '#fecaca',
  },
];

function buildReport(stage: (typeof GDS_STAGES)[0]): string {
  const date = new Date().toLocaleDateString('es-ES');
  return `GDS-FAST (Global Deterioration Scale / Functional Assessment Staging) — ${date}
Estadio: ${stage.label}

Descripción clínica:
${stage.description}

Referencia: Reisberg B et al. Am J Psychiatry. 1982;139(9):1136-9.`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function GDSFASTScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  // FIX #8: open the GDS level that contains the selected stage, or all collapsed by default
  const [openLevels, setOpenLevels] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7]));

  const stage = GDS_STAGES.find((s) => s.id === selected);

  const toggleLevel = (gds: number) => {
    setOpenLevels((prev) => {
      const n = new Set(prev);
      n.has(gds) ? n.delete(gds) : n.add(gds);
      return n;
    });
  };

  const handleSelect = (id: string) => {
    setSelected(id);
    onMarkDirty?.();
  };

  return (
    <ScaleLayout
      title="GDS-FAST"
      subtitle="Global Deterioration Scale / FAST"
      score={stage ? `GDS ${stage.gds}${'substage' in stage ? stage.substage : ''}` : '—'}
      maxScore={''}
      interpretation={stage?.label.split('—')[1]?.trim() ?? 'Selecciona estadio'}
      severity={stage?.severity ?? 'info'}
      onComplete={() => {
        if (!stage) return;
        onComplete({
          scaleId: 'gds',
          scaleName: 'GDS-FAST',
          score: stage.id.toUpperCase(),
          maxScore: '7F',
          interpretation: stage.label,
          severity: stage.severity,
          reportText: buildReport(stage),
          timestamp: Date.now(),
          answers: { stage: stage.id },
        });
      }}
      onBack={onBack}
      reportText={stage ? buildReport(stage) : ''}
      completeDisabled={!selected}
      onMarkDirty={onMarkDirty}
    >
      <div className="space-y-2">
        {GDS_LEVELS.map((level) => {
          const stages = GDS_STAGES.filter((s) => s.gds === level.gds);
          const isOpen = openLevels.has(level.gds);
          const isSelectedLevel = stage?.gds === level.gds;

          // Single-stage levels (GDS 1-5): no substages to collapse
          if (stages.length === 1) {
            const s = stages[0];
            const isActive = selected === s.id;
            return (
              <button
                key={s.id}
                onClick={() => handleSelect(s.id)}
                className="w-full text-left p-4 rounded-xl border-2 transition-all"
                style={{
                  background: isActive ? level.bg : '#ffffff',
                  borderColor: isActive ? level.border : '#e2e8f0',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: level.color }} />
                  <span className="text-sm font-bold" style={{ color: isActive ? level.color : '#1e293b' }}>
                    {level.title}
                  </span>
                  {isActive && (
                    <span
                      className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ background: level.color, color: '#fff' }}
                    >
                      Seleccionado
                    </span>
                  )}
                </div>
                <div className="text-xs leading-relaxed text-slate-500 ml-4">{s.description}</div>
              </button>
            );
          }

          // Multi-substage levels (GDS 6, 7): collapsible
          return (
            <div
              key={level.gds}
              className="rounded-xl border-2 overflow-hidden transition-all"
              style={{ borderColor: isSelectedLevel ? level.border : '#e2e8f0' }}
            >
              <button
                onClick={() => toggleLevel(level.gds)}
                className="w-full flex items-center gap-2 p-4 text-left"
                style={{ background: isSelectedLevel ? level.bg : '#f8fafc' }}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: level.color }} />
                <span
                  className="flex-1 text-sm font-bold"
                  style={{ color: isSelectedLevel ? level.color : '#1e293b' }}
                >
                  {level.title}
                </span>
                {isSelectedLevel && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full mr-2"
                    style={{ background: level.color, color: '#fff' }}
                  >
                    {stage?.id.toUpperCase()}
                  </span>
                )}
                <ChevronDown
                  size={14}
                  color="#94a3b8"
                  style={{
                    transform: isOpen ? 'none' : 'rotate(-90deg)',
                    transition: '0.15s',
                    flexShrink: 0,
                  }}
                />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100">
                  {stages.map((s, idx) => {
                    const isActive = selected === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleSelect(s.id)}
                        className="w-full text-left px-4 py-3 transition-all flex items-start gap-3"
                        style={{
                          background: isActive ? level.bg : '#ffffff',
                          borderBottom: idx < stages.length - 1 ? '1px solid #f1f5f9' : 'none',
                        }}
                      >
                        <div
                          className="flex-shrink-0 mt-0.5 w-8 h-5 flex items-center justify-center rounded text-xs font-bold"
                          style={{
                            background: isActive ? level.color : '#f1f5f9',
                            color: isActive ? '#ffffff' : '#64748b',
                          }}
                        >
                          {'substage' in s ? s.substage : ''}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div
                            className="text-xs font-semibold mb-0.5"
                            style={{ color: isActive ? level.color : '#334155' }}
                          >
                            {s.label}
                          </div>
                          <div className="text-xs leading-relaxed text-slate-500">{s.description}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ScaleLayout>
  );
}
