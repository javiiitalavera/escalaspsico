import { useState, useCallback } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

interface Props {
  onComplete: (r: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

// memoria_inicial eliminado — no suma puntuación, solo es registro de administración
export interface Answers {
  vs_sendero: number; // TMT-B alternante (0-1)
  vs_cubo: number; // copia cubo (0-1)
  vs_reloj_c: number; // reloj contorno (0-1)
  vs_reloj_n: number; // reloj números (0-1)
  vs_reloj_m: number; // reloj manecillas (0-1)
  nombrar: number;
  atencion1: number; // series de números (0-2)
  atencion2: number; // resta serial (0-3)
  atencion3: number; // vigilancia letras (0-1)
  lenguaje1: number; // repetición frases (0-2)
  lenguaje2: number; // fluidez verbal (0-1)
  abstraccion: number;
  recuerdo: number; // sin pistas (0-5)
  orientacion: number;
  escolaridad: number; // +1 si ≤12 años
}

const INITIAL: Answers = {
  vs_sendero: 0,
  vs_cubo: 0,
  vs_reloj_c: 0,
  vs_reloj_n: 0,
  vs_reloj_m: 0,
  nombrar: 0,
  atencion1: 0,
  atencion2: 0,
  atencion3: 0,
  lenguaje1: 0,
  lenguaje2: 0,
  abstraccion: 0,
  recuerdo: 0,
  orientacion: 0,
  escolaridad: 0,
};

export function getScore(a: Answers): number {
  const vs = a.vs_sendero + a.vs_cubo + a.vs_reloj_c + a.vs_reloj_n + a.vs_reloj_m;
  const raw =
    vs +
    a.nombrar +
    a.atencion1 +
    a.atencion2 +
    a.atencion3 +
    a.lenguaje1 +
    a.lenguaje2 +
    a.abstraccion +
    a.recuerdo +
    a.orientacion;
  return Math.min(30, raw + a.escolaridad);
}

export function interpret(score: number): { text: string; severity: ScaleResult['severity'] } {
  if (score >= 26) return { text: 'Normal', severity: 'normal' };
  if (score >= 21) return { text: 'Deterioro leve', severity: 'mild' };
  if (score >= 11) return { text: 'Deterioro moderado', severity: 'moderate' };
  return { text: 'Deterioro grave', severity: 'severe' };
}

function buildReport(score: number, interp: string, a: Answers): string {
  const date = new Date().toLocaleDateString('es-ES');
  const rawScore = score - a.escolaridad;
  const vs = a.vs_sendero + a.vs_cubo + a.vs_reloj_c + a.vs_reloj_n + a.vs_reloj_m;
  return `MoCA (Montreal Cognitive Assessment) — ${date}
Puntuación total: ${score}/30 — ${interp}${a.escolaridad ? ' (incluye +1 por escolaridad)' : ''}

• Visuoespacial / ejecutivo: ${vs}/5
    · Sendero alternante (TMT-B): ${a.vs_sendero}/1
    · Copia del cubo: ${a.vs_cubo}/1
    · Reloj — contorno: ${a.vs_reloj_c}/1 · números: ${a.vs_reloj_n}/1 · manecillas: ${a.vs_reloj_m}/1
• Nombrar: ${a.nombrar}/3
• Atención (series de números): ${a.atencion1}/2
• Atención (resta serial 7): ${a.atencion2}/3
• Atención (vigilancia letras): ${a.atencion3}/1
• Lenguaje (repetición): ${a.lenguaje1}/2
• Fluidez verbal: ${a.lenguaje2}/1
• Abstracción: ${a.abstraccion}/2
• Recuerdo diferido: ${a.recuerdo}/5
• Orientación: ${a.orientacion}/6
• Puntuación escolaridad: ${a.escolaridad}/1

Puntuación bruta: ${rawScore}/29${a.escolaridad ? ` + 1 (escolaridad ≤12 años) = ${score}/30` : ''}

Puntos de corte: ≥26 normal · 21-25 deterioro leve · 11-20 moderado · ≤10 grave
Referencia: Nasreddine ZS et al. J Am Geriatr Soc. 2005;53(4):695-699.
DOI: https://doi.org/10.1111/j.1532-5415.2005.53221.x`;
}

function ItemRow({
  label,
  max,
  value,
  onChange,
  note,
}: {
  label: string;
  max: number;
  value: number;
  onChange: (v: number) => void;
  note?: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-sm font-medium text-slate-700">{label}</div>
        <div className="text-xs text-slate-400 ml-3 flex-shrink-0">
          <span className="font-mono font-semibold text-clinical-600">{value}</span>
          <span className="text-slate-300">/{max}</span>
        </div>
      </div>
      {note && <div className="text-xs text-slate-400 mb-1.5 leading-snug">{note}</div>}
      <div className="flex gap-2">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => onChange(i)}
            className={`min-w-[3rem] h-11 rounded-xl text-sm font-semibold border transition-all
              ${value === i ? 'bg-clinical-600 text-white border-clinical-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 active:bg-slate-50'}`}
          >
            {i}
          </button>
        ))}
      </div>
    </div>
  );
}

