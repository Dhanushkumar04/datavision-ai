import React, { useState, useEffect } from 'react';
import { DatasetProvider, useDatasetContext } from './context/DatasetContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { WorkflowStepper } from './components/workflow/WorkflowStepper';
import { LandingPage } from './pages/LandingPage';
import { UploadPage } from './pages/UploadPage';
import { DataProfilePage } from './pages/DataProfilePage';
import { DataQualityPage } from './pages/DataQualityPage';
import { TransformPage } from './pages/TransformPage';
import { DataPreviewPage } from './pages/DataPreviewPage';
import { ThemeSelectionPage } from './pages/ThemeSelectionPage';
import { DashboardPage } from './pages/DashboardPage';
import { AIInsightsPage } from './pages/AIInsightsPage';
import { ReportsPage } from './pages/ReportsPage';

const AppContent: React.FC = () => {
  const { activeNav, currentStep, kpis } = useDatasetContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // View routing based on activeNav and currentStep
  const renderMainContent = () => {
    if (activeNav === 'overview') {
      return <LandingPage />;
    }

    if (activeNav === 'upload' || (currentStep === 'upload' && activeNav !== 'profile' && activeNav !== 'quality' && activeNav !== 'transform' && activeNav !== 'preview')) {
      return <UploadPage />;
    }

    if (activeNav === 'profile' || currentStep === 'analysis') {
      return <DataProfilePage />;
    }

    if (activeNav === 'quality' || currentStep === 'quality') {
      return <DataQualityPage />;
    }

    if (activeNav === 'transform' || currentStep === 'recommendations' || currentStep === 'transformation') {
      return <TransformPage />;
    }

    if (activeNav === 'preview' || currentStep === 'preview' || currentStep === 'load') {
      return <DataPreviewPage />;
    }

    if (currentStep === 'theme') {
      return <ThemeSelectionPage />;
    }

    if (activeNav === 'reports' || currentStep === 'export') {
      return <ReportsPage />;
    }

    if (activeNav === 'insights' || currentStep === 'explore') {
      return <AIInsightsPage />;
    }

    if (activeNav === 'dashboard' || currentStep === 'dashboard') {
      if (kpis.length === 0) {
        return <ThemeSelectionPage />;
      }
      return <DashboardPage />;
    }

    // Placeholders for subsequent phases (Phase 6 to Phase 8)
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto">
          <span className="text-xl font-bold font-mono">{activeNav.toUpperCase()}</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white capitalize">
          {activeNav.replace('-', ' ')} Module
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          Phases 1, 2, 3, and 4 (UI Foundation, Automatic Analysis, Quality, Transformations, Preview & Loading) are complete and operational. This module will activate in the designated roadmap phase.
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Header darkMode={darkMode} setDarkMode={setDarkMode} />
      <WorkflowStepper />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          setCollapsed={setSidebarCollapsed} 
        />

        <main className="flex-1 overflow-y-auto">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <DatasetProvider>
      <AppContent />
    </DatasetProvider>
  );
}

export default App;
