import { useState } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

// V-VST — Volume-Viscosity Swallow Test
// Clavé P et al. Clin Nutr. 2008;27(4):553-562.

type Viscosity = 'nectar' | 'liquid' | 'pudin';
type Volume = 5 | 10 | 20;

interface TakeResult {
  tos: boolean;
  voz: boolean;
  desaturacion: boolean;
  selloLabial: boolean;
  residuoOral: boolean;
  deglFraccionada: boolean;
  residuoFaringeo: boolean;
  skipped: boolean; // toma omitida por fallo de seguridad previo
}

type TakeKey = `${Viscosity}_${Volume}`;

const TAKES: { key: TakeKey; viscosity: Viscosity; volume: Volume }[] = [
  { key: 'nectar_5', viscosity: 'nectar', volume: 5 },
  { key: 'nectar_10', viscosity: 'nectar', volume: 10 },
  { key: 'nectar_20', viscosity: 'nectar', volume: 20 },
  { key: 'liquid_5', viscosity: 'liquid', volume: 5 },
  { key: 'liquid_10', viscosity: 'liquid', volume: 10 },
  { key: 'liquid_20', viscosity: 'liquid', volume: 20 },
  { key: 'pudin_5', viscosity: 'pudin', volume: 5 },
  { key: 'pudin_10', viscosity: 'pudin', volume: 10 },
  { key: 'pudin_20', viscosity: 'pudin', volume: 20 },
];

const VIS_LABEL: Record<Viscosity, string> = {
  nectar: 'Néctar',
  liquid: 'Líquido',
  pudin: 'Pudín',
};

const EMPTY_TAKE: TakeResult = {
  tos: false,
  voz: false,
  desaturacion: false,
  selloLabial: false,
  residuoOral: false,
  deglFraccionada: false,
  residuoFaringeo: false,
  skipped: false,
};

function hasSafetyIssue(t: TakeResult): boolean {
  return t.tos || t.voz || t.desaturacion;
}

function hasEfficacyIssue(t: TakeResult): boolean {
  return t.selloLabial || t.residuoOral || t.deglFraccionada || t.residuoFaringeo;
}

