import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// Test Alusti — versión completa, baremo 0-100
// Fuente: autor — hoja de registro oficial (testalusti.eu)
// Ítems 1 y 2: cada extremidad puntúa por separado (4 extremidades × baremo)

interface Answers {
  // Ítem 1: articular pasivo — 4 extremidades, 0-2 cada una
  i1_esd: number;
  i1_esi: number;
  i1_eid: number;
  i1_eii: number;
  // Ítem 2: muscular activo — 4 extremidades, 0-5 cada una
  i2_esd: number;
  i2_esi: number;
  i2_eid: number;
  i2_eii: number;
  // Ítems 3-10
  i3: number;
  i4: number;
  i5: number;
  i6: number;
  i7: number;
  i8: number;
  i9: number;
  i10: number;
}

const INITIAL: Answers = {
  i1_esd: 0,
  i1_esi: 0,
  i1_eid: 0,
  i1_eii: 0,
  i2_esd: 0,
  i2_esi: 0,
  i2_eid: 0,
  i2_eii: 0,
  i3: 0,
  i4: 0,
  i5: 0,
  i6: 0,
  i7: 0,
  i8: 0,
  i9: 0,
  i10: 0,
};

function getScore(a: Answers): number {
  return Math.min(
    100,
    a.i1_esd +
      a.i1_esi +
      a.i1_eid +
      a.i1_eii +
      a.i2_esd +
      a.i2_esi +
      a.i2_eid +
      a.i2_eii +
      a.i3 +
      a.i4 +
      a.i5 +
      a.i6 +
      a.i7 +
      a.i8 +
      a.i9 +
      a.i10,
  );
}

function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score <= 30) return { text: 'Dependencia total', severity: 'severe' };
  if (score <= 40) return { text: 'Dependencia severa', severity: 'severe' };
  if (score <= 50) return { text: 'Dependencia moderada', severity: 'moderate' };
  if (score <= 60) return { text: 'Dependencia leve', severity: 'mild' };
  if (score <= 75) return { text: 'Buena movilidad', severity: 'mild' };
  if (score <= 90) return { text: 'Muy buena movilidad', severity: 'normal' };
  return { text: 'Excelente movilidad', severity: 'normal' };
}

function buildReport(score: number, interp: string, a: Answers): string {
  const date = new Date().toLocaleDateString('es-ES');
  return `Test Alusti (versión completa) — ${date}
Puntuación: ${score}/100 — ${interp}

Ítem 1. Articular pasivo (0-2 por extremidad):
  ESD: ${a.i1_esd} · ESI: ${a.i1_esi} · EID: ${a.i1_eid} · EII: ${a.i1_eii} → subtotal: ${a.i1_esd + a.i1_esi + a.i1_eid + a.i1_eii}/8
Ítem 2. Muscular activo (0-5 por extremidad):
  ESD: ${a.i2_esd} · ESI: ${a.i2_esi} · EID: ${a.i2_eid} · EII: ${a.i2_eii} → subtotal: ${a.i2_esd + a.i2_esi + a.i2_eid + a.i2_eii}/20
Ítem 3. Transferencia dec. supino→sedestación: ${a.i3}/5
Ítem 4. Tronco en sedestación: ${a.i4}/5
Ítem 5. Transferencia sedestación→bipedestación: ${a.i5}/5
Ítem 6. Bipedestación: ${a.i6}/5
Ítem 7. Marcha: ${a.i7}/25
Ítem 8. Radio de acción de marcha: ${a.i8}/7
Ítem 9. Tándem ojos cerrados: ${a.i9}/10
Ítem 10. Apoyo monopodal ojos cerrados: ${a.i10}/10

Baremo: ≤30 dep. total · 31-40 severa · 41-50 moderada · 51-60 leve · 61-75 buena · 76-90 muy buena · 91-100 excelente
Fuente: testalusti.eu`;
}

const PASIVO_OPTS = [
  { label: '0 — No funcional', value: 0 },
  { label: '1 — Funcional', value: 1 },
  { label: '2 — Bueno', value: 2 },
];

const ACTIVO_OPTS = [
  { label: '0 — Sin contracción muscular', value: 0 },
  { label: '1 — Vestigio de contracción', value: 1 },
  { label: '2 — Movimiento activo sin gravedad', value: 2 },
  { label: '3 — Movimiento activo contra gravedad', value: 3 },
  { label: '4 — Contra gravedad y resistencia', value: 4 },
  { label: '5 — Potencia muscular normal', value: 5 },
];

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

