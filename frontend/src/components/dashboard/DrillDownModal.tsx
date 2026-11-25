import React, { useState, useMemo } from 'react';
import { 
  X, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet, 
  FileText,
  Filter
} from 'lucide-react';
import { ThemeConfig } from '../../types/dashboard';
import { exportCleanedCsv, exportCleanedExcel } from '../../services/exportService';
import { ParsedDataset } from '../../types/dataset';

interface DrillDownModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  rows: Record<string, any>[];
  headers: string[];
  theme: ThemeConfig;
  activeFilterContext?: string;
}

export const DrillDownModal: React.FC<DrillDownModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  rows,
  headers,
  theme,
  activeFilterContext,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  if (!isOpen) return null;

  // Filtered rows by search
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter(row => {
      return Object.values(row).some(val => 
        String(val ?? '').toLowerCase().includes(term)
      );
    });
  }, [rows, searchTerm]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const aVal = a[sortColumn];
      const bVal = b[sortColumn];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const numA = Number(aVal);
      const numB = Number(bVal);
      if (!isNaN(numA) && !isNaN(numB)) {
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      const strA = String(aVal).toLowerCase();
      const strB = String(bVal).toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredRows, sortColumn, sortDirection]);

  // Paginated rows
  const totalPages = Math.ceil(sortedRows.length / pageSize) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') setSortDirection('desc');
      else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleExportCsv = () => {
    const syntheticDataset: ParsedDataset = {
      meta: {
        name: `drilldown_export_${Date.now()}`,
        sizeBytes: 0,
        format: 'csv',
        rowCount: sortedRows.length,
        columnCount: headers.length,
        parsedAt: new Date().toISOString(),
      },
      rawHeaders: headers,
      data: sortedRows,
    };
    exportCleanedCsv(syntheticDataset, 'drilldown_records');
  };

  const handleExportExcel = () => {
    const syntheticDataset: ParsedDataset = {
      meta: {
        name: `drilldown_export_${Date.now()}`,
        sizeBytes: 0,
        format: 'xlsx',
        rowCount: sortedRows.length,
        columnCount: headers.length,
        parsedAt: new Date().toISOString(),
      },
      rawHeaders: headers,
      data: sortedRows,
    };
    exportCleanedExcel(syntheticDataset, 'drilldown_records');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className={`w-full max-w-6xl max-h-[90vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden ${theme.cardClass} ${theme.borderClass}`}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-blue-600 text-white uppercase tracking-wider">
                Drill-Down Data View
              </span>
              {activeFilterContext && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  {activeFilterContext}
                </span>
              )}
            </div>
            <h2 className={`text-xl font-extrabold ${theme.textPrimaryClass}`}>
              {title}
            </h2>
            <p className={`text-xs ${theme.textSecondaryClass}`}>
              {subtitle || `Inspecting ${sortedRows.length.toLocaleString()} matching underlying records`}
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search across drilled rows..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
            />
          </div>

          {/* Export and Page Size Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <span>Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-semibold cursor-pointer"
              >
                <option value={10}>10 rows</option>
                <option value={15}>15 rows</option>
                <option value={25}>25 rows</option>
                <option value={50}>50 rows</option>
              </select>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export filtered records as CSV"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              CSV
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Export filtered records as Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              Excel
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="flex-1 overflow-auto p-4 scrollbar-thin">
          {paginatedRows.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-mono">
              No matching records found for the current drill-down criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 sticky top-0 z-10">
                  <th className="py-2.5 px-3 text-slate-400 font-mono w-12 text-center">#</th>
                  {headers.map((col) => {
                    const isSorted = sortColumn === col;
                    return (
                      <th
                        key={col}
                        onClick={() => handleSort(col)}
                        className="py-2.5 px-3 font-bold uppercase tracking-wider text-[11px] text-slate-600 dark:text-slate-300 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors whitespace-nowrap"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{col}</span>
                          <ArrowUpDown className={`w-3 h-3 ${isSorted ? 'text-blue-500 font-bold' : 'text-slate-400 opacity-40'}`} />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                {paginatedRows.map((row, rowIdx) => (
                  <tr 
                    key={rowIdx}
                    className="hover:bg-blue-500/5 transition-colors"
                  >
                    <td className="py-2 px-3 text-center text-slate-400 text-[10px]">
                      {(currentPage - 1) * pageSize + rowIdx + 1}
                    </td>
                    {headers.map((col) => (
                      <td key={col} className="py-2 px-3 truncate max-w-[200px]" title={String(row[col] ?? '')}>
                        {row[col] !== null && row[col] !== undefined ? String(row[col]) : <span className="text-slate-400 italic">null</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, sortedRows.length)} of {sortedRows.length.toLocaleString()} rows
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-slate-700 dark:text-slate-300 font-semibold px-2">
              Page {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
