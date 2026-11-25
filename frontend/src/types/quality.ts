export type IssueSeverity = 'critical' | 'warning' | 'info';

export type IssueCategory =
  | 'missing_values'
  | 'duplicate_rows'
  | 'duplicate_identifiers'
  | 'inconsistent_dates'
  | 'numeric_as_text'
  | 'currency_as_text'
  | 'percentage_as_text'
  | 'whitespace_anomalies'
  | 'capitalization_inconsistency'
  | 'outliers'
  | 'constant_column'
  | 'excessive_missing'
  | 'negative_in_positive_field'
  | 'mixed_data_types';

export type TransformationActionType =
  | 'remove_rows'
  | 'fill_missing_value'
  | 'fill_missing_mean'
  | 'fill_missing_median'
  | 'fill_missing_mode'
  | 'standardize_date'
  | 'clean_numeric'
  | 'standardize_percentage'
  | 'deduplicate_keep_first'
  | 'deduplicate_keep_last'
  | 'normalize_capitalization'
  | 'trim_whitespace'
  | 'cap_outliers_iqr'
  | 'remove_outlier_rows'
  | 'drop_column'
  | 'leave_unchanged';

export interface QualityIssue {
  id: string;
  category: IssueCategory;
  name: string;
  affectedColumn?: string;
  affectedRowCount: number;
  affectedRowIndices: number[];
  affectedPercentage: number;
  sampleProblemValues: any[];
  severity: IssueSeverity;
  recommendedSolution: string;
  supportedActions: {
    action: TransformationActionType;
    label: string;
    description: string;
  }[];
  selectedAction: TransformationActionType;
  actionParams?: {
    customFillValue?: string;
    casingStyle?: 'Title Case' | 'UPPERCASE' | 'lowercase';
    outlierBounds?: { lower: number; upper: number };
  };
  status: 'pending' | 'applied' | 'skipped';
}

export interface ScoreDeduction {
  rule: string;
  pointsDeducted: number;
  reason: string;
}

export interface QualityAuditResult {
  score: number; // 0 to 100
  scoreGrade: 'Excellent' | 'Good' | 'Needs Improvement' | 'Poor';
  totalIssues: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  issues: QualityIssue[];
  deductions: ScoreDeduction[];
  auditedAt: string;
}

export interface DiffRow {
  rowIndex: number;
  columnName?: string;
  beforeValue: any;
  afterValue: any;
  changeType: 'modified' | 'deleted' | 'imputed';
}

export interface TransformationRecord {
  id: string;
  timestamp: string;
  issueId: string;
  issueName: string;
  columnAffected?: string;
  actionType: TransformationActionType;
  actionLabel: string;
  rowsAffected: number;
  summary: string;
  diffSample: DiffRow[];
}
