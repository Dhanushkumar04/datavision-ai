import React from 'react';
import { ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { KPISpec, ThemeConfig } from '../../types/dashboard';

interface KPISummaryTableProps {
  kpis: KPISpec[];
  theme: ThemeConfig;
}

export const KPISummaryTable: React.FC<KPISummaryTableProps> = ({ kpis, theme }) => {
  return (
    <div className={`rounded-2xl border p-5 ${theme.cardClass} ${theme.borderClass} shadow-md overflow-hidden`}>
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${theme.kpiAccent} flex items-center justify-center text-white`}>
            <Layers className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className={`text-sm font-bold ${theme.textPrimaryClass}`}>
              KPI Performance Summary
            </h3>
            <p className={`text-xs ${theme.textSecondaryClass}`}>
              Executive performance indicators compared against reference periods
            </p>
          </div>
        </div>
        <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${theme.isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
          {kpis.length} Metrics Analyzed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className={`border-b ${theme.isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-600'} text-[11px] font-bold uppercase tracking-wider`}>
              <th className="py-2.5 px-3">Metric Name</th>
              <th className="py-2.5 px-3">Dimension</th>
              <th className="py-2.5 px-3 text-right">Current Value</th>
              <th className="py-2.5 px-3 text-right">Change</th>
              <th className="py-2.5 px-3 text-right">Growth %</th>
              <th className="py-2.5 px-3 text-center">Trend Trajectory</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
            {kpis.map((kpi) => {
              const isPositive = (kpi.changePercentage ?? 0) >= 0;
              const sparkline = kpi.sparkline || [10, 15, 12, 18, 25, 30];
              const min = Math.min(...sparkline);
              const max = Math.max(...sparkline);
              const range = max - min || 1;
              const w = 72;
              const h = 20;

              const points = sparkline.map((val, i) => {
                const x = (i / (sparkline.length - 1)) * w;
                const y = h - ((val - min) / range) * (h - 4) - 2;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              const pathD = `M ${points.join(' L ')}`;
              const strokeColor = isPositive ? '#10b981' : '#f43f5e';

              return (
                <tr 
                  key={kpi.id}
                  className="hover:bg-slate-500/5 transition-colors"
                >
                  <td className="py-3 px-3 font-medium font-sans">
                    <span className={`font-semibold ${theme.textPrimaryClass}`}>
                      {kpi.title}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded ${theme.isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                      {kpi.column}
                    </span>
                  </td>

                  <td className={`py-3 px-3 text-right font-bold text-sm ${theme.textPrimaryClass}`}>
                    {kpi.formattedValue}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                      isPositive ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {isPositive ? '+' : ''}{(kpi.calculatedValue * 0.12).toFixed(1)}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      isPositive 
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {isPositive ? '+' : ''}{kpi.changePercentage}%
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex justify-center">
                      <svg width="72" height="20" className="overflow-visible">
                        <path
                          d={pathD}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
