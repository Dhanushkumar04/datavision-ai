import { ParsedDataset, RawRecord } from '../types/dataset';
import { QualityIssue, TransformationActionType, TransformationRecord, DiffRow } from '../types/quality';
import { cleanNumericValue, isValidDateString } from './schemaDetection';

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

/**
 * Executes a single transformation on a dataset immutably
 */
export function executeTransformation(
  currentDataset: ParsedDataset,
  issue: QualityIssue,
  actionType: TransformationActionType,
  params?: Record<string, any>
): { updatedDataset: ParsedDataset; record: TransformationRecord } {
  const col = issue.affectedColumn;
  let rows: RawRecord[] = currentDataset.data.map(r => ({ ...r }));
  let headers = [...currentDataset.rawHeaders];
  const diffSample: DiffRow[] = [];
  let summary = '';
  let rowsAffected = 0;

  switch (actionType) {
    case 'deduplicate_keep_first': {
      const seen = new Set<string>();
      const deduplicated: RawRecord[] = [];
      const isIdentifierCol = col && issue.category === 'duplicate_identifiers';

      rows.forEach((row, idx) => {
        const key = isIdentifierCol ? String(row[col] || '').trim().toLowerCase() : JSON.stringify(row);
        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(row);
        } else {
          rowsAffected++;
          if (diffSample.length < 5) {
            diffSample.push({
              rowIndex: idx + 1,
              columnName: col || 'All Columns',
              beforeValue: isIdentifierCol ? row[col] : 'Duplicate Row',
              afterValue: '[Removed]',
              changeType: 'deleted',
            });
          }
        }
      });

      rows = deduplicated;
      summary = `Removed ${rowsAffected} duplicate record(s).`;
      break;
    }

    case 'deduplicate_keep_last': {
      const seen = new Set<string>();
      const deduplicated: RawRecord[] = [];
      const reversed = [...rows].reverse();
      const isIdentifierCol = col && issue.category === 'duplicate_identifiers';

      reversed.forEach((row, idx) => {
        const key = isIdentifierCol ? String(row[col] || '').trim().toLowerCase() : JSON.stringify(row);
        if (!seen.has(key)) {
          seen.add(key);
          deduplicated.push(row);
        } else {
          rowsAffected++;
          if (diffSample.length < 5) {
            diffSample.push({
              rowIndex: rows.length - idx,
              columnName: col || 'All Columns',
              beforeValue: isIdentifierCol ? row[col] : 'Duplicate Row',
              afterValue: '[Removed]',
              changeType: 'deleted',
            });
          }
        }
      });

      rows = deduplicated.reverse();
      summary = `Deduplicated records (kept latest occurrence, removed ${rowsAffected} duplicates).`;
      break;
    }

    case 'remove_rows': {
      if (col) {
        const kept: RawRecord[] = [];
        rows.forEach((row, idx) => {
          const val = row[col];
          const isBlank = val === null || val === undefined || String(val).trim() === '';
          if (isBlank) {
            rowsAffected++;
            if (diffSample.length < 5) {
              diffSample.push({
                rowIndex: idx + 1,
                columnName: col,
                beforeValue: val ?? '[Blank]',
                afterValue: '[Row Deleted]',
                changeType: 'deleted',
              });
            }
          } else {
            kept.push(row);
          }
        });
        rows = kept;
        summary = `Removed ${rowsAffected} row(s) with missing values in "${col}".`;
      }
      break;
    }

    case 'fill_missing_value': {
      if (col) {
        const fillVal = params?.customFillValue ?? issue.actionParams?.customFillValue ?? 'Unknown';
        rows.forEach((row, idx) => {
          const val = row[col];
          if (val === null || val === undefined || String(val).trim() === '') {
            rowsAffected++;
            if (diffSample.length < 5) {
              diffSample.push({
                rowIndex: idx + 1,
                columnName: col,
                beforeValue: val ?? '[Blank]',
                afterValue: fillVal,
                changeType: 'imputed',
              });
            }
            row[col] = fillVal;
          }
        });
        summary = `Imputed ${rowsAffected} missing cell(s) in "${col}" with "${fillVal}".`;
      }
      break;
    }

    case 'fill_missing_mean':
    case 'fill_missing_median': {
      if (col) {
        const fillVal = params?.customFillValue ?? issue.actionParams?.customFillValue ?? '0';
        const numVal = parseFloat(fillVal) || 0;
        rows.forEach((row, idx) => {
          const val = row[col];
          if (val === null || val === undefined || String(val).trim() === '') {
            rowsAffected++;
            if (diffSample.length < 5) {
              diffSample.push({
                rowIndex: idx + 1,
                columnName: col,
                beforeValue: val ?? '[Blank]',
                afterValue: numVal,
                changeType: 'imputed',
              });
            }
            row[col] = numVal;
          }
        });
        summary = `Imputed ${rowsAffected} missing cell(s) in "${col}" with statistical value (${numVal}).`;
      }
      break;
    }

    case 'clean_numeric': {
      if (col) {
        rows.forEach((row, idx) => {
          const raw = row[col];
          const cleanNum = cleanNumericValue(raw);
          if (cleanNum !== null && cleanNum !== raw) {
            rowsAffected++;
            if (diffSample.length < 5) {
              diffSample.push({
                rowIndex: idx + 1,
                columnName: col,
                beforeValue: raw,
                afterValue: cleanNum,
                changeType: 'modified',
              });
            }
            row[col] = cleanNum;
          }
        });
        summary = `Cleaned and parsed numeric values in "${col}" (${rowsAffected} rows standardized).`;
      }
      break;
    }

    case 'standardize_percentage': {
      if (col) {
        rows.forEach((row, idx) => {
          const raw = row[col];
          if (typeof raw === 'string' && raw.includes('%')) {
            const num = parseFloat(raw.replace('%', '').trim());
            if (!isNaN(num)) {
              rowsAffected++;
              if (diffSample.length < 5) {
                diffSample.push({
                  rowIndex: idx + 1,
                  columnName: col,
                  beforeValue: raw,
                  afterValue: num,
                  changeType: 'modified',
                });
              }
              row[col] = num;
            }
          }
        });
        summary = `Converted percentage strings in "${col}" to numeric values (${rowsAffected} values).`;
      }
      break;
    }

    case 'standardize_date': {
      if (col) {
        rows.forEach((row, idx) => {
          const raw = row[col];
          if (raw !== null && raw !== undefined && String(raw).trim() !== '') {
            const str = String(raw).trim();
            if (isValidDateString(str)) {
              const ts = Date.parse(str);
              if (!isNaN(ts)) {
                const isoDate = new Date(ts).toISOString().split('T')[0];
                if (isoDate !== str) {
                  rowsAffected++;
                  if (diffSample.length < 5) {
                    diffSample.push({
                      rowIndex: idx + 1,
                      columnName: col,
                      beforeValue: raw,
                      afterValue: isoDate,
                      changeType: 'modified',
                    });
                  }
                  row[col] = isoDate;
                }
              }
            }
          }
        });
        summary = `Standardized date formats to ISO YYYY-MM-DD in "${col}" (${rowsAffected} dates updated).`;
      }
      break;
    }

    case 'normalize_capitalization': {
      if (col) {
        const style = params?.casingStyle ?? issue.actionParams?.casingStyle ?? 'Title Case';
        rows.forEach((row, idx) => {
          const raw = row[col];
          if (typeof raw === 'string') {
            const trimmed = raw.trim();
            let converted = trimmed;
            if (style === 'Title Case') converted = toTitleCase(trimmed);
            else if (style === 'UPPERCASE') converted = trimmed.toUpperCase();
            else if (style === 'lowercase') converted = trimmed.toLowerCase();

            if (converted !== raw) {
              rowsAffected++;
              if (diffSample.length < 5) {
                diffSample.push({
                  rowIndex: idx + 1,
                  columnName: col,
                  beforeValue: raw,
                  afterValue: converted,
                  changeType: 'modified',
                });
              }
              row[col] = converted;
            }
          }
        });
        summary = `Normalized capitalization to ${style} in "${col}" (${rowsAffected} values modified).`;
      }
      break;
    }

    case 'trim_whitespace': {
      if (col) {
        rows.forEach((row, idx) => {
          const raw = row[col];
          if (typeof raw === 'string' && raw.trim() !== raw) {
            rowsAffected++;
            if (diffSample.length < 5) {
              diffSample.push({
                rowIndex: idx + 1,
                columnName: col,
                beforeValue: `"${raw}"`,
                afterValue: `"${raw.trim()}"`,
                changeType: 'modified',
              });
            }
            row[col] = raw.trim();
          }
        });
        summary = `Trimmed whitespace from all cells in "${col}" (${rowsAffected} cells updated).`;
      }
      break;
    }

    case 'cap_outliers_iqr': {
      if (col && issue.actionParams?.outlierBounds) {
        const { lower, upper } = issue.actionParams.outlierBounds;
        rows.forEach((row, idx) => {
          const num = cleanNumericValue(row[col]);
          if (num !== null) {
            let capped = num;
            if (num < lower) capped = lower;
            else if (num > upper) capped = upper;

            if (capped !== num) {
              rowsAffected++;
              if (diffSample.length < 5) {
                diffSample.push({
                  rowIndex: idx + 1,
                  columnName: col,
                  beforeValue: num,
                  afterValue: capped,
                  changeType: 'modified',
                });
              }
              row[col] = capped;
            }
          }
        });
        summary = `Winsorized ${rowsAffected} outlier value(s) in "${col}" to bounds [${lower}, ${upper}].`;
      }
      break;
    }

    case 'remove_outlier_rows': {
      if (col && issue.actionParams?.outlierBounds) {
        const { lower, upper } = issue.actionParams.outlierBounds;
        const kept: RawRecord[] = [];
        rows.forEach((row, idx) => {
          const num = cleanNumericValue(row[col]);
          if (num !== null && (num < lower || num > upper)) {
            rowsAffected++;
            if (diffSample.length < 5) {
              diffSample.push({
                rowIndex: idx + 1,
                columnName: col,
                beforeValue: num,
                afterValue: '[Row Deleted]',
                changeType: 'deleted',
              });
            }
          } else {
            kept.push(row);
          }
        });
        rows = kept;
        summary = `Removed ${rowsAffected} record(s) containing statistical outliers in "${col}".`;
      }
      break;
    }

    case 'drop_column': {
      if (col) {
        headers = headers.filter(h => h !== col);
        rows.forEach((row) => {
          delete row[col];
        });
        rowsAffected = rows.length;
        summary = `Dropped column "${col}" from the dataset.`;
      }
      break;
    }

    case 'leave_unchanged':
    default:
      summary = `Kept original data in "${col || 'dataset'}" unchanged.`;
      break;
  }

  const updatedDataset: ParsedDataset = {
    ...currentDataset,
    rawHeaders: headers,
    data: rows,
    meta: {
      ...currentDataset.meta,
      rowCount: rows.length,
      columnCount: headers.length,
    },
  };

  const actionObj = issue.supportedActions.find(a => a.action === actionType);
  const actionLabel = actionObj ? actionObj.label : actionType;

  const record: TransformationRecord = {
    id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toLocaleTimeString(),
    issueId: issue.id,
    issueName: issue.name,
    columnAffected: col,
    actionType,
    actionLabel,
    rowsAffected,
    summary,
    diffSample,
  };

  return {
    updatedDataset,
    record,
  };
}
