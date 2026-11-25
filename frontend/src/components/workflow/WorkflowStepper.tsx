import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { useDatasetContext } from '../../context/DatasetContext';
import { WORKFLOW_STEPS, WorkflowStepId } from '../../types/dataset';

export const WorkflowStepper: React.FC = () => {
  const { currentStep, setCurrentStep, unlockedSteps, setActiveNav } = useDatasetContext();

  const handleStepClick = (stepId: WorkflowStepId) => {
    if (unlockedSteps.has(stepId)) {
      setCurrentStep(stepId);
      // Map step to navigation item
      if (stepId === 'upload') setActiveNav('upload');
      else if (stepId === 'analysis') setActiveNav('profile');
      else if (stepId === 'quality') setActiveNav('quality');
      else if (stepId === 'transformation') setActiveNav('transform');
      else if (stepId === 'preview') setActiveNav('preview');
      else if (stepId === 'theme') setActiveNav('dashboard');
      else if (stepId === 'dashboard') setActiveNav('dashboard');
      else if (stepId === 'explore') setActiveNav('insights');
      else if (stepId === 'export') setActiveNav('reports');
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-2.5 overflow-x-auto scrollbar-none transition-colors">
      <div className="flex items-center space-x-1 min-w-max text-xs">
        {WORKFLOW_STEPS.map((step, idx) => {
          const isActive = currentStep === step.id;
          const isUnlocked = unlockedSteps.has(step.id);
          const isCompleted = isUnlocked && !isActive && idx < WORKFLOW_STEPS.findIndex(s => s.id === currentStep);

          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => handleStepClick(step.id)}
                disabled={!isUnlocked}
                className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                    : isCompleted
                    ? 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer'
                    : isUnlocked
                    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer'
                    : 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
                }`}
                title={step.description}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isActive
                      ? 'bg-white text-blue-600'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
                      : isUnlocked
                      ? 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800/40 dark:text-slate-600'
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.stepNumber}
                </span>
                <span className="whitespace-nowrap">{step.label}</span>
              </button>

              {idx < WORKFLOW_STEPS.length - 1 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
