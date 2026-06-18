import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// 4AT — Rapid Clinical Test for Delirium
// Bellelli G et al. BMJ Open 2014. Validated in acute settings.

interface Answers {
  alertness: 0 | 4 | null;
  amt4: 0 | 1 | 2 | null;
  attention: 0 | 1 | 2 | null;
  acute: 0 | 4 | null;
}

const INITIAL: Answers = { alertness: null, amt4: null, attention: null, acute: null };

function getScore(a: Answers): number {
  return (a.alertness ?? 0) + (a.amt4 ?? 0) + (a.attention ?? 0) + (a.acute ?? 0);
}

function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score === 0) return { text: 'Delirium improbable', severity: 'normal' };
  if (score <= 3) return { text: 'Posible deterioro cognitivo', severity: 'mild' };
  return { text: 'Posible/probable delirium', severity: 'severe' };
}

function buildReport(score: number, interp: string, a: Answers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const alertLabels: Record<number, string> = { 0: 'Normal / leve (0 pts)', 4: 'Claramente anormal (4 pts)' };
  const amt4Labels: Record<number, string> = {
    0: '0 errores (0 pts)',
    1: '1 error (1 pt)',
    2: '≥2 errores (2 pts)',
  };
  const attLabels: Record<number, string> = {
    0: '≥7 correctos (0 pts)',
    1: '≤6 o 1 error (1 pt)',
    2: 'No puede/rehúsa (2 pts)',
  };
  const acuteLabels: Record<number, string> = { 0: 'No (0 pts)', 4: 'Sí (4 pts)' };
  return `4AT — Cribado rápido de delirium — ${date}
Puntuación total: ${score}/12 — ${interp}

1. Nivel de alerta: ${a.alertness !== null ? alertLabels[a.alertness] : '—'}
2. Orientación AMT4: ${a.amt4 !== null ? amt4Labels[a.amt4] : '—'}
3. Atención (meses al revés): ${a.attention !== null ? attLabels[a.attention] : '—'}
4. Cambio agudo/fluctuante: ${a.acute !== null ? acuteLabels[a.acute] : '—'}

Interpretación:
  0 pts    → Delirium improbable
  1-3 pts  → Posible deterioro cognitivo sin delirium
  ≥4 pts   → Posible/probable delirium — valorar evaluación completa

Referencia: Bellelli G et al. Validation of the 4AT, a new instrument for rapid delirium screening.
Age Ageing. 2014;43(4):496-502. www.the4at.com`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function CuatroATScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [a, setA] = useState<Answers>(INITIAL);
  const answeredCount = Object.values(a).filter((v) => v !== null).length;
  const score = getScore(a);
  const { text: interpText, severity } = interpret(score);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => {
    setA((prev) => ({ ...prev, [k]: v }));
    onMarkDirty?.();
  };

  return (
    <ScaleLayout
      title="4AT"
      subtitle="Cribado rápido de delirium"
      score={score}
      maxScore={12}
      interpretation={interpText}
      severity={severity}
      progress={{ answered: answeredCount, total: 4 }}
      onComplete={() =>
        onComplete({
          scaleId: '4at',
          scaleName: '4AT',
          score,
          maxScore: 12,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, a),
          timestamp: Date.now(),
          answers: {
            alertness: a.alertness ?? 0,
            amt4: a.amt4 ?? 0,
            attention: a.attention ?? 0,
            acute: a.acute ?? 0,
          },
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, a)}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-5 p-3 bg-warm-50 rounded-xl leading-relaxed">
        Test de cribado rápido de delirium. No requiere colaboración del paciente para el ítem 1. Administrar
        en 2 minutos.
      </div>

      {/* 1. Alertness */}
      <div className="mb-5">
        <div className="text-sm font-semibold text-slate-800 mb-1">1. Nivel de alerta</div>
        <div className="text-xs text-slate-500 mb-3 leading-relaxed">
          Observar al paciente durante la entrevista. Si en algún momento presenta somnolencia marcada (cierra
          los ojos), agitación o inatención anormal, puntuar 4.
        </div>
        <div className="space-y-1.5">
          {(
            [
              { label: 'Normal (completamente alerta, no agitado durante la entrevista)', value: 0 as const },
              {
                label: 'Leve somnolencia durante <10 seg al despertar o agitación leve breve',
                value: 0 as const,
                sub: true,
              },
              { label: 'Claramente anormal', value: 4 as const },
            ] as { label: string; value: 0 | 4; sub?: boolean }[]
          ).map((opt, idx) => (
            <button
              key={idx}
              onClick={() => set('alertness', opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                ${
                  a.alertness === opt.value && !(opt.sub && a.alertness === 0 && idx === 2)
                    ? 'bg-clinical-600 text-white border-clinical-600'
                    : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                }`}
            >
              <span className="font-medium text-left leading-snug">{opt.label}</span>
              <span
                className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0 ${a.alertness === opt.value ? 'text-white/70' : 'text-slate-400'}`}
              >
                {opt.value} pts
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. AMT4 */}
      <div className="mb-5">
        <div className="text-sm font-semibold text-slate-800 mb-1">2. Orientación — AMT4</div>
        <div className="text-xs text-slate-500 mb-1 leading-relaxed">
          Preguntar:{' '}
          <strong>
            ¿Qué edad tiene? · ¿Cuál es su fecha de nacimiento? · ¿En qué lugar estamos? · ¿En qué año
            estamos?
          </strong>
        </div>
        <div className="text-xs text-slate-400 mb-3">No orientar ni ayudar. Contar errores u omisiones.</div>
        <div className="space-y-1.5">
          {(
            [
              { label: 'Sin errores', value: 0 as const },
              { label: '1 error / omisión', value: 1 as const },
              { label: '2 o más errores / omisiones', value: 2 as const },
            ] as { label: string; value: 0 | 1 | 2 }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('amt4', opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                ${a.amt4 === opt.value ? 'bg-clinical-600 text-white border-clinical-600' : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'}`}
            >
              <span className="font-medium">{opt.label}</span>
              <span
                className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0 ${a.amt4 === opt.value ? 'text-white/70' : 'text-slate-400'}`}
              >
                {opt.value} pts
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Attention */}
      <div className="mb-5">
        <div className="text-sm font-semibold text-slate-800 mb-1">3. Atención</div>
        <div className="text-xs text-slate-500 mb-1 leading-relaxed">
          Pedir al paciente que diga los <strong>meses del año al revés</strong>, empezando por diciembre.
        </div>
        <div className="text-xs text-slate-400 mb-3">
          Detener si no puede empezar o comete ≥2 errores consecutivos. Si el paciente no puede realizar la
          prueba por causa diferente al delirium (idioma, déficit grave), puntuar 0 y anotarlo.
        </div>
        <div className="space-y-1.5">
          {(
            [
              { label: '7 o más meses correctos', value: 0 as const },
              { label: 'Menos de 7 meses correctos', value: 1 as const },
              { label: 'No puede empezar o rehúsa la prueba', value: 2 as const },
            ] as { label: string; value: 0 | 1 | 2 }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('attention', opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                ${a.attention === opt.value ? 'bg-clinical-600 text-white border-clinical-600' : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'}`}
            >
              <span className="font-medium text-left leading-snug">{opt.label}</span>
              <span
                className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0 ${a.attention === opt.value ? 'text-white/70' : 'text-slate-400'}`}
              >
                {opt.value} pts
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Acute change */}
      <div className="mb-5">
        <div className="text-sm font-semibold text-slate-800 mb-1">4. Cambio agudo o curso fluctuante</div>
        <div className="text-xs text-slate-500 mb-3 leading-relaxed">
          ¿Hay evidencia de cambio agudo o curso fluctuante en: nivel de alerta, cognición, u otra función
          mental? Preguntar a familiar/cuidador o revisar historial clínico.
        </div>
        <div className="space-y-1.5">
          {(
            [
              { label: 'No', value: 0 as const },
              { label: 'Sí', value: 4 as const },
            ] as { label: string; value: 0 | 4 }[]
          ).map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('acute', opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                ${a.acute === opt.value ? 'bg-clinical-600 text-white border-clinical-600' : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'}`}
            >
              <span className="font-medium">{opt.label}</span>
              <span
                className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0 ${a.acute === opt.value ? 'text-white/70' : 'text-slate-400'}`}
              >
                {opt.value} pts
              </span>
            </button>
          ))}
        </div>
      </div>
    </ScaleLayout>
  );
}
