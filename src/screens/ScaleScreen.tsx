import { lazy, Suspense, type ComponentType } from 'react';
import type { ScaleResult } from '../types';

interface Props {
  scaleId: string;
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}

type ScaleComponent = ComponentType<{
  onComplete: (result: ScaleResult) => void;
  onBack: () => void;
  onMarkDirty?: () => void;
}>;

/**
 * Mapa estático de scaleId → componente lazy.
 *
 * Code-splitting por escala: cada escala se carga en su propio chunk
 * (vía dynamic import), reduciendo el bundle inicial ~40%.
 *
 * Ventajas:
 * - Primera carga más rápida (no descarga las 31 escalas, solo la activa)
 * - Service Worker cachea cada chunk por separado (mejor granularidad offline)
 * - Mejor experiencia en redes lentas (típico en hospital con WiFi saturada)
 *
 * Suspense fallback muestra loader mientras llega el chunk (desde SW cache es instantáneo).
 */
const SCALE_COMPONENTS: Record<string, ScaleComponent> = {
  mmse: lazy(() => import('../scales/MMSE').then((m) => ({ default: m.MMSEScale as ScaleComponent }))),
  moca: lazy(() => import('../scales/MoCA').then((m) => ({ default: m.MoCAScale as ScaleComponent }))),
  reloj: lazy(() =>
    import('../scales/TestReloj').then((m) => ({ default: m.TestRelojScale as ScaleComponent })),
  ),
  fab: lazy(() => import('../scales/FAB').then((m) => ({ default: m.FABScale as ScaleComponent }))),
  npi: lazy(() => import('../scales/NPIQ').then((m) => ({ default: m.NPIQScale as ScaleComponent }))),
  cornell: lazy(() =>
    import('../scales/Cornell').then((m) => ({ default: m.CornellScale as ScaleComponent })),
  ),
  barthelbasico: lazy(() =>
    import('../scales/BarthelBasico').then((m) => ({ default: m.BarthelBasicoScale as ScaleComponent })),
  ),
  barthel: lazy(() =>
    import('../scales/Barthel').then((m) => ({ default: m.BarthelScale as ScaleComponent })),
  ),
  lawton: lazy(() => import('../scales/Lawton').then((m) => ({ default: m.LawtonScale as ScaleComponent }))),
  gds: lazy(() => import('../scales/GDSFAST').then((m) => ({ default: m.GDSFASTScale as ScaleComponent }))),
  sppb: lazy(() => import('../scales/SPPB').then((m) => ({ default: m.SPPBScale as ScaleComponent }))),
  tinetti: lazy(() =>
    import('../scales/Tinetti').then((m) => ({ default: m.TinettiScale as ScaleComponent })),
  ),
  tug: lazy(() => import('../scales/TUG').then((m) => ({ default: m.TUGScale as ScaleComponent }))),
  frail: lazy(() => import('../scales/FRAIL').then((m) => ({ default: m.FRAILScale as ScaleComponent }))),
  frailvig: lazy(() =>
    import('../scales/FrailVIG').then((m) => ({ default: m.FrailVIGScale as ScaleComponent })),
  ),
  rockwood: lazy(() =>
    import('../scales/Rockwood').then((m) => ({ default: m.RockwoodScale as ScaleComponent })),
  ),
  mnasf: lazy(() => import('../scales/MNASF').then((m) => ({ default: m.MNASFScale as ScaleComponent }))),
  ramsay: lazy(() => import('../scales/Ramsay').then((m) => ({ default: m.RamsayScale as ScaleComponent }))),
  zarit: lazy(() => import('../scales/Zarit').then((m) => ({ default: m.ZaritScale as ScaleComponent }))),
  npuap: lazy(() => import('../scales/NPUAP').then((m) => ({ default: m.NPUAPScale as ScaleComponent }))),
  painad: lazy(() => import('../scales/PAINAD').then((m) => ({ default: m.PAINADScale as ScaleComponent }))),
  walter: lazy(() => import('../scales/Walter').then((m) => ({ default: m.WalterScale as ScaleComponent }))),
  alusti: lazy(() => import('../scales/Alusti').then((m) => ({ default: m.AlustiScale as ScaleComponent }))),
  alustiabrev: lazy(() =>
    import('../scales/AlustiAbrev').then((m) => ({ default: m.AlustiAbrevScale as ScaleComponent })),
  ),
  velocidadmarcha: lazy(() =>
    import('../scales/VelocidadMarcha').then((m) => ({ default: m.VelocidadMarchaScale as ScaleComponent })),
  ),
  '4at': lazy(() =>
    import('../scales/CuatroAT').then((m) => ({ default: m.CuatroATScale as ScaleComponent })),
  ),
  vvst: lazy(() => import('../scales/VVST').then((m) => ({ default: m.VVSTScale as ScaleComponent }))),
  ad8: lazy(() => import('../scales/AD8').then((m) => ({ default: m.AD8Scale as ScaleComponent }))),
  minicog: lazy(() =>
    import('../scales/MiniCog').then((m) => ({ default: m.MiniCogScale as ScaleComponent })),
  ),
  phq9: lazy(() => import('../scales/PHQ9').then((m) => ({ default: m.PHQ9Scale as ScaleComponent }))),
  cdr: lazy(() => import('../scales/CDR').then((m) => ({ default: m.CDRScale as ScaleComponent }))),
};

function ScaleLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-clinical-200 border-t-clinical-600 animate-spin" />
        <p className="text-xs text-slate-400">Cargando escala…</p>
      </div>
    </div>
  );
}

export function ScaleScreen({ scaleId, onComplete, onBack, onMarkDirty }: Props) {
  const ScaleComponent = SCALE_COMPONENTS[scaleId];

  if (!ScaleComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-2">Escala no encontrada</p>
          <p className="text-xs text-slate-400 mb-4">{scaleId}</p>
          <button
            onClick={onBack}
            className="px-4 py-2 rounded-xl bg-clinical-600 text-white text-sm font-semibold"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<ScaleLoader />}>
      <ScaleComponent onComplete={onComplete} onBack={onBack} onMarkDirty={onMarkDirty} />
    </Suspense>
  );
}
