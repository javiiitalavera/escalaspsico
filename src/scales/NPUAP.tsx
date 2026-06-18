import { useState, memo } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// SVG cross-section illustrations for each stage.
// Memoizado: el SVG solo depende de `stage`, evita re-renders al cambiar selección.
const SkinLayersSVG = memo(function SkinLayersSVG({ stage }: { stage: number }) {
  // Shared skin layer anatomy
  // stage: 0=none selected, 1,2,3,4,5=unstageable,6=DTI
  const w = 280,
    h = 140;

  // Layer colors
  const epidermisColor = '#f5c5a3';
  const dermisColor = '#e8956d';
  const subQColor = '#f5e6b0';
  const muscleColor = '#d9534f';
  const boneColor = '#b8a89a';
  const woundColor = '#8b2020';
  const escharColor = '#3a2a1a';
  const dtiColor = '#6b3a5c';

  // Base layers (always shown)
  const baseLayers = (
    <>
      {/* Bone */}
      <rect x={60} y={118} width={160} height={16} rx={4} fill={boneColor} />
      {/* Muscle */}
      <rect x={40} y={96} width={200} height={26} rx={2} fill={muscleColor} />
      {/* Subcutaneous */}
      <rect x={20} y={68} width={240} height={32} rx={2} fill={subQColor} />
      {/* Dermis */}
      <rect x={20} y={44} width={240} height={28} rx={2} fill={dermisColor} />
      {/* Epidermis */}
      <rect x={20} y={28} width={240} height={20} rx={8} fill={epidermisColor} />

      {/* Layer labels */}
      <text x={268} y={40} textAnchor="end" fontSize={7} fill="#c0784a" fontFamily="system-ui">
        Epidermis
      </text>
      <text x={268} y={60} textAnchor="end" fontSize={7} fill="#a05030" fontFamily="system-ui">
        Dermis
      </text>
      <text x={268} y={86} textAnchor="end" fontSize={7} fill="#8a7a30" fontFamily="system-ui">
        Subcutáneo
      </text>
      <text x={268} y={108} textAnchor="end" fontSize={7} fill="#c04040" fontFamily="system-ui">
        Músculo
      </text>
      <text x={268} y={128} textAnchor="end" fontSize={7} fill="#7a6a60" fontFamily="system-ui">
        Hueso
      </text>
    </>
  );

  let wound = null;
  if (stage === 1) {
    // Stage I: skin intact, redness only
    wound = <rect x={90} y={28} width={100} height={20} rx={8} fill="#e05050" opacity={0.5} />;
  } else if (stage === 2) {
    // Stage II: partial thickness — epidermis/upper dermis
    wound = (
      <>
        <rect x={90} y={28} width={100} height={20} rx={8} fill={woundColor} opacity={0.85} />
        <ellipse cx={140} cy={44} rx={50} ry={8} fill={woundColor} opacity={0.7} />
      </>
    );
  } else if (stage === 3) {
    // Stage III: full thickness to subcutaneous
    wound = (
      <>
        <rect x={90} y={28} width={100} height={20} rx={8} fill={woundColor} />
        <rect x={100} y={44} width={80} height={28} fill={woundColor} opacity={0.9} />
        <ellipse cx={140} cy={72} rx={40} ry={7} fill={woundColor} opacity={0.6} />
      </>
    );
  } else if (stage === 4) {
    // Stage IV: full thickness to muscle/bone
    wound = (
      <>
        <rect x={90} y={28} width={100} height={20} rx={8} fill={woundColor} />
        <rect x={100} y={44} width={80} height={28} fill={woundColor} />
        <rect x={110} y={68} width={60} height={32} fill={woundColor} opacity={0.9} />
        <ellipse cx={140} cy={100} rx={30} ry={6} fill={woundColor} opacity={0.7} />
      </>
    );
  } else if (stage === 5) {
    // Unstageable: covered by eschar/slough
    wound = (
      <>
        <rect x={90} y={28} width={100} height={20} rx={8} fill={woundColor} />
        <rect x={100} y={44} width={80} height={20} fill={woundColor} opacity={0.5} />
        {/* Eschar covering */}
        <rect x={88} y={26} width={104} height={22} rx={8} fill={escharColor} opacity={0.9} />
        <text x={140} y={41} textAnchor="middle" fontSize={7} fill="#c8a060" fontFamily="system-ui">
          Escara / esfacelo
        </text>
      </>
    );
  } else if (stage === 6) {
    // DTI: deep tissue injury — deep purple discoloration, skin intact
    wound = (
      <>
        <rect x={90} y={28} width={100} height={20} rx={8} fill={dtiColor} opacity={0.6} />
        <ellipse cx={140} cy={56} rx={45} ry={12} fill={dtiColor} opacity={0.5} />
        <ellipse cx={140} cy={68} rx={35} ry={10} fill={dtiColor} opacity={0.4} />
      </>
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full rounded-xl" style={{ maxHeight: 140 }}>
      {baseLayers}
      {wound}
      {/* Pressure arrow */}
      <text x={140} y={16} textAnchor="middle" fontSize={9} fill="#475569" fontFamily="system-ui">
        ↓ Presión
      </text>
    </svg>
  );
});

const STAGES = [
  {
    id: 1,
    label: 'Categoría I',
    sublabel: 'Eritema no blanqueable',
    color: 'bg-yellow-50 border-yellow-300',
    activeColor: 'bg-yellow-100 border-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800',
    description:
      'Piel intacta con eritema no blanqueable en zona localizada. Puede ser dolorosa, firme, blanda, más caliente o más fría que el tejido circundante.',
    severity: 'mild' as ScaleResult['severity'],
  },
  {
    id: 2,
    label: 'Categoría II',
    sublabel: 'Pérdida parcial del espesor de la piel',
    color: 'bg-orange-50 border-orange-300',
    activeColor: 'bg-orange-100 border-orange-500',
    badge: 'bg-orange-100 text-orange-800',
    description:
      'Pérdida parcial del espesor de la piel con exposición de dermis. El lecho de la herida es viable, rosado o rojo, húmedo. Puede presentarse como flictena (ampolla) intacta o rota.',
    severity: 'moderate' as ScaleResult['severity'],
  },
  {
    id: 3,
    label: 'Categoría III',
    sublabel: 'Pérdida total del espesor de la piel',
    color: 'bg-red-50 border-red-300',
    activeColor: 'bg-red-100 border-red-500',
    badge: 'bg-red-100 text-red-800',
    description:
      'Pérdida total del espesor de la piel. Tejido adiposo visible, puede haber tejido de granulación. Puede haber socavamiento y tunelización. Sin exposición de fascia, músculo, tendón, ligamento o hueso.',
    severity: 'severe' as ScaleResult['severity'],
  },
  {
    id: 4,
    label: 'Categoría IV',
    sublabel: 'Pérdida total del espesor de los tejidos',
    color: 'bg-red-100 border-red-500',
    activeColor: 'bg-red-200 border-red-700',
    badge: 'bg-red-200 text-red-900',
    description:
      'Pérdida total del espesor de los tejidos con exposición o palpación directa de fascia, músculo, tendón, ligamento, cartílago o hueso. Puede haber esfacelo o escara. Puede incluir socavamiento y tunelización.',
    severity: 'severe' as ScaleResult['severity'],
  },
  {
    id: 5,
    label: 'No estadiable',
    sublabel: 'Profundidad desconocida',
    color: 'bg-slate-50 border-slate-300',
    activeColor: 'bg-slate-100 border-slate-500',
    badge: 'bg-slate-200 text-slate-800',
    description:
      'Pérdida total del espesor de la piel y de los tejidos en la que la extensión del daño no puede confirmarse porque está cubierta por esfacelo o escara. Hasta su retirada no puede determinarse la categoría real.',
    severity: 'severe' as ScaleResult['severity'],
  },
  {
    id: 6,
    label: 'Lesión tejido profundo',
    sublabel: 'LTP — Profundidad desconocida',
    color: 'bg-purple-50 border-purple-300',
    activeColor: 'bg-purple-100 border-purple-500',
    badge: 'bg-purple-100 text-purple-800',
    description:
      'Piel intacta o no intacta con área localizada de color rojo oscuro, marrón o púrpura persistente, o separación epidérmica que deja al descubierto un lecho de la herida oscuro o flictena con sangre. El dolor y el cambio de temperatura preceden con frecuencia a los cambios de color.',
    severity: 'severe' as ScaleResult['severity'],
  },
];

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function NPUAPScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [selected, setSelected] = useState<number | null>(null);
  const stage = selected !== null ? STAGES[selected] : null;

  const reportText = stage
    ? `Clasificación NPUAP/EPUAP de Úlcera por Presión — ${new Date().toLocaleDateString('es-ES')}\n\n${stage.label}: ${stage.sublabel}\n\n${stage.description}\n\nClasificación basada en: National Pressure Ulcer Advisory Panel / European Pressure Ulcer Advisory Panel.`
    : '';

  return (
    <ScaleLayout
      title="NPUAP/EPUAP"
      subtitle="Clasificación de Úlceras por Presión"
      score={selected !== null ? selected + 1 : 0}
      maxScore={6}
      interpretation={stage?.sublabel ?? 'Selecciona categoría'}
      severity={stage?.severity ?? 'normal'}
      onComplete={() => {
        if (!stage) return;
        onComplete({
          scaleId: 'npuap',
          scaleName: 'NPUAP/EPUAP',
          score: selected! + 1,
          maxScore: 6,
          interpretation: `${stage.label}: ${stage.sublabel}`,
          severity: stage.severity,
          reportText,
          timestamp: Date.now(),
          answers: { categoria: selected! + 1 },
        });
      }}
      onBack={onBack}
      reportText={reportText}
      completeDisabled={selected === null}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-4 p-3 bg-warm-50 rounded-xl">
        Selecciona la categoría que mejor describe la lesión observada. Las ilustraciones muestran la
        profundidad afectada en corte transversal.
      </div>

      {STAGES.map((s, i) => (
        <button
          key={s.id}
          onClick={() => setSelected(i)}
          className={`w-full text-left rounded-2xl border-2 p-4 mb-3 transition-all
            ${selected === i ? s.activeColor : s.color}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.badge}`}>{s.label}</span>
            <span className="text-sm font-semibold text-slate-800">{s.sublabel}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">{s.description}</p>
          {/* SVG illustration */}
          <div className="bg-white rounded-xl p-2 border border-slate-100">
            <SkinLayersSVG stage={s.id} />
          </div>
        </button>
      ))}
    </ScaleLayout>
  );
}
