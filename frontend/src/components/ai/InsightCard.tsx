import React from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Sparkles, 
  ShieldAlert, 
  FileText, 
  Zap
} from 'lucide-react';
import { BusinessInsight } from '../../types/ai';
import { ThemeConfig } from '../../types/dashboard';

interface InsightCardProps {
  insight: BusinessInsight;
  theme: ThemeConfig;
  onApplyAction?: (insight: BusinessInsight) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight, theme }) => {
  const getCategoryConfig = () => {
    switch (insight.category) {
      case 'trend':
        return {
          icon: TrendingUp,
          label: 'Market Trend',
          badgeClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          accentBorder: 'border-l-blue-500',
        };
      case 'anomaly':
        return {
          icon: AlertTriangle,
          label: 'Data Anomaly',
          badgeClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
          accentBorder: 'border-l-amber-500',
        };
      case 'opportunity':
        return {
          icon: Sparkles,
          label: 'Growth Opportunity',
          badgeClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          accentBorder: 'border-l-emerald-500',
        };
      case 'risk':
        return {
          icon: ShieldAlert,
          label: 'Strategic Risk',
          badgeClass: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
          accentBorder: 'border-l-rose-500',
        };
      default:
        return {
          icon: FileText,
          label: 'Executive Summary',
          badgeClass: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
          accentBorder: 'border-l-purple-500',
        };
    }
  };

  const config = getCategoryConfig();
  const Icon = config.icon;

  return (
    <div 
      className={`rounded-2xl border border-l-4 p-5 transition-all duration-300 hover:shadow-xl flex flex-col justify-between ${theme.cardClass} ${theme.borderClass} ${config.accentBorder} space-y-4`}
    >
      {/* Top Header: Badge and Impact */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
          {insight.metricValue && (
            <span className="text-[11px] font-mono font-bold px-2 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {insight.metricValue}
            </span>
          )}
        </div>

        <span className={`text-[10px] font-bold uppercase tracking-wider font-mono px-2 py-0.5 rounded ${
          insight.impact === 'high' 
            ? 'bg-rose-500/10 text-rose-500' 
            : insight.impact === 'medium'
            ? 'bg-amber-500/10 text-amber-500'
            : 'bg-slate-500/10 text-slate-400'
        }`}>
          {insight.impact} Impact
        </span>
      </div>

      {/* Title & Description */}
      <div className="space-y-1.5">
        <h3 className={`text-base font-bold tracking-tight ${theme.textPrimaryClass}`}>
          {insight.title}
        </h3>
        <p className={`text-xs leading-relaxed ${theme.textSecondaryClass}`}>
          {insight.description}
        </p>
      </div>

      {/* Quantitative Evidence Callout */}
      <div className={`p-3 rounded-xl border text-[11px] font-mono ${
        theme.isDark 
          ? 'bg-slate-800/60 border-slate-700/60 text-slate-200' 
          : 'bg-slate-100 border-slate-200 text-slate-800'
      }`}>
        <span className="text-slate-400 font-bold uppercase block text-[9px] mb-1">Empirical Evidence:</span>
        {insight.evidence}
      </div>

      {/* Strategic Recommendation */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
        <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5 min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans">
            Prescriptive Recommendation:
          </span>
          <p className={`text-xs font-medium leading-relaxed ${theme.textPrimaryClass}`}>
            {insight.recommendation}
          </p>
        </div>
      </div>
    </div>
  );
};
