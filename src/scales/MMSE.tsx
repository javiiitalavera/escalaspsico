import { useState, useCallback } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

export interface MMSEAnswers {
  // Orientación temporal (5)
  anyo: number;
  mes: number;
  dia: number;
  diaSemana: number;
  estacion: number;
  // Orientación espacial (5)
  pais: number;
  comunidad: number;
  ciudad: number;
  lugar: number;
  planta: number;
  // Fijación (3)
  fijacion: number;
  // Atención y cálculo (5)
  atencion: number;
  // Recuerdo diferido (3)
  recuerdo: number;
  // Lenguaje (8) + praxias (1)
  nombrar: number;
  repetir: number;
  comprender3: number;
  leer: number;
  escribir: number;
  copiar: number;
}

const INITIAL: MMSEAnswers = {
  anyo: 0,
  mes: 0,
  dia: 0,
  diaSemana: 0,
  estacion: 0,
  pais: 0,
  comunidad: 0,
  ciudad: 0,
  lugar: 0,
  planta: 0,
  fijacion: 0,
  atencion: 0,
  recuerdo: 0,
  nombrar: 0,
  repetir: 0,
  comprender3: 0,
  leer: 0,
  escribir: 0,
  copiar: 0,
};

export function getScore(a: MMSEAnswers): number {
  return (
    a.anyo +
    a.mes +
    a.dia +
    a.diaSemana +
    a.estacion +
    a.pais +
    a.comunidad +
    a.ciudad +
    a.lugar +
    a.planta +
    a.fijacion +
    a.atencion +
    a.recuerdo +
    a.nombrar +
    a.repetir +
    a.comprender3 +
    a.leer +
    a.escribir +
    a.copiar
  );
}

export function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score >= 25) return { text: 'Normal', severity: 'normal' };
  if (score >= 20) return { text: 'Deterioro leve', severity: 'mild' };
  if (score >= 10) return { text: 'Deterioro moderado', severity: 'moderate' };
  return { text: 'Deterioro grave', severity: 'severe' };
}