function CubeFigure() {
  // Isometric cube faithful to MoCA original:
  // 3 visible faces: top, front-left, front-right
  // Using cabinet oblique projection (45°, 0.5 depth) as in the MoCA paper
  // Base square side = 48px. Oblique offset: dx=24, dy=-14
  const s = 48;
  const ox = 24,
    oy = -14; // oblique vector (depth direction)
  // Front-bottom-left corner at (28, 85)
  const x0 = 28,
    y0 = 85;
  // 8 vertices of the cube (only front 5 + back-top 2 needed for 3 visible faces)
  const A = [x0, y0]; // front-bottom-left
  const B = [x0 + s, y0]; // front-bottom-right
  const C = [x0 + s, y0 - s]; // front-top-right
  const D = [x0, y0 - s]; // front-top-left
  const E = [x0 + ox, y0 + oy]; // back-bottom-left  (= A + oblique)
  const F = [x0 + s + ox, y0 + oy]; // back-bottom-right (= B + oblique)
  const G = [x0 + s + ox, y0 - s + oy]; // back-top-right    (= C + oblique)
  const H = [x0 + ox, y0 - s + oy]; // back-top-left     (= D + oblique)
  const pt = (v: number[]) => `${v[0]},${v[1]}`;
  return (
    <div className="mb-3 p-3 bg-white border border-slate-200 rounded-xl inline-block">
      <svg width="108" height="105" viewBox="0 0 108 105" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Right face (A B F E) */}
        <polygon
          points={`${pt(B)} ${pt(F)} ${pt(G)} ${pt(C)}`}
          stroke="#1e293b"
          strokeWidth="1.5"
          fill="white"
        />
        {/* Front face (A B C D) */}
        <polygon
          points={`${pt(A)} ${pt(B)} ${pt(C)} ${pt(D)}`}
          stroke="#1e293b"
          strokeWidth="1.5"
          fill="white"
        />
        {/* Top face (D C G H) */}
        <polygon
          points={`${pt(D)} ${pt(C)} ${pt(G)} ${pt(H)}`}
          stroke="#1e293b"
          strokeWidth="1.5"
          fill="white"
        />
        {/* Back-left vertical edge (hidden in real cube but shown as dashed per MoCA original) */}
        <line
          x1={E[0]}
          y1={E[1]}
          x2={H[0]}
          y2={H[1]}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <line
          x1={E[0]}
          y1={E[1]}
          x2={A[0]}
          y2={A[1]}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
        <line
          x1={E[0]}
          y1={E[1]}
          x2={F[0]}
          y2={F[1]}
          stroke="#1e293b"
          strokeWidth="1"
          strokeDasharray="3,3"
        />
      </svg>
    </div>
  );
}

