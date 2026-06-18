import { useEffect, useState } from 'react';

// Detecta cuando el service worker tiene una versión nueva lista para activar.
// Devuelve { needsUpdate, applyUpdate }
export function useUpdateNotifier() {
  const [needsUpdate, setNeedsUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const checkRegistration = async () => {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) return;

      // Si ya hay un worker en espera al montar
      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setNeedsUpdate(true);
      }

      // Escuchar futuros workers en espera
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setNeedsUpdate(true);
          }
        });
      });
    };

    checkRegistration();

    // Escuchar mensaje de controllerchange para recargar cuando el SW se active
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }, []);

  const applyUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return { needsUpdate, applyUpdate };
}
