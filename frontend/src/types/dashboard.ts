export type ThemeId = 
  | 'modern'       // Stripe Atlas / Modern SaaS (clean porcelain white, royal blue accents)
  | 'dark'         // Cyber Obsidian / Dark Analytics (deep space charcoal, neon indigo/cyan glow)
  | 'powerbi'      // Power BI Fabric (enterprise slate header, gold & cobalt BI palette)
  | 'tableau'      // Tableau Horizon (neutral canvas, iconic 10-color balanced visualization)
  | 'executive'    // Emerald Prestige (luxury deep emerald slate, gold/teal C-suite hierarchy)
  | 'gradient'     // Cosmic Aurora (vibrant violet-to-cyan gradient mesh with glowing cards)
  | 'cyberpunk'    // Tokyo Synthwave (ultra-dark obsidian with glowing fuchsia & neon yellow)
  | 'custom';      // Custom Studio (personalized branding & palette)

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  description: string;
  badge: string;
  category: string;
  isDark: boolean;
  backgroundClass: string;
  cardClass: string;
  borderClass: string;
  headerClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
  accentClass: string;
  glowClass: string;
  chartPalette: string[];
  kpiAccent: string;
  gradientStop: string;
}

export type AggregationType = 'sum' | 'avg' | 'count' | 'count_distinct' | 'min' | 'max';

export interface KPISpec {
  id: string;
  title: string;
  column: string;
  aggregation: AggregationType;
  format: 'currency' | 'number' | 'compact' | 'percentage';
  prefix?: string;
  suffix?: string;
  calculatedValue: number;
  formattedValue: string;
  subtitle?: string;
  sparkline?: number[];
  changePercentage?: number;
  benchmarkValue?: string;
}

export type ChartType = 
  | 'bar' 
  | 'horizontal_bar' 
  | 'line' 
  | 'area' 
  | 'donut' 
  | 'scatter' 
  | 'histogram';

export interface ChartDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
  percentage?: number;
  color?: string;
}

export interface ChartSpec {
  id: string;
  title: string;
  subtitle: string;
  type: ChartType;
  dimensionColumn: string;
  measureColumn: string;
  secondaryMeasureColumn?: string;
  aggregation: AggregationType;
  sortBy?: 'value_desc' | 'value_asc' | 'label_asc';
  topN?: number;
  gridSpan?: 'full' | 'half' | 'third' | 'two-thirds';
  data: ChartDataPoint[];
}

export interface DashboardLayout {
  themeId: ThemeId;
  kpis: KPISpec[];
  charts: ChartSpec[];
  generatedAt: string;
}

export interface SavedDashboardTemplate {
  id: string;
  name: string;
  savedAt: string;
  themeId: ThemeId;
  kpis: KPISpec[];
  charts: ChartSpec[];
}
