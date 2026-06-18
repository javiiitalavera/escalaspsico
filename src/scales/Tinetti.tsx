import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

const EQUILIBRIO_ITEMS = [
  { key: 'eq1', label: 'Equilibrio sentado', opts: ['Se inclina o desliza', 'Firme y seguro'] },
  {
    key: 'eq2',
    label: 'Levantarse',
    opts: ['Incapaz sin ayuda', 'Capaz con apoyo en brazos', 'Sin ayuda de brazos'],
  },
  { key: 'eq3', label: 'Intentos de levantarse', opts: ['Incapaz', 'Capaz >1 intento', 'Capaz 1 intento'] },
  {
    key: 'eq4',
    label: 'Equilibrio al ponerse de pie (5s)',
    opts: ['Inestable', 'Estable con apoyo', 'Estable sin apoyo'],
  },
  {
    key: 'eq5',
    label: 'Equilibrio de pie',
    opts: ['Inestable', 'Estable con base amplia', 'Estable base estrecha'],
  },
  { key: 'eq6', label: 'Empujar (3 veces)', opts: ['Cae', 'Se tambalea pero se sostiene', 'Firme'] },
  { key: 'eq7', label: 'Ojos cerrados (de pie)', opts: ['Inestable', 'Estable'] },
  { key: 'eq8', label: 'Giro de 360°', opts: ['Pasos discontinuos', 'Pasos continuos'] },
  { key: 'eq9', label: 'Giro de 360° (estabilidad)', opts: ['Inestable', 'Estable'] },
  {
    key: 'eq10',
    label: 'Sentarse',
    opts: ['Inseguro / cae en silla', 'Usa brazos o movimiento brusco', 'Seguro y suave'],
  },
] as const;

const MARCHA_ITEMS = [
  { key: 'ma1', label: 'Inicio de la marcha', opts: ['Vacilación / múltiples intentos', 'Sin vacilación'] },
  {
    key: 'ma2',
    label: 'Longitud del paso (pie derecho)',
    opts: ['No supera pie izquierdo', 'Supera pie izquierdo'],
  },
  {
    key: 'ma3',
    label: 'Longitud del paso (pie izquierdo)',
    opts: ['No supera pie derecho', 'Supera pie derecho'],
  },
  { key: 'ma4', label: 'Simetría del paso', opts: ['Asimétrico', 'Simétrico'] },
  { key: 'ma5', label: 'Continuidad del paso', opts: ['Interrupciones', 'Continuo'] },
  {
    key: 'ma6',
    label: 'Trayectoria (3 metros)',
    opts: ['Desviación marcada', 'Desviación leve/moderada', 'Trayectoria recta'],
  },
  {
    key: 'ma7',
    label: 'Tronco',
    opts: [
      'Balanceo marcado',
      'Balanceo leve / rodillas/espalda flexionadas',
      'Sin balanceo, rodillas/espalda derechas',
    ],
  },
  { key: 'ma8', label: 'Postura al caminar', opts: ['Talones separados', 'Talones casi se tocan'] },
] as const;

type EqKey = (typeof EQUILIBRIO_ITEMS)[number]['key'];
type MaKey = (typeof MARCHA_ITEMS)[number]['key'];
type TinettiAnswers = Record<EqKey | MaKey, number>;

const INITIAL = Object.fromEntries([
  ...EQUILIBRIO_ITEMS.map((i) => [i.key, 0]),
  ...MARCHA_ITEMS.map((i) => [i.key, 0]),
]) as TinettiAnswers;

export function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score >= 24) return { text: 'Bajo riesgo de caída', severity: 'normal' };
  if (score >= 19) return { text: 'Riesgo moderado de caída', severity: 'moderate' };
  return { text: 'Alto riesgo de caída', severity: 'severe' };
}

function buildReport(score: number, eqScore: number, maScore: number, interp: string): string {
  const date = new Date().toLocaleDateString('es-ES');
  return `Test de Tinetti — ${date}
Puntuación total: ${score}/28 — ${interp}

• Subescala equilibrio: ${eqScore}/16
• Subescala marcha: ${maScore}/12`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

function ItemSelector({
  item,
  value,
  onChange,
}: {
  item: { key: string; label: string; opts: readonly string[] };
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-4">
      <div className="text-sm font-semibold text-slate-800 mb-1.5">{item.label}</div>
      <div className="flex flex-wrap gap-2">
        {item.opts.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onChange(idx)}
            className={`flex-1 min-w-0 py-2.5 px-2 rounded-xl text-xs font-medium border transition-all
              ${value === idx ? 'bg-clinical-600 text-white border-clinical-600' : 'bg-white text-slate-600 border-slate-200'}`}
          >
            <span className="font-bold block">{idx}</span>
            <span className="leading-tight">{opt}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function TinettiScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<TinettiAnswers>(INITIAL);
  const set = (k: EqKey | MaKey, v: number) => setAnswers((prev) => ({ ...prev, [k]: v }));

  const answeredCount = [...Object.values(answers)].filter((v) => v !== 0 || true).length; // all items shown
  const eqScore = EQUILIBRIO_ITEMS.reduce((sum, item) => sum + answers[item.key], 0);
  const maScore = MARCHA_ITEMS.reduce((sum, item) => sum + answers[item.key], 0);
  const score = eqScore + maScore;
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="Tinetti"
      subtitle="Test de equilibrio y marcha"
      score={score}
      maxScore={28}
      interpretation={interpText}
      severity={severity}
      onComplete={() =>
        onComplete({
          scaleId: 'tinetti',
          scaleName: 'Tinetti',
          score,
          maxScore: 28,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, eqScore, maScore, interpText),
          timestamp: Date.now(),
          answers: answers as Record<string, number>,
        })
      }
      onBack={onBack}
      reportText={buildReport(score, eqScore, maScore, interpText)}
      progress={{ answered: Object.values(answers).filter((v) => v > 0).length, total: 18 }}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">
        Equilibrio — {eqScore}/16
      </div>
      {EQUILIBRIO_ITEMS.map((item) => (
        <ItemSelector
          key={item.key}
          item={item}
          value={answers[item.key]}
          onChange={(v) => set(item.key, v)}
        />
      ))}
      <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3 mt-4">
        Marcha — {maScore}/12
      </div>
      {MARCHA_ITEMS.map((item) => (
        <ItemSelector
          key={item.key}
          item={item}
          value={answers[item.key]}
          onChange={(v) => set(item.key, v)}
        />
      ))}
    </ScaleLayout>
  );
}
