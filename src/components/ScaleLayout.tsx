import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Copy, CheckCheck, ClipboardList } from 'lucide-react';
import type { ScaleResult } from '../types';
import { getSeverityColor, getSeverityDot, copyToClipboard } from '../utils';

interface Props {
  title: string;
  subtitle: string;
  score: number | string;
  maxScore: number | string;
  interpretation: string;
  severity: ScaleResult['severity'];
  onComplete: () => void;
  onBack: () => void;
  reportText: string;
  completeDisabled?: boolean;
  children: React.ReactNode;
  onMarkDirty?: () => void;
  progress?: { answered: number; total: number };
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
const SEV_TEXT: Record<string, string> = {
  normal: '#15803d',
  mild: '#92400e',
  moderate: '#9a3412',
  severe: '#991b1b',
  info: '#1e3a8a',
};
const SEV_BORDER: Record<string, string> = {
  normal: '#bbf7d0',
  mild: '#fde68a',
  moderate: '#fed7aa',
  severe: '#fecaca',
  info: '#d0e9fa',
};

export function ScaleLayout({
  title,
  subtitle,
  score,
  maxScore,
  interpretation,
  severity,
  onComplete,
  onBack,
  reportText,
  completeDisabled = false,
  children,
  onMarkDirty,
  progress,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [touched, setTouched] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const swipeActive = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(57);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  // Measure header height dynamically so score bar sticks correctly below it
  useEffect(() => {
    if (!headerRef.current) return;
    const ro = new ResizeObserver(() => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    });
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, []);

  // Swipe right → back with slide animation
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipeActive.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartX.current;
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dy > 10 && !swipeActive.current) return; // vertical scroll, ignore
    if (dx > 10) swipeActive.current = true;
    if (swipeActive.current && dx > 0 && containerRef.current) {
      containerRef.current.style.transform = `translateX(${dx}px)`;
      containerRef.current.style.opacity = `${1 - dx / 350}`;
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX.current;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY.current);
      if (!containerRef.current) return;
      if (swipeActive.current && dx >= 100 && dy < 60) {
        // Complete swipe: animate out then navigate
        containerRef.current.style.transition = 'transform 0.18s ease-out, opacity 0.18s ease-out';
        containerRef.current.style.transform = 'translateX(100%)';
        containerRef.current.style.opacity = '0';
        setTimeout(() => handleBack(), 170);
      } else {
        // Snap back
        containerRef.current.style.transition = 'transform 0.2s ease-out, opacity 0.2s ease-out';
        containerRef.current.style.transform = 'translateX(0)';
        containerRef.current.style.opacity = '1';
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = '';
            containerRef.current.style.transform = '';
            containerRef.current.style.opacity = '';
          }
        }, 200);
      }
      swipeActive.current = false;
    },
    [touched],
  ); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = () => {
    if (touched && !window.confirm('Hay datos sin guardar. ¿Salir de la escala?')) return;
    onBack();
  };

  const handleCopy = async () => {
    if (!reportText) return;
    await copyToClipboard(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInteraction = () => {
    if (!touched) {
      setTouched(true);
      onMarkDirty?.();
    }
  };

  const showNeutral =
    !touched && severity === 'severe' && (typeof score === 'number' ? score === 0 : score === '—');
  const displayInterpretation = showNeutral ? 'Sin completar' : interpretation;
  const copyEnabled = reportText.length > 0;
  const progressPct = progress ? Math.round((progress.answered / progress.total) * 100) : null;

  // ── MOBILE ──
  return (
    <div
      ref={containerRef}
      className="flex flex-col min-h-screen bg-surface"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header — measured for dynamic sticky top below */}
      <div
        ref={headerRef}
        className="sticky top-0 z-10 bg-white border-b border-slate-100 px-4 py-3 safe-top"
      >
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-xl active:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-slate-900 text-base leading-tight">{title}</div>
            <div className="text-xs text-slate-500 truncate">{subtitle}</div>
          </div>
        </div>

        {/* Progress bar */}
        {progress && (
          <div className="mt-2.5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-slate-400 font-medium">
                {progress.answered} de {progress.total} ítems
              </span>
              <span className="text-[10px] font-bold text-clinical-600">{progressPct}%</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%`, background: progressPct === 100 ? '#16a34a' : '#3a7abf' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Score bar — top calculated from measured header height */}
      <div
        className="sticky z-10 bg-white border-b border-slate-100 px-4 py-3 shadow-sm"
        style={{ top: headerHeight }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${showNeutral ? 'bg-clinical-500' : getSeverityDot(severity)}`}
            />
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${showNeutral ? 'text-clinical-600 bg-clinical-50 border-clinical-200' : getSeverityColor(severity)}`}
            >
              {displayInterpretation}
            </span>
          </div>
          <span className="font-mono text-xl font-bold text-clinical-600">
            {showNeutral ? '—' : score}
            {!showNeutral && maxScore !== '' && <span className="text-sm text-slate-400">/{maxScore}</span>}
          </span>
        </div>
      </div>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5" onClick={handleInteraction}>
        {children}
      </div>

      {/* Bottom actions */}
      <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-3 safe-bottom">
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            disabled={!copyEnabled}
            className="flex items-center gap-2 px-4 h-12 rounded-2xl border border-slate-200 bg-white text-slate-700 text-sm font-medium active:bg-slate-50 disabled:opacity-40"
          >
            {copied ? <CheckCheck className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button
            onClick={onComplete}
            disabled={completeDisabled}
            className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl bg-clinical-600 text-white text-sm font-semibold active:bg-clinical-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <ClipboardList className="w-4 h-4" />
            Guardar resultado
          </button>
        </div>
      </div>
    </div>
  );
}
