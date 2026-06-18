import { useState, useEffect, useRef } from 'react';
import { X, Copy, CheckCheck, Home } from 'lucide-react';
import type { ScaleResult } from '../types';
import { getSeverityColor, getSeverityDot, copyToClipboard, formatDate } from '../utils';

interface Props {
  result: ScaleResult;
  onClose: () => void; // go to home
  onDismiss: () => void; // stay on scale (close modal only)
}

const SEV_COLOR: Record<string, string> = {
  normal: '#16a34a',
  mild: '#d97706',
  moderate: '#ea580c',
  severe: '#dc2626',
  info: '#3a7abf',
};
const SEV_BG: Record<string, string> = {
  normal: '#f0fdf4',
  mild: '#fffbeb',
  moderate: '#fff7ed',
  severe: '#fef2f2',
  info: '#e8f4fd',
};

export function ResultModal({ result, onClose, onDismiss }: Props) {
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Guardar foco previo y mover foco al modal al montar
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null;
    // Foco al botón de cerrar tras un tick (para que renderice)
    const t = setTimeout(() => {
      const firstBtn = dialogRef.current?.querySelector<HTMLElement>('button');
      firstBtn?.focus();
    }, 50);
    return () => clearTimeout(t);
  }, []);

  // Restaurar foco al desmontar
  useEffect(() => {
    return () => {
      previousFocusRef.current?.focus?.();
    };
  }, []);

  // Cerrar con Escape (cierra sin ir a home, igual que click fuera)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onDismiss();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onDismiss]);

  // Focus trap simple: Tab y Shift+Tab ciclan dentro del modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleCopy = async () => {
    await copyToClipboard(result.reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const num = typeof result.score === 'number' ? result.score : parseFloat(String(result.score));
  const max = typeof result.maxScore === 'number' ? result.maxScore : parseFloat(String(result.maxScore));
  const pct = !isNaN(num) && !isNaN(max) && max > 0 ? Math.min(100, Math.round((num / max) * 100)) : null;
  const barColor = SEV_COLOR[result.severity] ?? '#94a3b8';

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
      onClick={onDismiss}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Resultado de ${result.scaleName}: ${result.score} sobre ${result.maxScore}, ${result.interpretation}`}
        className="w-full max-w-lg bg-white rounded-t-3xl p-5 pb-8 safe-bottom"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '80vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg font-bold text-slate-900">{result.scaleName}</div>
            <div className="text-xs text-slate-500">{formatDate(result.timestamp)}</div>
          </div>
          <button
            onClick={onDismiss}
            aria-label="Cerrar diálogo"
            className="p-2 rounded-xl active:bg-slate-100"
          >
            <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-4 p-4 bg-slate-50 rounded-2xl">
          <div className={`w-3 h-3 rounded-full ${getSeverityDot(result.severity)}`} aria-hidden="true" />
          <div>
            <div className="font-mono text-2xl font-bold text-clinical-600">
              {result.score}
              {result.maxScore !== '' && <span className="text-slate-400 text-base">/{result.maxScore}</span>}
            </div>
            <div
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border inline-block mt-1 ${getSeverityColor(result.severity)}`}
            >
              {result.interpretation}
            </div>
          </div>
        </div>
        <div className="bg-slate-900 rounded-2xl p-4 mb-4">
          <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
            {result.reportText}
          </pre>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            aria-label="Copiar informe al portapapeles"
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-clinical-600 text-white font-semibold text-sm active:bg-clinical-700"
          >
            {copied ? (
              <CheckCheck className="w-4 h-4" aria-hidden="true" />
            ) : (
              <Copy className="w-4 h-4" aria-hidden="true" />
            )}
            {copied ? '¡Copiado!' : 'Copiar informe'}
          </button>
          <button
            onClick={onClose}
            aria-label="Ir al inicio"
            className="flex items-center justify-center gap-2 px-4 h-12 rounded-2xl border border-slate-200 bg-white text-slate-600 text-sm font-semibold active:bg-slate-50"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
