import { Home, Star, Settings } from 'lucide-react';
import type { ActiveScreen } from '../types';

interface Props {
  active: ActiveScreen;
  onChange: (screen: ActiveScreen) => void;
}

const NAV_ITEMS = [
  { id: 'home' as const, label: 'Inicio', Icon: Home },
  { id: 'favorites' as const, label: 'Favoritas', Icon: Star },
  { id: 'settings' as const, label: 'Ajustes', Icon: Settings },
];

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-slate-100 safe-bottom">
      <div className="flex">
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-colors
              ${active === id ? 'text-clinical-600' : 'text-slate-400 active:text-slate-600'}`}
          >
            <Icon className={`w-5 h-5 ${active === id ? 'fill-clinical-100' : ''}`} />
            <span className={`text-[10px] font-semibold ${active === id ? 'text-clinical-600' : ''}`}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
