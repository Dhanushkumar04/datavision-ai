import React, { useState, useRef, useEffect } from 'react';
import { Columns3, CheckSquare, Square } from 'lucide-react';

interface ColumnVisibilityDropdownProps {
  allColumns: string[];
  visibleColumns: string[];
  onChange: (visibleCols: string[]) => void;
}

export const ColumnVisibilityDropdown: React.FC<ColumnVisibilityDropdownProps> = ({
  allColumns,
  visibleColumns,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleColumn = (col: string) => {
    if (visibleColumns.includes(col)) {
      if (visibleColumns.length > 1) {
        onChange(visibleColumns.filter(c => c !== col));
      }
    } else {
      onChange([...visibleColumns, col]);
    }
  };

  const selectAll = () => onChange([...allColumns]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
      >
        <Columns3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span>Columns ({visibleColumns.length}/{allColumns.length})</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-30 p-2 text-xs space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-slate-800 px-1">
            <span className="font-bold text-slate-800 dark:text-slate-200">Visible Columns</span>
            <button
              onClick={selectAll}
              className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Select All
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
            {allColumns.map((col) => {
              const isChecked = visibleColumns.includes(col);
              return (
                <div
                  key={col}
                  onClick={() => toggleColumn(col)}
                  className="flex items-center space-x-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer select-none text-slate-700 dark:text-slate-300"
                >
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                  )}
                  <span className="truncate font-mono text-[11px]">{col}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