// Compact table: rows = extremidades, columns = values
// prefix: unique string to namespace button keys (e.g. 'i1' or 'i2')
function ExtremidadGrid({
  prefix,
  opts,
  values,
  onChange,
}: {
  prefix: string;
  opts: { label: string; value: number }[];
  values: { key: string; label: string; value: number }[];
  onChange: (key: string, v: number) => void;
}) {
  const EE = ['ESD', 'ESI', 'EID', 'EII'];
  const selectedDesc = (v: number) => opts.find((o) => o.value === v)?.label.split(' — ')[1] ?? '';
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
      {/* Header row */}
      <div className="flex bg-slate-50 border-b border-slate-200">
        <div className="w-12 flex-shrink-0 px-2 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wide" />
        {opts.map((opt) => (
          <div
            key={opt.value}
            className="flex-1 text-center py-1.5 text-[11px] font-bold text-slate-500 tabular-nums"
          >
            {opt.value}
          </div>
        ))}
        <div className="w-16 flex-shrink-0 px-2 py-1.5 text-[10px] font-semibold text-slate-400 text-right uppercase tracking-wide">
          val
        </div>
      </div>
      {/* Data rows */}
      {values.map((row, rowIdx) => (
        <div
          key={row.key}
          className={`flex items-center ${rowIdx < values.length - 1 ? 'border-b border-slate-100' : ''}`}
        >
          <div className="w-12 flex-shrink-0 px-2 py-2 text-[11px] font-bold text-slate-500">
            {EE[rowIdx]}
          </div>
          {opts.map((opt) => {
            const isSelected = row.value === opt.value;
            return (
              <div
                key={`${prefix}-${row.key}-${opt.value}`}
                className="flex-1 flex items-center justify-center py-1.5"
              >
                <button
                  onClick={() => onChange(row.key, opt.value)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold border transition-all
                    ${
                      isSelected
                        ? 'bg-clinical-600 text-white border-clinical-600 shadow-sm'
                        : 'bg-white text-slate-500 border-slate-200 active:bg-slate-50'
                    }`}
                >
                  {isSelected ? '✓' : ''}
                </button>
              </div>
            );
          })}
          <div className="w-16 flex-shrink-0 px-2 py-2 text-right">
            <span className="text-xs font-bold text-clinical-600 tabular-nums">{row.value}</span>
            <div className="text-[9px] text-slate-400 leading-tight">{selectedDesc(row.value)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

const ITEMS_3_10 = [
  {
    key: 'i3' as keyof Answers,
    num: 3,
    label: 'Transferencia decúbito supino → sedestación',
    abrev: false,
    note: 'Desde decúbito supino hasta sentado al borde de la cama.',
    opts: [
      { label: '0 — Imposible / gran ayuda de 2 personas', value: 0 },
      { label: '1 — Moderada-máxima ayuda de 1 persona', value: 1 },
      { label: '2 — Mínima ayuda de 1 persona', value: 2 },
      { label: '3 — Autónomo, >1 intento, con supervisión', value: 3 },
      { label: '4 — Autónomo, 1 intento, con dificultad', value: 4 },
      { label: '5 — Autónomo, sin dificultad', value: 5 },
    ],
  },
  {
    key: 'i4' as keyof Answers,
    num: 4,
    label: 'Tronco en sedestación',
    abrev: true,
    note: 'Sentado en camilla sin apoyo posterior, pies en suelo, manos sobre muslos.',
    opts: [
      { label: '0 — Imposible / gran ayuda de 2 personas', value: 0 },
      { label: '1 — Moderada-máxima ayuda de 1 persona', value: 1 },
      { label: '2 — Mínima ayuda de 1 persona', value: 2 },
      { label: '3 — Autónomo, >1 intento, con supervisión', value: 3 },
      { label: '4 — Autónomo, estable, sin supervisión', value: 4 },
      { label: '5 — Autónomo, estable ante empujones sobre el tronco', value: 5 },
    ],
  },
  {
    key: 'i5' as keyof Answers,
    num: 5,
    label: 'Transferencia sedestación → bipedestación',
    abrev: false,
    note: 'Sentado en silla con respaldo y apoyabrazos.',
    opts: [
      { label: '0 — Imposible / gran ayuda de 2 personas, manos en apoyabrazos', value: 0 },
      { label: '1 — Moderada-máxima ayuda de 1 persona, manos en apoyabrazos', value: 1 },
      { label: '2 — Mínima ayuda de 1 persona, manos en apoyabrazos', value: 2 },
      { label: '3 — Autónomo, >1 intento, con supervisión, manos en apoyabrazos', value: 3 },
      { label: '4 — Autónomo, 1 intento, manos en apoyabrazos', value: 4 },
      { label: '5 — Autónomo, brazos en cruz sobre el pecho', value: 5 },
    ],
  },
  {
    key: 'i6' as keyof Answers,
    num: 6,
    label: 'Bipedestación',
    abrev: true,
    note: 'En bipedestación, pies a la altura de las caderas.',
    opts: [
      { label: '0 — Imposible / gran ayuda de 2 personas', value: 0 },
      { label: '1 — Moderado-máximo apoyo/descarga de 1 persona', value: 1 },
      { label: '2 — Mínimo apoyo/descarga de 1 persona', value: 2 },
      { label: '3 — Autónomo, >1 intento, con supervisión', value: 3 },
      { label: '4 — Autónomo, estable, 1 intento', value: 4 },
      { label: '5 — Autónomo, estable ante empujones sobre el tronco', value: 5 },
    ],
  },
  {
    key: 'i7' as keyof Answers,
    num: 7,
    label: 'Marcha',
    abrev: true,
    note: 'Andador + 1 persona = 5 pts · Andador autónomo = 10 pts.',
    opts: [
      { label: '0 — Marcha nula o con ayuda física de 2 personas', value: 0 },
      { label: '5 — Gran ayuda física de 1 persona', value: 5 },
      { label: '10 — Ligero contacto físico de 1 persona', value: 10 },
      { label: '15 — Solo, con supervisión de 1 persona', value: 15 },
      { label: '20 — Independiente en terreno llano', value: 20 },
      { label: '25 — Independiente en terrenos irregulares', value: 25 },
    ],
  },
  {
    key: 'i8' as keyof Answers,
    num: 8,
    label: 'Radio de acción de marcha',
    abrev: true,
    note: 'Distancia en metros que es capaz de caminar.',
    opts: [
      { label: '0 — Marcha imposible', value: 0 },
      { label: '1 — 0 a 10 m', value: 1 },
      { label: '2 — 10 a 20 m', value: 2 },
      { label: '3 — 20 a 50 m', value: 3 },
      { label: '5 — 50 a 150 m', value: 5 },
      { label: '7 — Más de 150 m', value: 7 },
    ],
  },
  {
    key: 'i9' as keyof Answers,
    num: 9,
    label: 'Tándem con ojos cerrados',
    abrev: false,
    note: 'Solo si ítem 7 (Marcha) = 25 pts. Talón-punta, 1 intento prueba OA, el válido OC.',
    opts: [
      { label: '0 — 0" a 2"', value: 0 },
      { label: '2 — 2" a 4"', value: 2 },
      { label: '4 — 4" a 6"', value: 4 },
      { label: '6 — 6" a 8"', value: 6 },
      { label: '8 — 8" a 10"', value: 8 },
      { label: '10 — Más de 10"', value: 10 },
    ],
  },
  {
    key: 'i10' as keyof Answers,
    num: 10,
    label: 'Apoyo monopodal con ojos cerrados',
    abrev: false,
    note: 'Solo si ítem 7 (Marcha) = 25 pts. Apoyo un pie, 1 intento prueba OA, el válido OC.',
    opts: [
      { label: '0 — 0" a 2"', value: 0 },
      { label: '2 — 2" a 4"', value: 2 },
      { label: '4 — 4" a 6"', value: 4 },
      { label: '6 — 6" a 8"', value: 6 },
      { label: '8 — 8" a 10"', value: 8 },
      { label: '10 — Más de 10"', value: 10 },
    ],
  },
] as const;

export function AlustiScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [a, setA] = useState<Answers>(INITIAL);
  const [touchedItems, setTouchedItems] = useState<Set<string>>(new Set());
  const touch = (group: string) =>
    setTouchedItems((prev) => {
      const s = new Set(prev);
      s.add(group);
      return s;
    });
  const set = (k: keyof Answers, v: number, group?: string) => {
    setA((prev) => ({ ...prev, [k]: v }));
    if (group) touch(group);
    onMarkDirty?.();
  };
  const score = getScore(a);
  const { text: interpText, severity } = interpret(score);

  const i1sum = a.i1_esd + a.i1_esi + a.i1_eid + a.i1_eii;
  const i2sum = a.i2_esd + a.i2_esi + a.i2_eid + a.i2_eii;

  return (
    <ScaleLayout
      title="Alusti"
      subtitle="Test Alusti — versión completa"
      score={score}
      maxScore={100}
      interpretation={interpText}
      severity={severity}
      progress={{ answered: touchedItems.size, total: 10 }}
      onComplete={() =>
        onComplete({
          scaleId: 'alusti',
          scaleName: 'Test Alusti',
          score,
          maxScore: 100,
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
        Los ítems marcados con <span className="font-bold text-clinical-700">A</span> forman también la
        versión abreviada (1,4,6,7,8). Ítems 9 y 10: solo si marcha = 25 pts.
      </div>

      {/* Ítem 1 — Articular pasivo */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-800">1. Extremidades articular pasivo</span>
          <span className="text-[10px] font-bold text-clinical-600 bg-clinical-50 border border-clinical-200 rounded px-1.5 py-0.5">
            A
          </span>
          <span className="ml-auto text-xs font-bold text-clinical-600 tabular-nums">{i1sum}/8</span>
        </div>
        <div className="text-xs text-slate-400 mb-2 leading-relaxed">
          EE.SS: flexión pasiva de hombro · EE.II: flexum cadera/rodilla/tobillo
        </div>
        <ExtremidadGrid
          prefix="i1"
          opts={PASIVO_OPTS}
          values={[
            { key: 'i1_esd', label: 'ESD', value: a.i1_esd },
            { key: 'i1_esi', label: 'ESI', value: a.i1_esi },
            { key: 'i1_eid', label: 'EID', value: a.i1_eid },
            { key: 'i1_eii', label: 'EII', value: a.i1_eii },
          ]}
          onChange={(key, v) => set(key as keyof Answers, v, 'i1')}
        />
      </div>

      {/* Ítem 2 — Muscular activo */}
      <div className="mb-5">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold text-slate-800">2. Extremidades muscular activo</span>
          <span className="ml-auto text-xs font-bold text-clinical-600 tabular-nums">{i2sum}/20</span>
        </div>
        <div className="text-xs text-slate-400 mb-2 leading-relaxed">
          EE.SS: flexión activa de hombros · EE.II: elevación con extensión de rodilla contra gravedad
        </div>
        <ExtremidadGrid
          prefix="i2"
          opts={ACTIVO_OPTS}
          values={[
            { key: 'i2_esd', label: 'ESD', value: a.i2_esd },
            { key: 'i2_esi', label: 'ESI', value: a.i2_esi },
            { key: 'i2_eid', label: 'EID', value: a.i2_eid },
            { key: 'i2_eii', label: 'EII', value: a.i2_eii },
          ]}
          onChange={(key, v) => set(key as keyof Answers, v, 'i2')}
        />
      </div>

      {ITEMS_3_10.map((item) => (
        <div key={item.key} className="mb-5">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-sm font-semibold text-slate-800">
              {item.num}. {item.label}
            </span>
            {item.abrev && (
              <span className="text-[10px] font-bold text-clinical-600 bg-clinical-50 border border-clinical-200 rounded px-1.5 py-0.5">
                A
              </span>
            )}
          </div>
          {item.note && <div className="text-xs text-slate-400 mb-2 leading-relaxed">{item.note}</div>}
          <div className="space-y-1.5">
            {item.opts.map((opt) => (
              <button
                key={opt.value}
                onClick={() => set(item.key, opt.value, item.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-sm
                  ${
                    a[item.key] === opt.value
                      ? 'bg-clinical-600 text-white border-clinical-600'
                      : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                  }`}
              >
                <span className="font-medium text-left leading-snug">{opt.label}</span>
                <span
                  className={`text-xs font-bold tabular-nums ml-3 flex-shrink-0 ${a[item.key] === opt.value ? 'text-white/70' : 'text-slate-400'}`}
                >
                  {opt.value} pts
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </ScaleLayout>
  );
}
