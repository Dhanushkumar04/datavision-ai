import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  ParsedDataset, 
  WorkflowStepId, 
  NavigationSection, 
  WORKFLOW_STEPS,
  DatasetAnalysisResult,
  SemanticType
} from '../types/dataset';
import { QualityAuditResult, TransformationActionType, TransformationRecord } from '../types/quality';
import { ThemeId, KPISpec, ChartSpec, ChartType } from '../types/dashboard';
import { profileDataset } from '../services/dataProfiler';
import { auditDatasetQuality } from '../services/dataQuality';
import { executeTransformation } from '../services/transformationEngine';
import { generateKPIs } from '../services/kpiGenerator';
import { recommendCharts } from '../services/chartRecommendation';
import { recommendTheme } from '../services/themeEngine';

interface DatasetContextType {
  // Datasets (Raw original vs Working cleaned vs Loaded committed)
  rawDataset: ParsedDataset | null;
  dataset: ParsedDataset | null;
  loadedDataset: ParsedDataset | null;
  isDataLoaded: boolean;
  setDataset: (dataset: ParsedDataset | null) => void;
  
  // Phase 2: Analysis & Profiling
  analysisResult: DatasetAnalysisResult | null;
  overrideColumnType: (columnName: string, newType: SemanticType) => void;
  columnOverrides: Record<string, SemanticType>;
  isAnalyzing: boolean;

  // Phase 3: Data Quality & Transformations
  qualityAudit: QualityAuditResult | null;
  initialQualityScore: number;
  transformationHistory: TransformationRecord[];
  canUndo: boolean;
  canRedo: boolean;
  applyIssueTransformation: (issueId: string, actionType?: TransformationActionType, params?: any) => void;
  applyAllRecommendedTransformations: () => void;
  undoTransformation: () => void;
  redoTransformation: () => void;
  resetToRawDataset: () => void;

  // Phase 4: Data Preview & Loading
  updateCell: (rowIndex: number, column: string, newValue: any) => void;
  loadCleanedData: () => void;

  // Phase 5: Theme Selection & Dashboard Generation
  selectedThemeId: ThemeId;
  setSelectedThemeId: (theme: ThemeId) => void;
  kpis: KPISpec[];
  charts: ChartSpec[];
  generateDashboard: (themeId?: ThemeId) => void;
  updateChartType: (chartId: string, newType: ChartType) => void;

  // Navigation & Workflow states
  currentStep: WorkflowStepId;
  setCurrentStep: (step: WorkflowStepId) => void;
  activeNav: NavigationSection;
  setActiveNav: (nav: NavigationSection) => void;
  
  // Unlocked steps for backward/forward navigation
  unlockedSteps: Set<WorkflowStepId>;
  unlockStep: (step: WorkflowStepId) => void;
  
  // Processing status
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (msg: string) => void;
  uploadProgress: number;
  setUploadProgress: (progress: number) => void;
  
  // Error state
  error: string | null;
  setError: (err: string | null) => void;
  
  // Reset & Navigation helpers
  resetAll: () => void;
  goToNextStep: () => void;
  goToPrevStep: () => void;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [rawDataset, setRawDataset] = useState<ParsedDataset | null>(null);
  const [dataset, setDatasetState] = useState<ParsedDataset | null>(null);
  const [loadedDataset, setLoadedDataset] = useState<ParsedDataset | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [initialQualityScore, setInitialQualityScore] = useState<number>(100);

  const [analysisResult, setAnalysisResult] = useState<DatasetAnalysisResult | null>(null);
  const [columnOverrides, setColumnOverrides] = useState<Record<string, SemanticType>>({});
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Phase 3 State
  const [qualityAudit, setQualityAudit] = useState<QualityAuditResult | null>(null);
  const [transformationHistory, setTransformationHistory] = useState<TransformationRecord[]>([]);
  const [undoSnapshots, setUndoSnapshots] = useState<ParsedDataset[]>([]);
  const [redoStack, setRedoStack] = useState<{ dataset: ParsedDataset; record: TransformationRecord }[]>([]);

  // Phase 5 State
  const [selectedThemeId, setSelectedThemeId] = useState<ThemeId>('modern');
  const [kpis, setKpis] = useState<KPISpec[]>([]);
  const [charts, setCharts] = useState<ChartSpec[]>([]);

  // Navigation states
  const [currentStep, setCurrentStep] = useState<WorkflowStepId>('upload');
  const [activeNav, setActiveNav] = useState<NavigationSection>('overview');
  const [unlockedSteps, setUnlockedSteps] = useState<Set<WorkflowStepId>>(new Set(['upload']));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const unlockStep = (step: WorkflowStepId) => {
    setUnlockedSteps(prev => new Set([...prev, step]));
  };