function buildReport(score: number, interp: string, a: MMSEAnswers): string {
  const date = new Date().toLocaleDateString('es-ES');
  return `MMSE (Mini-Mental State Examination) — ${date}
Puntuación total: ${score}/30 — ${interp}

• Orientación temporal: ${a.anyo + a.mes + a.dia + a.diaSemana + a.estacion}/5
• Orientación espacial: ${a.pais + a.comunidad + a.ciudad + a.lugar + a.planta}/5
• Fijación: ${a.fijacion}/3
• Atención y cálculo: ${a.atencion}/5
• Recuerdo diferido: ${a.recuerdo}/3
• Lenguaje y praxias: ${a.nombrar + a.repetir + a.comprender3 + a.leer + a.escribir + a.copiar}/9

Puntos de corte: ≥25 normal · 20-24 deterioro leve · 10-19 moderado · <10 grave
Referencia: Folstein MF et al. J Psychiatr Res. 1975;12(3):189-198.`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

// Compact dot-toggle row for binary items (0/1) — one line per item, no label needed
// items: array of short labels shown under each dot
function DotGrid({
  items,
  values,
  onChange,
}: {
  items: string[];
  values: number[];
  onChange: (idx: number, v: number) => void;
}) {
  const total = values.reduce((a, b) => a + b, 0);
  return (
    <div className="flex items-center justify-between mb-2 px-1">
      <div className="flex gap-3">
        {values.map((v, i) => (
          <button
            key={i}
            onClick={() => onChange(i, v === 1 ? 0 : 1)}
            className="flex flex-col items-center gap-1.5 group"
          >
            <div
              className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all
              ${
                v === 1
                  ? 'bg-clinical-600 border-clinical-600'
                  : 'bg-white border-slate-300 group-active:border-clinical-400'
              }`}
            >
              {v === 1 && (
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span
              className={`text-[10px] font-medium leading-tight text-center max-w-[2.5rem]
              ${v === 1 ? 'text-clinical-600' : 'text-slate-400'}`}
            >
              {items[i]}
            </span>
          </button>
        ))}
      </div>
      <div className="flex flex-col items-end">
        <span className="font-mono text-2xl font-bold text-clinical-700 leading-none">{total}</span>
        <span className="text-xs text-slate-400">/{items.length}</span>
      </div>
    </div>
  );
}

// Standard row for items with more than 2 options (0–N)
function ItemRow({
  label,
  max,
  value,
  onChange,
}: {
  label: string;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between mb-1.5">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        <div className="text-xs text-slate-400 ml-3 flex-shrink-0">
          <span className="font-mono font-semibold text-clinical-600">{value}</span>
          <span className="text-slate-300">/{max}</span>
        </div>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            title={i === 0 ? 'Ninguna correcta' : i === max ? 'Todas correctas' : `${i} de ${max} correctas`}
            className={`min-w-[3rem] h-11 rounded-xl text-sm font-semibold border transition-all
              ${
                value === i
                  ? 'bg-clinical-600 text-white border-clinical-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 active:bg-slate-50'
              }`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}

function PentagonFigure() {
  // Geometrically correct interlocking pentagons — Folstein MMSE original.
  // r=40, cxL=62, cxR=118, cy=54 (sep=56px → visible overlap).
  // Computed vertices:
  //   L: (62,14) (100,41.6) (85.5,86.4) (38.5,86.4) (24,41.6)
  //   R: (118,14) (156,41.6) (141.5,86.4) (94.5,86.4) (80,41.6)
  // Intersection points: (90,34.34) top and (90,72.55) bottom.
  // Overlap diamond: (90,34.34)→(100,41.6)→(90,72.55)→(80,41.6)
  //
  // Rendering: each pentagon is clipped to exclude the other's interior,
  // then both outlines are drawn inside the diamond — creating true crossing lines.
  const L = '62,14 100,41.6 85.5,86.4 38.5,86.4 24,41.6';
  const R = '118,14 156,41.6 141.5,86.4 94.5,86.4 80,41.6';
  // Diamond = overlap zone where both sets of lines should be visible
  const diamond = '90,34.34 100,41.6 90,72.55 80,41.6';
  return (
    <div className="mb-3 flex flex-col items-start">
      <div className="p-3 bg-white border border-slate-200 rounded-xl inline-block">
        <svg width="180" height="102" viewBox="0 0 180 102" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* clipL = everything EXCEPT the right pentagon's interior */}
            <clipPath id="clipL">
              <polygon points="0,0 180,0 180,102 0,102 0,0" fillRule="evenodd" />
              {/* subtract R interior — use evenodd winding */}
            </clipPath>
            {/* Simple approach: draw both fills white, then both strokes.
                Then redraw the diamond area with both strokes on top.
                This ensures lines are visible both inside and outside overlap. */}
          </defs>
          {/* Step 1: white fill both — overlap becomes white background */}
          <polygon points={L} fill="white" />
          <polygon points={R} fill="white" />
          {/* Step 2: draw both outlines fully */}
          <polygon points={L} fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinejoin="miter" />
          <polygon points={R} fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinejoin="miter" />
          {/* Step 3: in the diamond (overlap) zone, redraw BOTH outlines so
              crossing lines are visible — this makes them appear to intersect */}
          <g>
            <clipPath id="diamondClip">
              <polygon points={diamond} />
            </clipPath>
            <g clipPath="url(#diamondClip)">
              <polygon points={L} fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinejoin="miter" />
              <polygon points={R} fill="none" stroke="#1e293b" strokeWidth="1.8" strokeLinejoin="miter" />
            </g>
          </g>
        </svg>
      </div>
      <div className="text-[9px] text-slate-400 mt-1">Copiar estos pentágonos entrelazados</div>
    </div>
  );
}

export function MMSEScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [answers, setAnswers] = useState<MMSEAnswers>(INITIAL);
  const [touchedSections, setTouchedSections] = useState<Set<string>>(new Set());
  const touch = (s: string) =>
    setTouchedSections((prev) => {
      const n = new Set(prev);
      n.add(s);
      return n;
    });
  const set = useCallback(<K extends keyof MMSEAnswers>(k: K, v: MMSEAnswers[K]) => {
    setAnswers((prev) => ({ ...prev, [k]: v }));
    touch(String(k));
  }, []);

  // Dot grid helpers: store each sub-item as individual key but render as grid
  const temporalValues = [answers.anyo, answers.mes, answers.dia, answers.diaSemana, answers.estacion];
  const temporalKeys: (keyof MMSEAnswers)[] = ['anyo', 'mes', 'dia', 'diaSemana', 'estacion'];
  const temporalLabels = ['Año', 'Mes', 'Día', 'Semana', 'Estación'];

  const espacialValues = [answers.pais, answers.comunidad, answers.ciudad, answers.lugar, answers.planta];
  const espacialKeys: (keyof MMSEAnswers)[] = ['pais', 'comunidad', 'ciudad', 'lugar', 'planta'];
  const espacialLabels = ['País', 'C.A.', 'Ciudad', 'Lugar', 'Planta'];

  const score = getScore(answers);
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="MMSE"
      subtitle="Mini-Mental State Examination"
      score={score}
      maxScore={30}
      interpretation={interpText}
      severity={severity}
      onComplete={() =>
        onComplete({
          scaleId: 'mmse',
          scaleName: 'MMSE',
          score,
          maxScore: 30,
          interpretation: interpText,
          severity,
          reportText: buildReport(score, interpText, answers),
          timestamp: Date.now(),
          answers: answers as unknown as Record<string, number>,
        })
      }
      onBack={onBack}
      reportText={buildReport(score, interpText, answers)}
      progress={{ answered: touchedSections.size, total: 11 }}
      onMarkDirty={onMarkDirty}
    >
      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">
          Orientación temporal
        </div>
        <ItemRow
          label="Año, mes, día, día de la semana, estación"
          max={5}
          value={temporalValues.reduce((a, b) => a + b, 0)}
          onChange={(v) => {
            const keys: (keyof MMSEAnswers)[] = ['anyo', 'mes', 'dia', 'diaSemana', 'estacion'];
            setAnswers((prev) => {
              const next = { ...prev };
              keys.forEach((k, i) => {
                next[k] = i < v ? 1 : 0;
              });
              return next;
            });
            touch('temporal');
          }}
        />
      </section>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">
          Orientación espacial
        </div>
        <ItemRow
          label="País, comunidad, ciudad, lugar, planta"
          max={5}
          value={espacialValues.reduce((a, b) => a + b, 0)}
          onChange={(v) => {
            const keys: (keyof MMSEAnswers)[] = ['pais', 'comunidad', 'ciudad', 'lugar', 'planta'];
            setAnswers((prev) => {
              const next = { ...prev };
              keys.forEach((k, i) => {
                next[k] = i < v ? 1 : 0;
              });
              return next;
            });
            touch('espacial');
          }}
        />
      </section>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">Fijación</div>
        <ItemRow
          label="Repite 3 palabras (peseta, caballo, manzana)"
          max={3}
          value={answers.fijacion}
          onChange={(v) => set('fijacion', v)}
        />
      </section>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">
          Atención y cálculo
        </div>
        <ItemRow
          label="Serie 100-7 × 5 ó deletrear MUNDO al revés"
          max={5}
          value={answers.atencion}
          onChange={(v) => set('atencion', v)}
        />
      </section>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">
          Recuerdo diferido
        </div>
        <ItemRow
          label="Recuerda las 3 palabras"
          max={3}
          value={answers.recuerdo}
          onChange={(v) => set('recuerdo', v)}
        />
      </section>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">
          Lenguaje y praxias
        </div>
        <ItemRow
          label="Nombra 2 objetos (lápiz, reloj)"
          max={2}
          value={answers.nombrar}
          onChange={(v) => set('nombrar', v)}
        />
        <ItemRow
          label="Repite «ni sí, ni no, ni pero»"
          max={1}
          value={answers.repetir}
          onChange={(v) => set('repetir', v)}
        />
        <ItemRow
          label="Orden de 3 pasos (coge papel, dóblalo, ponlo en el suelo)"
          max={3}
          value={answers.comprender3}
          onChange={(v) => set('comprender3', v)}
        />
        <ItemRow
          label="Lee y ejecuta «cierre los ojos»"
          max={1}
          value={answers.leer}
          onChange={(v) => set('leer', v)}
        />
        <ItemRow
          label="Escribe una frase"
          max={1}
          value={answers.escribir}
          onChange={(v) => set('escribir', v)}
        />
        <PentagonFigure />
        <ItemRow
          label="Copia los pentágonos entrelazados"
          max={1}
          value={answers.copiar}
          onChange={(v) => set('copiar', v)}
        />
      </section>
    </ScaleLayout>
  );
}
