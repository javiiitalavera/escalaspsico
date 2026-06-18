import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// Walter Index — 1-year mortality after hospitalization in adults ≥70
// Walter LC et al. JAMA 2001;285:2987-2994

// Scoring system derived from the original paper
const RISK_TABLE: Record<number, { pct: string; label: string }> = {
  0: { pct: '4%', label: 'Muy bajo' },
  1: { pct: '5%', label: 'Muy bajo' },
  2: { pct: '7%', label: 'Bajo' },
  3: { pct: '9%', label: 'Bajo' },
  4: { pct: '12%', label: 'Bajo-moderado' },
  5: { pct: '15%', label: 'Moderado' },
  6: { pct: '19%', label: 'Moderado' },
  7: { pct: '24%', label: 'Moderado-alto' },
  8: { pct: '30%', label: 'Alto' },
  9: { pct: '37%', label: 'Alto' },
  10: { pct: '45%', label: 'Muy alto' },
  11: { pct: '54%', label: 'Muy alto' },
  12: { pct: '64%', label: 'Muy alto' },
};

function getRisk(points: number) {
  const capped = Math.min(points, 12);
  return RISK_TABLE[capped] ?? { pct: '>64%', label: 'Muy alto' };
}

function getSeverity(points: number): ScaleResult['severity'] {
  if (points <= 2) return 'normal';
  if (points <= 4) return 'mild';
  if (points <= 7) return 'moderate';
  return 'severe';
}

interface Answers {
  sex: 'male' | 'female' | null;
  bathe: boolean | null;
  dress: boolean | null;
  transfer: boolean | null;
  toilet: boolean | null;
  eat: boolean | null;
  chf: boolean | null;
  cancer: 'none' | 'solitary' | 'metastatic' | null;
  creatinine: 'low' | 'high' | null;
  albumin: 'high' | 'mid' | 'low' | null;
}

const INITIAL: Answers = {
  sex: null,
  bathe: null,
  dress: null,
  transfer: null,
  toilet: null,
  eat: null,
  chf: null,
  cancer: null,
  creatinine: null,
  albumin: null,
};

function calcPoints(a: Answers): number {
  let pts = 0;
  if (a.sex === 'male') pts += 1;
  if (a.bathe === true) pts += 2;
  if (a.dress === true) pts += 1;
  if (a.transfer === true) pts += 2;
  if (a.toilet === true) pts += 1;
  if (a.eat === true) pts += 2;
  if (a.chf === true) pts += 2;
  if (a.cancer === 'solitary') pts += 2;
  if (a.cancer === 'metastatic') pts += 3;
  if (a.creatinine === 'high') pts += 2;
  if (a.albumin === 'mid') pts += 1;
  if (a.albumin === 'low') pts += 2;
  return pts;
}

function buildReport(pts: number, risk: string, pct: string, a: Answers): string {
  const date = new Date().toLocaleDateString('es-ES');
  return `Índice de Walter — Mortalidad al año post-hospitalización — ${date}

Puntuación total: ${pts} puntos
Riesgo estimado de mortalidad a 1 año: ${pct} (${risk})

Variables:
  Sexo: ${a.sex === 'male' ? 'Varón (+1)' : 'Mujer (0)'}
  Necesita ayuda para bañarse: ${a.bathe ? 'Sí (+2)' : 'No'}
  Necesita ayuda para vestirse: ${a.dress ? 'Sí (+1)' : 'No'}
  Necesita ayuda para transferencia: ${a.transfer ? 'Sí (+2)' : 'No'}
  Necesita ayuda para usar el retrete: ${a.toilet ? 'Sí (+1)' : 'No'}
  Necesita ayuda para comer: ${a.eat ? 'Sí (+2)' : 'No'}
  Insuficiencia cardíaca congestiva: ${a.chf ? 'Sí (+2)' : 'No'}
  Cáncer: ${{ none: 'No', solitary: 'Solitario (+2)', metastatic: 'Metastásico (+3)' }[a.cancer ?? 'none']}
  Creatinina al ingreso: ${a.creatinine === 'high' ? '>3.0 (+2)' : '≤3.0'}
  Albúmina al ingreso: ${{ high: '>3.4 g/dL', mid: '3.0-3.4 g/dL (+1)', low: '<3.0 g/dL (+2)' }[a.albumin ?? 'high']}

Referencia: Walter LC et al. JAMA 2001;285:2987-2994
Población: adultos hospitalizados ≥70 años. C-statistic: 0.79`;
}