  // Re-run profiling & data quality audit whenever dataset or overrides change
  useEffect(() => {
    if (!dataset) {
      setAnalysisResult(null);
      setQualityAudit(null);
      return;
    }

    try {
      setIsAnalyzing(true);
      const profiled = profileDataset(dataset, columnOverrides);
      setAnalysisResult(profiled);

      const audit = auditDatasetQuality(dataset, profiled.columnProfiles);
      setQualityAudit(audit);

      // Record initial score before transformations
      if (transformationHistory.length === 0) {
        setInitialQualityScore(audit.score);
      }

      unlockStep('upload');
      unlockStep('analysis');
      unlockStep('quality');
      unlockStep('recommendations');
      unlockStep('transformation');
      unlockStep('preview');
      unlockStep('load');
    } catch (err: any) {
      console.error('Profiling/Quality error:', err);
      setError(`Quality audit failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [dataset, columnOverrides]);

  const setDataset = (newDataset: ParsedDataset | null) => {
    setColumnOverrides({});
    setRawDataset(newDataset);
    setDatasetState(newDataset);
    setLoadedDataset(null);
    setIsDataLoaded(false);
    setTransformationHistory([]);
    setUndoSnapshots([]);
    setRedoStack([]);
    if (newDataset) {
      unlockStep('upload');
      unlockStep('analysis');
      unlockStep('quality');
    }
  };

  const overrideColumnType = (columnName: string, newType: SemanticType) => {
    setColumnOverrides(prev => ({
      ...prev,
      [columnName]: newType,
    }));
  };

  // Apply a single transformation issue
  const applyIssueTransformation = (
    issueId: string, 
    actionType?: TransformationActionType, 
    params?: any
  ) => {
    if (!dataset || !qualityAudit) return;
    const targetIssue = qualityAudit.issues.find(i => i.id === issueId);
    if (!targetIssue) return;

    const action = actionType || targetIssue.selectedAction;
    if (action === 'leave_unchanged') return;

    // Save current dataset snapshot for undo
    setUndoSnapshots(prev => [...prev, dataset]);
    setRedoStack([]);

    const { updatedDataset, record } = executeTransformation(dataset, targetIssue, action, params);

    setTransformationHistory(prev => [...prev, record]);
    setDatasetState(updatedDataset);
  };

  // Apply all recommended transformations in one batch
  const applyAllRecommendedTransformations = () => {
    if (!dataset || !qualityAudit) return;
    const pendingIssues = qualityAudit.issues.filter(i => i.status !== 'applied' && i.selectedAction !== 'leave_unchanged');
    if (pendingIssues.length === 0) return;

    setUndoSnapshots(prev => [...prev, dataset]);
    setRedoStack([]);

    let curData = dataset;
    const newRecords: TransformationRecord[] = [];

    for (const issue of pendingIssues) {
      const { updatedDataset, record } = executeTransformation(curData, issue, issue.selectedAction, issue.actionParams);
      curData = updatedDataset;
      newRecords.push(record);
    }

    setTransformationHistory(prev => [...prev, ...newRecords]);
    setDatasetState(curData);
  };

  // Undo last transformation
  const undoTransformation = () => {
    if (undoSnapshots.length === 0 || !dataset) return;

    const previousDataset = undoSnapshots[undoSnapshots.length - 1];
    const newSnapshots = undoSnapshots.slice(0, -1);
    const lastRecord = transformationHistory[transformationHistory.length - 1];

    if (lastRecord) {
      setRedoStack(prev => [...prev, { dataset, record: lastRecord }]);
      setTransformationHistory(prev => prev.slice(0, -1));
    }

    setUndoSnapshots(newSnapshots);
    setDatasetState(previousDataset);
  };

  // Redo previously undone transformation
  const redoTransformation = () => {
    if (redoStack.length === 0 || !dataset) return;

    const next = redoStack[redoStack.length - 1];
    const newRedo = redoStack.slice(0, -1);

    setUndoSnapshots(prev => [...prev, dataset]);
    setTransformationHistory(prev => [...prev, next.record]);
    setRedoStack(newRedo);
    setDatasetState(next.dataset);
  };

  // Reset working dataset back to original raw uploaded state
  const resetToRawDataset = () => {
    if (rawDataset) {
      setDatasetState(rawDataset);
      setTransformationHistory([]);
      setUndoSnapshots([]);
      setRedoStack([]);
    }
  };

  // Phase 4: Inline cell editing in Preview table
  const updateCell = (rowIndex: number, column: string, newValue: any) => {
    if (!dataset) return;
    const updatedRows = [...dataset.data];
    if (rowIndex >= 0 && rowIndex < updatedRows.length) {
      const oldVal = updatedRows[rowIndex][column];
      if (oldVal === newValue) return;

      // Save snapshot for undo
      setUndoSnapshots(prev => [...prev, dataset]);

      updatedRows[rowIndex] = {
        ...updatedRows[rowIndex],
        [column]: newValue,
      };

      const updatedDataset: ParsedDataset = {
        ...dataset,
        data: updatedRows,
      };

      const editRecord: TransformationRecord = {
        id: `edit-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        issueId: 'manual-cell-edit',
        issueName: 'Manual Cell Edit',
        columnAffected: column,
        actionType: 'fill_missing_value',
        actionLabel: 'Manual Cell Edit',
        rowsAffected: 1,
        summary: `Edited row ${rowIndex + 1} "${column}" from "${oldVal}" to "${newValue}".`,
        diffSample: [
          {
            rowIndex: rowIndex + 1,
            columnName: column,
            beforeValue: oldVal,
            afterValue: newValue,
            changeType: 'modified',
          },
        ],
      };

      setTransformationHistory(prev => [...prev, editRecord]);
      setDatasetState(updatedDataset);
    }
  };

  // Phase 4: Commit cleaned dataset and advance to Dashboard theme selection
  const loadCleanedData = () => {
    if (!dataset) return;
    setLoadedDataset(dataset);
    setIsDataLoaded(true);

    // AI Recommend theme based on dataset domain & profile
    if (analysisResult) {
      const rec = recommendTheme(dataset, analysisResult.columnProfiles);
      setSelectedThemeId(rec.themeId);
    }

    unlockStep('load');
    unlockStep('theme');
    unlockStep('dashboard');

    setCurrentStep('theme');
    setActiveNav('dashboard');
  };

  // Phase 5: Generate dynamic BI dashboard with KPIs and charts
  const generateDashboard = (themeId?: ThemeId) => {
    const activeData = loadedDataset || dataset;
    if (!activeData || !analysisResult) return;

    if (themeId) {
      setSelectedThemeId(themeId);
    }

    const generatedKpis = generateKPIs(activeData, analysisResult.columnProfiles);
    const generatedCharts = recommendCharts(activeData, analysisResult.columnProfiles);

    setKpis(generatedKpis);
    setCharts(generatedCharts);

    unlockStep('dashboard');
    unlockStep('explore');
    unlockStep('export');
    setCurrentStep('dashboard');
    setActiveNav('dashboard');
  };

  const updateChartType = (chartId: string, newType: ChartType) => {
    setCharts(prev => prev.map(c => c.id === chartId ? { ...c, type: newType } : c));
  };

  const resetAll = () => {
    setRawDataset(null);
    setDatasetState(null);
    setLoadedDataset(null);
    setIsDataLoaded(false);
    setAnalysisResult(null);
    setQualityAudit(null);
    setTransformationHistory([]);
    setUndoSnapshots([]);
    setRedoStack([]);
    setColumnOverrides({});
    setSelectedThemeId('modern');
    setKpis([]);
    setCharts([]);
    setCurrentStep('upload');
    setActiveNav('overview');
    setUnlockedSteps(new Set(['upload']));
    setError(null);
    setIsLoading(false);
    setLoadingMessage('');
    setUploadProgress(0);
  };

  const goToNextStep = () => {
    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex >= 0 && currentIndex < WORKFLOW_STEPS.length - 1) {
      const nextStep = WORKFLOW_STEPS[currentIndex + 1].id;
      unlockStep(nextStep);
      setCurrentStep(nextStep);
    }
  };

