import React from 'react';
import { ArrowRight, Eye } from 'lucide-react';
import { TransformationRecord } from '../../types/quality';

interface TransformationDiffPreviewProps {
  latestRecord?: TransformationRecord;
}

export const TransformationDiffPreview: React.FC<TransformationDiffPreviewProps> = ({
  latestRecord,
}) => {
  if (!latestRecord || latestRecord.diffSample.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 dark:text-slate-200">
          <Eye className="w-4 h-4 text-blue-600" />
          <span>Before & After Transformation Diff Preview</span>
        </div>
        <span className="text-[11px] text-slate-400">
          Latest: {latestRecord.actionLabel}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px]">
            <tr>
              <th className="px-3 py-2">Row #</th>
              <th className="px-3 py-2">Column</th>
              <th className="px-3 py-2">Before Value</th>
              <th className="px-3 py-2"></th>
              <th className="px-3 py-2">After Value</th>
              <th className="px-3 py-2">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {latestRecord.diffSample.map((diff, idx) => (
              <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                <td className="px-3 py-2 font-mono text-slate-500">{diff.rowIndex}</td>
                <td className="px-3 py-2 font-mono font-medium text-slate-800 dark:text-slate-200">{diff.columnName}</td>
                <td className="px-3 py-2 font-mono text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-950/20 line-through">
                  {String(diff.beforeValue)}
                </td>
                <td className="px-2 py-2 text-slate-400 text-center">
                  <ArrowRight className="w-3.5 h-3.5" />
                </td>
                <td className="px-3 py-2 font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20">
                  {String(diff.afterValue)}
                </td>
                <td className="px-3 py-2">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize">
                    {diff.changeType}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
