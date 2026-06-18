import { useState } from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import type { ScaleResult } from '../types';
import { SCALES } from '../scales/registry';
import { ScaleCard } from '../components/ScaleCard';
import { RecentCard } from '../components/RecentCard';
import { ResultModal } from '../components/ResultModal';

const CATEGORIES = [
  'Cognición',
  'Ánimo y conducta',
  'Fragilidad y supervivencia',
  'Función',
  'Movilidad',
  'Enfermería',
  'Cuidador',
] as const;

interface Props {
  favorites: string[];
  recents: ScaleResult[];
  onSelectScale: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteRecent: (timestamp: number) => void;
}

export function HomeScreen({ favorites, recents, onSelectScale, onToggleFavorite, onDeleteRecent }: Props) {
  const [search, setSearch] = useState('');
  const [selectedResult, setSelectedResult] = useState<ScaleResult | null>(null);
  const [openCats, setOpenCats] = useState<Set<string>>(new Set());

  const toggleCat = (cat: string) =>
    setOpenCats((prev) => {
      const s = new Set(prev);
      s.has(cat) ? s.delete(cat) : s.add(cat);
      return s;
    });

  const filtered = SCALES.filter(
    (s) =>
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.shortName.toLowerCase().includes(search.toLowerCase()) ||
      s.category.toLowerCase().includes(search.toLowerCase()),
  );
  const favoriteScales = SCALES.filter((s) => favorites.includes(s.id));

  return (
    <div className="pb-24 px-4 max-w-2xl mx-auto">
      <div className="pt-6 pb-4">
        <div className="flex items-center gap-3 mb-3">
          <img
            src="/pwa-192x192.png"
            alt="NeuroGeri"
            className="w-10 h-10 rounded-xl object-contain bg-white shadow-card border border-slate-100 p-1"
          />
          <div>
            <div className="text-[10px] font-semibold text-accent-500 uppercase tracking-widest leading-none mb-0.5">
              Escalas clínicas psicogeriatría
            </div>
            <h1 className="text-xl font-bold text-clinical-600 leading-none">NeuroGeri Calc</h1>
          </div>
        </div>
      </div>
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar escala..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-9 py-2.5 bg-white rounded-2xl border border-slate-200 text-base focus:outline-none focus:ring-2 focus:ring-clinical-500 shadow-card"
          style={{ fontSize: '16px' }}
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>
      {search ? (
        <div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
            Resultados ({filtered.length})
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filtered.map((scale) => (
              <ScaleCard
                key={scale.id}
                scale={scale}
                isFavorite={favorites.includes(scale.id)}
                onPress={() => onSelectScale(scale.id)}
                onToggleFavorite={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(scale.id);
                }}
              />
            ))}
            {filtered.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                Sin resultados para &ldquo;{search}&rdquo;
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {recents.length > 0 && (
            <section className="mb-6">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Recientes
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {recents.slice(0, 3).map((r, i) => (
                  <RecentCard
                    key={i}
                    result={r}
                    onPress={() => setSelectedResult(r)}
                    onDelete={() => onDeleteRecent(r.timestamp)}
                  />
                ))}
              </div>
            </section>
          )}
          {favoriteScales.length > 0 && (
            <section className="mb-6">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
                Favoritas
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            </section>
          )}
          {CATEGORIES.map((cat) => {
            const catScales = SCALES.filter((s) => s.category === cat);
            const isOpen = openCats.has(cat);
            return (
              <section key={cat} className="mb-2">
                <button
                  onClick={() => toggleCat(cat)}
                  className="w-full flex items-center justify-between py-3 px-1 group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      {cat}
                    </span>
                    <span className="text-[10px] text-slate-300 font-medium">{catScales.length}</span>
                  </div>
                  <ChevronDown
                    className="w-4 h-4 text-slate-300 group-active:text-slate-400 transition-transform duration-200"
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                {isOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                    {catScales.map((scale) => (
                      <ScaleCard
                        key={scale.id}
                        scale={scale}
                        isFavorite={favorites.includes(scale.id)}
                        onPress={() => onSelectScale(scale.id)}
                        onToggleFavorite={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(scale.id);
                        }}
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </>
      )}
      {selectedResult && (
        <ResultModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
          onDismiss={() => setSelectedResult(null)}
        />
      )}
    </div>
  );
}
