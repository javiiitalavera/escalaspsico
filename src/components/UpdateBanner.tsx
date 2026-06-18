import { RefreshCw } from 'lucide-react';

interface Props {
  onUpdate: () => void;
}

/**
 * Banner discreto en la parte superior de la app cuando hay actualización
 * del Service Worker disponible. No bloquea la UI.
 */
export function UpdateBanner({ onUpdate }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-[9999] bg-clinical-600 flex items-center justify-between px-4 py-2.5 gap-3 shadow-[0_2px_8px_rgba(58,122,191,0.4)]"
    >
      <div className="flex items-center gap-2">
        <RefreshCw size={14} className="text-white/90" aria-hidden="true" />
        <span className="text-[13px] font-semibold text-white">Nueva versión disponible</span>
      </div>
      <button
        onClick={onUpdate}
        className="bg-white text-clinical-600 border-none rounded-lg px-3.5 py-1.5 text-xs font-bold active:bg-clinical-50"
      >
        Actualizar
      </button>
    </div>
  );
}
