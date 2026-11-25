import React, { useState } from 'react';
import { ChartDataPoint } from '../../types/dashboard';
import { formatCompactNumber, formatNumber } from '../../utils/formatting';

interface BarChartRendererProps {
  data: ChartDataPoint[];
  palette: string[];
  isHorizontal?: boolean;
  onSliceClick?: (label: string) => void;
  selectedLabel?: string | null;
  isDark?: boolean;
}

export const BarChartRenderer: React.FC<BarChartRendererProps> = ({
  data,
  palette,
  isHorizontal = false,
  onSliceClick,
  selectedLabel,
  isDark = true,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <div className="h-56 flex items-center justify-center text-xs text-slate-400">No chart data available</div>;
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);

  // 1. HORIZONTAL BAR: Modern Enterprise Ranking Leaderboard
  if (isHorizontal) {
    return (
      <div className="space-y-3 py-1 w-full">
        {data.slice(0, 7).map((item, idx) => {
          const widthPct = Math.max(4, (item.value / maxValue) * 100);
          const color = palette[idx % palette.length];
          const isSelected = selectedLabel === item.label;
          const isFaded = selectedLabel && !isSelected;
          const isHovered = hoveredIdx === idx;

          return (
            <div 
              key={item.label}
              onClick={() => onSliceClick && onSliceClick(item.label)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`space-y-1.5 cursor-pointer transition-all p-1.5 rounded-lg ${
                isHovered ? 'bg-slate-500/10' : ''
              } ${isFaded ? 'opacity-30' : 'opacity-100'}`}
            >
              <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2 min-w-0">
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold font-mono ${
                    idx === 0 
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                      : idx === 1 
                      ? 'bg-slate-400/20 text-slate-400 border border-slate-400/30' 
                      : idx === 2 
                      ? 'bg-amber-700/20 text-amber-600 border border-amber-700/30' 
                      : 'bg-slate-500/10 text-slate-400'
                  }`}>
                    #{idx + 1}
                  </span>
                  <span className={`truncate max-w-[200px] font-medium text-xs ${isDark ? 'text-slate-200' : 'text-slate-800'}`} title={item.label}>
                    {item.label}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 font-mono">
                  {item.percentage !== undefined && (
                    <span className="text-[11px] text-slate-400">
                      {item.percentage}%
                    </span>
                  )}
                  <span className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {formatNumber(item.value)}
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div className="w-full h-2.5 bg-slate-200/50 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full transition-all duration-500 relative"
                  style={{ 
                    width: `${widthPct}%`,
                    backgroundColor: color,
                    boxShadow: isHovered || isSelected ? `0 0 10px ${color}` : 'none'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 2. VERTICAL BAR: High-Impact Rounded Top Columns
  const svgWidth = 520;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = svgWidth - paddingX * 2;
  const chartHeight = svgHeight - paddingY * 2;

  const barWidth = Math.min(38, Math.max(16, (chartWidth / data.length) * 0.65));
  const slotWidth = chartWidth / data.length;

  return (
    <div className="w-full relative flex flex-col items-center">
      {/* Tooltip on hover */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div className="absolute top-0 right-4 z-20 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 font-mono pointer-events-none">
          <span className="font-semibold">{data[hoveredIdx].label}</span>: {formatNumber(data[hoveredIdx].value)}
          {data[hoveredIdx].percentage && ` (${data[hoveredIdx].percentage}%)`}
        </div>
      )}

      <svg 
        viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
        className="w-full h-56 overflow-visible"
      >
        <defs>
          {data.map((_, i) => {
            const col = palette[i % palette.length];
            return (
              <linearGradient key={`bar-grad-${i}`} id={`bar-grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={col} stopOpacity="1" />
                <stop offset="100%" stopColor={col} stopOpacity="0.65" />
              </linearGradient>
            );
          })}
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = paddingY + chartHeight * (1 - pct);
          const gridVal = maxValue * pct;
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800/80"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-slate-400 font-mono"
              >
                {formatCompactNumber(gridVal)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, idx) => {
          const xCenter = paddingX + idx * slotWidth + slotWidth / 2;
          const barHeight = Math.max(4, (item.value / maxValue) * chartHeight);
          const y = paddingY + chartHeight - barHeight;
          const x = xCenter - barWidth / 2;
          const isSelected = selectedLabel === item.label;
          const isFaded = selectedLabel && !isSelected;
          const isHovered = hoveredIdx === idx;

          return (
            <g 
              key={item.label}
              onClick={() => onSliceClick && onSliceClick(item.label)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer transition-all"
              opacity={isFaded ? 0.25 : 1}
            >
              {/* Background slot track */}
              <rect
                x={x}
                y={paddingY}
                width={barWidth}
                height={chartHeight}
                rx="6"
                className="fill-slate-100 dark:fill-slate-800/40"
              />

              {/* Active data bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx="6"
                fill={`url(#bar-grad-${idx})`}
                filter={isHovered || isSelected ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))' : 'none'}
                className="transition-all duration-300"
              />

              {/* Top value on bar */}
              {barHeight > 24 && (
                <text
                  x={xCenter}
                  y={y - 6}
                  textAnchor="middle"
                  className="text-[9px] font-mono font-bold fill-slate-700 dark:fill-slate-300"
                >
                  {formatCompactNumber(item.value)}
                </text>
              )}

              {/* X Axis label */}
              <text
                x={xCenter}
                y={svgHeight - paddingY + 16}
                textAnchor="middle"
                className="text-[10px] font-medium fill-slate-500 dark:fill-slate-400 font-sans"
              >
                {item.label.length > 9 ? `${item.label.slice(0, 8)}…` : item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
