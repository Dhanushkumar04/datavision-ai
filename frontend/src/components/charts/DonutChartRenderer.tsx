import React, { useState } from 'react';
import { ChartDataPoint } from '../../types/dashboard';
import { formatCompactNumber, formatNumber } from '../../utils/formatting';

interface DonutChartRendererProps {
  data: ChartDataPoint[];
  palette: string[];
  onSliceClick?: (label: string) => void;
  selectedLabel?: string | null;
  isDark?: boolean;
}

export const DonutChartRenderer: React.FC<DonutChartRendererProps> = ({
  data,
  palette,
  onSliceClick,
  selectedLabel,
  isDark = true,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length === 0) {
    return <div className="h-56 flex items-center justify-center text-xs text-slate-400">No segment data</div>;
  }

  const total = data.reduce((acc, d) => acc + d.value, 0) || 1;
  const radius = 42;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;

  // Compute slice arcs
  let accumulatedPercent = 0;
  const slices = data.map((d, idx) => {
    const pct = d.value / total;
    const strokeDasharray = `${pct * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += pct;
    return {
      data: d,
      index: idx,
      color: palette[idx % palette.length],
      strokeDasharray,
      strokeDashoffset,
      percentage: Number((pct * 100).toFixed(1)),
    };
  });

  const activeItem = hoveredIdx !== null ? slices[hoveredIdx] : selectedLabel ? slices.find(s => s.data.label === selectedLabel) : null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-2 w-full">
      {/* Donut SVG with Center Stat */}
      <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90 overflow-visible">
          {/* Background circle track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            className="text-slate-100 dark:text-slate-800/80"
            strokeWidth={strokeWidth}
          />

          {/* Slices */}
          {slices.map((slice) => {
            const isHovered = hoveredIdx === slice.index;
            const isSelected = selectedLabel === slice.data.label;
            const isFaded = (hoveredIdx !== null && !isHovered) || (selectedLabel && !isSelected);

            return (
              <circle
                key={slice.data.label}
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={slice.color}
                strokeWidth={isHovered || isSelected ? strokeWidth + 3 : strokeWidth}
                strokeDasharray={slice.strokeDasharray}
                strokeDashoffset={slice.strokeDashoffset}
                strokeLinecap="round"
                className="cursor-pointer transition-all duration-200"
                opacity={isFaded ? 0.3 : 1}
                filter={isHovered || isSelected ? 'drop-shadow(0 0 6px rgba(0,0,0,0.4))' : 'none'}
                onClick={() => onSliceClick && onSliceClick(slice.data.label)}
                onMouseEnter={() => setHoveredIdx(slice.index)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}
        </svg>

        {/* Center Metric Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans truncate max-w-[90px]">
            {activeItem ? activeItem.data.label : 'Total'}
          </span>
          <span className={`text-base font-extrabold font-mono mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {activeItem ? formatCompactNumber(activeItem.data.value) : formatCompactNumber(total)}
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            {activeItem ? `${activeItem.percentage}%` : `${slices.length} segments`}
          </span>
        </div>
      </div>

      {/* Modern Interactive Breakdown List */}
      <div className="flex-1 w-full space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-none">
        {slices.map((slice) => {
          const isHovered = hoveredIdx === slice.index;
          const isSelected = selectedLabel === slice.data.label;
          const isFaded = (hoveredIdx !== null && !isHovered) || (selectedLabel && !isSelected);

          return (
            <div
              key={slice.data.label}
              onClick={() => onSliceClick && onSliceClick(slice.data.label)}
              onMouseEnter={() => setHoveredIdx(slice.index)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`p-2 rounded-lg cursor-pointer transition-all border ${
                isSelected
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : isHovered
                  ? 'bg-slate-500/10 border-slate-500/20'
                  : 'bg-transparent border-transparent'
              } ${isFaded ? 'opacity-35' : 'opacity-100'}`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <div className="flex items-center gap-2 truncate">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className={`font-medium truncate max-w-[130px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {slice.data.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {formatNumber(slice.data.value)}
                  </span>
                  <span className="text-slate-400 text-[11px] w-9 text-right font-medium">
                    {slice.percentage}%
                  </span>
                </div>
              </div>

              {/* Progress mini-bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${slice.percentage}%`,
                    backgroundColor: slice.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
