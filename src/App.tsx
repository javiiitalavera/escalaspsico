import { useAppState } from './hooks/useAppState';
import { BottomNav } from './components/BottomNav';
import { ResultModal } from './components/ResultModal';
import { HomeScreen } from './screens/HomeScreen';
import { FavoritesScreen } from './screens/FavoritesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { ScaleScreen } from './screens/ScaleScreen';
import { UpdateBanner } from './components/UpdateBanner';
import { useUpdateNotifier } from './hooks/useUpdateNotifier';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SCALE_MAP } from './scales/registry';

export default function App() {
  const { needsUpdate, applyUpdate } = useUpdateNotifier();
  const {
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
  } = useAppState();

  const handleSelectScale = (id: string) => openScale(id);
  const handleNavigate = (screen: typeof activeScreen) => navigateTo(screen);

  return (
    <div className="min-h-screen bg-surface font-sans">
      {needsUpdate && <UpdateBanner onUpdate={applyUpdate} />}

      {activeScreen === 'scale' && activeScaleId ? (
        <ErrorBoundary
          scaleName={SCALE_MAP[activeScaleId]?.shortName ?? activeScaleId}
          onBack={() => handleNavigate('home')}
        >
          <ScaleScreen
            scaleId={activeScaleId}
            onComplete={saveResult}
            onBack={() => handleNavigate('home')}
            onMarkDirty={markDirty}
          />
        </ErrorBoundary>
      ) : (
        <>
          <main className="min-h-screen">
            {activeScreen === 'home' && (
              <HomeScreen
                favorites={favorites}
                recents={recents}
                onSelectScale={handleSelectScale}
                onToggleFavorite={toggleFavorite}
                onDeleteRecent={removeRecent}
              />
            )}
            {activeScreen === 'favorites' && (
              <FavoritesScreen
                favorites={favorites}
                onSelectScale={handleSelectScale}
                onToggleFavorite={toggleFavorite}
              />
            )}
            {activeScreen === 'settings' && (
              <SettingsScreen
                onClearRecents={clearRecents}
                onClearFavorites={clearFavorites}
                autoClearRecents={autoClearRecents}
                onToggleAutoClearRecents={toggleAutoClearRecents}
              />
            )}
          </main>
          <BottomNav active={activeScreen} onChange={handleNavigate} />
        </>
      )}
      {pendingResult && (
        <ResultModal result={pendingResult} onClose={afterResultClose} onDismiss={clearPendingResult} />
      )}
    </div>
  );
}
