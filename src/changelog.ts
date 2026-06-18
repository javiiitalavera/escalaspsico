// ─────────────────────────────────────────────────────────
//  CHANGELOG — editar manualmente con cada nueva versión
//  Formato: versión semántica + fecha + lista de cambios
// ─────────────────────────────────────────────────────────

export const APP_VERSION = '1.3.2';

export interface ChangelogEntry {
  version: string;
  date: string;       // dd/mm/yyyy
  changes: string[];
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '1.3.2',
    date: '21/05/2025',
    changes: [
      'Nueva escala: AD8 — cribado de demencia por informante (Galvin et al. 2005)',
      'Nueva escala: Mini-Cog — cribado cognitivo breve (Borson et al. 2000)',
      'Nueva escala: CDR-SB — estadiaje global de demencia, Sum of Boxes (Morris 1993)',
      'Nueva escala: PHQ-9 — cribado y gravedad de depresión (Kroenke & Spitzer 2002)',
      'Categorías en pantalla de inicio ahora colapsables — por defecto cerradas',
    ],
  },
  {
    version: '1.3.1',
    date: '24/03/2025',
    changes: [
      'Nueva escala: 4AT — cribado rápido de delirium (Bellelli et al. 2014)',
      'Nueva escala: V-VST — test volumen-viscosidad para valoración de disfagia (Clavé et al. 2008)',
      'Corregido zoom involuntario en iOS al introducir tiempo en TUG, V6M y SpO₂ en V-VST',
    ],
  },
  {
    version: '1.3.0',
    date: '20/03/2025',
    changes: [
      'Nuevas escalas: Alusti completo, Alusti abreviado, Barthel básico',
      'Barra de progreso añadida en: MoCA, Barthel, Barthel-Shah, FRAIL-VIG, Lawton, PAINAD, MNA-SF, Alusti, Alusti abreviado',
      'NPI-Q: corregido cálculo prematuro — ahora muestra "Sin completar" hasta responder todos los dominios',
      'MNA-SF: corregida errata en etiqueta del ítem F (aparecía como F1)',
      'MoCA: imágenes de animales movidas a /public/ (bundle -150KB gzipped)',
      'Auditoría de código: eliminado dead code desktop en HomeScreen y FavoritesScreen',
      'PWA: corregido theme-color y nombre de app en iOS',
    ],
  },
  {
    version: '1.2.0',
    date: '16/03/2025',
    changes: [
      'MoCA: visuoespacial desglosado en 5 subítems (sendero, cubo, reloj)',
      'MoCA: corregida atención series de números (máximo 2 puntos)',
      'Alusti / Alusti Abreviado: ítems 1 y 2 ahora puntúan las 4 extremidades por separado',
      'Alusti: tabla compacta para extremidades (diseño grilla)',
      'Walter: maxScore corregido a 18',
      'Detección automática de actualizaciones con banner de aviso',
    ],
  },
  {
    version: '1.1.0',
    date: '10/03/2025',
    changes: [
      'Swipe derecho para volver al menú desde cualquier escala',
      'Barra de progreso en escalas largas (Zarit, Tinetti, NPI-Q, FAB, Cornell, Walter)',
      'Confirmación de salida solo si se ha modificado algo',
      'Scroll automático al inicio al abrir una escala',
    ],
  },
  {
    version: '1.0.0',
    date: '01/03/2025',
    changes: [
      'Versión inicial con 25 escalas psicogeriatría',
      'PWA instalable en iOS y Android',
      'Favoritos y historial de recientes',
      'Copiar informe al portapapeles',
    ],
  },
];
