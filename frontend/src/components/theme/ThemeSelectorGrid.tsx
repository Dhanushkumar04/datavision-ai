import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import { ThemeId } from '../../types/dashboard';
import { THEME_CONFIGS } from '../../services/themeEngine';

interface ThemeSelectorGridProps {
  selectedThemeId: ThemeId;
  onSelectTheme: (id: ThemeId) => void;
  recommendedThemeId?: ThemeId;
  recommendationReason?: string;
}

export const ThemeSelectorGrid: React.FC<ThemeSelectorGridProps> = ({
  selectedThemeId,
  onSelectTheme,
  recommendedThemeId,
  recommendationReason,
}) => {
  const themeList = Object.values(THEME_CONFIGS);

  return (
    <div className="space-y-8">
      {/* AI Recommendation Banner */}
      {recommendedThemeId && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-600/15 via-indigo-600/15 to-purple-600/15 border-2 border-blue-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-blue-500/5">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex-shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-500 font-mono">
                  AI Recommended Theme
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                  {THEME_CONFIGS[recommendedThemeId].name}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-500/20 text-slate-300">
                  {THEME_CONFIGS[recommendedThemeId].category}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 max-w-3xl leading-relaxed">
                {recommendationReason || 'Optimal visual hierarchy and color psychology matched to your dataset.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => onSelectTheme(recommendedThemeId)}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
          >
            Apply Recommended
          </button>
        </div>
      )}

      {/* Grid of 8 High-End Themes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {themeList.map((theme) => {
          const isSelected = selectedThemeId === theme.id;
          const isRecommended = recommendedThemeId === theme.id;

          return (
            <div
              key={theme.id}
              onClick={() => onSelectTheme(theme.id)}
              className={`rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 relative group flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-2xl scale-[1.02] bg-slate-900/90 dark:bg-slate-900'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/80 shadow-md'
              }`}
            >
              {/* Badges row */}
              <div className="flex items-center justify-between mb-3.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {theme.badge}
                  </span>
                  {isRecommended && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Best Match
                    </span>
                  )}
                </div>

                {isSelected ? (
                  <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-700 group-hover:border-blue-400 transition-colors" />
                )}
              </div>

              {/* Realistic Mini Dashboard Mockup Preview */}
              <div className={`rounded-xl border p-3.5 mb-4 transition-all duration-300 overflow-hidden ${theme.backgroundClass} ${theme.borderClass}`}>
                <div className="space-y-2.5">
                  {/* Mockup Header bar */}
                  <div className="flex items-center justify-between pb-1.5 border-b border-white/10 dark:border-white/10">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
                      <div className={`w-12 h-1.5 rounded ml-1 ${theme.isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                    </div>
                    <div className="w-8 h-2 rounded bg-blue-500/40" />
                  </div>

                  {/* Mockup 2 KPI cards */}
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className={`p-1.5 rounded-lg border ${theme.cardClass} ${theme.borderClass}`}>
                      <div className="text-[8px] uppercase tracking-wider text-slate-400">Revenue</div>
                      <div className={`text-xs font-bold font-mono ${theme.textPrimaryClass}`}>$1.25M</div>
                      <div className="text-[7px] text-emerald-500 font-bold">+12.5%</div>
                    </div>
                    <div className={`p-1.5 rounded-lg border ${theme.cardClass} ${theme.borderClass}`}>
                      <div className="text-[8px] uppercase tracking-wider text-slate-400">Orders</div>
                      <div className={`text-xs font-bold font-mono ${theme.textPrimaryClass}`}>2,350</div>
                      <div className="text-[7px] text-emerald-500 font-bold">+15.3%</div>
                    </div>
                  </div>

                  {/* Mockup Chart Visual */}
                  <div className={`p-2 rounded-lg border ${theme.cardClass} ${theme.borderClass}`}>
                    <div className="flex items-center justify-between text-[8px] text-slate-400 mb-1">
                      <span>Performance Trajectory</span>
                      <span className="font-mono text-emerald-500">▲ Active</span>
                    </div>

                    {/* Mini Area/Line SVG */}
                    <div className="h-10 w-full flex items-end">
                      <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible">
                        <defs>
                          <linearGradient id={`mini-grad-${theme.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={theme.chartPalette[0]} stopOpacity="0.5" />
                            <stop offset="100%" stopColor={theme.chartPalette[0]} stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M 0 25 C 20 20, 30 10, 50 18 C 70 25, 80 5, 100 8 L 100 30 L 0 30 Z"
                          fill={`url(#mini-grad-${theme.id})`}
                        />
                        <path
                          d="M 0 25 C 20 20, 30 10, 50 18 C 70 25, 80 5, 100 8"
                          fill="none"
                          stroke={theme.chartPalette[0]}
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Theme Meta Info */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    {theme.name}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                    {theme.isDark ? 'Dark Mode' : 'Light Canvas'}
                  </span>
                </div>

                <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  {theme.tagline}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                  {theme.description}
                </p>

                {/* Color Palette Swatches */}
                <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-mono">Palette:</span>
                  <div className="flex items-center gap-1">
                    {theme.chartPalette.slice(0, 6).map((color, idx) => (
                      <div
                        key={idx}
                        className="w-3.5 h-3.5 rounded-full border border-black/15 dark:border-white/15"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
