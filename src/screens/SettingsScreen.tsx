import { useState } from 'react';
import { Trash2, Info, CheckCheck, ChevronDown, ChevronUp, Shield } from 'lucide-react';
import { CHANGELOG, APP_VERSION } from '../changelog';

interface Props {
  onClearRecents: () => void;
  onClearFavorites: () => void;
  autoClearRecents: boolean;
  onToggleAutoClearRecents: (value: boolean) => void;
}

function IOSSteps() {
  return (
    <div className="space-y-3 mt-3">
      {[
        {
          n: '1',
          text: 'Abre esta página en Safari',
          note: 'Debe ser Safari — Chrome en iOS no permite instalar PWA',
        },
        {
          n: '2',
          text: 'Pulsa el botón Compartir',
          note: 'El icono de cuadrado con flecha hacia arriba, en la barra inferior',
        },
        { n: '3', text: 'Selecciona «Añadir a inicio»', note: 'Desplázate en el menú hasta encontrarlo' },
        { n: '4', text: 'Confirma pulsando «Añadir»', note: 'La app aparecerá en tu pantalla de inicio' },
      ].map((step) => (
        <div key={step.n} className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-clinical-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {step.n}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-800">{step.text}</div>
            <div className="text-xs text-slate-500 leading-relaxed mt-0.5">{step.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function AndroidSteps() {
  return (
    <div className="space-y-3 mt-3">
      {[
        { n: '1', text: 'Abre esta página en Chrome', note: 'También funciona en Edge y Samsung Internet' },
        { n: '2', text: 'Pulsa el menú ⋮ (tres puntos)', note: 'Esquina superior derecha del navegador' },
        {
          n: '3',
          text: 'Selecciona «Añadir a pantalla de inicio»',
          note: 'O «Instalar app» si aparece el banner automático',
        },
        { n: '4', text: 'Confirma pulsando «Añadir»', note: 'La app se instala como acceso directo' },
      ].map((step) => (
        <div key={step.n} className="flex gap-3">
          <div className="w-6 h-6 rounded-full bg-clinical-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
            {step.n}
          </div>
          <div>
            <div className="text-sm font-medium text-slate-800">{step.text}</div>
            <div className="text-xs text-slate-500 leading-relaxed mt-0.5">{step.note}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ChangelogRow({
  entry,
  isCurrent,
}: {
  entry: { version: string; date: string; changes: string[] };
  isCurrent: boolean;
}) {
  const [open, setOpen] = useState(isCurrent);
  return (
    <div>
      <button
        onClick={() => !isCurrent && setOpen((o) => !o)}
        className={`w-full px-4 py-3.5 flex items-center gap-2 text-left ${isCurrent ? 'cursor-default' : 'active:bg-slate-50'}`}
      >
        <span className="text-sm font-bold text-clinical-600">v{entry.version}</span>
        <span className="text-xs text-slate-400">{entry.date}</span>
        {isCurrent && (
          <span className="text-[10px] font-bold bg-clinical-600 text-white rounded px-1.5 py-0.5">
            ACTUAL
          </span>
        )}
        {!isCurrent && (
          <span className="ml-auto text-slate-300">
            {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        )}
      </button>
      {open && (
        <ul className="list-disc pl-8 pr-4 pb-3.5 space-y-0.5">
          {entry.changes.map((c, j) => (
            <li key={j} className="text-xs text-slate-600 leading-relaxed">
              {c}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function SettingsScreen({
  onClearRecents,
  onClearFavorites,
  autoClearRecents,
  onToggleAutoClearRecents,
}: Props) {
  const [clearedRecents, setClearedRecents] = useState(false);
  const [clearedFavorites, setClearedFavorites] = useState(false);
  const [installOpen, setInstallOpen] = useState<'ios' | 'android' | null>(null);

  const handleClearRecents = () => {
    onClearRecents();
    setClearedRecents(true);
    setTimeout(() => setClearedRecents(false), 2000);
  };
  const handleClearFavorites = () => {
    onClearFavorites();
    setClearedFavorites(true);
    setTimeout(() => setClearedFavorites(false), 2000);
  };

  // ── MOBILE ──
  return (
    <div className="pb-24 px-4 max-w-2xl">
      <div className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Ajustes</h1>
      </div>
      <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-100 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src="/logo-settings.png"
            alt="NeuroGeri Calc"
            className="w-12 h-12 rounded-xl object-contain flex-shrink-0"
          />
          <div>
            <div className="font-bold text-clinical-600 text-base">NeuroGeri Calc</div>
            <div className="text-xs text-accent-500 font-semibold">Escalas clínicas psicogeriatría</div>
            <div className="text-xs text-slate-400 mt-0.5">v{APP_VERSION}</div>
          </div>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Herramienta de cálculo de escalas clínicas para uso en psicogeriatría. Los datos se almacenan
          exclusivamente en el dispositivo local.
        </p>
      </div>
      <div className="bg-clinical-50 border border-clinical-200 rounded-2xl p-4 flex gap-3 mb-4">
        <Shield className="w-4 h-4 text-clinical-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-clinical-700 mb-1">Uso exclusivo profesional sanitario</p>
          <p className="text-xs text-clinical-600 leading-relaxed">
            Esta aplicación está destinada únicamente a profesionales de la salud cualificados. Los resultados
            no sustituyen el juicio clínico del médico responsable.
          </p>
        </div>
      </div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
        Instalar en el móvil
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden mb-4">
        <button
          onClick={() => setInstallOpen(installOpen === 'ios' ? null : 'ios')}
          className="w-full flex items-center gap-3 px-4 py-4 active:bg-slate-50 border-b border-slate-100"
        >
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-slate-800">iPhone / iPad</div>
            <div className="text-xs text-slate-400">Instalar via Safari</div>
          </div>
          {installOpen === 'ios' ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {installOpen === 'ios' && (
          <div className="px-4 pb-4 pt-2 border-b border-slate-100 bg-slate-50">
            <IOSSteps />
          </div>
        )}
        <button
          onClick={() => setInstallOpen(installOpen === 'android' ? null : 'android')}
          className="w-full flex items-center gap-3 px-4 py-4 active:bg-slate-50"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24C14.9 8.13 13.5 7.75 12 7.75s-2.9.38-4.47 1.16L5.65 5.67c-.19-.28-.54-.37-.83-.22-.3.16-.42.54-.26.85L6.4 9.48C3.93 11.07 2.5 13.62 2.5 16.5h19c0-2.88-1.43-5.43-3.9-7.02zM9 13.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
            </svg>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-semibold text-slate-800">Android</div>
            <div className="text-xs text-slate-400">Instalar via Chrome</div>
          </div>
          {installOpen === 'android' ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        {installOpen === 'android' && (
          <div className="px-4 pb-4 pt-2 bg-slate-50">
            <AndroidSteps />
          </div>
        )}
      </div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
        Privacidad clínica
      </div>
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden mb-4">
        <label className="w-full flex items-center gap-3 px-4 py-4 active:bg-slate-50 cursor-pointer">
          <input
            type="checkbox"
            checked={autoClearRecents}
            onChange={(e) => onToggleAutoClearRecents(e.target.checked)}
            className="w-5 h-5 rounded accent-clinical-600"
          />
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-slate-700">Borrar recientes al cerrar la app</div>
            <div className="text-xs text-slate-400 leading-relaxed mt-0.5">
              Elimina automáticamente el historial de resultados cuando cierras la PWA. Útil en dispositivos
              compartidos o uso hospitalario.
            </div>
          </div>
        </label>
      </div>

      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Datos locales</div>
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden mb-4">
        <button
          onClick={handleClearRecents}
          className="w-full flex items-center gap-3 px-4 py-4 active:bg-slate-50 border-b border-slate-50"
        >
          {clearedRecents ? (
            <CheckCheck className="w-5 h-5 text-emerald-500" />
          ) : (
            <Trash2 className="w-5 h-5 text-slate-400" />
          )}
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-slate-700">Borrar recientes</div>
            <div className="text-xs text-slate-400">Eliminar historial</div>
          </div>
          {clearedRecents && <span className="text-xs text-emerald-500">Hecho</span>}
        </button>
        <button
          onClick={handleClearFavorites}
          className="w-full flex items-center gap-3 px-4 py-4 active:bg-slate-50"
        >
          {clearedFavorites ? (
            <CheckCheck className="w-5 h-5 text-emerald-500" />
          ) : (
            <Trash2 className="w-5 h-5 text-slate-400" />
          )}
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-slate-700">Borrar favoritas</div>
            <div className="text-xs text-slate-400">Eliminar todas las marcadas</div>
          </div>
          {clearedFavorites && <span className="text-xs text-emerald-500">Hecho</span>}
        </button>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 mb-5">
        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          Ningún dato clínico se almacena en servidores externos. Todo el historial reside en el dispositivo
          local.
        </p>
      </div>
      <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Novedades</div>
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden mb-5">
        {CHANGELOG.map((entry, i) => (
          <div key={entry.version} className={i < CHANGELOG.length - 1 ? 'border-b border-slate-100' : ''}>
            <ChangelogRow entry={entry} isCurrent={i === 0} />
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-slate-400 pb-2">
        NeuroGeri Calc · Javier González · {new Date().getFullYear()}
      </p>
    </div>
  );
}
