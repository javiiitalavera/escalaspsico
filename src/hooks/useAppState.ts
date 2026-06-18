import { useState, useCallback, useEffect } from 'react';
import type { ActiveScreen, ScaleResult } from '../types';
import {
  loadFavorites,
  saveFavorites,
  loadRecents,
  saveRecents,
  addRecent,
  loadAutoClearRecents,
  saveAutoClearRecents,
} from '../utils';

export function useAppState() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('home');
  const [activeScaleId, setActiveScaleId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => loadFavorites());
  const [recents, setRecents] = useState<ScaleResult[]>(() => loadRecents());
  const [pendingResult, setPendingResult] = useState<ScaleResult | null>(null);
  const [autoClearRecents, setAutoClearRecents] = useState<boolean>(() => loadAutoClearRecents());

  const navigateTo = useCallback((screen: ActiveScreen) => {
    setActiveScreen(screen);
    if (screen !== 'scale') {
      setActiveScaleId(null);
    }
  }, []);

  const openScale = useCallback((id: string) => {
    setActiveScaleId(id);
    setActiveScreen('scale');
  }, []);

  // onMarkDirty es un no-op intencional: ScaleLayout gestiona el estado "dirty"
  // (formulario tocado) localmente para mostrar el confirm de salida.
  // Se mantiene en el contrato público para no romper los 31 scales que lo pasan.
  const markDirty = useCallback(() => {}, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      saveFavorites(next);
      return next;
    });
  }, []);

  // saveResult: guarda el resultado en recientes y abre el modal.
  // No fuerza navegación — el usuario decide cuándo volver al inicio.
  const saveResult = useCallback((result: ScaleResult) => {
    setRecents((prev) => {
      const next = addRecent({ ...result, timestamp: Date.now() }, prev);
      saveRecents(next);
      return next;
    });
    setPendingResult(result);
  }, []);

  // afterResultClose: cerrar modal + volver al inicio.
  const afterResultClose = useCallback(() => {
    setPendingResult(null);
    setActiveScreen('home');
    setActiveScaleId(null);
  }, []);

  const clearPendingResult = useCallback(() => {
    setPendingResult(null);
  }, []);

  const removeRecent = useCallback((timestamp: number) => {
    setRecents((prev) => {
      const next = prev.filter((r) => r.timestamp !== timestamp);
      saveRecents(next);
      return next;
    });
  }, []);

  const clearRecents = useCallback(() => {
    setRecents([]);
    saveRecents([]);
  }, []);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
    saveFavorites([]);
  }, []);

  const toggleAutoClearRecents = useCallback((value: boolean) => {
    setAutoClearRecents(value);
    saveAutoClearRecents(value);
  }, []);

  // Borrar recientes automáticamente al cerrar la app si la preferencia está activa.
  // pagehide es más fiable que beforeunload en iOS PWA standalone.
  useEffect(() => {
    if (!autoClearRecents) return;

    const clearOnHide = () => {
      // Solo si la página se está descargando (no solo backgrounding)
      if (document.visibilityState === 'hidden') {
        try {
          localStorage.removeItem('psicogeri_recents');
        } catch {
          // Silencioso
        }
      }
    };

    const onPageHide = (e: PageTransitionEvent) => {
      if (e.persisted) return; // bfcache, no cerrar
      try {
        localStorage.removeItem('psicogeri_recents');
      } catch {
        /* noop */
      }
    };

    document.addEventListener('visibilitychange', clearOnHide);
    window.addEventListener('pagehide', onPageHide);

    return () => {
      document.removeEventListener('visibilitychange', clearOnHide);
      window.removeEventListener('pagehide', onPageHide);
    };
  }, [autoClearRecents]);

  return {
    activeScreen,
    activeScaleId,
    favorites,
    recents,
    pendingResult,
    autoClearRecents,
    navigateTo,
    openScale,
    markDirty,
    toggleFavorite,
    saveResult,
    afterResultClose,
    clearPendingResult,
    clearRecents,
    clearFavorites,
    removeRecent,
    toggleAutoClearRecents,
  };
}
