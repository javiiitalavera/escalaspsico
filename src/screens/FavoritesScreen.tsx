import { Star } from 'lucide-react';
import { SCALES } from '../scales/registry';
import { ScaleCard } from '../components/ScaleCard';

interface Props {
  favorites: string[];
  onSelectScale: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function FavoritesScreen({ favorites, onSelectScale, onToggleFavorite }: Props) {
  const favoriteScales = SCALES.filter((s) => favorites.includes(s.id));

  // Mobile
  return (
    <div className="pb-24 px-4">
      <div className="pt-6 pb-4">
        <h1 className="text-2xl font-bold text-slate-900">Favoritas</h1>
        <p className="text-sm text-slate-500 mt-1">{favoriteScales.length} escalas guardadas</p>
      </div>
      {favoriteScales.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
            <Star className="w-8 h-8 text-amber-300" />
          </div>
          <div className="text-center">
            <div className="font-semibold text-slate-700 mb-1">Sin favoritas</div>
            <div className="text-sm text-slate-400">
              Pulsa la estrella en cualquier escala para guardarla aquí
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {favoriteScales.map((scale) => (
            <ScaleCard
              key={scale.id}
              scale={scale}
              isFavorite
              onPress={() => onSelectScale(scale.id)}
              onToggleFavorite={(e) => {
                e.stopPropagation();
                onToggleFavorite(scale.id);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
