import { ThemeId, ThemeConfig } from '../types/dashboard';
import { ParsedDataset, ColumnProfile } from '../types/dataset';

export const THEME_CONFIGS: Record<ThemeId, ThemeConfig> = {
  dark: {
    id: 'dark',
    name: 'Cyber Obsidian',
    tagline: 'Modern SaaS Dark Analytics',
    description: 'Deep obsidian space canvas with glowing cyan and indigo neon accents. Built for tech products, developer tools, and SaaS telemetry.',
    badge: 'Popular SaaS',
    category: 'Tech & SaaS',
    isDark: true,
    backgroundClass: 'bg-[#080d1a]',
    cardClass: 'bg-[#0f172a]/95 backdrop-blur-md shadow-lg shadow-black/40',
    borderClass: 'border-slate-800/90 hover:border-slate-700/80',
    headerClass: 'bg-[#0b1329]/95 border-b border-slate-800/80',
    textPrimaryClass: 'text-slate-100',
    textSecondaryClass: 'text-slate-400',
    accentClass: 'text-cyan-400',
    glowClass: 'shadow-[0_0_24px_rgba(14,165,233,0.15)] ring-1 ring-cyan-500/20',
    kpiAccent: 'from-blue-600 via-indigo-600 to-cyan-500',
    gradientStop: '#0ea5e9',
    chartPalette: ['#38bdf8', '#818cf8', '#c084fc', '#34d399', '#fbbf24', '#f472b6', '#22d3ee', '#a78bfa'],
  },
  powerbi: {
    id: 'powerbi',
    name: 'Power BI Enterprise',
    tagline: 'Enterprise Microsoft Fabric Style',
    description: 'Structured corporate business intelligence with warm amber/gold accents, dark enterprise slate framing, and structured card layouts.',
    badge: 'Enterprise BI',
    category: 'Enterprise BI',
    isDark: false,
    backgroundClass: 'bg-[#f0f2f5]',
    cardClass: 'bg-white shadow-sm hover:shadow-md transition-shadow',
    borderClass: 'border-slate-200/90 hover:border-slate-300',
    headerClass: 'bg-[#182234] text-white border-b border-slate-800',
    textPrimaryClass: 'text-slate-900',
    textSecondaryClass: 'text-slate-600',
    accentClass: 'text-amber-600',
    glowClass: 'shadow-[0_0_20px_rgba(217,119,6,0.15)] ring-1 ring-amber-500/20',
    kpiAccent: 'from-amber-500 via-yellow-600 to-slate-800',
    gradientStop: '#d97706',
    chartPalette: ['#d97706', '#2563eb', '#059669', '#7c3aed', '#dc2626', '#0891b2', '#475569', '#ea580c'],
  },
  executive: {
    id: 'executive',
    name: 'Emerald Prestige',
    tagline: 'Executive & Wealth Leadership',
    description: 'Deep royal emerald slate with gold and mint highlights. Tailored for C-suite business presentations, board meetings, and high-stakes financial reviews.',
    badge: 'C-Suite Ready',
    category: 'Finance & Leadership',
    isDark: true,
    backgroundClass: 'bg-[#061412]',
    cardClass: 'bg-[#0d221e]/95 backdrop-blur-md shadow-lg shadow-black/50',
    borderClass: 'border-emerald-900/60 hover:border-emerald-700/60',
    headerClass: 'bg-[#091b18]/95 border-b border-emerald-900/60',
    textPrimaryClass: 'text-emerald-50',
    textSecondaryClass: 'text-emerald-200/70',
    accentClass: 'text-emerald-400',
    glowClass: 'shadow-[0_0_25px_rgba(16,185,129,0.18)] ring-1 ring-emerald-500/20',
    kpiAccent: 'from-emerald-500 via-teal-600 to-emerald-700',
    gradientStop: '#10b981',
    chartPalette: ['#10b981', '#34d399', '#0ea5e9', '#f59e0b', '#6366f1', '#14b8a6', '#f43f5e', '#a855f7'],
  },
  tableau: {
    id: 'tableau',
    name: 'Tableau Visionary',
    tagline: 'Visualization-First Analytics',
    description: 'Balanced neutral backdrop paired with the world-renowned 10-color categorical palette. Engineered for data scientists, statisticians, and visual analysts.',
    badge: 'Analytics First',
    category: 'Data Science',
    isDark: false,
    backgroundClass: 'bg-[#f7f8fa]',
    cardClass: 'bg-white shadow-xs hover:shadow-sm transition-shadow',
    borderClass: 'border-slate-200 hover:border-slate-300',
    headerClass: 'bg-white border-b border-slate-200',
    textPrimaryClass: 'text-slate-800',
    textSecondaryClass: 'text-slate-500',
    accentClass: 'text-[#4e79a7]',
    glowClass: 'shadow-[0_0_18px_rgba(78,121,167,0.15)] ring-1 ring-[#4e79a7]/20',
    kpiAccent: 'from-[#4e79a7] via-[#59a14f] to-[#f28e2c]',
    gradientStop: '#4e79a7',
    chartPalette: ['#4e79a7', '#f28e2c', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7'],
  },
  gradient: {
    id: 'gradient',
    name: 'Cosmic Aurora',
    tagline: 'Vibrant Mesh Gradient & Glow',
    description: 'Multi-layer deep cosmic gradients with floating translucent glass cards and radiant neon borders. High visual energy for marketing and growth dashboards.',
    badge: 'Vibrant Glow',
    category: 'Creative & Growth',
    isDark: true,
    backgroundClass: 'bg-gradient-to-br from-[#0c0a24] via-[#09112a] to-[#041a24]',
    cardClass: 'bg-slate-900/80 backdrop-blur-xl shadow-xl shadow-black/50',
    borderClass: 'border-violet-500/30 hover:border-violet-400/50',
    headerClass: 'bg-slate-950/70 backdrop-blur-md border-b border-violet-500/20',
    textPrimaryClass: 'text-white',
    textSecondaryClass: 'text-violet-200/70',
    accentClass: 'text-fuchsia-400',
    glowClass: 'shadow-[0_0_30px_rgba(192,132,252,0.22)] ring-1 ring-fuchsia-500/30',
    kpiAccent: 'from-fuchsia-500 via-violet-600 to-cyan-500',
    gradientStop: '#c084fc',
    chartPalette: ['#c084fc', '#38bdf8', '#f472b6', '#4ade80', '#fbbf24', '#818cf8', '#2dd4bf', '#fb7185'],
  },
  modern: {
    id: 'modern',
    name: 'Stripe Minimalist',
    tagline: 'Fintech Precision & High Trust',
    description: 'Crisp porcelain-white canvas with royal cobalt accents, ultra-fine borders, and modern fintech typography. Clean, authoritative, and distraction-free.',
    badge: 'Fintech Grade',
    category: 'Fintech & Modern',
    isDark: false,
    backgroundClass: 'bg-[#fafbfc]',
    cardClass: 'bg-white shadow-xs hover:shadow-md transition-shadow',
    borderClass: 'border-slate-200/80 hover:border-blue-200',
    headerClass: 'bg-white border-b border-slate-200',
    textPrimaryClass: 'text-slate-900',
    textSecondaryClass: 'text-slate-500',
    accentClass: 'text-blue-600',
    glowClass: 'shadow-[0_0_20px_rgba(37,99,235,0.12)] ring-1 ring-blue-500/20',
    kpiAccent: 'from-blue-600 via-indigo-600 to-blue-700',
    gradientStop: '#2563eb',
    chartPalette: ['#2563eb', '#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'],
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Tokyo Synthwave',
    tagline: 'Vibrant Neon Pulse',
    description: 'Pitch-black night canvas powered by hot magenta, electric cyan, and neon amber. Maximum contrast and futuristic visual excitement.',
    badge: 'Futuristic',
    category: 'Creative & Growth',
    isDark: true,
    backgroundClass: 'bg-[#050508]',
    cardClass: 'bg-[#0c0c14]/95 backdrop-blur-md shadow-2xl shadow-pink-950/20',
    borderClass: 'border-pink-900/50 hover:border-pink-500/60',
    headerClass: 'bg-[#080810]/95 border-b border-pink-900/40',
    textPrimaryClass: 'text-pink-50',
    textSecondaryClass: 'text-pink-200/60',
    accentClass: 'text-pink-400',
    glowClass: 'shadow-[0_0_28px_rgba(244,63,94,0.25)] ring-1 ring-pink-500/30',
    kpiAccent: 'from-rose-500 via-fuchsia-600 to-amber-400',
    gradientStop: '#f43f5e',
    chartPalette: ['#f43f5e', '#06b6d4', '#eab308', '#a855f7', '#10b981', '#f97316', '#3b82f6', '#ec4899'],
  },
  custom: {
    id: 'custom',
    name: 'Custom Studio',
    tagline: 'Personalized Brand Palette',
    description: 'Configurable design palette adapting to your company brand colors and corporate identity.',
    badge: 'Brand Kit',
    category: 'Personalized',
    isDark: false,
    backgroundClass: 'bg-slate-50',
    cardClass: 'bg-white shadow-sm',
    borderClass: 'border-slate-200',
    headerClass: 'bg-white border-b border-slate-200',
    textPrimaryClass: 'text-slate-900',
    textSecondaryClass: 'text-slate-500',
    accentClass: 'text-violet-600',
    glowClass: 'shadow-[0_0_20px_rgba(124,58,237,0.15)] ring-1 ring-violet-500/20',
    kpiAccent: 'from-violet-600 via-indigo-600 to-purple-600',
    gradientStop: '#7c3aed',
    chartPalette: ['#7c3aed', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4', '#64748b', '#84cc16'],
  },
};

/**
 * Intelligent Theme Recommendation Engine
 * Recommends optimal theme based on dataset domain, size, and column profiles
 */
export function recommendTheme(
  dataset: ParsedDataset,
  profiles: Record<string, ColumnProfile>
): { themeId: ThemeId; reason: string } {
  const headersLower = dataset.rawHeaders.map(h => h.toLowerCase()).join(' ');
  const profileList = Object.values(profiles);
  const hasCurrency = profileList.some(p => p.effectiveType === 'currency');
  const hasTemporal = profileList.some(p => p.effectiveType === 'datetime');

  // 1. Retail / Sales / E-Commerce dataset -> Power BI Enterprise
  if (/order|sales|retail|customer|product|seller|price|cart|revenue|shipping|quantity/i.test(headersLower)) {
    return {
      themeId: 'powerbi',
      reason: 'E-Commerce / Commercial Retail detected. Power BI Enterprise delivers structured transactional layouts, multi-dimensional category shares, and executive sales volume cards.',
    };
  }

  // 2. Tech / SaaS / Software / Telemetry -> Cyber Obsidian
  if (/mrr|arr|churn|cac|ltv|session|api|user|platform|event|dau|mau|latency|version|server/i.test(headersLower)) {
    return {
      themeId: 'dark',
      reason: 'SaaS & Digital Product metrics identified. Cyber Obsidian delivers high-contrast dark telemetry with glowing neon accents for time-series growth.',
    };
  }

  // 3. Finance / Corporate Workforce / HR -> Emerald Prestige
  if (hasCurrency || /salary|employee|headcount|department|attrition|tenure|bonus|payroll|expense|pnl|budget/i.test(headersLower)) {
    return {
      themeId: 'executive',
      reason: 'Workforce & Corporate Financial data detected. Emerald Prestige provides an authoritative C-suite appearance with luxury emerald and gold metric hierarchy.',
    };
  }

  // 4. Clinical / Operations / Healthcare / Research -> Tableau Visionary
  if (/patient|hospital|bed|treatment|admission|clinical|doctor|diagnosis|test|lab|cohort/i.test(headersLower)) {
    return {
      themeId: 'tableau',
      reason: 'Clinical, Operational or Scientific dataset identified. Tableau Visionary emphasizes perceptual accuracy with balanced categorical color distribution.',
    };
  }

  // 5. High-velocity temporal datasets -> Cosmic Aurora
  if (hasTemporal && profileList.length > 5) {
    return {
      themeId: 'gradient',
      reason: 'Multi-variable trend dataset identified. Cosmic Aurora provides vibrant visual depth and illuminated charts for complex time-series tracking.',
    };
  }

  // Default fallback -> Stripe Minimalist
  return {
    themeId: 'modern',
    reason: 'Universal business tabular dataset. Stripe Minimalist delivers high-trust corporate typography, clean white backgrounds, and crisp royal blue accents.',
  };
}