type BoolField = 'bathe' | 'dress' | 'transfer' | 'toilet' | 'eat' | 'chf';

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function WalterScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [a, setA] = useState<Answers>(INITIAL);
  const answeredCount = Object.values(a).filter((v) => v !== null).length;
  const pts = calcPoints(a);
  const { pct, label } = getRisk(pts);
  const severity = getSeverity(pts);

  const set = (field: keyof Answers, value: Answers[keyof Answers]) =>
    setA((prev) => ({ ...prev, [field]: value }));

  const setBool = (field: BoolField, value: boolean) => setA((prev) => ({ ...prev, [field]: value }));

  const BoolQ = ({
    field,
    question,
    pts1,
    pts0 = 0,
  }: {
    field: BoolField;
    question: string;
    pts1: number;
    pts0?: number;
  }) => (
    <div className="mb-4">
      <div className="text-sm font-semibold text-slate-800 mb-2">{question}</div>
      <div className="flex gap-2">
        {[
          { label: 'Sí', value: true, pts: pts1 },
          { label: 'No', value: false, pts: pts0 },
        ].map((opt) => (
          <button
            key={String(opt.value)}
            onClick={() => setBool(field, opt.value)}
            className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all
              ${
                a[field] === opt.value
                  ? 'bg-clinical-600 text-white border-clinical-600'
                  : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
              }`}
          >
            <span className="font-medium">{opt.label}</span>
            {opt.pts > 0 && (
              <span
                className={`text-xs font-bold ${a[field] === opt.value ? 'text-white/70' : 'text-slate-400'}`}
              >
                +{opt.pts}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <ScaleLayout
      title="Walter"
      subtitle="Índice de Walter — Mortalidad 1 año"
      score={pts}
      maxScore={18}
      interpretation={`${pct} mortalidad al año — ${label}`}
      severity={severity}
      onComplete={() =>
        onComplete({
          scaleId: 'walter',
          scaleName: 'Índice de Walter',
          score: pts,
          maxScore: 18,
          interpretation: `${pct} mortalidad al año — ${label}`,
          severity,
          reportText: buildReport(pts, label, pct, a),
          timestamp: Date.now(),
          answers: { pts, sex: a.sex ?? '', cancer: a.cancer ?? '' },
        })
      }
      onBack={onBack}
      reportText={buildReport(pts, label, pct, a)}
      progress={{ answered: answeredCount, total: 10 }}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-4 p-3 bg-warm-50 rounded-xl">
        Predice mortalidad por cualquier causa al año tras hospitalización en adultos ≥70 años. C-statistic
        0.79. Walter et al., JAMA 2001.
      </div>

      {/* Sex */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-800 mb-2">1. Sexo biológico del paciente</div>
        <div className="flex gap-2">
          {[
            { label: 'Varón', value: 'male' as const, pts: 1 },
            { label: 'Mujer', value: 'female' as const, pts: 0 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('sex', opt.value)}
              className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all
                ${
                  a.sex === opt.value
                    ? 'bg-clinical-600 text-white border-clinical-600'
                    : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                }`}
            >
              <span className="font-medium">{opt.label}</span>
              {opt.pts > 0 && (
                <span
                  className={`text-xs font-bold ${a.sex === opt.value ? 'text-white/70' : 'text-slate-400'}`}
                >
                  +{opt.pts}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Functional dependence */}
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 mt-5">
        Al alta, ¿necesita ayuda de otros para...?
      </div>
      <BoolQ
        field="bathe"
        question="Bañarse (más de una parte del cuerpo, entrar/salir de bañera)"
        pts1={2}
      />
      <BoolQ field="dress" question="Vestirse" pts1={1} />
      <BoolQ field="transfer" question="Transferencia cama-sillón" pts1={2} />
      <BoolQ field="toilet" question="Usar el retrete (transferencia, higiene, cuña)" pts1={1} />
      <BoolQ field="eat" question="Comer (ayuda parcial/total o nutrición parenteral)" pts1={2} />

      {/* Comorbidities */}
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 mt-5">
        Comorbilidades
      </div>
      <BoolQ field="chf" question="Insuficiencia cardíaca congestiva" pts1={2} />

      {/* Cancer */}
      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-800 mb-2">Cáncer solitario o metastásico</div>
        <div className="text-xs text-slate-400 mb-2">
          Si solo ha tenido cánceres cutáneos menores, selecciona "No"
        </div>
        <div className="space-y-1.5">
          {[
            { label: 'No', value: 'none' as const, pts: 0 },
            { label: 'Solitario', value: 'solitary' as const, pts: 2 },
            { label: 'Metastásico', value: 'metastatic' as const, pts: 3 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('cancer', opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all
                ${
                  a.cancer === opt.value
                    ? 'bg-clinical-600 text-white border-clinical-600'
                    : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                }`}
            >
              <span className="font-medium">{opt.label}</span>
              {opt.pts > 0 && (
                <span
                  className={`text-xs font-bold ${a.cancer === opt.value ? 'text-white/70' : 'text-slate-400'}`}
                >
                  +{opt.pts}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Labs */}
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3 mt-5">
        Analítica al ingreso
      </div>

      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-800 mb-2">Creatinina</div>
        <div className="flex gap-2">
          {[
            { label: '≤ 3.0', value: 'low' as const, pts: 0 },
            { label: '> 3.0', value: 'high' as const, pts: 2 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('creatinine', opt.value)}
              className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all
                ${
                  a.creatinine === opt.value
                    ? 'bg-clinical-600 text-white border-clinical-600'
                    : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                }`}
            >
              <span className="font-medium">{opt.label}</span>
              {opt.pts > 0 && (
                <span
                  className={`text-xs font-bold ${a.creatinine === opt.value ? 'text-white/70' : 'text-slate-400'}`}
                >
                  +{opt.pts}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-semibold text-slate-800 mb-2">Albúmina (g/dL)</div>
        <div className="space-y-1.5">
          {[
            { label: '> 3.4', value: 'high' as const, pts: 0 },
            { label: '3.0 – 3.4', value: 'mid' as const, pts: 1 },
            { label: '< 3.0', value: 'low' as const, pts: 2 },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => set('albumin', opt.value)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all
                ${
                  a.albumin === opt.value
                    ? 'bg-clinical-600 text-white border-clinical-600'
                    : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                }`}
            >
              <span className="font-medium">{opt.label} g/dL</span>
              {opt.pts > 0 && (
                <span
                  className={`text-xs font-bold ${a.albumin === opt.value ? 'text-white/70' : 'text-slate-400'}`}
                >
                  +{opt.pts}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Risk summary box */}
      {pts > 0 && (
        <div
          className={`mt-4 p-4 rounded-2xl border-2 text-center
          ${
            severity === 'normal'
              ? 'bg-emerald-50 border-emerald-200'
              : severity === 'mild'
                ? 'bg-yellow-50 border-yellow-200'
                : severity === 'moderate'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="text-2xl font-bold text-slate-800">{pct}</div>
          <div className="text-sm text-slate-600">mortalidad estimada al año</div>
          <div className="text-xs text-slate-400 mt-1">
            {pts} puntos — Riesgo {label}
          </div>
        </div>
      )}
    </ScaleLayout>
  );
}
