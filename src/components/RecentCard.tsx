import { Trash2, Clock } from 'lucide-react';
import type { ScaleResult } from '../types';
import { formatDate, getSeverityColor, getSeverityDot } from '../utils';

interface Props {
  result: ScaleResult;
  onPress: () => void;
  onDelete: () => void;
}

export function RecentCard({ result, onPress, onDelete }: Props) {
  return (
    <div className="flex items-stretch gap-2">
      <button
        onClick={onPress}
        className="flex-1 text-left bg-white rounded-2xl p-4 shadow-card active:shadow-none border border-slate-100 min-w-0"
      >
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getSeverityDot(result.severity)}`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-bold text-slate-900 text-sm">{result.scaleName}</span>
              <span className="font-mono text-sm font-semibold text-clinical-700 flex-shrink-0">
                {result.score}
                {result.maxScore !== '' && <span className="text-slate-400 text-xs">/{result.maxScore}</span>}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${getSeverityColor(result.severity)}`}
              >
                {result.interpretation}
              </span>
              <span className="text-[10px] text-slate-400 flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" />
                {formatDate(result.timestamp)}
              </span>
            </div>
          </div>
        </div>
      </button>

      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label={`Eliminar resultado de ${result.scaleName}`}
        className="flex-shrink-0 w-12 bg-white rounded-2xl border border-slate-100 shadow-card flex items-center justify-center active:bg-red-50 active:border-red-200 transition-colors group"
      >
        <Trash2
          className="w-4 h-4 text-slate-300 group-active:text-red-400 transition-colors"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
