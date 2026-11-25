import React, { useState } from 'react';
import { ChartDataPoint } from '../../types/dashboard';
import { formatCompactNumber, formatNumber } from '../../utils/formatting';

interface LineChartRendererProps {
  data: ChartDataPoint[];
  palette: string[];
  isArea?: boolean;
  onPointClick?: (label: string) => void;
  selectedLabel?: string | null;
}

export const LineChartRenderer: React.FC<LineChartRendererProps> = ({
  data,
  palette,
  isArea = true,
  onPointClick,
  selectedLabel,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (data.length < 2) {
    return <div className="h-56 flex items-center justify-center text-xs text-slate-400">At least 2 chronological points required</div>;
  }

  const primaryColor = palette[0] || '#38bdf8';
  const width = 560;
  const height = 230;
  const paddingX = 45;
  const paddingY = 35;

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const valueRange = maxValue - minValue || 1;

  // Compute SVG coordinates
  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * innerWidth;
    const y = height - paddingY - ((d.value - minValue) / valueRange) * innerHeight;
    return { x, y, data: d, index: i };
  });

  // Build smooth bezier SVG line path
  const linePath = points.reduce((acc, curr, idx, arr) => {
    if (idx === 0) return `M ${curr.x} ${curr.y}`;
    const prev = arr[idx - 1];
    const cp1x = prev.x + (curr.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) / 2;
    const cp2y = curr.y;
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }, '');

  // Build closed area polygon
  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const areaPath = `${linePath} L ${lastPoint.x} ${height - paddingY} L ${firstPoint.x} ${height - paddingY} Z`;

  const gradientId = `line-area-grad-${Math.random().toString(36).substring(2, 9)}`;

  const activePoint = hoveredIdx !== null ? points[hoveredIdx] : null;

  return (
    <div className="w-full relative flex flex-col items-center">
      {/* Floating Tooltip */}
      {activePoint && (
        <div 
          className="absolute z-20 bg-slate-900/95 backdrop-blur-md text-white px-3 py-2 rounded-xl shadow-2xl border border-slate-700/80 pointer-events-none transition-all duration-75 text-xs font-mono"
          style={{
            left: `${Math.min(80, Math.max(10, (activePoint.x / width) * 100))}%`,
            top: '0px',
            transform: 'translateX(-50%)'
          }}
        >
          <div className="text-[10px] text-slate-400 font-sans">{activePoint.data.label}</div>
          <div className="font-bold text-sm text-cyan-400">
            {formatNumber(activePoint.data.value)}
          </div>
        </div>
      )}

      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-56 overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={primaryColor} stopOpacity={0.35} />
            <stop offset="70%" stopColor={primaryColor} stopOpacity={0.08} />
            <stop offset="100%" stopColor={primaryColor} stopOpacity={0.0} />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
          const y = paddingY + innerHeight * (1 - pct);
          const gridVal = minValue + valueRange * pct;
          return (
            <g key={idx}>
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
                {formatCompactNumber(gridVal)}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {isArea && (
          <path
            d={areaPath}
            fill={`url(#${gradientId})`}
          />
        )}

        {/* Stroke Line */}
        <path
          d={linePath}
          fill="none"
          stroke={primaryColor}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#glow)"
        />

        {/* Interactive Vertical Cursor Line */}
        {activePoint && (
          <line
            x1={activePoint.x}
            y1={paddingY}
            x2={activePoint.x}
            y2={height - paddingY}
            stroke={primaryColor}
            strokeWidth="1.5"
            strokeDasharray="2 2"
            opacity="0.8"
          />
        )}

        {/* Data Points */}
        {points.map((pt, idx) => {
          const isSelected = selectedLabel === pt.data.label;
          const isHovered = hoveredIdx === idx;

          return (
            <g 
              key={idx}
              className="cursor-pointer"
              onClick={() => onPointClick && onPointClick(pt.data.label)}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {/* Invisible large hit target */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r="16"
                fill="transparent"
              />

              {/* Outer pulsing ring on hover */}
              {(isHovered || isSelected) && (
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="9"
                  fill="none"
                  stroke={primaryColor}
                  strokeWidth="2.5"
                  opacity="0.6"
                />
              )}

              {/* Inner core circle */}
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isHovered ? 5.5 : 4}
                fill={primaryColor}
                stroke="#ffffff"
                strokeWidth="2"
                className="transition-all duration-150"
              />

              {/* X Axis Label */}
              {(idx === 0 || idx === points.length - 1 || idx % Math.ceil(points.length / 5) === 0) && (
                <text
                  x={pt.x}
                  y={height - paddingY + 16}
                  textAnchor="middle"
                  className="text-[10px] font-medium fill-slate-500 dark:fill-slate-400 font-mono"
                >
                  {pt.data.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