function TrailFigure() {
  // Node positions calibrated to MoCA original TMT-B alternate sequencing figure.
  // Order of connection: 1 → A → 2 → B → 3 → C → 4 → D → 5 → E
  // ViewBox 220x190 — nodes scattered to match official layout
  const nodes: Array<{ label: string; x: number; y: number; start?: boolean; end?: boolean }> = [
    { label: '1', x: 34, y: 148, start: true },
    { label: 'A', x: 56, y: 42 },
    { label: '2', x: 118, y: 72 },
    { label: 'B', x: 80, y: 118 },
    { label: '3', x: 152, y: 138 },
    { label: 'C', x: 22, y: 172 },
    { label: '4', x: 96, y: 168 },
    { label: 'D', x: 26, y: 88 },
    { label: '5', x: 174, y: 96 },
    { label: 'E', x: 168, y: 36 },
  ];
  const order = ['1', 'A', '2', 'B', '3', 'C', '4', 'D', '5', 'E'];
  const byLabel = Object.fromEntries(nodes.map((n) => [n.label, n]));
  return (
    <div className="mb-3 p-3 bg-white border border-slate-200 rounded-xl inline-block">
      <svg width="200" height="188" viewBox="0 0 200 188" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Dashed guide lines between consecutive nodes */}
        {order.slice(0, -1).map((lbl, i) => {
          const from = byLabel[lbl];
          const to = byLabel[order[i + 1]];
          return (
            <line
              key={lbl}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="#94a3b8"
              strokeWidth="0.9"
              strokeDasharray="4,3"
            />
          );
        })}
        {/* Node circles */}
        {nodes.map((n) => {
          const isNum = !isNaN(Number(n.label));
          return (
            <g key={n.label}>
              <circle cx={n.x} cy={n.y} r="14" fill="white" stroke="#1e293b" strokeWidth="1.5" />
              <text
                x={n.x}
                y={n.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={isNum ? '12' : '11'}
                fontWeight="600"
                fill="#1e293b"
              >
                {n.label}
              </text>
              {n.start && (
                <text x={n.x} y={n.y + 24} textAnchor="middle" fontSize="8" fill="#64748b">
                  Comienzo
                </text>
              )}
              {n.end && (
                <text x={n.x} y={n.y + 24} textAnchor="middle" fontSize="8" fill="#64748b">
                  Final
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function AnimalFigures() {
  return (
    <div className="mb-4 flex gap-4 flex-wrap items-end">
      {[
        { src: '/moca-leon.png', label: 'León' },
        { src: '/moca-rinoceronte.png', label: 'Rinoceronte' },
        { src: '/moca-camello.png', label: 'Camello' },
      ].map(({ src, label }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="p-2 bg-white border border-slate-200 rounded-xl">
            <img src={src} alt={label} className="h-20 w-auto object-contain" />
          </div>
          <div className="text-[9px] text-slate-400 mt-1 font-medium">[ &nbsp;&nbsp;&nbsp; ]</div>
        </div>
      ))}
    </div>
  );
}

export function MoCAScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [a, setA] = useState<Answers>(INITIAL);
  const [touchedSections, setTouchedSections] = useState<Set<string>>(new Set());
  const set = useCallback(<K extends keyof Answers>(k: K, v: number, section: string) => {
    setA((prev) => ({ ...prev, [k]: v }));
    setTouchedSections((prev) => {
      const s = new Set(prev);
      s.add(section);
      return s;
    });
  }, []);
  const score = getScore(a);
  const { text: interpText, severity } = interpret(score);

  return (
    <ScaleLayout
      title="MoCA"
      subtitle="Montreal Cognitive Assessment"
      score={score}
      maxScore={30}
      interpretation={interpText}
      severity={severity}
      progress={{ answered: touchedSections.size, total: 10 }}
      onComplete={() =>
        onComplete({
          scaleId: 'moca',
          scaleName: 'MoCA',
          score,
          maxScore: 30,
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
      {/* Memoria inicial — no puntúa, solo registro */}
      <div className="mb-5 p-3 bg-warm-50 border border-amber-200 rounded-xl">
        <div className="text-xs font-semibold text-amber-700 mb-1">
          Registro de memoria inicial (no puntúa)
        </div>
        <div className="text-xs text-amber-600 leading-relaxed">
          Leer las 5 palabras al ritmo de 1/segundo: <strong>cara · seda · iglesia · clavel · rojo</strong>.
          Repetir 2 veces aunque el paciente las recuerde todas. No puntuar aquí — se evalúa en recuerdo
          diferido.
        </div>
      </div>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">
          Visuoespacial / Ejecutivo
        </div>
        <div className="flex gap-6 flex-wrap mb-3">
          <TrailFigure />
          <CubeFigure />
        </div>
        <ItemRow
          label="Sendero alternante (TMT-B: 1-A-2-B-3-C-4-D-5-E)"
          max={1}
          value={a.vs_sendero}
          note="1pt si la secuencia es correcta sin ningún error"
          onChange={(v) => set('vs_sendero', v, 'vs')}
        />
        <ItemRow
          label="Copia del cubo tridimensional"
          max={1}
          value={a.vs_cubo}
          note="1pt si es tridimensional, todas las líneas correctas, sin líneas añadidas"
          onChange={(v) => set('vs_cubo', v, 'vs')}
        />
        <ItemRow
          label="Reloj (11h10) — contorno + números + manecillas"
          max={3}
          value={a.vs_reloj_c + a.vs_reloj_n + a.vs_reloj_m}
          note="Contorno (1pt): esfera sin deformaciones · Números (1pt): todos, orden correcto, posición aproximada · Manecillas (1pt): dos manecillas, hora correcta, minutero más largo"
          onChange={(v) => {
            setA((prev) => ({
              ...prev,
              vs_reloj_c: v >= 1 ? 1 : 0,
              vs_reloj_n: v >= 2 ? 1 : 0,
              vs_reloj_m: v >= 3 ? 1 : 0,
            }));
            setTouchedSections((prev) => {
              const s = new Set(prev);
              s.add('vs');
              return s;
            });
          }}
        />
      </section>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">Nombrar</div>
        <AnimalFigures />
        <ItemRow
          label="León · rinoceronte · camello"
          max={3}
          value={a.nombrar}
          onChange={(v) => set('nombrar', v, 'nombrar')}
        />
      </section>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">Atención</div>
        <ItemRow
          label="Series de números (5 directos: 2-1-8-5-4 · 3 inversos: 7-4-2)"
          max={2}
          value={a.atencion1}
          onChange={(v) => set('atencion1', v, 'atencion1')}
          note="1pt por serie directa correcta · 1pt por serie inversa correcta"
        />
        <ItemRow
          label="Resta serial 7 desde 100 (93 · 86 · 79 · 72 · 65)"
          max={3}
          value={a.atencion2}
          onChange={(v) => set('atencion2', v, 'atencion2')}
          note="0 errores=3pt · 1 error=2pt · 2-3 errores=1pt · ≥4=0pt"
        />
        <ItemRow
          label="Vigilancia: golpear al oír «A» en lista de letras"
          max={1}
          value={a.atencion3}
          onChange={(v) => set('atencion3', v, 'atencion3')}
          note="0pt si ≥2 errores"
        />
      </section>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">Lenguaje</div>
        <ItemRow
          label="Repetición de frases (2 frases exactas)"
          max={2}
          value={a.lenguaje1}
          onChange={(v) => set('lenguaje1', v, 'lenguaje1')}
          note="«El gato siempre se esconde...» · «No necesito más ayuda...»"
        />
        <ItemRow
          label="Fluidez verbal: palabras con «F» en 1 min (≥11 = 1pt)"
          max={1}
          value={a.lenguaje2}
          onChange={(v) => set('lenguaje2', v, 'lenguaje2')}
        />
      </section>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">
          Abstracción
        </div>
        <ItemRow
          label="Similitudes (tren/bicicleta · reloj/regla)"
          max={2}
          value={a.abstraccion}
          onChange={(v) => set('abstraccion', v, 'abstraccion')}
        />
      </section>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">
          Recuerdo diferido
        </div>
        <ItemRow
          label="5 palabras sin pistas (cara · seda · iglesia · clavel · rojo)"
          max={5}
          value={a.recuerdo}
          onChange={(v) => set('recuerdo', v, 'recuerdo')}
          note="Solo puntúan las recordadas SIN pista. Las recordadas con pista categórica o de elección no suman."
        />
      </section>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">
          Orientación
        </div>
        <ItemRow
          label="Fecha · mes · año · día semana · lugar · ciudad"
          max={6}
          value={a.orientacion}
          onChange={(v) => set('orientacion', v, 'orientacion')}
        />
      </section>

      <section className="mb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-clinical-600 mb-3">
          Corrección por escolaridad
        </div>
        <div className="text-xs text-slate-500 mb-3 leading-relaxed">
          Añadir 1 punto si el paciente tiene ≤12 años de escolaridad formal (la puntuación máxima sigue
          siendo 30).
        </div>
        <div className="flex gap-2">
          {[
            { label: 'No aplicar (+0)', v: 0 },
            { label: 'Escolaridad ≤12 años (+1)', v: 1 },
          ].map((opt) => (
            <button
              key={opt.v}
              onClick={() => set('escolaridad', opt.v, 'escolaridad')}
              className={`flex-1 h-11 rounded-xl text-sm font-semibold border transition-all
                ${a.escolaridad === opt.v ? 'bg-clinical-600 text-white border-clinical-600' : 'bg-white text-slate-600 border-slate-200 active:bg-slate-50'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>
    </ScaleLayout>
  );
}
