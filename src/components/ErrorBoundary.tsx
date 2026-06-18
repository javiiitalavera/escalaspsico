import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  scaleName?: string;
  onBack?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary que captura errores en tiempo de ejecución dentro de una escala
 * clínica. Evita que la app entera muera si un cálculo o un render falla.
 *
 * No captura errores en event handlers (intencional); solo captura errores de
 * render y de lifecycle. Para errores de handlers, usar try/catch explícito.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Silencioso: no hay telemetría configurada (offline-first, privacidad).
    // Si en el futuro se añade, este es el punto de extensión.
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    // Forzar recarga del SW cache
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleBack = () => {
    this.setState({ hasError: false, error: null });
    this.props.onBack?.();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const scaleName = this.props.scaleName ?? 'la escala';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10 bg-surface">
        <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-card border border-slate-100 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">No se pudo cargar {scaleName}</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-5">
            Se ha producido un error inesperado al cargar la escala. Puedes volver al inicio e intentarlo de
            nuevo. Si el error persiste, considera actualizar la app desde Ajustes.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <details className="text-left bg-slate-50 rounded-xl p-3 mb-4 text-xs">
              <summary className="cursor-pointer text-slate-600 font-semibold">
                Detalle técnico (solo dev)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap break-all text-slate-500">
                {this.state.error.message}
                {this.state.error.stack ? `\n\n${this.state.error.stack}` : ''}
              </pre>
            </details>
          )}

          <div className="flex gap-2">
            {this.props.onBack && (
              <button
                onClick={this.handleBack}
                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold active:bg-slate-50"
              >
                <Home className="w-4 h-4" />
                Inicio
              </button>
            )}
            <button
              onClick={this.handleReload}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl bg-clinical-600 text-white text-sm font-semibold active:bg-clinical-700"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }
}
