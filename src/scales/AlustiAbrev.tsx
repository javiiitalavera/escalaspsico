import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// Test Alusti Abreviado — ítems 1, 4, 6, 7, 8 del completo, baremo 0-50
// Ítem 1: 4 extremidades × 0-2 = máx 8
// Ítem 4: 0-5, Ítem 6: 0-5, Ítem 7: 0-25, Ítem 8: 0-7 → total máx 50

interface Answers {
  i1_esd: number;
  i1_esi: number;
  i1_eid: number;
  i1_eii: number;
  i4: number;
  i6: number;
  i7: number;
  i8: number;
}

const INITIAL: Answers = {
  i1_esd: 0,
  i1_esi: 0,
  i1_eid: 0,
  i1_eii: 0,
  i4: 0,
  i6: 0,
  i7: 0,
  i8: 0,
};

function getScore(a: Answers): number {
  return Math.min(50, a.i1_esd + a.i1_esi + a.i1_eid + a.i1_eii + a.i4 + a.i6 + a.i7 + a.i8);
}

function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score < 16) return { text: 'Dependencia total', severity: 'severe' };
  if (score <= 30) return { text: 'Dependencia moderada-severa', severity: 'severe' };
  if (score <= 36) return { text: 'Dependencia leve', severity: 'moderate' };
  return { text: 'Movilidad conservada', severity: 'normal' };
}

function buildReport(score: number, interp: string, a: Answers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const i1sum = a.i1_esd + a.i1_esi + a.i1_eid + a.i1_eii;
  return `Test Alusti (versión abreviada) — ${date}
Puntuación: ${score}/50 — ${interp}

Ítem 1. Articular pasivo (0-2 por extremidad):
  ESD: ${a.i1_esd} · ESI: ${a.i1_esi} · EID: ${a.i1_eid} · EII: ${a.i1_eii} → subtotal: ${i1sum}/8
Ítem 4. Tronco en sedestación: ${a.i4}/5
Ítem 6. Bipedestación: ${a.i6}/5
Ítem 7. Marcha: ${a.i7}/25
Ítem 8. Radio de acción de marcha: ${a.i8}/7

Baremo: <16 dep. total · 16-30 dep. moderada-severa · 31-36 dep. leve · >36 movilidad conservada
Fuente: testalusti.eu`;
}

const PASIVO_OPTS = [
  { label: '0 — No funcional', value: 0 },
  { label: '1 — Funcional', value: 1 },
  { label: '2 — Bueno', value: 2 },
];

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

