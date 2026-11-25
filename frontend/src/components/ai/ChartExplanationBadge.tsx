import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, AlertCircle, Lightbulb, BarChart } from 'lucide-react';
import { ChartExplanation } from '../../types/ai';

interface ChartExplanationBadgeProps {
  explanation: ChartExplanation;
}

export const ChartExplanationBadge: React.FC<ChartExplanationBadgeProps> = ({ explanation }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:text-blue-700 transition-colors py-1 cursor-pointer"
      >
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          AI Chart Insight & Takeaways
        </span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="mt-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 space-y-2 text-xs animate-in fade-in">
          {/* Summary */}
          <div className="flex items-start gap-2">
            <BarChart className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            <span className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {explanation.summary}
            </span>
          </div>

          {/* Key Takeaway */}
          <div className="flex items-start gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
            <span className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              <strong>Takeaway:</strong> {explanation.keyTakeaway}
            </span>
          </div>

          {/* Anomaly Alert */}
          {explanation.anomalyAlert && (
            <div className="flex items-start gap-2 text-rose-500 font-medium">
              <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{explanation.anomalyAlert}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
