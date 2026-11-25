import React from 'react';
import { 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Activity, 
  ArrowRight,
  Database,
  Layers
} from 'lucide-react';
import { SAMPLE_DATASETS } from '../../services/sampleDatasets';
import { SampleDatasetInfo } from '../../types/dataset';

interface SampleDatasetSelectorProps {
  onSelectSample: (sample: SampleDatasetInfo) => void;
  isLoading: boolean;
}

export const SampleDatasetSelector: React.FC<SampleDatasetSelectorProps> = ({ 
  onSelectSample, 
  isLoading 
}) => {
  const getIcon = (domain: string) => {
    switch (domain) {
      case 'Sales Analytics':
        return ShoppingBag;
      case 'HR Analytics':
        return Users;
      case 'Financial Analytics':
        return TrendingUp;
      case 'Healthcare Analytics':
        return Activity;
      default:
        return Database;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center">
            <Layers className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            Or start instantly with a sample dataset
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Explore complete end-to-end automated BI across different structured domains.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {SAMPLE_DATASETS.map((sample) => {
          const Icon = getIcon(sample.domain);

          return (
            <div
              key={sample.id}
              onClick={() => !isLoading && onSelectSample(sample)}
              className="group p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${sample.badgeColor}`}>
                    {sample.domain}
                  </span>
                </div>

                <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {sample.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {sample.description}
                </p>

                <div className="flex flex-wrap gap-1 mb-3">
                  {sample.keyColumns.slice(0, 3).map((col) => (
                    <span 
                      key={col}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono"
                    >
                      {col}
                    </span>
                  ))}
                  {sample.keyColumns.length > 3 && (
                    <span className="text-[10px] px-1 py-0.5 text-slate-400">
                      +{sample.keyColumns.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>{sample.rowCount} records • {sample.columnCount} cols</span>
                <span className="inline-flex items-center group-hover:translate-x-1 transition-transform">
                  Load <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
