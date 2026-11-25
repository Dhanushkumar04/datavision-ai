import { ParsedDataset, ColumnProfile } from '../types/dataset';
import { QualityIssue, QualityAuditResult, ScoreDeduction } from '../types/quality';
import { cleanNumericValue, isValidDateString } from './schemaDetection';

/**
 * Audits dataset quality and generates transparent rule-based score & issues
 */
export function auditDatasetQuality(
  dataset: ParsedDataset,
  profiles: Record<string, ColumnProfile>
): QualityAuditResult {
  const issues: QualityIssue[] = [];
  const deductions: ScoreDeduction[] = [];
  const rows = dataset.data;
  const n = rows.length;

  if (n === 0) {
    return {
      score: 100,
      scoreGrade: 'Excellent',
      totalIssues: 0,
      criticalCount: 0,
      warningCount: 0,
      infoCount: 0,
      issues: [],
      deductions: [],
      auditedAt: new Date().toISOString(),
    };
  }

  // 1. DUPLICATE ROWS CHECK
  const rowHashIndex = new Map<string, number[]>();
  rows.forEach((row, idx) => {
    const hash = JSON.stringify(row);
    const existing = rowHashIndex.get(hash) || [];
    existing.push(idx);
    rowHashIndex.set(hash, existing);
  });

  const duplicateRowIndices: number[] = [];
  for (const indices of rowHashIndex.values()) {
    if (indices.length > 1) {
      // All occurrences after the first are duplicates
      duplicateRowIndices.push(...indices.slice(1));
    }
  }

  if (duplicateRowIndices.length > 0) {
    const dupCount = duplicateRowIndices.length;
    const dupPct = Number(((dupCount / n) * 100).toFixed(1));
    const points = Math.min(15, Math.ceil(dupPct * 1.5));

    deductions.push({
      rule: 'Duplicate Records Penalty',
      pointsDeducted: points,
      reason: `${dupCount} duplicate rows (${dupPct}% of dataset)`,
    });

    issues.push({
      id: 'issue-duplicate-rows',
      category: 'duplicate_rows',
      name: 'Duplicate Rows Detected',
      affectedRowCount: dupCount,
      affectedRowIndices: duplicateRowIndices,
      affectedPercentage: dupPct,
      sampleProblemValues: [`${dupCount} identical record rows`],
      severity: dupPct > 10 ? 'critical' : 'warning',
      recommendedSolution: 'Remove completely duplicate rows or keep the first occurrence.',
      supportedActions: [
        { action: 'deduplicate_keep_first', label: 'Keep First Occurrence', description: 'Removes all duplicate copies, keeping the first row.' },
        { action: 'deduplicate_keep_last', label: 'Keep Last Occurrence', description: 'Removes previous duplicates, keeping the most recent copy.' },
        { action: 'leave_unchanged', label: 'Leave Unchanged', description: 'Keep all duplicate rows in the dataset.' },
      ],
      selectedAction: 'deduplicate_keep_first',
      status: 'pending',
    });
  }

  // 2. COLUMN-SPECIFIC QUALITY AUDITS
  for (const header of dataset.rawHeaders) {
    const profile = profiles[header];
    if (!profile) continue;

    const values = rows.map(r => r[header]);

    // A. Missing Values Check
    const missingIndices: number[] = [];
    values.forEach((v, idx) => {
      if (v === null || v === undefined || String(v).trim() === '') {
        missingIndices.push(idx);
      }
    });

    if (missingIndices.length > 0) {
      const count = missingIndices.length;
      const pct = Number(((count / n) * 100).toFixed(1));
      const isExcessive = pct >= 40;
      const severity = isExcessive ? 'critical' : pct > 10 ? 'warning' : 'info';
      const points = isExcessive ? 10 : Math.min(8, Math.ceil(pct / 5));

      deductions.push({
        rule: `Missing Values in ${header}`,
        pointsDeducted: points,
        reason: `${count} missing values (${pct}%) in "${header}"`,
      });

      const isNumeric = ['numerical', 'currency', 'percentage'].includes(profile.effectiveType);

      const supportedActions: QualityIssue['supportedActions'] = [
        { action: 'remove_rows', label: 'Remove Affected Rows', description: 'Deletes rows where this value is blank.' },
      ];

      if (isNumeric) {
        supportedActions.push(
          { action: 'fill_missing_mean', label: 'Impute with Mean', description: `Replace blanks with column average (${profile.numericalStats?.mean || 0}).` },
          { action: 'fill_missing_median', label: 'Impute with Median', description: `Replace blanks with column median (${profile.numericalStats?.median || 0}).` }
        );
      } else {
        supportedActions.push(
          { action: 'fill_missing_value', label: 'Replace with "Unknown"', description: 'Fills all blank cells with the text "Unknown".' }
        );
      }

      if (isExcessive) {
        supportedActions.push({ action: 'drop_column', label: 'Drop Entire Column', description: 'Remove column because over 40% of its data is missing.' });
      }

      supportedActions.push({ action: 'leave_unchanged', label: 'Leave Unchanged', description: 'Keep blank cells as-is.' });

      issues.push({
        id: `issue-missing-${header}`,
        category: isExcessive ? 'excessive_missing' : 'missing_values',
        name: isExcessive ? `Excessive Missing Values in ${header}` : `Missing Values in ${header}`,
        affectedColumn: header,
        affectedRowCount: count,
        affectedRowIndices: missingIndices,
        affectedPercentage: pct,
        sampleProblemValues: ['[Empty Cell]', 'null', '""'],
        severity,
        recommendedSolution: isNumeric
          ? 'Impute missing values with column mean/median or remove affected rows.'
          : 'Replace missing text with "Unknown" or remove affected rows.',
        supportedActions,
        selectedAction: isNumeric ? 'fill_missing_median' : 'fill_missing_value',
        actionParams: {
          customFillValue: isNumeric ? String(profile.numericalStats?.median || 0) : 'Unknown',
        },
        status: 'pending',
      });
    }

    // B. Duplicate Primary Identifiers Check
    // IMPORTANT: Only evaluate suspected PRIMARY KEYS (identifier columns with high uniqueness >= 85%).
    // Foreign keys with low uniqueness (e.g. customer_id, product_id) are categorical dimensions and MUST NOT be flagged as errors!
    if (profile.effectiveType === 'identifier' && profile.uniquePercentage >= 85) {
      const idFreq = new Map<string, number[]>();
      values.forEach((v, idx) => {
        if (v !== null && v !== undefined && String(v).trim() !== '') {
          const str = String(v).trim();
          const list = idFreq.get(str) || [];
          list.push(idx);
          idFreq.set(str, list);
        }
      });

      const duplicateIdIndices: number[] = [];
      const dupIdSamples: string[] = [];

      for (const [idStr, list] of idFreq.entries()) {
        if (list.length > 1) {
          duplicateIdIndices.push(...list.slice(1));
          if (dupIdSamples.length < 5) dupIdSamples.push(`${idStr} (${list.length}x)`);
        }
      }

      const dupIdCount = duplicateIdIndices.length;
      const dupIdPct = Number(((dupIdCount / n) * 100).toFixed(1));

      // Only flag if there are rare accidental duplicate collisions in the primary key (< 15% duplicate collisions)
      if (dupIdCount > 0 && dupIdPct < 15) {
        deductions.push({
          rule: `Duplicate Primary Key in ${header}`,
          pointsDeducted: Math.min(10, Math.ceil(dupIdCount * 2)),
          reason: `${dupIdCount} rows contain duplicate IDs in primary record identifier "${header}"`,
        });

        issues.push({
          id: `issue-dupid-${header}`,
          category: 'duplicate_identifiers',
          name: `Duplicate Primary Keys in ${header}`,
          affectedColumn: header,
          affectedRowCount: dupIdCount,
          affectedRowIndices: duplicateIdIndices,
          affectedPercentage: dupIdPct,
          sampleProblemValues: dupIdSamples,
          severity: 'warning',
          recommendedSolution: 'Primary key contains duplicate values. Review these records before deduplicating.',
          supportedActions: [
            { action: 'leave_unchanged', label: 'Leave Unchanged (Recommended)', description: 'Do not automatically delete records.' },
            { action: 'deduplicate_keep_first', label: 'Keep First ID Occurrence', description: 'Removes rows with repeated identifier values.' },
          ],
          selectedAction: 'leave_unchanged',
          status: 'pending',
        });
      }
    }

    // C. Currency / Percentage Stored as String with Symbols
    if (profile.effectiveType === 'currency') {
      const textCurrencyIndices: number[] = [];
      const textSamples: string[] = [];

      values.forEach((v, idx) => {
        if (v !== null && v !== undefined && typeof v === 'string') {
          if (/[$€£₹¥,]/.test(v)) {
            textCurrencyIndices.push(idx);
            if (textSamples.length < 4) textSamples.push(v);
          }
        }
      });

      if (textCurrencyIndices.length > 0) {
        const count = textCurrencyIndices.length;
        const pct = Number(((count / n) * 100).toFixed(1));

        deductions.push({
          rule: `Currency Format in ${header}`,
          pointsDeducted: 3,
          reason: `${count} values stored with currency symbols or commas`,
        });

        issues.push({
          id: `issue-currency-${header}`,
          category: 'currency_as_text',
          name: `Currency Symbols Stored in ${header}`,
          affectedColumn: header,
          affectedRowCount: count,
          affectedRowIndices: textCurrencyIndices,
          affectedPercentage: pct,
          sampleProblemValues: textSamples,
          severity: 'info',
          recommendedSolution: 'Strip symbols (e.g. $, €) and commas so numbers can be aggregated and charted.',
          supportedActions: [
            { action: 'clean_numeric', label: 'Convert to Numeric Float', description: 'Removes currency symbols and parses clean numeric floats.' },
            { action: 'leave_unchanged', label: 'Keep Raw Strings', description: 'Leave currency symbols intact.' },
          ],
          selectedAction: 'clean_numeric',
          status: 'pending',
        });
      }
    }

    if (profile.effectiveType === 'percentage') {
      const textPercentIndices: number[] = [];
      const percentSamples: string[] = [];

      values.forEach((v, idx) => {
        if (v !== null && v !== undefined && typeof v === 'string' && String(v).includes('%')) {
          textPercentIndices.push(idx);
          if (percentSamples.length < 4) percentSamples.push(String(v));
        }
      });

      if (textPercentIndices.length > 0) {
        const count = textPercentIndices.length;
        const pct = Number(((count / n) * 100).toFixed(1));

        issues.push({
          id: `issue-percent-${header}`,
          category: 'percentage_as_text',
          name: `Percentage String Formatting in ${header}`,
          affectedColumn: header,
          affectedRowCount: count,
          affectedRowIndices: textPercentIndices,
          affectedPercentage: pct,
          sampleProblemValues: percentSamples,
          severity: 'info',
          recommendedSolution: 'Standardize percentage values to numeric (e.g. 5% -> 5).',
          supportedActions: [
            { action: 'standardize_percentage', label: 'Standardize to Numeric (e.g. 5% -> 5)', description: 'Strips "%" and converts to clean numeric values.' },
            { action: 'leave_unchanged', label: 'Keep Raw Strings', description: 'Keep values as strings with "%".' },
          ],
          selectedAction: 'standardize_percentage',
          status: 'pending',
        });
      }
    }

    // D. Inconsistent Capitalization (e.g. Bangalore, bangalore, BANGALORE)
    if (['categorical', 'geographic'].includes(profile.effectiveType)) {
      const caseMap = new Map<string, Set<string>>();
      values.forEach((v) => {
        if (v !== null && v !== undefined && String(v).trim() !== '') {
          const raw = String(v).trim();
          const lower = raw.toLowerCase();
          const set = caseMap.get(lower) || new Set<string>();
          set.add(raw);
          caseMap.set(lower, set);
        }
      });

      const inconsistentGroups: string[] = [];
      const affectedIndices: number[] = [];

      for (const [, variants] of caseMap.entries()) {
        if (variants.size > 1) {
          inconsistentGroups.push(Array.from(variants).join(' / '));
        }
      }

      if (inconsistentGroups.length > 0) {
        // Collect rows matching these inconsistent categories
        values.forEach((v, idx) => {
          if (v !== null && v !== undefined) {
            const raw = String(v).trim();
            const lower = raw.toLowerCase();
            const set = caseMap.get(lower);
            if (set && set.size > 1) {
              affectedIndices.push(idx);
            }
          }
        });

        const count = affectedIndices.length;
        const pct = Number(((count / n) * 100).toFixed(1));

        deductions.push({
          rule: `Casing Inconsistencies in ${header}`,
          pointsDeducted: 3,
          reason: `Mixed capitalization variants in "${header}" (e.g. ${inconsistentGroups.slice(0, 2).join(', ')})`,
        });

        issues.push({
          id: `issue-case-${header}`,
          category: 'capitalization_inconsistency',
          name: `Inconsistent Capitalization in ${header}`,
          affectedColumn: header,
          affectedRowCount: count,
          affectedRowIndices: affectedIndices,
          affectedPercentage: pct,
          sampleProblemValues: inconsistentGroups.slice(0, 4),
          severity: 'warning',
          recommendedSolution: 'Normalize category capitalization to Title Case so slices and charts do not split duplicate bars.',
          supportedActions: [
            { action: 'normalize_capitalization', label: 'Normalize to Title Case', description: 'Converts "bangalore" and "BANGALORE" to "Bangalore".' },
            { action: 'leave_unchanged', label: 'Leave Original Casing', description: 'Do not modify categorical capitalization.' },
          ],
          selectedAction: 'normalize_capitalization',
          actionParams: { casingStyle: 'Title Case' },
          status: 'pending',
        });
      }
    }

    // E. Leading/Trailing Whitespace
    const whitespaceIndices: number[] = [];
    const whitespaceSamples: string[] = [];

    values.forEach((v, idx) => {
      if (typeof v === 'string') {
        if (v.trim() !== v) {
          whitespaceIndices.push(idx);
          if (whitespaceSamples.length < 4) whitespaceSamples.push(`"${v}"`);
        }
      }
    });

    if (whitespaceIndices.length > 0) {
      const count = whitespaceIndices.length;
      const pct = Number(((count / n) * 100).toFixed(1));

      issues.push({
        id: `issue-whitespace-${header}`,
        category: 'whitespace_anomalies',
        name: `Whitespace Anomalies in ${header}`,
        affectedColumn: header,
        affectedRowCount: count,
        affectedRowIndices: whitespaceIndices,
        affectedPercentage: pct,
        sampleProblemValues: whitespaceSamples,
        severity: 'info',
        recommendedSolution: 'Trim leading and trailing whitespace to prevent phantom duplicate filters.',
        supportedActions: [
          { action: 'trim_whitespace', label: 'Trim Whitespace', description: 'Removes leading and trailing spaces from all values in this column.' },
          { action: 'leave_unchanged', label: 'Leave Unchanged', description: 'Keep existing spaces.' },
        ],
        selectedAction: 'trim_whitespace',
        status: 'pending',
      });
    }

    // F. Inconsistent Date Formats & Invalid Dates
    if (profile.effectiveType === 'datetime') {
      const invalidDateIndices: number[] = [];
      const invalidSamples: string[] = [];

      values.forEach((v, idx) => {
        if (v !== null && v !== undefined && String(v).trim() !== '') {
          const str = String(v).trim();
          if (!isValidDateString(str)) {
            invalidDateIndices.push(idx);
            if (invalidSamples.length < 4) invalidSamples.push(str);
          }
        }
      });

      if (invalidDateIndices.length > 0) {
        const count = invalidDateIndices.length;
        const pct = Number(((count / n) * 100).toFixed(1));

        deductions.push({
          rule: `Invalid Dates in ${header}`,
          pointsDeducted: 6,
          reason: `${count} non-date values in date column "${header}"`,
        });

        issues.push({
          id: `issue-date-${header}`,
          category: 'inconsistent_dates',
          name: `Inconsistent Dates in ${header}`,
          affectedColumn: header,
          affectedRowCount: count,
          affectedRowIndices: invalidDateIndices,
          affectedPercentage: pct,
          sampleProblemValues: invalidSamples,
          severity: 'warning',
          recommendedSolution: 'Standardize dates to ISO format (YYYY-MM-DD) or remove invalid entries.',
          supportedActions: [
            { action: 'standardize_date', label: 'Standardize Dates to YYYY-MM-DD', description: 'Converts recognized dates to consistent ISO format; clears unparseable entries.' },
            { action: 'remove_rows', label: 'Remove Invalid Date Rows', description: 'Delete rows with corrupted dates.' },
            { action: 'leave_unchanged', label: 'Leave Unchanged', description: 'Do not modify date strings.' },
          ],
          selectedAction: 'standardize_date',
          status: 'pending',
        });
      }
    }

    // G. Outliers Check (Numerical IQR method)
    if (profile.numericalStats && profile.numericalStats.outliers.count > 0) {
      const outliers = profile.numericalStats.outliers;
      const lower = outliers.lowerBound;
      const upper = outliers.upperBound;

      const outlierRowIndices: number[] = [];
      values.forEach((v, idx) => {
        const num = cleanNumericValue(v);
        if (num !== null && (num < lower || num > upper)) {
          outlierRowIndices.push(idx);
        }
      });

      if (outlierRowIndices.length > 0) {
        issues.push({
          id: `issue-outlier-${header}`,
          category: 'outliers',
          name: `Statistical Outliers in ${header}`,
          affectedColumn: header,
          affectedRowCount: outlierRowIndices.length,
          affectedRowIndices: outlierRowIndices,
          affectedPercentage: outliers.percentage,
          sampleProblemValues: outliers.sampleOutliers.map(String),
          severity: 'info',
          recommendedSolution: `Values fall outside Tukey IQR boundaries [${lower}, ${upper}]. Choose whether to keep, cap (Winsorize), or remove.`,
          supportedActions: [
            { action: 'leave_unchanged', label: 'Keep Original Values (Recommended)', description: 'Preserve authentic business outliers without altering data.' },
            { action: 'cap_outliers_iqr', label: 'Cap Values at Bounds', description: `Cap extreme values to [${lower}, ${upper}].` },
            { action: 'remove_outlier_rows', label: 'Remove Outlier Records', description: 'Delete rows containing these extreme values.' },
          ],
          selectedAction: 'leave_unchanged',
          actionParams: {
            outlierBounds: { lower, upper },
          },
          status: 'pending',
        });
      }
    }

    // H. Constant Column Check (Zero variance)
    if (profile.uniqueCount === 1 && n > 5) {
      deductions.push({
        rule: `Constant Column: ${header}`,
        pointsDeducted: 2,
        reason: `All rows have the exact same value in "${header}"`,
      });

      issues.push({
        id: `issue-constant-${header}`,
        category: 'constant_column',
        name: `Constant Column ${header}`,
        affectedColumn: header,
        affectedRowCount: n,
        affectedRowIndices: Array.from({ length: n }, (_, i) => i),
        affectedPercentage: 100,
        sampleProblemValues: [String(values[0])],
        severity: 'info',
        recommendedSolution: 'Column has zero variance and provides no analytical value.',
        supportedActions: [
          { action: 'drop_column', label: 'Drop Column', description: 'Remove column from the dataset.' },
          { action: 'leave_unchanged', label: 'Leave Unchanged', description: 'Keep constant column.' },
        ],
        selectedAction: 'leave_unchanged',
        status: 'pending',
      });
    }
  }

  // Calculate Overall Quality Score: 100 - sum(deductions)
  const totalDeductions = deductions.reduce((acc, d) => acc + d.pointsDeducted, 0);
  const score = Math.max(0, Math.min(100, 100 - totalDeductions));

  const scoreGrade = score >= 90 ? 'Excellent' : score >= 75 ? 'Good' : score >= 50 ? 'Needs Improvement' : 'Poor';

  const criticalCount = issues.filter(i => i.severity === 'critical').length;
  const warningCount = issues.filter(i => i.severity === 'warning').length;
  const infoCount = issues.filter(i => i.severity === 'info').length;

  return {
    score,
    scoreGrade,
    totalIssues: issues.length,
    criticalCount,
    warningCount,
    infoCount,
    issues,
    deductions,
    auditedAt: new Date().toISOString(),
  };
}
