export type WorkflowStepId = 
  | 'upload'            // Step 1: Upload Dataset
  | 'analysis'          // Step 2: Automatic Dataset Analysis
  | 'quality'           // Step 3: Data Quality Assessment
  | 'recommendations'   // Step 4: Recommended Data Transformations
  | 'transformation'    // Step 5: Data Cleaning and Transformation
  | 'preview'           // Step 6: Data Preview and Validation
  | 'load'              // Step 7: Load Cleaned Dataset
  | 'theme'             // Step 8: Select Dashboard Theme
  | 'dashboard'         // Step 9: Automatically Generate Dashboard
  | 'explore'           // Step 10: Interactive Analysis and Filtering
  | 'export';           // Step 11: Export Dashboard and Reports

export interface WorkflowStep {
  stepNumber: number;
  id: WorkflowStepId;
  label: string;
  description: string;
}

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { stepNumber: 1, id: 'upload', label: 'Upload Dataset', description: 'Upload CSV or Excel files' },
  { stepNumber: 2, id: 'analysis', label: 'Auto Analysis', description: 'Schema & statistical profiling' },
  { stepNumber: 3, id: 'quality', label: 'Data Quality', description: 'Audit issues & quality score' },
  { stepNumber: 4, id: 'recommendations', label: 'Transform Recipes', description: 'AI-recommended fixes' },
  { stepNumber: 5, id: 'transformation', label: 'Transform Data', description: 'Clean & standardize' },
  { stepNumber: 6, id: 'preview', label: 'Data Preview', description: 'Inspect & validate changes' },
  { stepNumber: 7, id: 'load', label: 'Load Dataset', description: 'Commit to analytics engine' },
  { stepNumber: 8, id: 'theme', label: 'Select Theme', description: 'Choose visual design palette' },
  { stepNumber: 9, id: 'dashboard', label: 'Generate BI', description: 'Build dynamic dashboard' },
  { stepNumber: 10, id: 'explore', label: 'Cross-Filter', description: 'Interact, slice & drill-down' },
  { stepNumber: 11, id: 'export', label: 'Export Reports', description: 'PDF, CSV, PNG reporting' },
];

export type NavigationSection = 
  | 'overview'
  | 'upload'
  | 'profile'
  | 'quality'
  | 'transform'
  | 'preview'
  | 'dashboard'
  | 'insights'
  | 'reports'
  | 'settings';

export type SemanticType =
  | 'numerical'
  | 'categorical'
  | 'datetime'
  | 'boolean'
  | 'identifier'
  | 'currency'
  | 'percentage'
  | 'geographic'
  | 'text'
  | 'other';

export const SEMANTIC_TYPE_LABELS: Record<SemanticType, { label: string; badge: string; icon: string }> = {
  numerical: { label: 'Numerical', badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800', icon: '#' },
  categorical: { label: 'Categorical', badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800', icon: 'Abc' },
  datetime: { label: 'Date & Time', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800', icon: '📅' },
  boolean: { label: 'Boolean', badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800', icon: '✓/✗' },
  identifier: { label: 'Identifier', badge: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700', icon: 'ID' },
  currency: { label: 'Currency', badge: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/60 dark:text-green-300 dark:border-green-800', icon: '$' },
  percentage: { label: 'Percentage', badge: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-800', icon: '%' },
  geographic: { label: 'Geographic', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800', icon: '📍' },
  text: { label: 'Text', badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800', icon: '¶' },
  other: { label: 'Other', badge: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700', icon: '?' },
};

export interface NumericalStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: number[];
  stdDev: number;
  variance: number;
  p25: number;
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  iqr: number;
  skewness: number;
  outliers: {
    count: number;
    percentage: number;
    lowerBound: number;
    upperBound: number;
    sampleOutliers: number[];
  };
  histogramBuckets: {
    binIndex: number;
    range: string;
    min: number;
    max: number;
    count: number;
    percentage: number;
  }[];
}

export interface CategoricalStats {
  cardinality: number;
  topValues: { value: string; count: number; percentage: number }[];
  leastValues: { value: string; count: number; percentage: number }[];
  mostFrequent: { value: string; count: number };
  leastFrequent: { value: string; count: number };
}

export interface DateStats {
  earliest: string;
  latest: string;
  rangeDays: number;
  hasTimeComponent: boolean;
  availableDimensions: ('year' | 'quarter' | 'month' | 'week' | 'day')[];
  parsedDatesCount: number;
  invalidDatesCount: number;
}

export interface ColumnProfile {
  name: string;
  detectedType: SemanticType;
  effectiveType: SemanticType;
  isUserOverridden: boolean;
  totalCount: number;
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  uniquePercentage: number;
  sampleValues: any[];
  numericalStats?: NumericalStats;
  categoricalStats?: CategoricalStats;
  dateStats?: DateStats;
}

export interface DatasetOverview {
  totalRows: number;
  totalColumns: number;
  duplicateRows: number;
  duplicateRowsPercentage: number;
  missingCells: number;
  missingCellsPercentage: number;
  memoryUsageBytes: number;
  uniqueRecordCount: number;
  typeCounts: Record<SemanticType, number>;
}

export interface ColumnRelationship {
  type: 'arithmetic' | 'primary_key' | 'hierarchy' | 'correlation';
  sourceColumns: string[];
  targetColumn: string;
  description: string;
  confidence: 'verified' | 'inferred';
  formula?: string;
  metricValue?: number;
}

export interface DatasetAnalysisResult {
  overview: DatasetOverview;
  columnProfiles: Record<string, ColumnProfile>;
  relationships: ColumnRelationship[];
  analyzedAt: string;
}

export interface DatasetMeta {
  name: string;
  sizeBytes: number;
  format: 'csv' | 'xlsx' | 'xls';
  rowCount: number;
  columnCount: number;
  parsedAt: string;
  sheetNames?: string[];
  activeSheet?: string;
  delimiter?: string;
}

export type RawRecord = Record<string, any>;

export interface ParsedDataset {
  meta: DatasetMeta;
  rawHeaders: string[];
  data: RawRecord[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SampleDatasetInfo {
  id: string;
  title: string;
  domain: string;
  description: string;
  rowCount: number;
  columnCount: number;
  path: string;
  badgeColor: string;
  keyColumns: string[];
}
