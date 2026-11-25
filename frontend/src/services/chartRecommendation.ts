import { ParsedDataset, ColumnProfile } from '../types/dataset';
import { ChartSpec, ChartDataPoint, AggregationType } from '../types/dashboard';
import { cleanNumericValue } from './schemaDetection';

/**
 * Executes a GroupBy aggregation on raw dataset rows
 */
export function aggregateByDimension(
  rows: Record<string, any>[],
  dimensionCol: string,
  measureCol: string,
  aggregation: AggregationType,
  topN: number = 8,
  sortBy: 'value_desc' | 'value_asc' | 'label_asc' = 'value_desc'
): ChartDataPoint[] {
  const groupMap = new Map<string, { total: number; count: number }>();

  for (const row of rows) {
    let dimVal = row[dimensionCol];
    if (dimVal === null || dimVal === undefined || String(dimVal).trim() === '') {
      dimVal = 'Unknown';
    } else {
      dimVal = String(dimVal).trim();
    }

    const numVal = cleanNumericValue(row[measureCol]) || 0;
    const existing = groupMap.get(dimVal) || { total: 0, count: 0 };
    existing.total += numVal;
    existing.count += 1;
    groupMap.set(dimVal, existing);
  }

  const result: ChartDataPoint[] = [];
  let grandTotal = 0;

  for (const [label, stats] of groupMap.entries()) {
    let finalVal = 0;
    if (aggregation === 'sum') finalVal = stats.total;
    else if (aggregation === 'avg') finalVal = stats.count > 0 ? stats.total / stats.count : 0;
    else if (aggregation === 'count') finalVal = stats.count;
    else finalVal = stats.total;

    finalVal = Number(finalVal.toFixed(2));
    grandTotal += Math.abs(finalVal);

    result.push({
      label,
      value: finalVal,
    });
  }

  // Calculate percentages
  result.forEach((p) => {
    p.percentage = grandTotal > 0 ? Number(((p.value / grandTotal) * 100).toFixed(1)) : 0;
  });

  // Sort
  if (sortBy === 'value_desc') {
    result.sort((a, b) => b.value - a.value);
  } else if (sortBy === 'value_asc') {
    result.sort((a, b) => a.value - b.value);
  } else if (sortBy === 'label_asc') {
    result.sort((a, b) => a.label.localeCompare(b.label));
  }

  return result.slice(0, topN);
}

/**
 * Aggregates temporal time-series (by Month or Date)
 */
function aggregateTimeSeries(
  rows: Record<string, any>[],
  dateCol: string,
  measureCol: string,
  aggregation: AggregationType
): ChartDataPoint[] {
  const timeMap = new Map<string, { total: number; count: number }>();

  for (const row of rows) {
    const rawDate = row[dateCol];
    if (!rawDate) continue;

    const str = String(rawDate).trim();
    // Normalize date to YYYY-MM if long date, or keep original
    let timeKey = str;
    if (str.length >= 7 && /^\d{4}[-/.]\d{1,2}/.test(str)) {
      timeKey = str.substring(0, 7); // e.g. 2024-05
    }

    const numVal = cleanNumericValue(row[measureCol]) || 0;
    const existing = timeMap.get(timeKey) || { total: 0, count: 0 };
    existing.total += numVal;
    existing.count += 1;
    timeMap.set(timeKey, existing);
  }

  const sortedKeys = Array.from(timeMap.keys()).sort();
  const rawPoints = sortedKeys.map((key) => {
    const stats = timeMap.get(key)!;
    const val = aggregation === 'avg' && stats.count > 0 
      ? Number((stats.total / stats.count).toFixed(2)) 
      : Number(stats.total.toFixed(2));

    return {
      label: key,
      value: val,
    };
  });

  // Keep up to 12 monthly/temporal periods
  return rawPoints.slice(0, 12);
}

/**
 * Builds scatter plot coordinates between two numerical columns
 */
function buildScatterCoordinates(
  rows: Record<string, any>[],
  xCol: string,
  yCol: string,
  sampleSize: number = 35
): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  const step = Math.max(1, Math.floor(rows.length / sampleSize));

  for (let i = 0; i < rows.length; i += step) {
    const row = rows[i];
    const xVal = cleanNumericValue(row[xCol]);
    const yVal = cleanNumericValue(row[yCol]);

    if (xVal !== null && yVal !== null) {
      points.push({
        label: `Sample #${i + 1}`,
        value: xVal,
        secondaryValue: yVal,
      });
    }
  }

  return points;
}

/**
 * Recommends 4 to 6 high-value charts dynamically from dataset schema with intelligent grid layouts
 */
