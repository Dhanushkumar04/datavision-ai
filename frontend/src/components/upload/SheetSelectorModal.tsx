import React, { useState } from 'react';
import { FileSpreadsheet, Check, X } from 'lucide-react';

interface SheetSelectorModalProps {
  sheetNames: string[];
  initialSheet: string;
  onSelect: (sheetName: string) => void;
  onCancel: () => void;
}

export const SheetSelectorModal: React.FC<SheetSelectorModalProps> = ({
  sheetNames,
  initialSheet,
  onSelect,
  onCancel,
}) => {
  const [selectedSheet, setSelectedSheet] = useState(initialSheet || sheetNames[0]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Select Worksheet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This workbook contains multiple worksheets. Which one would you like to analyze?
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto my-4 pr-1">
          {sheetNames.map((sheet) => {
            const isSelected = selectedSheet === sheet;
            return (
              <div
                key={sheet}
                onClick={() => setSelectedSheet(sheet)}
                className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <FileSpreadsheet className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{sheet}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSelect(selectedSheet)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            Analyze Sheet
          </button>
        </div>
      </div>
    </div>
  );
};
