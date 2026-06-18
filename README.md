# NeuroGeri Calc

> Calculadora móvil de **escalas clínicas psicogeriátricas** para profesionales sanitarios.
> PWA offline-first, instalable en iOS y Android, sin servidor ni telemetría.

[![CI](https://github.com/javiiitalavera/escalaspsico/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](tsconfig.json)
[![PWA](https://img.shields.io/badge/PWA-installable-purple.svg)](public/manifest.webmanifest)

## ⚠️ Descargo de responsabilidad clínica

**Esta aplicación está destinada exclusivamente a profesionales de la salud cualificados.**

- Los resultados calculados **no sustituyen el juicio clínico** del profesional responsable.
- Las puntuaciones de corte y baremos están basados en la literatura científica citada en cada escala, pero **deben validarse contra la fuente original** antes de tomar decisiones clínicas.
- La app **no es un dispositivo médico certificado** (no está marcado CE ni avalado por ninguna agencia reguladora).
- El autor **no se hace responsable** de decisiones clínicas derivadas del uso de esta herramienta.
- Cualquier dato clínico introducido **se almacena exclusivamente en el dispositivo local** del usuario (`localStorage`). El autor no tiene acceso a ellos.

Si detectas un error en un baremo o punto de corte, **abre un issue** indicando la escala, el error observado y la fuente bibliográfica correcta.

## 📋 Escalas incluidas (31)

### Cognición (8)
- **MMSE** — Mini-Mental State Examination (Folstein 1975)
- **MoCA** — Montreal Cognitive Assessment (Nasreddine 2005)
- **Mini-Cog** — Cribado cognitivo breve (Borson 2000)
- **AD8** — Cribado de demencia por informante (Galvin 2005)
- **Test del Reloj** — Cribado visuoespacial
- **FAB** — Frontal Assessment Battery (Dubois 2000)
- **GDS-FAST** — Global Deterioration Scale / Functional Assessment Staging
- **CDR-SB** — Clinical Dementia Rating, Sum of Boxes (Morris 1993)

### Ánimo y conducta (3)
- **NPI-Q** — Neuropsychiatric Inventory-Q (Kaufer 2000)
- **Cornell** — Cornell Scale for Depression in Dementia (Alexopoulos 1988)
- **PHQ-9** — Patient Health Questionnaire-9 (Kroenke & Spitzer 2002)

### Fragilidad y supervivencia (4)
- **FRAIL-VIG** — Índice de fragilidad avanzada (Amblàs-Novellas 2017)
- **FRAIL Scale** — Cribado de fragilidad 5 ítems (Morley 2012)
- **CFS Rockwood** — Clinical Frailty Scale (Rockwood 2005)
- **Walter** — Índice de mortalidad al año post-hospitalización ≥70 años (Walter 2001)

### Función (3)
- **Barthel básico** — Índice de Barthel original (Mahoney 1965)
- **Barthel-Shah** — Barthel modificado 5 niveles (Shah 1989)
- **Lawton-Brody** — Actividades instrumentales (Lawton 1969)

### Movilidad (6)
- **SPPB** — Short Physical Performance Battery (Guralnik 1994)
- **Tinetti** — Equilibrio y marcha (Tinetti 1986)
- **TUG** — Timed Up and Go (Podsiadlo 1991)
- **Alusti completo** — Movilidad funcional 0-100
- **Alusti abreviado** — Versión corta 0-50
- **Velocidad de marcha 6 metros**

### Enfermería (6)
- **MNA-SF** — Mini Nutritional Assessment Short Form (Rubenstein 2001)
- **NPUAP/EPUAP** — Clasificación de úlceras por presión
- **PAINAD** — Dolor en demencia avanzada (Warden 2003)
- **Ramsay** — Nivel de sedación
- **4AT** — Cribado rápido de delirium (Bellelli 2014)
- **V-VST** — Volume-Viscosity Swallow Test (Clavé 2008)

### Cuidador (1)
- **Zarit** — Sobrecarga del cuidador principal (Zarit 1980)

## 🚀 Instalación como app (PWA)

### iPhone / iPad
1. Abre la web en **Safari** (no funciona en Chrome iOS)
2. Pulsa el botón **Compartir** (cuadrado con flecha arriba)
3. Selecciona **"Añadir a pantalla de inicio"**
4. Confirma con **"Añadir"**

### Android
1. Abre la web en **Chrome** (o Edge / Samsung Internet)
2. Pulsa el menú **⋮** (tres puntos, esquina superior derecha)
3. Selecciona **"Instalar aplicación"** o **"Añadir a pantalla de inicio"**
4. Confirma

Una vez instalada, la app funciona **sin conexión a internet** y se comporta como una app nativa (icono, splash, pantalla completa).

## 💻 Desarrollo local

### Requisitos
- Node.js **≥ 18** (recomendado 20+)
- npm 9+ (o pnpm / yarn)

### Setup
```bash
git clone https://github.com/javiiitalavera/escalaspsico.git
cd escalaspsico
npm install
npm run dev      # http://localhost:5173
```

### Scripts disponibles
```bash
npm run dev       # Servidor de desarrollo Vite
npm run build     # tsc (typecheck) + vite build → dist/
npm run preview   # Sirve el build de producción localmente
npm run lint      # ESLint
npm run typecheck # Solo TS check, sin build
npm run test      # Vitest (watch)
npm run test:ci   # Vitest (run once, CI-friendly)
npm run format    # Prettier write
npm run format:check  # Prettier check
```

## 🧪 Tests

Los tests unitarios cubren las funciones puras `getScore`, `interpret` y `buildReport` de cada escala — es la capa más crítica porque un bug aquí puede llevar a un diagnóstico erróneo.

```bash
npm run test:ci   # Ejecuta todos los tests una vez
npm run test      # Modo watch para desarrollo
```

Para añadir tests a una escala nueva, crea `src/scales/__tests__/<ScaleName>.test.ts` y cubre como mínimo:
- Puntuación mínima (todo 0)
- Puntuación máxima (todo al valor óptimo)
- Puntos de corte de cada severidad (normal, mild, moderate, severe)
- Casos límite (valores intermedios, items nulos si aplica)

## 🏗️ Arquitectura

```
src/
├── App.tsx                  # Root: estado global + routing por pantalla
├── main.tsx                 # Entry point
│
├── components/              # Componentes UI reutilizables
│   ├── BottomNav.tsx        # Navegación inferior (Home/Fav/Ajustes)
│   ├── ErrorBoundary.tsx    # Captura errores en scales (UX segura)
│   ├── RecentCard.tsx       # Tarjeta de resultado reciente
│   ├── ResultModal.tsx      # Modal bottom-sheet con informe
│   ├── ScaleCard.tsx        # Tarjeta de escala en listados
│   ├── ScaleLayout.tsx      # Layout común a todas las escalas
│   └── UpdateBanner.tsx     # Banner "nueva versión disponible"
│
├── hooks/
│   ├── useAppState.ts       # Estado central (pantalla, favoritos, recents)
│   └── useUpdateNotifier.ts # Detecta updates del Service Worker
│
├── scales/                  # Una escala por archivo, patrón uniforme
│   ├── registry.ts          # Catálogo de metadatos (id, nombre, categoría)
│   ├── MMSE.tsx             # Cada escala exporta <ScaleName>Scale
│   ├── MoCA.tsx             # y usa ScaleLayout como wrapper
│   └── ...                  # 31 escalas en total
│
├── screens/                 # Pantallas de la app
│   ├── HomeScreen.tsx       # Buscador + categorías colapsables
│   ├── FavoritesScreen.tsx  # Escalas marcadas como favoritas
│   ├── ScaleScreen.tsx      # Dispatcher: scaleId → componente
│   └── SettingsScreen.tsx   # Versión, instalar, borrar datos, changelog
│
├── types/index.ts           # Tipos del dominio (ScaleDefinition, ScaleResult)
├── utils/index.ts           # localStorage helpers, cn(), clipboard, fechas
├── styles/globals.css       # Tailwind base + safe-area iOS
└── changelog.ts             # Versionado manual de releases
```

### Patrón de cada escala

Cada escala sigue el mismo patrón para facilitar mantenimiento y tests:

```tsx
// 1. Tipo Answers tipado
interface Answers { item1: number; item2: number; ... }
const INITIAL: Answers = { item1: 0, item2: 0, ... };

// 2. Función pura getScore
function getScore(a: Answers): number { ... }

// 3. Función pura interpret
function interpret(score: number): { text: string; severity: ScaleResult['severity'] } { ... }

// 4. Función pura buildReport
function buildReport(score: number, interp: string, a: Answers): string { ... }

// 5. Componente que usa ScaleLayout
export function MyScaleScale({ onComplete, onBack, onMarkDirty }: Props) {
  const [a, setA] = useState<Answers>(INITIAL);
  // ... UI
}
```

## 🔒 Privacidad

- **Sin servidor**: la app es 100% client-side. No hay backend, no hay API.
- **Sin telemetría**: no se recopila ningún dato de uso.
- **Sin cookies** ni tracking pixels.
- **Datos locales**: favoritos y últimos 10 resultados se guardan en `localStorage` del navegador/dispositivo. **No se sincronizan con ningún sitio.**
- **Fuentes self-hosted**: DM Sans y JetBrains Mono se sirven desde el propio dominio (no de Google Fonts).
- **PWA offline**: una vez instalada, funciona sin conexión. El Service Worker cachea todos los assets.

Para borrar todos los datos locales: **Ajustes → Borrar recientes + Borrar favoritas**.

## 🤝 Contribuir

Las contribuciones son bienvenidas, especialmente:

- **Correcciones de baremos** con cita bibliográfica
- **Nuevas escalas** siguiendo el patrón descrito arriba
- **Tests** para escalas que no tengan cobertura completa
- **Mejoras de accesibilidad** (aria, contraste, navegación por teclado)
- **Traducciones** de la interfaz

### Flujo
1. Fork → feature branch (`feat/nueva-escala-foo`)
2. `npm run lint && npm run typecheck && npm run test:ci && npm run build` — deben pasar
3. PR con descripción clara y referencias bibliográficas si es una escala nueva

## 📝 Changelog

Ver [changelog.ts](src/changelog.ts) para el historial completo de versiones.

## 📄 Licencia

[MIT](LICENSE) © Javier González

## 🙏 Agradecimientos

A los autores originales de cada escala, cuya validación científica hace posible esta herramienta. Las referencias bibliográficas completas se incluyen en el informe generado por cada escala.
