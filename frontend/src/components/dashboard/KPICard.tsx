import React from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Percent, 
  Layers, 
  Hash,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { KPISpec, ThemeConfig } from '../../types/dashboard';

interface KPICardProps {
  kpi: KPISpec;
  theme: ThemeConfig;
}

export const KPICard: React.FC<KPICardProps> = ({ kpi, theme }) => {
  const getIcon = () => {
    const text = (kpi.title + ' ' + kpi.column).toLowerCase();
    if (text.includes('revenue') || text.includes('sales') || text.includes('profit') || text.includes('amount') || text.includes('price') || text.includes('cost') || text.includes('salary') || text.includes('budget') || text.includes('target')) {
      return DollarSign;
    }
    if (text.includes('order') || text.includes('cart') || text.includes('purchase') || text.includes('transaction') || text.includes('sold')) {
      return ShoppingCart;
    }
    if (text.includes('customer') || text.includes('employee') || text.includes('user') || text.includes('patient') || text.includes('client')) {
      return Users;
    }
    if (text.includes('rate') || text.includes('margin') || text.includes('percent') || text.includes('ratio') || text.includes('discount')) {
      return Percent;
    }
    if (text.includes('quantity') || text.includes('unit') || text.includes('item') || text.includes('count') || text.includes('product')) {
      return Hash;
    }
    if (text.includes('score') || text.includes('performance') || text.includes('satisfaction')) {
      return Activity;
    }
    return Layers;
  };

  const Icon = getIcon();
  const isPositiveGrowth = (kpi.changePercentage ?? 0) >= 0;

  // Rich SVG Sparkline with smooth area gradient fill
  const renderSparkline = () => {
    if (!kpi.sparkline || kpi.sparkline.length < 2) return null;

    const data = kpi.sparkline;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 110;
    const height = 34;
    const gradientId = `spark-grad-${kpi.id}`;

    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 8) - 4;
      return { x, y };
    });

    // Build smooth curve
    const pathD = points.reduce((acc, curr, idx, arr) => {
      if (idx === 0) return `M ${curr.x} ${curr.y}`;
      const prev = arr[idx - 1];
      const cp1x = prev.x + (curr.x - prev.x) / 2;
      return `${acc} C ${cp1x} ${prev.y}, ${cp1x} ${curr.y}, ${curr.x} ${curr.y}`;
    }, '');

    const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;
    const strokeColor = theme.chartPalette[0] || '#3b82f6';

    return (
      <div className="w-[110px] h-[34px] overflow-hidden flex-shrink-0" title="Historical progression trend">
        <svg width="110" height="34" className="overflow-visible">
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={strokeColor} stopOpacity={0.4} />
              <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <path d={areaD} fill={`url(#${gradientId})`} />
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    );
  };

  return (
    <div 
      className={`rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden flex flex-col justify-between group ${theme.cardClass} ${theme.borderClass}`}
    >
      {/* Top subtle glow bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${theme.kpiAccent} opacity-80 group-hover:opacity-100 transition-opacity`} />

      {/* Top row: KPI Title and Icon Badge */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[11px] font-bold uppercase tracking-wider truncate ${theme.textSecondaryClass}`}>
              {kpi.title}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {kpi.aggregation.toUpperCase()}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[130px]">
              {kpi.column}
            </span>
          </div>
        </div>

        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${theme.kpiAccent} text-white shadow-md shadow-black/20 group-hover:scale-105 transition-transform`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="my-2">
        <div className={`text-2xl sm:text-3xl lg:text-3xl font-extrabold tracking-tight font-mono ${theme.textPrimaryClass}`}>
          {kpi.formattedValue}
        </div>
        {kpi.subtitle && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
            {kpi.subtitle}
          </p>
        )}
      </div>

      {/* Bottom row: Trend Delta and Sparkline */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800/80 mt-1">
        <div className="flex items-center gap-1.5">
          {kpi.changePercentage !== undefined && (
            <span 
              className={`inline-flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full ${
                isPositiveGrowth 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}
            >
              {isPositiveGrowth ? (
                <ArrowUpRight className="w-3.5 h-3.5" />
              ) : (
                <ArrowDownRight className="w-3.5 h-3.5" />
              )}
              {isPositiveGrowth ? '+' : ''}{kpi.changePercentage}%
            </span>
          )}
          <span className={`text-[10px] hidden sm:inline ${theme.textSecondaryClass}`}>
            vs prior
          </span>
        </div>

        {/* Sparkline */}
        {renderSparkline()}
      </div>
    </div>
  );
};