export function recommendCharts(
  dataset: ParsedDataset,
  profiles: Record<string, ColumnProfile>,
  customRows?: Record<string, any>[]
): ChartSpec[] {
  const charts: ChartSpec[] = [];
  const rows = customRows || dataset.data;
  if (rows.length === 0) return charts;

  const profileList = Object.values(profiles);

  // Identify column roles
  const dateCol = profileList.find(p => p.effectiveType === 'datetime')?.name;
  const currencyCols = profileList.filter(p => p.effectiveType === 'currency').map(p => p.name);
  const numericCols = profileList.filter(p => ['numerical', 'currency'].includes(p.effectiveType)).map(p => p.name);
  const categoricalCols = profileList.filter(p => ['categorical', 'geographic'].includes(p.effectiveType)).map(p => p.name);

  // Main primary measure
  const primaryMeasure = currencyCols[0] || numericCols[0];
  const secondaryMeasure = numericCols.find(c => c !== primaryMeasure);

  // 1. PRIMARY TREND: Time Series Trend (Area Chart)
  if (dateCol && primaryMeasure) {
    const timeData = aggregateTimeSeries(rows, dateCol, primaryMeasure, 'sum');
    const cleanMeasure = primaryMeasure.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    charts.push({
      id: `chart-trend-${dateCol}`,
      title: `${cleanMeasure} Trend Over Time`,
      subtitle: `Chronological trajectory aggregated by ${dateCol}`,
      type: 'area',
      dimensionColumn: dateCol,
      measureColumn: primaryMeasure,
      aggregation: 'sum',
      gridSpan: 'two-thirds',
      data: timeData,
    });
  }

  // 2. SEGMENT SHARE: Donut Chart for Low-Cardinality Category (<= 7 distinct values)
  const lowCardCol = categoricalCols.find(c => {
    const prof = profiles[c];
    return prof && prof.uniqueCount >= 2 && prof.uniqueCount <= 7;
  });

  if (lowCardCol && primaryMeasure) {
    const donutData = aggregateByDimension(rows, lowCardCol, primaryMeasure, 'sum', 6);
    const cleanDim = lowCardCol.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const cleanMeasure = primaryMeasure.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    charts.push({
      id: `chart-donut-${lowCardCol}`,
      title: `${cleanMeasure} by ${cleanDim}`,
      subtitle: `Proportional segment contribution across ${lowCardCol}`,
      type: 'donut',
      dimensionColumn: lowCardCol,
      measureColumn: primaryMeasure,
      aggregation: 'sum',
      gridSpan: 'third',
      data: donutData,
    });
  }

  // 3. TOP RANKINGS: High-Cardinality Entity Leaderboard (Horizontal Bar)
  const entityCol = categoricalCols.find(c => {
    if (c === lowCardCol) return false;
    const prof = profiles[c];
    return prof && prof.uniqueCount > 4;
  });

  if (entityCol && primaryMeasure) {
    const rankingData = aggregateByDimension(rows, entityCol, primaryMeasure, 'sum', 7, 'value_desc');
    const cleanEntity = entityCol.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const cleanMeasure = primaryMeasure.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    charts.push({
      id: `chart-rank-${entityCol}`,
      title: `Top ${cleanEntity} Rankings`,
      subtitle: `Highest performing ${entityCol} entities by ${cleanMeasure}`,
      type: 'horizontal_bar',
      dimensionColumn: entityCol,
      measureColumn: primaryMeasure,
      aggregation: 'sum',
      gridSpan: 'half',
      data: rankingData,
    });
  }

  // 4. DIMENSION COMPARISON: Vertical Bar Chart
  const midCardCol = categoricalCols.find(c => c !== lowCardCol && c !== entityCol);
  if (midCardCol && primaryMeasure) {
    const barData = aggregateByDimension(rows, midCardCol, primaryMeasure, 'sum', 7);
    const cleanDim = midCardCol.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const cleanMeasure = primaryMeasure.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    charts.push({
      id: `chart-bar-${midCardCol}`,
      title: `${cleanMeasure} by ${cleanDim}`,
      subtitle: `Comparative volume analysis across ${midCardCol} segments`,
      type: 'bar',
      dimensionColumn: midCardCol,
      measureColumn: primaryMeasure,
      aggregation: 'sum',
      gridSpan: 'half',
      data: barData,
    });
  }

  // 5. CORRELATION / SCATTER PLOT
  if (primaryMeasure && secondaryMeasure) {
    const scatterData = buildScatterCoordinates(rows, primaryMeasure, secondaryMeasure, 35);
    const cleanX = primaryMeasure.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const cleanY = secondaryMeasure.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    charts.push({
      id: `chart-scatter-${primaryMeasure}-${secondaryMeasure}`,
      title: `${cleanX} vs. ${cleanY}`,
      subtitle: `Observation scatter distribution demonstrating metric correlation`,
      type: 'scatter',
      dimensionColumn: primaryMeasure,
      measureColumn: primaryMeasure,
      secondaryMeasureColumn: secondaryMeasure,
      aggregation: 'sum',
      gridSpan: 'half',
      data: scatterData,
    });
  }

  return charts;
}
