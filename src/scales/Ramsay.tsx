import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

const LEVELS = [
  {
    value: 1,
    label: 'Nivel 1',
    description: 'Paciente ansioso, agitado o inquieto',
    color: 'border-red-300 bg-red-50',
    activeColor: 'bg-red-500 border-red-500',
    badge: 'bg-red-100 text-red-700',
    severity: 'severe' as ScaleResult['severity'],
    sedation: 'Despierto — Sin sedación',
  },
  {
    value: 2,
    label: 'Nivel 2',
    description: 'Paciente cooperador, orientado y tranquilo',
    color: 'border-emerald-300 bg-emerald-50',
    activeColor: 'bg-emerald-600 border-emerald-600',
    badge: 'bg-emerald-100 text-emerald-700',
    severity: 'normal' as ScaleResult['severity'],
    sedation: 'Despierto — Sedación óptima',
  },
  {
    value: 3,
    label: 'Nivel 3',
    description: 'Paciente dormido, con respuesta a órdenes verbales',
    color: 'border-yellow-300 bg-yellow-50',
    activeColor: 'bg-yellow-500 border-yellow-500',
    badge: 'bg-yellow-100 text-yellow-700',
    severity: 'mild' as ScaleResult['severity'],
    sedation: 'Dormido — Sedación ligera',
  },
  {
    value: 4,
    label: 'Nivel 4',
    description: 'Paciente dormido, con respuesta rápida al estímulo glabelar o sonoro intenso',
    color: 'border-amber-300 bg-amber-50',
    activeColor: 'bg-amber-500 border-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    severity: 'mild' as ScaleResult['severity'],
    sedation: 'Dormido — Sedación moderada',
  },
  {
    value: 5,
    label: 'Nivel 5',
    description: 'Paciente dormido, con respuesta lenta al estímulo glabelar o sonoro intenso',
    color: 'border-orange-300 bg-orange-50',
    activeColor: 'bg-orange-500 border-orange-500',
    badge: 'bg-orange-100 text-orange-700',
    severity: 'moderate' as ScaleResult['severity'],
    sedation: 'Dormido — Sedación profunda',
  },
  {
    value: 6,
    label: 'Nivel 6',
    description: 'Paciente dormido, sin respuesta a estímulos',
    color: 'border-slate-400 bg-slate-100',
    activeColor: 'bg-slate-700 border-slate-700',
    badge: 'bg-slate-200 text-slate-700',
    severity: 'severe' as ScaleResult['severity'],
    sedation: 'Dormido — Sedación excesiva / Anestesia',
  },
];

function buildReport(level: (typeof LEVELS)[number]): string {
  const date = new Date().toLocaleDateString('es-ES');
  return `Escala de Ramsay — Nivel de sedación — ${date}

Nivel seleccionado: ${level.value}/6
Descripción: ${level.description}
Interpretación: ${level.sedation}

Niveles de referencia:
  1 — Paciente ansioso, agitado o inquieto (sin sedación)
  2 — Cooperador, orientado y tranquilo (sedación óptima) ✓
  3 — Dormido, responde a órdenes verbales (sedación ligera)
  4 — Dormido, respuesta rápida a estímulo glabelar/sonoro (sedación moderada)
  5 — Dormido, respuesta lenta a estímulo glabelar/sonoro (sedación profunda)
  6 — Dormido, sin respuesta a estímulos (sedación excesiva)

Referencia: Ramsay MA et al. BMJ 1974;2:656-659.`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function RamsayScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const level = selected !== null ? LEVELS[selected - 1] : null;

  return (
    <ScaleLayout
      title="Ramsay"
      subtitle="Escala de Ramsay — Nivel de sedación"
      score={selected ?? 0}
      maxScore={6}
      interpretation={level?.sedation ?? 'Selecciona nivel'}
      severity={level?.severity ?? 'normal'}
      onComplete={() => {
        if (!level) return;
        onComplete({
          scaleId: 'ramsay',
          scaleName: 'Escala de Ramsay',
          score: level.value,
          maxScore: 6,
          interpretation: level.sedation,
          severity: level.severity,
          reportText: buildReport(level),
          timestamp: Date.now(),
          answers: { nivel: level.value },
        });
      }}
      onBack={onBack}
      reportText={level ? buildReport(level) : ''}
      completeDisabled={!level}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-5 p-3 bg-warm-50 rounded-xl leading-relaxed">
        Escala de valoración del nivel de sedación. Ramsay et al., BMJ 1974.
        <br />
        <br />
        <span className="font-semibold text-slate-600">En cuidados paliativos</span> el objetivo no es
        mantener al paciente despierto y cooperador (nivel 2), sino aliviar el sufrimiento refractario. Los
        niveles 3-4 son habituales en sedación paliativa intermitente; los niveles 5-6 corresponden a sedación
        paliativa profunda y continua cuando el sufrimiento no puede controlarse de otro modo.
      </div>

      <div className="space-y-2.5">
        {LEVELS.map((l) => (
          <button
            key={l.value}
            onClick={() => setSelected(l.value)}
            className={`w-full text-left rounded-2xl border-2 px-4 py-3.5 transition-all
              ${selected === l.value ? l.activeColor + ' text-white' : l.color}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm mt-0.5
                ${selected === l.value ? 'bg-white/20 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}
              >
                {l.value}
              </div>
              <div className="flex-1">
                <div
                  className={`text-sm font-semibold mb-0.5 ${selected === l.value ? 'text-white' : 'text-slate-800'}`}
                >
                  {l.sedation}
                </div>
                <div
                  className={`text-xs leading-relaxed ${selected === l.value ? 'text-white/80' : 'text-slate-500'}`}
                >
                  {l.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </ScaleLayout>
  );
}
