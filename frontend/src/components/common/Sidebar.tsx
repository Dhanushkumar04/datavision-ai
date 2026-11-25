import React from 'react';
import { 
  Home, 
  UploadCloud, 
  Table2, 
  ShieldCheck, 
  Wand2, 
  Eye, 
  LayoutDashboard, 
  BrainCircuit, 
  FileText, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { useDatasetContext } from '../../context/DatasetContext';
import { NavigationSection, WorkflowStepId } from '../../types/dataset';

interface NavItem {
  id: NavigationSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  stepId?: WorkflowStepId;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'upload', label: 'Upload Dataset', icon: UploadCloud, stepId: 'upload' },
  { id: 'profile', label: 'Data Profile', icon: Table2, stepId: 'analysis' },
  { id: 'quality', label: 'Data Quality', icon: ShieldCheck, stepId: 'quality' },
  { id: 'transform', label: 'Transform Data', icon: Wand2, stepId: 'transformation' },
  { id: 'preview', label: 'Data Preview', icon: Eye, stepId: 'preview' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, stepId: 'dashboard' },
  { id: 'insights', label: 'AI Insights', icon: BrainCircuit, stepId: 'explore' },
  { id: 'reports', label: 'Reports', icon: FileText, stepId: 'export' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { 
    activeNav, 
    setActiveNav, 
    setCurrentStep, 
    dataset, 
    unlockedSteps 
  } = useDatasetContext();

  const handleNavClick = (item: NavItem) => {
    setActiveNav(item.id);
    if (item.stepId && unlockedSteps.has(item.stepId)) {
      setCurrentStep(item.stepId);
    }
  };

  return (
    <aside 
      className={`relative flex-shrink-0 z-20 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          const isLocked = item.stepId && !unlockedSteps.has(item.stepId) && !dataset;

          return (
            <button
              key={item.id}
              onClick={() => !isLocked && handleNavClick(item)}
              disabled={Boolean(isLocked)}
              className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 shadow-sm'
                  : isLocked
                  ? 'text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-60'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <div className="flex items-center justify-center min-w-[20px]">
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              </div>

              {!collapsed && (
                <span className="ml-3 truncate">{item.label}</span>
              )}

              {/* Status indicators */}
              {!collapsed && isLocked && (
                <Lock className="w-3.5 h-3.5 ml-auto text-slate-300 dark:text-slate-700" />
              )}

              {!collapsed && item.stepId && dataset && unlockedSteps.has(item.stepId) && !isActive && (
                <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-500 opacity-60 group-hover:opacity-100" />
              )}
            </button>
          );
        })}
      </div>

      {/* Dataset Summary footer */}
      {!collapsed && dataset && (
        <div className="p-3 mx-2 mb-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            <Database className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="truncate">{dataset.meta.name}</span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex justify-between">
            <span>{dataset.meta.rowCount.toLocaleString()} rows</span>
            <span>{dataset.meta.columnCount} columns</span>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
