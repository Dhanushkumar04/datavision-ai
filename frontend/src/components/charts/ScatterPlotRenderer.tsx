import React, { useState } from 'react';
import { ChartDataPoint } from '../../types/dashboard';
import { formatCompactNumber, formatNumber } from '../../utils/formatting';

interface ScatterPlotRendererProps {
  data: ChartDataPoint[];
  palette: string[];
  xLabel?: string;
  yLabel?: string;
}

export const ScatterPlotRenderer: React.FC<ScatterPlotRendererProps> = ({
  data,
  palette,
  xLabel = 'Measure X',
  yLabel = 'Measure Y',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length < 2) {
    return <div className="h-56 flex items-center justify-center text-xs text-slate-400">Insufficient coordinate data</div>;
  }

  const primaryColor = palette[0] || '#6366f1';
  const width = 520;
  const height = 220;
  const paddingX = 55;
  const paddingY = 35;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const xVals = data.map(d => d.value);
  const yVals = data.map(d => d.secondaryValue ?? 0);

  const minX = Math.min(...xVals);
  const maxX = Math.max(...xVals) || 1;
  const rangeX = maxX - minX || 1;

  const minY = Math.min(...yVals);
  const maxY = Math.max(...yVals) || 1;
  const rangeY = maxY - minY || 1;

  const points = data.map((d, i) => {
    const x = paddingX + ((d.value - minX) / rangeX) * innerWidth;
    const y = height - paddingY - (((d.secondaryValue ?? 0) - minY) / rangeY) * innerHeight;
    return { x, y, data: d, index: i };
  });

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="w-full relative flex flex-col items-center">
      {/* Tooltip on hover */}
      {activePoint && (
        <div 
          className="absolute z-20 bg-slate-900/95 backdrop-blur-md text-white px-3 py-1.5 rounded-lg shadow-xl border border-slate-700 text-xs font-mono pointer-events-none"
          style={{
            left: `${Math.min(80, Math.max(10, (activePoint.x / width) * 100))}%`,
            top: '0px',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="text-[10px] text-slate-400 font-sans">{activePoint.data.label}</div>
          <div>{xLabel}: <span className="font-bold text-cyan-400">{formatNumber(activePoint.data.value)}</span></div>
          <div>{yLabel}: <span className="font-bold text-emerald-400">{formatNumber(activePoint.data.secondaryValue ?? 0)}</span></div>
        </div>
      )}

      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-56 overflow-visible"
      >
        <defs>
          <radialGradient id="bubble-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.8" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0.25" />
          </radialGradient>
        </defs>

        {/* Horizontal gridlines & Y labels */}
        {[0, 0.5, 1].map((pct, idx) => {
          const y = paddingY + innerHeight * (1 - pct);
          const val = minY + rangeY * pct;
          return (
            <g key={`y-${idx}`}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
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
                {formatCompactNumber(val)}
              </text>
            </g>
          );
        })}

        {/* Vertical gridlines & X labels */}
        {[0, 0.5, 1].map((pct, idx) => {
          const x = paddingX + innerWidth * pct;
          const val = minX + rangeX * pct;
          return (
            <g key={`x-${idx}`}>
              <line
                x1={x}
                y1={paddingY}
                x2={x}
                y2={height - paddingY}
                stroke="currentColor"
                className="text-slate-200 dark:text-slate-800/80"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={x}
                y={height - paddingY + 16}
                textAnchor="middle"
                className="text-[9px] fill-slate-400 font-mono"
              >
                {formatCompactNumber(val)}
              </text>
            </g>
          );
        })}

        {/* Points */}
        {points.map((pt, idx) => {
          const isHovered = hoveredIdx === idx;
          const pointColor = palette[idx % palette.length];

          return (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r="12"
                fill="transparent"
              />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 7 : 4.5}
                fill={pointColor}
                opacity={isHovered ? 1 : 0.75}
                stroke="#ffffff"
                strokeWidth={isHovered ? 2 : 1}
                className="transition-all duration-150"
                style={{
                  filter: isHovered ? `drop-shadow(0 0 8px ${pointColor})` : 'none'
                }}
              />
            </g>
          );
        })}

        {/* X Axis title */}
        <text
          x={width / 2}
          y={height - 2}
          textAnchor="middle"
          className="text-[10px] font-semibold fill-slate-500 dark:fill-slate-400"
        >
          {xLabel} →
        </text>

        {/* Y Axis title */}
        <text
          x={14}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 14, ${height / 2})`}
          className="text-[10px] font-semibold fill-slate-500 dark:fill-slate-400"
        >
          ↑ {yLabel}
        </text>
      </svg>
    </div>
  );
};
