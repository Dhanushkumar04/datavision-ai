import { ParsedDataset, ColumnProfile } from '../types/dataset';

export interface DateFilterConfig {
  column: string;
  startDate?: string;
  endDate?: string;
  preset?: 'all' | 'last_30_days' | 'last_90_days' | 'this_year' | 'last_year';
}

export interface SlicerDimension {
  column: string;
  label: string;
  values: { value: string; count: number }[];
}

/**
 * Normalizes date string into YYYY-MM-DD for comparison
 */
function normalizeDateStr(dateVal: any): string | null {
  if (!dateVal) return null;
  const str = String(dateVal).trim();
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return null;
}

/**
 * Applies all active categorical filters, date range filters, and search query to rows
 */
export function applyGlobalFilters(
  rows: Record<string, any>[],
  activeFilters: Record<string, string>,
  dateFilter?: DateFilterConfig | null,
  searchQuery?: string
): Record<string, any>[] {
  if (!rows || rows.length === 0) return [];

  const filterEntries = Object.entries(activeFilters).filter(([_, val]) => val && val !== 'all');
  const hasFilters = filterEntries.length > 0;
  const hasDateFilter = dateFilter && (dateFilter.startDate || dateFilter.endDate || (dateFilter.preset && dateFilter.preset !== 'all'));
  const hasSearch = searchQuery && searchQuery.trim().length > 0;

  if (!hasFilters && !hasDateFilter && !hasSearch) {
    return rows;
  }

  const queryLower = searchQuery ? searchQuery.trim().toLowerCase() : '';

  return rows.filter((row) => {
    // 1. Categorical dimension filters
    for (const [col, targetVal] of filterEntries) {
      const rowVal = String(row[col] ?? '').trim();
      if (rowVal.toLowerCase() !== targetVal.toLowerCase()) {
        return false;
      }
    }

    // 2. Date range filter
    if (hasDateFilter && dateFilter) {
      const rowDateStr = normalizeDateStr(row[dateFilter.column]);
      if (rowDateStr) {
        if (dateFilter.startDate && rowDateStr < dateFilter.startDate) {
          return false;
        }
        if (dateFilter.endDate && rowDateStr > dateFilter.endDate) {
          return false;
        }
      }
    }

    // 3. Global text search across all columns in row
    if (hasSearch) {
      const rowText = Object.values(row).map(v => String(v ?? '')).join(' ').toLowerCase();
      if (!rowText.includes(queryLower)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Extracts categorical dimensions with their distinct values and frequencies for slicers
 */
export function extractSlicerDimensions(
  dataset: ParsedDataset,
  profiles: Record<string, ColumnProfile>
): { dimensions: SlicerDimension[]; dateColumns: string[] } {
  const dimensions: SlicerDimension[] = [];
  const dateColumns: string[] = [];

  for (const [colName, profile] of Object.entries(profiles)) {
    if (profile.effectiveType === 'datetime') {
      dateColumns.push(colName);
    } else if (['categorical', 'geographic'].includes(profile.effectiveType) && profile.uniqueCount >= 2 && profile.uniqueCount <= 30) {
      // Count frequency of each unique value
      const countMap = new Map<string, number>();
      for (const row of dataset.data) {
        const val = String(row[colName] ?? '').trim();
        if (val) {
          countMap.set(val, (countMap.get(val) || 0) + 1);
        }
      }

      const values = Array.from(countMap.entries())
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 15);

      const label = colName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      dimensions.push({
        column: colName,
        label,
        values,
      });
    }
  }

  return { dimensions, dateColumns };
}

/**
 * Finds the earliest and latest date in a dataset column
 */
export function getDateExtents(rows: Record<string, any>[], dateCol: string): { minDate: string; maxDate: string } {
  let minDate = '9999-12-31';
  let maxDate = '0000-01-01';

  for (const row of rows) {
    const dStr = normalizeDateStr(row[dateCol]);
    if (dStr) {
      if (dStr < minDate) minDate = dStr;
      if (dStr > maxDate) maxDate = dStr;
    }
  }

  if (minDate === '9999-12-31') minDate = '';
  if (maxDate === '0000-01-01') maxDate = '';

  return { minDate, maxDate };
}
