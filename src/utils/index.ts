import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ScaleResult } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback
  const el = document.createElement('textarea');
  el.value = text;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  return Promise.resolve();
}

// ──────────────────────────────────────────────────────────────────────
// localStorage helpers
// ──────────────────────────────────────────────────────────────────────

const FAVORITES_KEY = 'psicogeri_favorites';
const RECENTS_KEY = 'psicogeri_recents';
const AUTO_CLEAR_KEY = 'psicogeri_auto_clear_recents';

/**
 * Lee de localStorage de forma segura. Devuelve fallback si:
 * - localStorage no existe (SSR / modo privado estricto)
 * - el valor no es JSON parseable
 */
function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Escribe en localStorage de forma segura. No lanza si:
 * - localStorage está lleno (QuotaExceededError)
 * - localStorage está bloqueado (modo privado iOS Safari en algunos casos)
 * - el valor no es serializable (raro, pero possible con ciclos)
 */
function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Silencioso: la app sigue funcionando, solo no persiste esta vez.
  }
}

export function loadFavorites(): string[] {
  const value = safeRead<string[]>(FAVORITES_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function saveFavorites(favorites: string[]): void {
  safeWrite(FAVORITES_KEY, favorites);
}

export function loadRecents(): ScaleResult[] {
  const value = safeRead<ScaleResult[]>(RECENTS_KEY, []);
  return Array.isArray(value) ? value : [];
}

export function saveRecents(recents: ScaleResult[]): void {
  // Keep last 10
  safeWrite(RECENTS_KEY, recents.slice(0, 10));
}

export function addRecent(result: ScaleResult, existing: ScaleResult[]): ScaleResult[] {
  // Dedupe real por scaleId + score + interpretación (no por timestamp, que siempre es único).
  // Si el mismo usuario calcula la misma escala con el mismo resultado dos veces seguidas,
  // solo guardamos la versión más reciente.
  const isSameResult = (a: ScaleResult) =>
    a.scaleId === result.scaleId && a.score === result.score && a.interpretation === result.interpretation;

  const filtered = existing.filter((r) => !isSameResult(r));
  return [result, ...filtered].slice(0, 10);
}

/**
 * Preferencia "borrar recientes al cerrar la app".
 * Cuando está activa, los recientes se borran al detectar que la PWA
 * se cierra (pagehide / visibilitychange=hidden).
 */
export function loadAutoClearRecents(): boolean {
  return Boolean(safeRead<boolean>(AUTO_CLEAR_KEY, false));
}

export function saveAutoClearRecents(value: boolean): void {
  safeWrite(AUTO_CLEAR_KEY, value);
}

// ──────────────────────────────────────────────────────────────────────
// Severity helpers (UI)
// ──────────────────────────────────────────────────────────────────────

export function getSeverityColor(severity: ScaleResult['severity']): string {
  switch (severity) {
    case 'normal':
      return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    case 'mild':
      return 'text-amber-600 bg-amber-50 border-amber-200';
    case 'moderate':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'severe':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'info':
      return 'text-clinical-600 bg-clinical-50 border-clinical-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export function getSeverityDot(severity: ScaleResult['severity']): string {
  switch (severity) {
    case 'normal':
      return 'bg-emerald-500';
    case 'mild':
      return 'bg-amber-500';
    case 'moderate':
      return 'bg-orange-500';
    case 'severe':
      return 'bg-red-500';
    case 'info':
      return 'bg-clinical-500';
    default:
      return 'bg-slate-400';
  }
}