function buildReport(results: Partial<Record<TakeKey, TakeResult>>, spO2base: string): string {
  const date = new Date().toLocaleDateString('es-ES');

  const viscGroups: Viscosity[] = ['nectar', 'liquid', 'pudin'];
  const volumes: Volume[] = [5, 10, 20];

  let safetyFail = false;
  let efficacyFail = false;

  const lines: string[] = [];
  for (const vis of viscGroups) {
    const visLines: string[] = [];
    for (const vol of volumes) {
      const key = `${vis}_${vol}` as TakeKey;
      const t = results[key];
      if (!t) continue;
      if (t.skipped) {
        visLines.push(`  ${vol}ml: OMITIDA (fallo de seguridad previo en esta viscosidad)`);
        continue;
      }
      const safety = hasSafetyIssue(t);
      const efficacy = hasEfficacyIssue(t);
      if (safety) safetyFail = true;
      if (efficacy) efficacyFail = true;
      const safetyStr = safety
        ? `⚠ SEGURIDAD: ${[t.tos && 'tos', t.voz && 'cambio de voz', t.desaturacion && 'desaturación'].filter(Boolean).join(', ')}`
        : '✓ Seguridad OK';
      const efficacyStr = efficacy
        ? `⚠ EFICACIA: ${[t.selloLabial && 'sello labial', t.residuoOral && 'residuo oral', t.deglFraccionada && 'deglución fraccionada', t.residuoFaringeo && 'residuo faríngeo'].filter(Boolean).join(', ')}`
        : '✓ Eficacia OK';
      visLines.push(`  ${vol}ml: ${safetyStr} | ${efficacyStr}`);
    }
    if (visLines.length) lines.push(`${VIS_LABEL[vis]}:\n${visLines.join('\n')}`);
  }

  const conclusion: string[] = [];
  if (safetyFail)
    conclusion.push('ALTERACIÓN DE SEGURIDAD — riesgo de aspiración. Modificar textura y/o volumen.');
  if (efficacyFail)
    conclusion.push('ALTERACIÓN DE EFICACIA — riesgo de malnutrición/deshidratación. Adaptar dieta.');
  if (!safetyFail && !efficacyFail)
    conclusion.push('Sin alteraciones de seguridad ni eficacia en las tomas realizadas.');

  return `V-VST (Volume-Viscosity Swallow Test) — ${date}
SpO2 basal: ${spO2base || '—'}%

RESULTADOS POR TOMA:
${lines.join('\n')}

CONCLUSIÓN:
${conclusion.join('\n')}

Referencia: Clavé P et al. Accuracy of the volume-viscosity swallow test for clinical screening
of oropharyngeal dysphagia and aspiration. Clin Nutr. 2008;27(4):553-562.`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function VVSTScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [spO2base, setSpO2base] = useState('');
  const [results, setResults] = useState<Partial<Record<TakeKey, TakeResult>>>({});
  const [currentStep, setCurrentStep] = useState(0); // index into TAKES

  // Compute which takes are available/skipped given current results
  function computeSkips(res: Partial<Record<TakeKey, TakeResult>>): Set<TakeKey> {
    const skipped = new Set<TakeKey>();
    for (const vis of ['nectar', 'liquid', 'pudin'] as Viscosity[]) {
      let failedSafety = false;
      for (const vol of [5, 10, 20] as Volume[]) {
        const key = `${vis}_${vol}` as TakeKey;
        if (failedSafety) {
          skipped.add(key);
          continue;
        }
        const t = res[key];
        if (t && hasSafetyIssue(t)) failedSafety = true;
      }
    }
    return skipped;
  }

  const skips = computeSkips(results);
  const completedTakes = TAKES.filter((t) => results[t.key] || skips.has(t.key)).length;
  const allDone = completedTakes === TAKES.length;

  const currentTake = TAKES[currentStep];
  const currentResult = currentTake ? (results[currentTake.key] ?? { ...EMPTY_TAKE }) : null;

  const setSign = (sign: keyof Omit<TakeResult, 'skipped'>, value: boolean) => {
    if (!currentTake) return;
    setResults((prev) => ({
      ...prev,
      [currentTake.key]: { ...(prev[currentTake.key] ?? EMPTY_TAKE), [sign]: value, skipped: false },
    }));
    onMarkDirty?.();
  };

  const confirmTake = () => {
    if (!currentTake || !currentResult) return;
    // Save current take
    const saved = { ...currentResult, skipped: false };
    const newResults = { ...results, [currentTake.key]: saved };

    // Auto-skip next volumes in same viscosity if safety failed
    const newSkips = computeSkips(newResults);
    for (const t of TAKES) {
      if (newSkips.has(t.key) && !newResults[t.key]) {
        newResults[t.key] = { ...EMPTY_TAKE, skipped: true };
      }
    }
    setResults(newResults);

    // Advance to next unskipped take
    let next = currentStep + 1;
    while (next < TAKES.length && newSkips.has(TAKES[next].key)) next++;
    setCurrentStep(next < TAKES.length ? next : TAKES.length);
    onMarkDirty?.();
  };

  const goToStep = (idx: number) => setCurrentStep(idx);

  const safetyFailAny = TAKES.some((t) => {
    const r = results[t.key];
    return r && !r.skipped && hasSafetyIssue(r);
  });
  const efficacyFailAny = TAKES.some((t) => {
    const r = results[t.key];
    return r && !r.skipped && hasEfficacyIssue(r);
  });
  const severity: ScaleResult['severity'] = safetyFailAny
    ? 'severe'
    : efficacyFailAny
      ? 'moderate'
      : allDone
        ? 'normal'
        : 'info';
  const interpretation = safetyFailAny
    ? 'Alteración de seguridad'
    : efficacyFailAny
      ? 'Alteración de eficacia'
      : allDone
        ? 'Sin alteraciones'
        : 'En curso';

  return (
    <ScaleLayout
      title="V-VST"
      subtitle="Volume-Viscosity Swallow Test"
      score={`${completedTakes}/${TAKES.length}`}
      maxScore=""
      interpretation={interpretation}
      severity={severity}
      progress={{ answered: completedTakes, total: TAKES.length }}
      onComplete={() =>
        onComplete({
          scaleId: 'vvst',
          scaleName: 'V-VST',
          score: interpretation,
          maxScore: '',
          interpretation,
          severity,
          reportText: buildReport(results, spO2base),
          timestamp: Date.now(),
          answers: { safetyFail: safetyFailAny ? 1 : 0, efficacyFail: efficacyFailAny ? 1 : 0 },
        })
      }
      onBack={onBack}
      reportText={buildReport(results, spO2base)}
      onMarkDirty={onMarkDirty}
    >
      {/* SpO2 basal */}
      <div className="mb-5">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Preparación</div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4">
          <label className="text-sm font-semibold text-slate-800 block mb-2">
            SpO₂ basal (antes del test)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={80}
              max={100}
              placeholder="98"
              value={spO2base}
              onChange={(e) => {
                setSpO2base(e.target.value);
                onMarkDirty?.();
              }}
              style={{ fontSize: '16px' }}
              className="w-24 px-3 py-2 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-clinical-500 text-center"
            />
            <span className="text-sm text-slate-500">%</span>
            <span className="text-xs text-slate-400 ml-2">Umbral de alerta: caída ≥3%</span>
          </div>
        </div>
      </div>

      {/* Take navigator */}
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Tomas</div>
        <div className="grid grid-cols-3 gap-1.5">
          {TAKES.map((take, idx) => {
            const res = results[take.key];
            const isSkipped = skips.has(take.key) || res?.skipped;
            const isDone = !!res && !res.skipped;
            const isCurrent = idx === currentStep && !allDone;
            const hasSafe = isDone && hasSafetyIssue(res);
            const hasEff = isDone && hasEfficacyIssue(res);
            return (
              <button
                key={take.key}
                onClick={() => !isSkipped && goToStep(idx)}
                disabled={isSkipped}
                className={`py-2 px-1 rounded-xl text-xs font-semibold border transition-all
                  ${
                    isSkipped
                      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      : isCurrent
                        ? 'bg-clinical-600 text-white border-clinical-600 shadow-sm'
                        : hasSafe
                          ? 'bg-red-50 text-red-600 border-red-200'
                          : hasEff
                            ? 'bg-amber-50 text-amber-600 border-amber-200'
                            : isDone
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                              : 'bg-white text-slate-500 border-slate-200 active:bg-slate-50'
                  }`}
              >
                {VIS_LABEL[take.viscosity][0]}
                {take.volume}
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 mt-2 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> OK
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Eficacia
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Seguridad
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" /> Omitida
          </span>
        </div>
      </div>

      {/* Current take form */}
      {!allDone && currentTake && currentResult && (
        <div className="bg-white border border-clinical-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-base font-bold text-clinical-700">
                {VIS_LABEL[currentTake.viscosity]}
              </span>
              <span className="text-sm text-slate-500 ml-2">{currentTake.volume} ml</span>
            </div>
            <span className="text-xs text-slate-400">
              Toma {currentStep + 1} de {TAKES.length}
            </span>
          </div>

          {/* Safety signs */}
          <div className="mb-4">
            <div className="text-xs font-bold text-red-600 uppercase tracking-widest mb-2">
              Signos de seguridad
            </div>
            <div className="text-xs text-slate-400 mb-2">
              Marcar si presentes durante o inmediatamente tras la deglución
            </div>
            <div className="space-y-1.5">
              {[
                { key: 'tos' as const, label: 'Tos durante o después de la deglución' },
                { key: 'voz' as const, label: 'Cambio de voz (húmeda/gorgoteante)' },
                {
                  key: 'desaturacion' as const,
                  label: `Desaturación SpO₂ ≥3%${spO2base ? ` (umbral ≤${Math.round(Number(spO2base) - 3)}%)` : ''}`,
                },
              ].map((sign) => (
                <button
                  key={sign.key}
                  onClick={() => setSign(sign.key, !currentResult[sign.key])}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all
                    ${
                      currentResult[sign.key]
                        ? 'bg-red-500 text-white border-red-500'
                        : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all
                    ${currentResult[sign.key] ? 'bg-white border-white' : 'border-slate-300'}`}
                  >
                    {currentResult[sign.key] && <div className="w-2 h-2 rounded-sm bg-red-500" />}
                  </div>
                  <span className="font-medium text-left">{sign.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Efficacy signs */}
          <div className="mb-4">
            <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-2">
              Signos de eficacia
            </div>
            <div className="space-y-1.5">
              {[
                { key: 'selloLabial' as const, label: 'Sello labial incompleto' },
                { key: 'residuoOral' as const, label: 'Residuo oral' },
                { key: 'deglFraccionada' as const, label: 'Deglución fraccionada (>1 deglución por toma)' },
                {
                  key: 'residuoFaringeo' as const,
                  label: 'Residuo faríngeo (voz con residuo tras deglución)',
                },
              ].map((sign) => (
                <button
                  key={sign.key}
                  onClick={() => setSign(sign.key, !currentResult[sign.key])}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm transition-all
                    ${
                      currentResult[sign.key]
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-slate-700 border-slate-200 active:bg-slate-50'
                    }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all
                    ${currentResult[sign.key] ? 'bg-white border-white' : 'border-slate-300'}`}
                  >
                    {currentResult[sign.key] && <div className="w-2 h-2 rounded-sm bg-amber-500" />}
                  </div>
                  <span className="font-medium text-left">{sign.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={confirmTake}
            className="w-full h-12 rounded-2xl bg-clinical-600 text-white text-sm font-semibold active:bg-clinical-700 shadow-sm"
          >
            Confirmar toma →
          </button>

          {hasSafetyIssue(currentResult) && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 leading-relaxed">
              ⚠ Fallo de seguridad detectado. Al confirmar, las tomas de mayor volumen con esta viscosidad
              quedarán omitidas.
            </div>
          )}
        </div>
      )}

      {/* Summary when done */}
      {allDone && (
        <div
          className={`p-4 rounded-2xl border-2 mb-4
          ${safetyFailAny ? 'bg-red-50 border-red-200' : efficacyFailAny ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}
        >
          <div
            className={`text-sm font-bold mb-2 ${safetyFailAny ? 'text-red-700' : efficacyFailAny ? 'text-amber-700' : 'text-emerald-700'}`}
          >
            {safetyFailAny
              ? '⚠ Alteración de seguridad detectada'
              : efficacyFailAny
                ? '⚠ Alteración de eficacia detectada'
                : '✓ Sin alteraciones'}
          </div>
          <div
            className={`text-xs leading-relaxed ${safetyFailAny ? 'text-red-600' : efficacyFailAny ? 'text-amber-600' : 'text-emerald-600'}`}
          >
            {safetyFailAny &&
              'Riesgo de aspiración. Considerar modificación de textura (pudin/néctar) y/o volumen. Derivar a logopedia.'}
            {!safetyFailAny &&
              efficacyFailAny &&
              'Riesgo de malnutrición o deshidratación. Adaptar dieta y supervisar ingesta.'}
            {!safetyFailAny &&
              !efficacyFailAny &&
              'Deglución aparentemente segura y eficaz en las condiciones del test.'}
          </div>
        </div>
      )}
    </ScaleLayout>
  );
}
