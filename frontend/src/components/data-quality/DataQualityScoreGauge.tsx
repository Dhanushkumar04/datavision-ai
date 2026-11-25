import React from 'react';
import { AlertCircle, AlertTriangle, Info, ChevronDown } from 'lucide-react';
import { QualityAuditResult } from '../../types/quality';

interface DataQualityScoreGaugeProps {
  audit: QualityAuditResult;
  showDeductions?: boolean;
}

export const DataQualityScoreGauge: React.FC<DataQualityScoreGaugeProps> = ({
  audit,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 90) return { text: 'text-emerald-600 dark:text-emerald-400', stroke: 'stroke-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800' };
    if (score >= 75) return { text: 'text-blue-600 dark:text-blue-400', stroke: 'stroke-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800' };
    if (score >= 50) return { text: 'text-amber-600 dark:text-amber-400', stroke: 'stroke-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800' };
    return { text: 'text-red-600 dark:text-red-400', stroke: 'stroke-red-500', bg: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800' };
  };

  const color = getScoreColor(audit.score);
  const circumference = 2 * Math.PI * 45; // radius 45
  const strokeDashoffset = circumference - (audit.score / 100) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        {/* Left: Radial Score Gauge */}
        <div className="flex items-center space-x-5">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="8"
                fill="none"
              />
              {/* Animated Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                className={`${color.stroke} transition-all duration-1000 ease-out`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-extrabold ${color.text} tracking-tight`}>
                {audit.score}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                out of 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${color.bg} ${color.text}`}>
                {audit.scoreGrade} Quality
              </span>
              <span className="text-xs text-slate-400">
                • {audit.totalIssues} Issue{audit.totalIssues === 1 ? '' : 's'} Detected
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
              Data Quality Health Index
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-0.5">
              Calculated using transparent rules: penalizes duplicates, missing values, corrupted formats, and outliers.
            </p>
          </div>
        </div>

        {/* Right: Severity Breakdown Chips */}
        <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto">
          <div className="flex-1 sm:flex-none flex items-center justify-between px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs font-semibold text-red-700 dark:text-red-300">
            <span className="flex items-center">
              <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-red-600" />
              Critical
            </span>
            <span className="ml-3 font-mono">{audit.criticalCount}</span>
          </div>

          <div className="flex-1 sm:flex-none flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs font-semibold text-amber-700 dark:text-amber-300">
            <span className="flex items-center">
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
              Warnings
            </span>
            <span className="ml-3 font-mono">{audit.warningCount}</span>
          </div>

          <div className="flex-1 sm:flex-none flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs font-semibold text-blue-700 dark:text-blue-300">
            <span className="flex items-center">
              <Info className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
              Informational
            </span>
            <span className="ml-3 font-mono">{audit.infoCount}</span>
          </div>
        </div>
      </div>

      {/* Deduction breakdown expandable */}
      {audit.deductions.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center justify-between w-full text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
          >
            <span>View Rule-Based Deduction Details ({audit.deductions.length})</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {expanded && (
            <div className="mt-3 space-y-1.5 divide-y divide-slate-100 dark:divide-slate-800/60 max-h-48 overflow-y-auto">
              {audit.deductions.map((ded, i) => (
                <div key={i} className="pt-1.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{ded.rule}</span>
                    <span className="text-[11px] text-slate-400 ml-2">({ded.reason})</span>
                  </div>
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">
                    -{ded.pointsDeducted} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
