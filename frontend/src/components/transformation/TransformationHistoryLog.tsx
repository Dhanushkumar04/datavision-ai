import React from 'react';
import { RotateCcw, History, Trash2 } from 'lucide-react';
import { TransformationRecord } from '../../types/quality';

interface TransformationHistoryLogProps {
  history: TransformationRecord[];
  onUndo: () => void;
  canUndo: boolean;
  onReset: () => void;
}

export const TransformationHistoryLog: React.FC<TransformationHistoryLogProps> = ({
  history,
  onUndo,
  canUndo,
  onReset,
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-100">
          <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="font-bold text-sm">Transformation Audit History ({history.length})</h4>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`flex items-center px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              canUndo
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                : 'text-slate-300 dark:text-slate-700 cursor-not-allowed'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Undo Last
          </button>

          <button
            onClick={() => {
              if (window.confirm('Revert all transformations and return to pristine uploaded dataset?')) {
                onReset();
              }
            }}
            className="flex items-center px-3 py-1 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            Revert to Original
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {history.map((rec) => (
          <div key={rec.id} className="pt-2 flex items-start justify-between text-xs">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {rec.actionLabel}
                </span>
                {rec.columnAffected && (
                  <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {rec.columnAffected}
                  </span>
                )}
                <span className="text-[10px] text-slate-400">{rec.timestamp}</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                {rec.summary}
              </p>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex-shrink-0">
              {rec.rowsAffected} rows
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
