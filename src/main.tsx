import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Fuentes self-hosted vía @fontsource (no Google Fonts).
// Razones: offline-first real (PWA), privacidad clínica (no se expone IP a Google),
// y consistencia de rendering sin FOUT en redes lentas.
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

import './styles/globals.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
