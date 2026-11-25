import React, { useState } from 'react';
import { 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw,
} from 'lucide-react';
import { useDatasetContext } from '../context/DatasetContext';
import { FileDropZone } from '../components/upload/FileDropZone';
import { SampleDatasetSelector } from '../components/upload/SampleDatasetSelector';
import { UploadProgress } from '../components/upload/UploadProgress';
import { SheetSelectorModal } from '../components/upload/SheetSelectorModal';
import { parseCsvFile, parseExcelFile } from '../services/fileParser';
import { SampleDatasetInfo } from '../types/dataset';
import { formatBytes } from '../utils/formatting';

export const UploadPage: React.FC = () => {
  const { 
    dataset, 
    setDataset, 
    setCurrentStep, 
    setActiveNav,
    isLoading, 
    setIsLoading,
    loadingMessage,
    setLoadingMessage,
    uploadProgress,
    setUploadProgress,
    error,
    setError,
    resetAll
  } = useDatasetContext();

  const [excelFileToProcess, setExcelFileToProcess] = useState<File | null>(null);
  const [excelSheets, setExcelSheets] = useState<string[]>([]);
  const [showSheetModal, setShowSheetModal] = useState<boolean>(false);
  const [currentFileMeta, setCurrentFileMeta] = useState<{ name: string; size: number } | null>(null);

  // Handle uploaded file
  const handleFileSelected = async (file: File) => {
    setError(null);
    setIsLoading(true);
    setUploadProgress(10);
    setCurrentFileMeta({ name: file.name, size: file.size });
    setLoadingMessage('Reading file...');

    try {
      const lowerName = file.name.toLowerCase();

      if (lowerName.endsWith('.csv')) {
        setLoadingMessage('Parsing CSV structure...');
        setUploadProgress(40);

        try {
          const parsed = await parseCsvFile(file, (pct) => {
            setUploadProgress(Math.min(90, Math.max(30, pct)));
          });
          setUploadProgress(100);
          setLoadingMessage('Dataset loaded successfully!');
          setDataset(parsed);
        } catch (csvErr: any) {
          // Fallback check: if the file is actually an Excel binary with .csv extension
          try {
            const buffer = await file.arrayBuffer();
            const { dataset: parsedExcel } = await parseExcelFile(buffer, undefined, file.name);
            setUploadProgress(100);
            setLoadingMessage('Dataset loaded successfully!');
            setDataset(parsedExcel);
          } catch {
            throw csvErr;
          }
        }
      } else if (lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls')) {
        setLoadingMessage('Inspecting Excel worksheets...');
        setUploadProgress(40);

        try {
          const buffer = await file.arrayBuffer();
          const { sheetNames } = await parseExcelFile(buffer, undefined, file.name);

          if (sheetNames.length > 1) {
            setExcelFileToProcess(file);
            setExcelSheets(sheetNames);
            setShowSheetModal(true);
            setIsLoading(false);
            return;
          }

          // Single sheet workbook
          setLoadingMessage(`Extracting data from sheet "${sheetNames[0]}"...`);
          setUploadProgress(70);
          const { dataset: parsedExcel } = await parseExcelFile(buffer, sheetNames[0], file.name);

          setUploadProgress(100);
          setLoadingMessage('Excel loaded successfully!');
          setDataset(parsedExcel);
        } catch (excelErr: any) {
          // Fallback check: if the file is actually a CSV text file named .xlsx/.xls
          try {
            const parsed = await parseCsvFile(file);
            setUploadProgress(100);
            setLoadingMessage('Dataset loaded successfully!');
            setDataset(parsed);
          } catch {
            throw excelErr;
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to parse the uploaded file.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle multi-sheet selection confirmation
  const handleSheetSelected = async (sheetName: string) => {
    if (!excelFileToProcess) return;
    setShowSheetModal(false);
    setIsLoading(true);
    setLoadingMessage(`Extracting rows from "${sheetName}"...`);
    setUploadProgress(60);

    try {
      const buffer = await excelFileToProcess.arrayBuffer();
      const { dataset: parsedExcel } = await parseExcelFile(buffer, sheetName, excelFileToProcess.name);
      setUploadProgress(100);
      setLoadingMessage('Excel sheet loaded successfully!');
      setDataset(parsedExcel);
    } catch (err: any) {
      setError(err.message || 'Failed to parse the selected worksheet.');
    } finally {
      setIsLoading(false);
      setExcelFileToProcess(null);
    }
  };

  // Handle sample dataset click
  const handleSelectSample = async (sample: SampleDatasetInfo) => {
    setError(null);
    setIsLoading(true);
    setCurrentFileMeta({ name: sample.title, size: sample.rowCount * 180 });
    setLoadingMessage(`Fetching ${sample.title}...`);
    setUploadProgress(30);

    try {
      const response = await fetch(sample.path);
      if (!response.ok) {
        throw new Error(`Could not load sample dataset (${response.statusText})`);
      }
      const csvText = await response.text();

      setLoadingMessage('Parsing sample rows & headers...');
      setUploadProgress(70);

      const parsed = await parseCsvFile(csvText);
      // Give it the clean sample name
      parsed.meta.name = sample.title;
      parsed.meta.sizeBytes = csvText.length;

      setUploadProgress(100);
      setLoadingMessage('Sample dataset ready!');
      setDataset(parsed);
    } catch (err: any) {
      setError(err.message || 'Failed to load sample dataset.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToAnalysis = () => {
    setCurrentStep('analysis');
    setActiveNav('profile');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Upload Your Dataset
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload any CSV, XLS, or XLSX spreadsheet. Our engine will automatically analyze columns, detect data quality issues, and prepare your interactive dashboard.
        </p>
      </div>

      {/* Progress display during active parsing */}
      {isLoading && currentFileMeta && (
        <UploadProgress
          fileName={currentFileMeta.name}
          fileSizeBytes={currentFileMeta.size}
          progressPercent={uploadProgress}
          statusMessage={loadingMessage}
        />
      )}

      {/* Error notification */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-sm text-red-700 dark:text-red-300 flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={() => setError(null)}
            className="text-xs font-bold underline ml-4 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* When dataset is uploaded: Show success card & CTA */}
      {dataset && !isLoading ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800/80 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {dataset.meta.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase">
                    Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Parsed on {new Date(dataset.meta.parsedAt).toLocaleTimeString()} • {formatBytes(dataset.meta.sizeBytes)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={resetAll}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors flex items-center"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Upload Different File
              </button>

              <button
                onClick={handleProceedToAnalysis}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all flex items-center group"
              >
                Continue to Analysis
                <ArrowRight className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Rows</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {dataset.meta.rowCount.toLocaleString()}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Columns</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                {dataset.meta.columnCount}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Detected Format</span>
              <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-0.5 uppercase">
                {dataset.meta.format}
              </p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Active Sheet</span>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1 truncate">
                {dataset.meta.activeSheet || 'Primary Sheet'}
              </p>
            </div>
          </div>

          {/* Column Tags Preview */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Detected Headers ({dataset.rawHeaders.length})
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {dataset.rawHeaders.map((header) => (
                <span
                  key={header}
                  className="px-2 py-1 rounded-md text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  {header}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div className="space-y-8">
          <FileDropZone 
            onFileSelected={handleFileSelected} 
            isLoading={isLoading} 
          />

          <SampleDatasetSelector
            onSelectSample={handleSelectSample}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* Multi-sheet selector modal for Excel */}
      {showSheetModal && (
        <SheetSelectorModal
          sheetNames={excelSheets}
          initialSheet={excelSheets[0]}
          onSelect={handleSheetSelected}
          onCancel={() => {
            setShowSheetModal(false);
            setExcelFileToProcess(null);
          }}
        />
      )}
    </div>
  );
};
