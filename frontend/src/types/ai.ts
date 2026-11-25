export type InsightCategory = 'trend' | 'anomaly' | 'opportunity' | 'risk' | 'summary';

export type InsightImpact = 'high' | 'medium' | 'low';

export interface BusinessInsight {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  impact: InsightImpact;
  dimension?: string;
  measure?: string;
  metricValue?: string | number;
  evidence: string;
  recommendation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  suggestedFollowUps?: string[];
  visualData?: {
    type: 'metric' | 'list' | 'comparison' | 'table';
    title: string;
    items?: { label: string; value: string | number; secondary?: string }[];
    highlightValue?: string;
  };
}

export interface ChartExplanation {
  chartId: string;
  summary: string;
  keyTakeaway: string;
  dominantSegment?: string;
  anomalyAlert?: string;
}