  const goToPrevStep = () => {
    const currentIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = WORKFLOW_STEPS[currentIndex - 1].id;
      setCurrentStep(prevStep);
    }
  };

  return (
    <DatasetContext.Provider
      value={{
        rawDataset,
        dataset,
        loadedDataset,
        isDataLoaded,
        setDataset,
        analysisResult,
        overrideColumnType,
        columnOverrides,
        isAnalyzing,
        qualityAudit,
        initialQualityScore,
        transformationHistory,
        canUndo: undoSnapshots.length > 0,
        canRedo: redoStack.length > 0,
        applyIssueTransformation,
        applyAllRecommendedTransformations,
        undoTransformation,
        redoTransformation,
        resetToRawDataset,
        updateCell,
        loadCleanedData,
        selectedThemeId,
        setSelectedThemeId,
        kpis,
        charts,
        generateDashboard,
        updateChartType,
        currentStep,
        setCurrentStep,
        activeNav,
        setActiveNav,
        unlockedSteps,
        unlockStep,
        isLoading,
        setIsLoading,
        loadingMessage,
        setLoadingMessage,
        uploadProgress,
        setUploadProgress,
        error,
        setError,
        resetAll,
        goToNextStep,
        goToPrevStep,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export function useDatasetContext(): DatasetContextType {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDatasetContext must be used within a DatasetProvider');
  }
  return context;
}
