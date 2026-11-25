import React, { useState } from 'react';
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Wand2 
} from 'lucide-react';
import { QualityIssue, TransformationActionType } from '../../types/quality';

interface QualityIssueCardProps {
  issue: QualityIssue;
  onApplyAction: (issueId: string, action: TransformationActionType, params?: any) => void;
  isLoading?: boolean;
}

export const QualityIssueCard: React.FC<QualityIssueCardProps> = ({
  issue,
  onApplyAction,
  isLoading,
}) => {
  const [selectedAction, setSelectedAction] = useState<TransformationActionType>(issue.selectedAction);
  const [customValue, setCustomValue] = useState<string>(issue.actionParams?.customFillValue || '');
  const [casingStyle, setCasingStyle] = useState<'Title Case' | 'UPPERCASE' | 'lowercase'>('Title Case');

  const getSeverityBadge = () => {
    switch (issue.severity) {
      case 'critical':
        return {
          icon: AlertCircle,
          label: 'Critical',
          classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-300 dark:border-red-900/60',
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          label: 'Warning',
          classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/60',
        };
      case 'info':
      default:
        return {
          icon: Info,
          label: 'Info',
          classes: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-900/60',
        };
    }
  };

  const severity = getSeverityBadge();
  const Icon = severity.icon;

  const handleApply = () => {
    onApplyAction(issue.id, selectedAction, {
      customFillValue: customValue,
      casingStyle,
      outlierBounds: issue.actionParams?.outlierBounds,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className={`p-1.5 rounded-lg border ${severity.classes}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                {issue.name}
              </h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${severity.classes}`}>
                {severity.label}
              </span>
            </div>
            {issue.affectedColumn && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Column: <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">{issue.affectedColumn}</span>
              </span>
            )}
          </div>
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          <span className="text-slate-900 dark:text-white font-bold">{issue.affectedRowCount}</span> records affected ({issue.affectedPercentage}%)
        </div>
      </div>

      {/* Description & Sample Problem Values */}
      <div className="space-y-2">
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {issue.recommendedSolution}
        </p>

        {issue.sampleProblemValues.length > 0 && (
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold">Sample values:</span>
            <div className="flex flex-wrap gap-1">
              {issue.sampleProblemValues.slice(0, 4).map((v, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  {String(v)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Selector & Transform Execution Controls */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
            Transformation:
          </label>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value as TransformationActionType)}
            className="w-full sm:w-auto text-xs font-semibold px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {issue.supportedActions.map((act) => (
              <option key={act.action} value={act.action}>
                {act.label}
              </option>
            ))}
          </select>

          {/* Conditional Input for Custom Value */}
          {selectedAction === 'fill_missing_value' && (
            <input
              type="text"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Fill value..."
              className="text-xs px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white w-28"
            />
          )}

          {/* Conditional Selector for Casing */}
          {selectedAction === 'normalize_capitalization' && (
            <select
              value={casingStyle}
              onChange={(e) => setCasingStyle(e.target.value as any)}
              className="text-xs px-2 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            >
              <option value="Title Case">Title Case</option>
              <option value="UPPERCASE">UPPERCASE</option>
              <option value="lowercase">lowercase</option>
            </select>
          )}
        </div>

        <button
          onClick={handleApply}
          disabled={selectedAction === 'leave_unchanged' || isLoading}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center flex-shrink-0 ${
            selectedAction === 'leave_unchanged'
              ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20'
          }`}
        >
          <Wand2 className="w-3.5 h-3.5 mr-1.5" />
          Apply Fix
        </button>
      </div>
    </div>
  );
};
