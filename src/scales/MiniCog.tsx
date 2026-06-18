import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// Mini-Cog — 3-word recall + Clock Drawing Test
// Borson S et al. Int J Geriatr Psychiatry. 2000;15(11):1021-1027.

interface Answers {
  palabras: 0 | 1 | 2 | 3 | null; // palabras recordadas sin pista
  reloj: 0 | 1 | 2 | null; // 0=anormal, 1=dudoso, 2=normal
}

const INITIAL: Answers = { palabras: null, reloj: null };

function getScore(a: Answers): number {
  return (a.palabras ?? 0) + (a.reloj === 2 ? 2 : a.reloj === 1 ? 1 : 0);
}

function interpret(a: Answers): { text: string; severity: ScaleResult['severity'] } {
  const palabras = a.palabras ?? 0;
  const reloj = a.reloj;
  if (palabras === 0) return { text: 'Cribado positivo — posible demencia', severity: 'severe' };
  if (palabras <= 2 && reloj !== 2)
    return { text: 'Cribado positivo — posible demencia', severity: 'moderate' };
  if (palabras === 3 || reloj === 2)
    return { text: 'Cribado negativo — demencia improbable', severity: 'normal' };
  return { text: 'Resultado indeterminado', severity: 'mild' };
}

function buildReport(score: number, interp: string, a: Answers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const relojLabel = a.reloj === 2 ? 'Normal' : a.reloj === 1 ? 'Dudoso' : a.reloj === 0 ? 'Anormal' : '—';
  return `Mini-Cog — Cribado cognitivo breve — ${date}
Puntuación total: ${score}/5 — ${interp}

Recuerdo de palabras: ${a.palabras ?? '—'}/3
Test del Reloj: ${relojLabel} (${a.reloj === 2 ? '2' : a.reloj === 1 ? '1' : '0'}/2 pts)

Algoritmo de interpretación:
  0 palabras recordadas              → Cribado positivo
  1-2 palabras + reloj anormal/dudoso → Cribado positivo
  1-2 palabras + reloj normal        → Cribado negativo
  3 palabras recordadas              → Cribado negativo

Referencia: Borson S et al. Int J Geriatr Psychiatry. 2000;15(11):1021-1027.`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function MiniCogScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [a, setA] = useState<Answers>(INITIAL);
  const answeredCount = [a.palabras, a.reloj].filter((v) => v !== null).length;
  const score = getScore(a);
  const { text: interpText, severity } = interpret(a);

  const set = <K extends keyof Answers>(k: K, v: Answers[K]) => {
    setA((prev) => ({ ...prev, [k]: v }));
    onMarkDirty?.();
  };

  return (
    <ScaleLayout
      title="Mini-Cog"
      subtitle="Cribado cognitivo breve"
      score={score}
      maxScore={5}
      interpretation={interpText}
      severity={severity}
      progress={{ answered: answeredCount, total: 2 }}
      onComplete={() =>
        onComplete({
          scaleId: 'minicog',
          scaleName: 'Mini-Cog',
          score,
          maxScore: 5,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, a),
          timestamp: Date.now(),
          answers: { palabras: a.palabras ?? 0, reloj: a.reloj ?? 0 },
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, a)}
      onMarkDirty={onMarkDirty}
    >
      {/* Instrucciones */}
      <div className="text-xs text-slate-500 mb-5 p-3 bg-warm-50 rounded-xl leading-relaxed space-y-1.5">
        <p>
          <strong>1.</strong> Decir 3 palabras no relacionadas (p. ej. <em>pelota · bandera · árbol</em>).
          Pedir que las repita y las memorice.
        </p>
        <p>
          <strong>2.</strong> Pedir que dibuje un reloj con todos los números y marque las 11:10.
        </p>
        <p>
          <strong>3.</strong> Pedir que recuerde las 3 palabras sin pista.
        </p>
      </div>

      {/* Palabras */}
      <div className="mb-6">
        <div className="text-sm font-semibold text-slate-800 mb-1">
          Recuerdo de palabras <span className="text-slate-400 font-normal text-xs">(sin pista)</span>
        </div>
        <div className="text-xs text-slate-400 mb-3">
          Contar solo las recordadas espontáneamente, sin ayuda.
        </div>
        <div className="grid grid-cols-4 gap-2">
          {([0, 1, 2, 3] as const).map((n) => (
            <button
              key={n}
              onClick={() => set('palabras', n)}
              className={`h-14 rounded-xl border text-sm font-bold transition-all
                ${
                  a.palabras === n
                    ? n === 3
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : n === 0
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                }`}
            >
              {n}
              <span className="block text-[10px] font-normal opacity-75 mt-0.5">
                {n === 0 ? 'ninguna' : n === 1 ? 'palabra' : 'palabras'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reloj */}
      <div className="mb-5">
        <div className="text-sm font-semibold text-slate-800 mb-1">Test del Reloj</div>
        <div className="text-xs text-slate-400 mb-3 leading-relaxed">
          Normal: todos los números en posición correcta + manecillas marcando la hora indicada.
          <br />
          Anormal: números incorrectos o ausentes, manecillas incorrectas o ausentes.
        </div>
        <div className="space-y-1.5">
          {[
            {
              value: 2 as const,
              label: 'Normal',
              sub: 'Esfera completa, números correctos, hora correcta',
              color: (v: number | null) =>
                v === 2
                  ? 'bg-emerald-500 text-white border-emerald-500'
                  : 'bg-white text-slate-700 border-slate-200',
            },
            {
              value: 1 as const,
              label: 'Dudoso',
              sub: 'Algún error menor, no claramente anormal',
              color: (v: number | null) =>
                v === 1
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-slate-700 border-slate-200',
            },
            {
              value: 0 as const,
              label: 'Anormal',
              sub: 'Errores claros en números o manecillas',
              color: (v: number | null) =>
                v === 0 ? 'bg-red-500 text-white border-red-500' : 'bg-white text-slate-700 border-slate-200',
            },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('reloj', opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${opt.color(a.reloj)}`}
            >
              <div className="text-left">
                <div className="font-semibold">{opt.label}</div>
                <div
                  className={`text-xs mt-0.5 ${a.reloj === opt.value ? 'text-white/70' : 'text-slate-400'}`}
                >
                  {opt.sub}
                </div>
              </div>
              <span
                className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0 ${a.reloj === opt.value ? 'text-white/70' : 'text-slate-400'}`}
              >
                {opt.value === 2 ? '2' : opt.value === 1 ? '1' : '0'} pts
              </span>
            </button>
          ))}
        </div>
      </div>
    </ScaleLayout>
  );
}
