import { useState, useRef } from 'react';
import type { ScaleResult } from '../types';
import { ScaleLayout } from '../components/ScaleLayout';

const DISTANCE = 6; // metros

function interpret(speed: number): { text: string; severity: ScaleResult['severity'] } {
  if (speed === 0) return { text: 'Sin dato', severity: 'normal' };
  if (speed < 0.4) return { text: 'Movilidad muy limitada — alto riesgo caídas', severity: 'severe' };
  if (speed < 0.6) return { text: 'Movilidad limitada — riesgo caídas', severity: 'severe' };
  if (speed < 0.8) return { text: 'Movilidad reducida — riesgo moderado', severity: 'moderate' };
  if (speed < 1.0) return { text: 'Movilidad aceptable', severity: 'mild' };
  return { text: 'Velocidad normal', severity: 'normal' };
}

interface Props {
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

export function VelocidadMarchaScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [seconds, setSeconds] = useState<number | null>(null);
  const [inputVal, setInputVal] = useState('');
  const [running, setRunning] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const speed = seconds !== null && seconds > 0 ? DISTANCE / seconds : 0;
  const { text: interpText, severity } = interpret(speed);

  function startTimer() {
    setRunning(true);
    setElapsed(0);
    const t = Date.now();
    setStartTime(t);
    intervalRef.current = setInterval(() => {
      setElapsed((Date.now() - t) / 1000);
    }, 100);
  }

  function stopTimer() {
    if (!startTime) return;
    const secs = (Date.now() - startTime) / 1000;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(parseFloat(secs.toFixed(1)));
    setInputVal(secs.toFixed(1));
  }

  function handleManualInput(v: string) {
    setInputVal(v);
    const n = parseFloat(v);
    if (!isNaN(n) && n > 0) setSeconds(n);
    else setSeconds(null);
  }

  function reset() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(null);
    setInputVal('');
    setElapsed(0);
    setStartTime(null);
  }

  const reportText =
    seconds !== null
      ? `Velocidad de marcha 6 metros — ${new Date().toLocaleDateString('es-ES')}\n\nTiempo: ${seconds} s\nDistancia: ${DISTANCE} m\nVelocidad: ${speed.toFixed(2)} m/s\nInterpretación: ${interpText}\n\nReferencia:\n< 0.4 m/s — Movilidad muy limitada, alto riesgo de caídas\n0.4-0.6 m/s — Movilidad limitada, riesgo de caídas\n0.6-0.8 m/s — Movilidad reducida, riesgo moderado\n0.8-1.0 m/s — Movilidad aceptable\n≥ 1.0 m/s — Velocidad normal`
      : '';

  return (
    <ScaleLayout
      title="VM 6m"
      subtitle="Velocidad de marcha — 6 metros"
      score={Math.round(speed * 100)}
      maxScore={0}
      interpretation={seconds !== null ? `${speed.toFixed(2)} m/s — ${interpText}` : 'Pendiente medición'}
      severity={severity}
      onComplete={() => {
        if (seconds === null) return;
        onComplete({
          scaleId: 'velocidadmarcha',
          scaleName: 'Velocidad marcha 6m',
          score: Math.round(speed * 100),
          maxScore: 0,
          interpretation: `${speed.toFixed(2)} m/s — ${interpText}`,
          severity,
          reportText,
          timestamp: Date.now(),
          answers: { segundos: seconds, velocidad_ms: speed },
        });
      }}
      onBack={onBack}
      reportText={reportText}
      onMarkDirty={onMarkDirty}
    >
      <div className="text-xs text-slate-500 mb-4 p-3 bg-warm-50 rounded-xl">
        Mide el tiempo que tarda el paciente en recorrer 6 metros a paso normal. Se calcula automáticamente la
        velocidad en m/s.
      </div>

      {/* Cronómetro */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-4 text-center shadow-card">
        <div className="text-4xl font-bold tabular-nums text-clinical-700 mb-4">
          {running ? elapsed.toFixed(1) : seconds !== null ? seconds.toFixed(1) : '0.0'}
          <span className="text-lg font-normal text-slate-400 ml-1">s</span>
        </div>
        <div className="flex gap-3 justify-center">
          {!running ? (
            <button
              onClick={startTimer}
              className="flex-1 bg-clinical-600 text-white rounded-2xl py-4 text-base font-bold active:bg-clinical-700 transition-colors"
            >
              ▶ Iniciar
            </button>
          ) : (
            <button
              onClick={stopTimer}
              className="flex-1 bg-red-500 text-white rounded-2xl py-4 text-base font-bold active:bg-red-600 transition-colors"
            >
              ⏹ Parar
            </button>
          )}
          <button
            onClick={reset}
            className="px-5 bg-slate-100 text-slate-600 rounded-2xl py-4 text-sm font-semibold active:bg-slate-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Manual input */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-4">
        <div className="text-sm font-semibold text-slate-700 mb-2">O introduce el tiempo manualmente</div>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="0"
            step="0.1"
            value={inputVal}
            onChange={(e) => handleManualInput(e.target.value)}
            placeholder="0.0"
            style={{ fontSize: '16px' }}
            className="flex-1 border border-slate-200 rounded-xl px-4 py-3 tabular-nums font-bold text-clinical-700 focus:outline-none focus:ring-2 focus:ring-clinical-500"
          />
          <span className="text-slate-500 font-medium">segundos</span>
        </div>
      </div>

      {/* Result */}
      {seconds !== null && seconds > 0 && (
        <div
          className={`rounded-2xl border-2 p-4 text-center
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
          <div className="text-3xl font-bold text-slate-800">
            {speed.toFixed(2)} <span className="text-base font-normal text-slate-500">m/s</span>
          </div>
          <div className="text-sm text-slate-600 mt-1">{interpText}</div>
          <div className="text-xs text-slate-400 mt-1">
            {seconds}s · {DISTANCE}m
          </div>
        </div>
      )}

      {/* Reference */}
      <div className="mt-4 bg-slate-50 rounded-2xl p-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Referencia</div>
        {[
          { range: '≥ 1.0 m/s', desc: 'Velocidad normal', color: 'text-emerald-600' },
          { range: '0.8 – 1.0', desc: 'Movilidad aceptable', color: 'text-yellow-600' },
          { range: '0.6 – 0.8', desc: 'Riesgo moderado', color: 'text-orange-600' },
          { range: '0.4 – 0.6', desc: 'Riesgo de caídas', color: 'text-red-500' },
          { range: '< 0.4 m/s', desc: 'Alto riesgo de caídas', color: 'text-red-700' },
        ].map((r) => (
          <div
            key={r.range}
            className="flex justify-between text-xs py-1 border-b border-slate-100 last:border-0"
          >
            <span className={`font-bold tabular-nums ${r.color}`}>{r.range}</span>
            <span className="text-slate-600">{r.desc}</span>
          </div>
        ))}
      </div>
    </ScaleLayout>
  );
}
