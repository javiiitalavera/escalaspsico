import { useState, useCallback } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

const DOMAINS = [
  { key: 'delirios', label: 'Delirios' },
  { key: 'alucinaciones', label: 'Alucinaciones' },
  { key: 'agitacion', label: 'Agitación / Agresividad' },
  { key: 'depresion', label: 'Depresión / Disforia' },
  { key: 'ansiedad', label: 'Ansiedad' },
  { key: 'euforia', label: 'Euforia / Elación' },
  { key: 'apatia', label: 'Apatía / Indiferencia' },
  { key: 'desinhibicion', label: 'Desinhibición' },
  { key: 'irritabilidad', label: 'Irritabilidad / Labilidad' },
  { key: 'motora', label: 'Conducta motora aberrante' },
  { key: 'suenyo', label: 'Conducta nocturna / Sueño' },
  { key: 'apetito', label: 'Apetito / Trastornos alimentarios' },
] as const;

type DomainKey = (typeof DOMAINS)[number]['key'];
type NPIAnswers = Record<DomainKey, number | null>;

const INITIAL: NPIAnswers = Object.fromEntries(DOMAINS.map((d) => [d.key, null])) as NPIAnswers;
const SEVERITY_LABELS = ['Ausente', 'Leve', 'Moderado', 'Grave'];

export function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score <= 3) return { text: 'Carga mínima', severity: 'normal' };
  if (score <= 12) return { text: 'Carga leve', severity: 'mild' };
  if (score <= 24) return { text: 'Carga moderada', severity: 'moderate' };
  return { text: 'Carga alta', severity: 'severe' };
}

function buildReport(score: number, interp: string, a: NPIAnswers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const items = DOMAINS.filter((d) => (a[d.key] ?? 0) > 0)
    .map((d) => `  ${d.label}: ${SEVERITY_LABELS[a[d.key] as number]}`)
    .join('\n');
  return `NPI-Q (Neuropsychiatric Inventory Questionnaire) — ${date}\nPuntuación total: ${score}/36 — ${interp}\n\nDominios alterados:\n${items || '  Ninguno'}\n\nPuntos de corte: 0-3 mínima · 4-12 leve · 13-24 moderada · >24 alta\nReferencia: Kaufer DI et al. J Neuropsychiatry Clin Neurosci. 2000;12(2):233-239.`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function NPIQScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<NPIAnswers>(INITIAL);
  const set = useCallback((k: DomainKey, v: number) => setAnswers((prev) => ({ ...prev, [k]: v })), []);

  const answeredCount = Object.values(answers).filter((v) => v !== null).length;
  const score = Object.values(answers).reduce<number>((a, b) => a + (b ?? 0), 0);
  const { text: interpText, severity } = interpret(score);

  const handleComplete = () => {
    onComplete({
      scaleId: 'npi',
      scaleName: 'NPI-Q',
      score,
      maxScore: 36,
      interpretation: interpText,
      severity,
      reportText: buildReport(score, interpText, answers),
      timestamp: Date.now(),
      answers: Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, v ?? 0])),
    });
  };

  return (
    <ScaleLayout
      title="NPI-Q"
      subtitle="Neuropsychiatric Inventory Questionnaire"
      score={score}
      maxScore={36}
      interpretation={interpText}
      severity={severity}
      onComplete={handleComplete}
      onBack={onBack}
      reportText={buildReport(score, interpText, answers)}
      progress={{ answered: answeredCount, total: 12 }}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-4 p-3 bg-warm-50 rounded-xl">
        Informante (cuidador/familiar). Valorar los últimos 30 días. Puntúe la <strong>gravedad</strong> si el
        síntoma está presente.
      </div>
      {DOMAINS.map((domain) => (
        <div key={domain.key} className="mb-4">
          <div className="text-sm font-semibold text-slate-800 mb-2">{domain.label}</div>
          <div className="grid grid-cols-4 gap-2">
            {SEVERITY_LABELS.map((label, idx) => (
              <button
                key={idx}
                onClick={() => set(domain.key, idx)}
                className={`h-12 rounded-xl text-xs font-semibold border transition-all
                  ${
                    answers[domain.key] === idx
                      ? idx === 0
                        ? 'bg-slate-600 text-white border-slate-600'
                        : idx === 1
                          ? 'bg-amber-500 text-white border-amber-500'
                          : idx === 2
                            ? 'bg-orange-500 text-white border-orange-500'
                            : 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
              >
                {label}
                <span className="block text-[10px] opacity-75 mt-0.5">{idx}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </ScaleLayout>
  );
}
