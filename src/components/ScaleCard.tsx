import { Star, Clock, ChevronRight } from 'lucide-react';
import type { ScaleDefinition } from '../types';

const CATEGORY_COLORS: Record<string, string> = {
  Cognición: 'bg-accent-50 text-accent-500',
  'Ánimo y conducta': 'bg-violet-50 text-violet-700',
  'Fragilidad y supervivencia': 'bg-rose-50 text-rose-700',
  Función: 'bg-teal-50 text-teal-700',
  Movilidad: 'bg-amber-50 text-amber-700',
  Enfermería: 'bg-cyan-50 text-cyan-700',
  Cuidador: 'bg-orange-50 text-orange-700',
};

interface Props {
  scale: ScaleDefinition;
  isFavorite: boolean;
  onPress: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export function ScaleCard({ scale, isFavorite, onPress, onToggleFavorite }: Props) {
  return (
    <button
      onClick={onPress}
      className="w-full text-left bg-white rounded-2xl p-4 shadow-card active:shadow-none active:scale-[0.99] transition-all border border-slate-100"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-base font-bold text-slate-900">{scale.shortName}</span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[scale.category] || 'bg-slate-100 text-slate-600'}`}
            >
              {scale.category}
            </span>
          </div>
          <div className="text-xs text-slate-500 leading-tight mb-2">{scale.description}</div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {scale.timeEstimate}
            </span>
            {Number(scale.maxScore) > 0 && <span>Máx. {scale.maxScore} pts</span>}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onToggleFavorite}
            aria-label={
              isFavorite ? `Quitar ${scale.shortName} de favoritas` : `Añadir ${scale.shortName} a favoritas`
            }
            aria-pressed={isFavorite}
            className="p-2 rounded-xl active:bg-slate-100"
          >
            <Star
              className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
            />
          </button>
          <ChevronRight className="w-4 h-4 text-slate-300" aria-hidden="true" />
        </div>
      </div>
    </button>
  );
}