// Compact table grid for 4 extremidades
function ExtremidadGrid({
  prefix,
  values,
  onChange,
}: {
  prefix: string;
  values: { key: string; value: number }[];
  onChange: (key: string, v: number) => void;
}) {
  const EE = ['ESD', 'ESI', 'EID', 'EII'];
  const descs = ['No funcional', 'Funcional', 'Bueno'];
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
      <div className="flex bg-slate-50 border-b border-slate-200">
        <div className="w-12 flex-shrink-0" />
        {[0, 1, 2].map((v) => (
          <div key={v} className="flex-1 text-center py-1.5 text-[11px] font-bold text-slate-500">
            {v}
          </div>
        ))}
        <div className="w-16 flex-shrink-0 px-2 py-1.5 text-[10px] font-semibold text-slate-400 text-right uppercase tracking-wide">
          val
        </div>
      </div>
      {values.map((row, rowIdx) => (
        <div
          key={row.key}
          className={`flex items-center ${rowIdx < values.length - 1 ? 'border-b border-slate-100' : ''}`}
        >
          <div className="w-12 flex-shrink-0 px-2 py-2 text-[11px] font-bold text-slate-500">
            {EE[rowIdx]}
          </div>
          {[0, 1, 2].map((v) => (
            <div key={`${prefix}-${row.key}-${v}`} className="flex-1 flex items-center justify-center py-1.5">
              <button
                onClick={() => onChange(row.key, v)}
                className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all
                  ${
                    row.value === v
                      ? 'bg-clinical-600 text-white border-clinical-600 shadow-sm'
                      : 'bg-white text-slate-500 border-slate-200 active:bg-slate-50'
                  }`}
              >
                {row.value === v ? '✓' : ''}
              </button>
            </div>
          ))}
          <div className="w-16 flex-shrink-0 px-2 py-2 text-right">
            <span className="text-xs font-bold text-clinical-600 tabular-nums">{row.value}</span>
            <div className="text-[9px] text-slate-400 leading-tight">{descs[row.value]}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AlustiAbrevScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [a, setA] = useState<Answers>(INITIAL);
  const [touchedItems, setTouchedItems] = useState<Set<string>>(new Set());
  const touch = (group: string) =>
    setTouchedItems((prev) => {
      const s = new Set(prev);
      s.add(group);
      return s;
    });
  const set = (k: keyof Answers, v: number, group: string) => {
    setA((prev) => ({ ...prev, [k]: v }));
    touch(group);
    onMarkDirty?.();
  };
  const score = getScore(a);
  const { text: interpText, severity } = interpret(score);
  const i1sum = a.i1_esd + a.i1_esi + a.i1_eid + a.i1_eii;

  return (
    <ScaleLayout
      title="Alusti abreviado"
      subtitle="Test Alusti — versión abreviada"
      score={score}
      maxScore={50}
      interpretation={interpText}
      severity={severity}
      progress={{ answered: touchedItems.size, total: 5 }}
      onComplete={() =>
        onComplete({
          scaleId: 'alustiabrev',
          scaleName: 'Test Alusti abreviado',
          score,
          maxScore: 50,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, a),
          timestamp: Date.now(),
          answers: a as unknown as Record<string, number>,
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, a)}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        Administrar cuando el paciente no puede ejecutar el test completo. Ítems 1, 4, 6, 7 y 8 del Test
        Alusti (numeración original).
      </div>

      {/* Ítem 1 */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-sm font-semibold text-slate-800">1. Extremidades articular pasivo</span>
          <span className="text-xs font-bold text-clinical-600 tabular-nums">{i1sum}/8</span>
        </div>
        <div className="text-xs text-slate-400 mb-3 leading-relaxed">
          EE.SS: flexión pasiva de hombro · EE.II: flexum cadera/rodilla. Baremo 0-2 por extremidad.
        </div>
        <div className="bg-slate-50 rounded-xl p-3 space-y-2">
          <ExtremidadGrid
            prefix="i1"
            values={[
              { key: 'i1_esd', value: a.i1_esd },
              { key: 'i1_esi', value: a.i1_esi },
              { key: 'i1_eid', value: a.i1_eid },
              { key: 'i1_eii', value: a.i1_eii },
            ]}
            onChange={(key, v) => set(key as keyof Answers, v, 'i1')}
          />
        </div>
      </div>

      {/* Ítem 4 */}
      <div className="mb-5">
        <div className="text-sm font-semibold text-slate-800 mb-1">4. Tronco en sedestación</div>
        <div className="text-xs text-slate-400 mb-2">
          Sentado en camilla sin apoyo posterior, pies en suelo, manos sobre muslos.
        </div>
        <div className="space-y-1.5">
          {[
            { label: '0 — Imposible / gran ayuda de 2 personas', value: 0 },
            { label: '1 — Moderada-máxima ayuda de 1 persona', value: 1 },
            { label: '2 — Mínima ayuda de 1 persona', value: 2 },
            { label: '3 — Autónomo, >1 intento, con supervisión', value: 3 },
            { label: '4 — Autónomo, estable, sin supervisión', value: 4 },
            { label: '5 — Autónomo, estable ante empujones sobre el tronco', value: 5 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('i4', opt.value, 'i4')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                ${a.i4 === opt.value && touchedItems.has('i4') ? 'bg-clinical-600 text-white border-clinical-600' : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'}`}
            >
              <span className="font-medium text-left leading-snug">{opt.label}</span>
              <span
                className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0 ${a.i4 === opt.value && touchedItems.has('i4') ? 'text-white/70' : 'text-slate-400'}`}
              >
                {opt.value} pts
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Ítem 6 */}
      <div className="mb-5">
        <div className="text-sm font-semibold text-slate-800 mb-1">6. Bipedestación</div>
        <div className="text-xs text-slate-400 mb-2">
          En bipedestación, cadera-rodilla-tobillo alineados verticalmente.
        </div>
        <div className="space-y-1.5">
          {[
            { label: '0 — Imposible / gran ayuda de 2 personas', value: 0 },
            { label: '1 — Moderado-máximo apoyo/descarga de 1 persona', value: 1 },
            { label: '2 — Mínimo apoyo/descarga de 1 persona', value: 2 },
            { label: '3 — Autónomo, >1 intento, con supervisión', value: 3 },
            { label: '4 — Autónomo, estable, 1 intento', value: 4 },
            { label: '5 — Autónomo, estable ante empujones sobre el tronco', value: 5 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('i6', opt.value, 'i6')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                ${a.i6 === opt.value && touchedItems.has('i6') ? 'bg-clinical-600 text-white border-clinical-600' : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'}`}
            >
              <span className="font-medium text-left leading-snug">{opt.label}</span>
              <span
                className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0 ${a.i6 === opt.value && touchedItems.has('i6') ? 'text-white/70' : 'text-slate-400'}`}
              >
                {opt.value} pts
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Ítem 7 */}
      <div className="mb-5">
        <div className="text-sm font-semibold text-slate-800 mb-1">7. Marcha</div>
        <div className="text-xs text-slate-400 mb-2">
          Andador + 1 persona = 5 pts · Andador autónomo = 10 pts.
        </div>
        <div className="space-y-1.5">
          {[
            { label: '0 — Marcha nula o con ayuda física de 2 personas', value: 0 },
            { label: '5 — Gran ayuda física de 1 persona', value: 5 },
            { label: '10 — Ligero contacto físico de 1 persona', value: 10 },
            { label: '15 — Solo, con supervisión de 1 persona', value: 15 },
            { label: '20 — Independiente en terreno llano', value: 20 },
            { label: '25 — Independiente en terrenos irregulares', value: 25 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('i7', opt.value, 'i7')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                ${a.i7 === opt.value && touchedItems.has('i7') ? 'bg-clinical-600 text-white border-clinical-600' : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'}`}
            >
              <span className="font-medium text-left leading-snug">{opt.label}</span>
              <span
                className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0 ${a.i7 === opt.value && touchedItems.has('i7') ? 'text-white/70' : 'text-slate-400'}`}
              >
                {opt.value} pts
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Ítem 8 */}
      <div className="mb-5">
        <div className="text-sm font-semibold text-slate-800 mb-1">8. Radio de acción de marcha</div>
        <div className="text-xs text-slate-400 mb-2">Distancia en metros que es capaz de caminar.</div>
        <div className="space-y-1.5">
          {[
            { label: '0 — Marcha imposible', value: 0 },
            { label: '1 — 0 a 10 m', value: 1 },
            { label: '2 — 10 a 20 m', value: 2 },
            { label: '3 — 20 a 50 m', value: 3 },
            { label: '5 — 50 a 150 m', value: 5 },
            { label: '7 — Más de 150 m', value: 7 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('i8', opt.value, 'i8')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                ${a.i8 === opt.value && touchedItems.has('i8') ? 'bg-clinical-600 text-white border-clinical-600' : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'}`}
            >
              <span className="font-medium text-left leading-snug">{opt.label}</span>
              <span
                className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0 ${a.i8 === opt.value && touchedItems.has('i8') ? 'text-white/70' : 'text-slate-400'}`}
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
