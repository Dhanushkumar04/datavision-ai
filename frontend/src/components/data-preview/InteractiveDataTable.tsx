import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Edit2, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';
import { ColumnProfile, SEMANTIC_TYPE_LABELS } from '../../types/dataset';
import { ColumnVisibilityDropdown } from './ColumnVisibilityDropdown';

interface InteractiveDataTableProps {
  data: Record<string, any>[];
  headers: string[];
  columnProfiles?: Record<string, ColumnProfile>;
  onCellEdit?: (rowIndex: number, column: string, newValue: any) => void;
}

type SortDirection = 'asc' | 'desc' | null;

export const InteractiveDataTable: React.FC<InteractiveDataTableProps> = ({
  data,
  headers,
  columnProfiles,
  onCellEdit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleColumns, setVisibleColumns] = useState<string[]>(headers);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Inline editing state: { rowIndex, column, value }
  const [editingCell, setEditingCell] = useState<{ rowIndex: number; column: string; value: string } | null>(null);

  // Sync visible columns if headers change
  React.useEffect(() => {
    setVisibleColumns(headers);
  }, [headers]);

  // Handle column sort toggle
  const handleSort = (col: string) => {
    if (sortColumn !== col) {
      setSortColumn(col);
      setSortDirection('asc');
    } else if (sortDirection === 'asc') {
      setSortDirection('desc');
    } else {
      setSortColumn(null);
      setSortDirection(null);
    }
    setCurrentPage(1);
  };

  // Filter and sort data
  const processedData = useMemo(() => {
    let result = [...data];

    // Global Search
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      result = result.filter(row => {
        return visibleColumns.some(col => {
          const val = row[col];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(q);
        });
      });
    }

    // Column Sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const valA = a[sortColumn];
        const valB = b[sortColumn];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        const numA = typeof valA === 'number' ? valA : parseFloat(String(valA).replace(/[$€£₹,%]/g, ''));
        const numB = typeof valB === 'number' ? valB : parseFloat(String(valB).replace(/[$€£₹,%]/g, ''));

        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === 'asc' ? numA - numB : numB - numA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        if (strA < strB) return sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, visibleColumns, searchQuery, sortColumn, sortDirection]);

  // Pagination calculation
  const totalRows = processedData.length;
  const totalPages = Math.ceil(totalRows / pageSize) || 1;
  const clampedPage = Math.min(currentPage, totalPages);
  const startIndex = (clampedPage - 1) * pageSize;
  const pageRows = processedData.slice(startIndex, startIndex + pageSize);

  // Commit cell edit
  const commitCellEdit = () => {
    if (!editingCell || !onCellEdit) return;
    onCellEdit(editingCell.rowIndex, editingCell.column, editingCell.value);
    setEditingCell(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search rows across columns..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3 justify-end">
          <ColumnVisibilityDropdown
            allColumns={headers}
            visibleColumns={visibleColumns}
            onChange={setVisibleColumns}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto flex-1 min-h-[300px]">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 select-none sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-3 py-2.5 font-mono text-[10px] text-slate-400 w-12 text-center border-r border-slate-100 dark:border-slate-800">
                #
              </th>
              {visibleColumns.map((col) => {
                const profile = columnProfiles ? columnProfiles[col] : undefined;
                const typeConfig = profile ? SEMANTIC_TYPE_LABELS[profile.effectiveType] : undefined;
                const isSorted = sortColumn === col;

                return (
                  <th
                    key={col}
                    onClick={() => handleSort(col)}
                    className="px-3 py-2.5 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap border-r border-slate-100 dark:border-slate-800 last:border-r-0"
                  >
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-1.5 min-w-0">
                        {typeConfig && (
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${typeConfig.badge}`}>
                            {typeConfig.icon}
                          </span>
                        )}
                        <span className="font-mono truncate" title={col}>
                          {col}
                        </span>
                      </div>

                      <div className="text-slate-400 flex-shrink-0">
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-40 hover:opacity-100" />
                        )}
                      </div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono text-slate-800 dark:text-slate-200">
            {pageRows.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 1} className="p-8 text-center text-slate-400 text-xs">
                  No records match your search query.
                </td>
              </tr>
            ) : (
              pageRows.map((row, rowIdx) => {
                const globalIndex = startIndex + rowIdx;

                return (
                  <tr 
                    key={globalIndex}
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors group"
                  >
                    <td className="px-3 py-2 text-center text-[10px] text-slate-400 bg-slate-50/40 dark:bg-slate-800/30 border-r border-slate-100 dark:border-slate-800">
                      {globalIndex + 1}
                    </td>

                    {visibleColumns.map((col) => {
                      const isEditing = editingCell?.rowIndex === globalIndex && editingCell?.column === col;
                      const val = row[col];
                      const isBlank = val === null || val === undefined || String(val).trim() === '';

                      return (
                        <td
                          key={col}
                          onDoubleClick={() => onCellEdit && setEditingCell({ rowIndex: globalIndex, column: col, value: String(val ?? '') })}
                          className="px-3 py-2 whitespace-nowrap max-w-[250px] truncate border-r border-slate-100 dark:border-slate-800 last:border-r-0 relative group/cell"
                        >
                          {isEditing ? (
                            <div className="flex items-center space-x-1">
                              <input
                                type="text"
                                autoFocus
                                value={editingCell.value}
                                onChange={(e) => setEditingCell({ ...editingCell, value: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') commitCellEdit();
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="w-full text-xs px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-blue-500 focus:outline-none"
                              />
                              <button onClick={commitCellEdit} className="p-0.5 text-emerald-600 hover:text-emerald-700">
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => setEditingCell(null)} className="p-0.5 text-slate-400 hover:text-slate-600">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <span className={isBlank ? 'text-slate-300 dark:text-slate-600 italic' : ''} title={String(val ?? '')}>
                                {isBlank ? '[Empty]' : String(val)}
                              </span>

                              {onCellEdit && (
                                <button
                                  onClick={() => setEditingCell({ rowIndex: globalIndex, column: col, value: String(val ?? '') })}
                                  className="opacity-0 group-hover/cell:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 transition-opacity ml-1"
                                  title="Edit cell"
                                >
                                  <Edit2 className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span className="text-slate-400">|</span>
          <span>
            Showing <span className="font-bold text-slate-900 dark:text-white">{totalRows > 0 ? startIndex + 1 : 0}</span> to{' '}
            <span className="font-bold text-slate-900 dark:text-white">{Math.min(startIndex + pageSize, totalRows)}</span> of{' '}
            <span className="font-bold text-slate-900 dark:text-white">{totalRows.toLocaleString()}</span> entries
          </span>
        </div>

        {/* Page Nav Buttons */}
        <div className="flex items-center space-x-1 font-medium">
          <button
            onClick={() => setCurrentPage(1)}
            disabled={clampedPage === 1}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            title="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={clampedPage === 1}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="px-2 text-xs">
            Page <span className="font-bold text-slate-900 dark:text-white">{clampedPage}</span> of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={clampedPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage(totalPages)}
            disabled={clampedPage === totalPages}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
