import { useState, useRef } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

function interpret(seconds: number): { text: string; severity: ScaleResult['severity'] } {
  if (seconds < 10) return { text: 'Normal / bajo riesgo', severity: 'normal' };
  if (seconds < 20) return { text: 'Funcional / riesgo moderado', severity: 'moderate' };
  return { text: 'Alto riesgo de caída', severity: 'severe' };
}

function buildReport(seconds: number, interp: string): string {
  const date = new Date().toLocaleDateString('es-ES');
  return `Timed Up and Go (TUG) — ${date}
Tiempo: ${seconds.toFixed(1)}s — ${interp}

Referencia: <10s normal, 10-19s riesgo moderado, ≥20s alto riesgo de caída.`;
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function TUGScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [time, setTime] = useState<number | null>(null);
  const [running, setRunning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const startRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const startTimer = () => {
    setRunning(true);
    setTime(null);
    startRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      setElapsed((Date.now() - startRef.current) / 1000);
    }, 50);
  };

  const stopTimer = () => {
    if (!running) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    const t = (Date.now() - startRef.current) / 1000;
    setTime(t);
    setElapsed(t);
    setRunning(false);
  };

  const reset = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setTime(null);
    setElapsed(0);
    setManualInput('');
  };

  const applyManual = () => {
    const v = parseFloat(manualInput.replace(',', '.'));
    if (!isNaN(v) && v > 0) setTime(v);
  };

  const finalTime = time ?? (manualInput ? parseFloat(manualInput.replace(',', '.')) : null);
  const { text: interpText, severity } = finalTime
    ? interpret(finalTime)
    : { text: 'Pendiente', severity: 'info' as const };

  return (
    <ScaleLayout
      title="TUG"
      subtitle="Timed Up and Go"
      score={finalTime ? `${finalTime.toFixed(1)}s` : '—'}
      maxScore={''}
      interpretation={interpText}
      severity={severity}
      onComplete={() => {
        if (!finalTime) return;
        onComplete({
          scaleId: 'tug',
          scaleName: 'TUG',
          score: finalTime,
          maxScore: 'seg',
          interpretation: interpText,
          severity,
          reportText: buildReport(finalTime, interpText),
          timestamp: Date.now(),
          answers: { seconds: finalTime },
        });
      }}
      onBack={onBack}
      reportText={finalTime ? buildReport(finalTime, interpText) : ''}
      completeDisabled={!finalTime || isNaN(finalTime)}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-5 p-3 bg-warm-50 rounded-xl">
        El paciente parte sentado en silla, se levanta, camina 3 metros, da media vuelta, vuelve y se sienta.
      </div>

      {/* Cronómetro */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 text-center">
        <div className="font-mono text-5xl font-bold text-clinical-700 mb-4 tabular-nums">
          {running ? elapsed.toFixed(1) : time ? time.toFixed(1) : '0.0'}s
        </div>
        <div className="flex gap-3 justify-center">
          {!running && !time && (
            <button
              onClick={startTimer}
              className="flex-1 h-14 bg-clinical-600 text-white rounded-2xl font-semibold text-lg active:bg-clinical-700"
            >
              ▶ Iniciar
            </button>
          )}
          {running && (
            <button
              onClick={stopTimer}
              className="flex-1 h-14 bg-red-500 text-white rounded-2xl font-semibold text-lg active:bg-red-600"
            >
              ■ Parar
            </button>
          )}
          {time && !running && (
            <>
              <button
                onClick={reset}
                className="flex-1 h-14 bg-slate-100 text-slate-700 rounded-2xl font-semibold active:bg-slate-200"
              >
                Repetir
              </button>
            </>
          )}
        </div>
      </div>

      {/* Entrada manual */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4">
        <button
          onClick={() => setShowManual(!showManual)}
          className="text-sm text-clinical-600 font-medium w-full text-left"
        >
          {showManual ? '▲' : '▼'} Introducir tiempo manualmente
        </button>
        {showManual && (
          <div className="mt-3 flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              placeholder="Segundos (ej. 12.5)"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              style={{ fontSize: '16px' }}
              className="flex-1 border border-slate-200 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-clinical-500"
            />
            <button
              onClick={applyManual}
              className="px-4 py-3 bg-clinical-600 text-white rounded-xl text-sm font-semibold active:bg-clinical-700"
            >
              OK
            </button>
          </div>
        )}
      </div>

      {/* Referencia */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ['< 10s', 'Normal', 'bg-emerald-50 text-emerald-700 border-emerald-200'],
          ['10-19s', 'Moderado', 'bg-orange-50 text-orange-700 border-orange-200'],
          ['≥ 20s', 'Alto riesgo', 'bg-red-50 text-red-700 border-red-200'],
        ].map(([range, label, style]) => (
          <div key={range} className={`p-2 rounded-xl border text-xs ${style}`}>
            <div className="font-bold">{range}</div>
            <div className="opacity-75">{label}</div>
          </div>
        ))}
      </div>
    </ScaleLayout>
  );
}
