import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedDataset } from '../types/dataset';
import { KPISpec, ChartSpec, SavedDashboardTemplate } from '../types/dashboard';
import { BusinessInsight } from '../types/ai';

/**
 * Sanitizes cell values to prevent spreadsheet formula injection (=, +, -, @, \t, \r)
 */
function sanitizeForSpreadsheet(val: any): any {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (/^[=+\-@\t\r]/.test(trimmed)) {
      return `'${trimmed}`;
    }
    return trimmed;
  }
  return val;
}

/**
 * Downloads cleaned dataset as CSV
 */
export function exportCleanedCsv(dataset: ParsedDataset, fileName?: string): void {
  const sanitizedRows = dataset.data.map((row) => {
    const cleanRow: Record<string, any> = {};
    for (const header of dataset.rawHeaders) {
      cleanRow[header] = sanitizeForSpreadsheet(row[header]);
    }
    return cleanRow;
  });

  const csv = Papa.unparse({
    fields: dataset.rawHeaders,
    data: sanitizedRows,
  });

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const downloadName = (fileName || dataset.meta.name.replace(/\.[^/.]+$/, '')) + '_cleaned.csv';

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', downloadName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Downloads cleaned dataset as Excel (.xlsx)
 */
export function exportCleanedExcel(dataset: ParsedDataset, fileName?: string): void {
  const sanitizedRows = dataset.data.map((row) => {
    const cleanRow: Record<string, any> = {};
    for (const header of dataset.rawHeaders) {
      cleanRow[header] = sanitizeForSpreadsheet(row[header]);
    }
    return cleanRow;
  });

  const worksheet = XLSX.utils.json_to_sheet(sanitizedRows, {
    header: dataset.rawHeaders,
  });

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned_Data');

  const downloadName = (fileName || dataset.meta.name.replace(/\.[^/.]+$/, '')) + '_cleaned.xlsx';
  XLSX.writeFile(workbook, downloadName);
}

/**
 * Generates and downloads a multi-sheet Executive Business Intelligence Workbook
 */
export function exportExecutiveExcelReport(
  dataset: ParsedDataset,
  kpis: KPISpec[],
  charts: ChartSpec[],
  insights: BusinessInsight[],
  fileName?: string
): void {
  const workbook = XLSX.utils.book_new();

  // SHEET 1: Executive KPI Summary
  const kpiRows = kpis.map(k => ({
    'Metric Title': k.title,
    'Target Dimension': k.column,
    'Aggregation Method': k.aggregation.toUpperCase(),
    'Formatted Value': k.formattedValue,
    'Numeric Value': k.calculatedValue,
    'Period Growth': k.changePercentage !== undefined ? `${k.changePercentage}%` : 'N/A',
    'Context Notes': k.subtitle || 'Operational baseline'
  }));
  const wsKPIs = XLSX.utils.json_to_sheet(kpiRows);
  XLSX.utils.book_append_sheet(workbook, wsKPIs, 'Executive_KPIs');

  // SHEET 2: Chart Dimension Aggregations
  const chartRows: any[] = [];
  charts.forEach(c => {
    c.data.forEach(d => {
      chartRows.push({
        'Visualization': c.title,
        'Dimension Column': c.dimensionColumn,
        'Measure Column': c.measureColumn,
        'Dimension Segment': d.label,
        'Aggregated Metric': d.value,
        'Segment Share': d.percentage !== undefined ? `${d.percentage}%` : 'N/A'
      });
    });
  });
  if (chartRows.length > 0) {
    const wsCharts = XLSX.utils.json_to_sheet(chartRows);
    XLSX.utils.book_append_sheet(workbook, wsCharts, 'Dimension_Breakdowns');
  }

  // SHEET 3: AI Business Insights & Recommendations
  if (insights.length > 0) {
    const insightRows = insights.map(i => ({
      'Category': i.category.toUpperCase(),
      'Insight Title': i.title,
      'Impact Level': i.impact.toUpperCase(),
      'Quantitative Metric': i.metricValue || 'N/A',
      'Analytical Evidence': i.evidence,
      'Strategic Recommendation': i.recommendation
    }));
    const wsInsights = XLSX.utils.json_to_sheet(insightRows);
    XLSX.utils.book_append_sheet(workbook, wsInsights, 'AI_Recommendations');
  }

  // SHEET 4: Full Cleaned Dataset
  const sanitizedData = dataset.data.slice(0, 10000).map(row => {
    const cleanRow: Record<string, any> = {};
    for (const h of dataset.rawHeaders) {
      cleanRow[h] = sanitizeForSpreadsheet(row[h]);
    }
    return cleanRow;
  });
  const wsData = XLSX.utils.json_to_sheet(sanitizedData, { header: dataset.rawHeaders });
  XLSX.utils.book_append_sheet(workbook, wsData, 'Dataset_Records');

  const downloadName = (fileName || dataset.meta.name.replace(/\.[^/.]+$/, '')) + '_Executive_BI_Report.xlsx';
  XLSX.writeFile(workbook, downloadName);
}

/**
 * Exports dashboard layout template to a downloadable JSON file
 */
export function exportDashboardJSON(template: SavedDashboardTemplate): void {
  const jsonStr = JSON.stringify(template, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${template.name.toLowerCase().replace(/\s+/g, '_')}_template.json`;
  link.click();
  URL.revokeObjectURL(url);
}
