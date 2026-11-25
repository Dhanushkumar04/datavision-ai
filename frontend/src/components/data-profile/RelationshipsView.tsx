import React from 'react';
import { 
  Key, 
  Calculator, 
  TrendingUp, 
  GitMerge
} from 'lucide-react';
import { ColumnRelationship } from '../../types/dataset';

interface RelationshipsViewProps {
  relationships: ColumnRelationship[];
}

export const RelationshipsView: React.FC<RelationshipsViewProps> = ({ relationships }) => {
  if (relationships.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-slate-400">
        No strong multi-column relationships or formulas detected yet.
      </div>
    );
  }

  const primaryKeys = relationships.filter(r => r.type === 'primary_key');
  const formulas = relationships.filter(r => r.type === 'arithmetic');
  const correlations = relationships.filter(r => r.type === 'correlation');
  const hierarchies = relationships.filter(r => r.type === 'hierarchy');

  return (
    <div className="space-y-6">
      {/* Primary Keys */}
      {primaryKeys.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
            <Key className="w-4 h-4 mr-1.5 text-amber-500" />
            Detected Primary Key Candidates
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {primaryKeys.map((pk, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                      {pk.targetColumn}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                      {pk.confidence.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {pk.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Derived Formulas */}
      {formulas.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
            <Calculator className="w-4 h-4 mr-1.5 text-blue-600" />
            Detected Derived Metrics & Formulas
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {formulas.map((f, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-bold text-sm text-blue-700 dark:text-blue-300">
                    {f.formula}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-semibold">
                    {f.confidence}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlations */}
      {correlations.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
            <TrendingUp className="w-4 h-4 mr-1.5 text-indigo-600" />
            Strong Linear Correlations
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {correlations.map((c, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {c.sourceColumns[0]} ↔ {c.targetColumn}
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      r = {c.metricValue}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {c.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hierarchies */}
      {hierarchies.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center">
            <GitMerge className="w-4 h-4 mr-1.5 text-emerald-600" />
            Categorical & Geographic Hierarchies
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hierarchies.map((h, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center flex-shrink-0">
                  <GitMerge className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {h.sourceColumns[0]} → {h.targetColumn}
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {h.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
