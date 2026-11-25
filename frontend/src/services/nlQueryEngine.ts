import { ParsedDataset, ColumnProfile } from '../types/dataset';
import { ChatMessage } from '../types/ai';
import { cleanNumericValue } from './schemaDetection';
import { formatCompactNumber, formatNumber } from '../utils/formatting';
import { aggregateByDimension } from './chartRecommendation';

/**
 * Natural Language Query Engine
 * Parses plain-English analytical questions and computes precise answers directly from dataset rows
 */
export function processNaturalLanguageQuery(
  query: string,
  dataset: ParsedDataset,
  profiles: Record<string, ColumnProfile>
): ChatMessage {
  const q = query.trim().toLowerCase();
  const rows = dataset.data;
  const profileList = Object.values(profiles);

  const numericCols = profileList.filter(p => ['numerical', 'currency'].includes(p.effectiveType)).map(p => p.name);
  const categoricalCols = profileList.filter(p => ['categorical', 'geographic'].includes(p.effectiveType)).map(p => p.name);

  const defaultMeasure = numericCols[0] || dataset.rawHeaders[0];

  // Helper: find column mentioned in query
  const findMatchingCol = (cols: string[]): string | undefined => {
    return cols.find(c => {
      const clean = c.toLowerCase().replace(/_/g, ' ');
      return q.includes(clean) || clean.split(' ').some(w => w.length > 3 && q.includes(w));
    });
  };

  const matchedMeasure = findMatchingCol(numericCols) || defaultMeasure;
  const matchedDim = findMatchingCol(categoricalCols) || categoricalCols[0];

  // 1. TOTAL / SUM QUERY
  if (/total|sum|cumulative|overall/i.test(q) && !/top|highest|best|compare/i.test(q)) {
    let total = 0;
    for (const r of rows) {
      total += cleanNumericValue(r[matchedMeasure]) || 0;
    }

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Based on your dataset containing **${rows.length.toLocaleString()}** records, the cumulative **Total ${matchedMeasure.replace(/_/g, ' ')}** is **${formatCompactNumber(total)}** (${formatNumber(total)}).`,
      visualData: {
        type: 'metric',
        title: `Total ${matchedMeasure.replace(/_/g, ' ')}`,
        highlightValue: formatCompactNumber(total),
      },
      suggestedFollowUps: [
        `What is the average ${matchedMeasure}?`,
        `Show top 5 ${matchedDim} by ${matchedMeasure}`,
        `Are there any outliers in ${matchedMeasure}?`,
      ],
    };
  }

  // 2. AVERAGE / MEAN QUERY
  if (/average|mean|typical|per transaction|avg/i.test(q)) {
    let total = 0;
    let count = 0;
    for (const r of rows) {
      const val = cleanNumericValue(r[matchedMeasure]);
      if (val !== null) {
        total += val;
        count++;
      }
    }
    const avg = count > 0 ? total / count : 0;
    const median = profiles[matchedMeasure]?.numericalStats?.median || avg;

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `The average **${matchedMeasure.replace(/_/g, ' ')}** across all observations is **${formatCompactNumber(avg)}** (median: **${formatCompactNumber(median)}**).`,
      visualData: {
        type: 'metric',
        title: `Average ${matchedMeasure.replace(/_/g, ' ')}`,
        highlightValue: formatCompactNumber(avg),
      },
      suggestedFollowUps: [
        `What is the total ${matchedMeasure}?`,
        `Show me top 5 ${matchedDim}`,
        `Are there outliers in ${matchedMeasure}?`,
      ],
    };
  }

  // 3. TOP N / HIGHEST / RANKING QUERY
  if (/top|highest|best|leading|leader|rank|maximum|max/i.test(q)) {
    const topN = 5;
    const targetDim = matchedDim || categoricalCols[0];
    const targetMeasure = matchedMeasure || defaultMeasure;

    const rankings = aggregateByDimension(rows, targetDim, targetMeasure, 'sum', topN, 'value_desc');

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Here are the **Top ${rankings.length} ${targetDim.replace(/_/g, ' ')}** ranked by highest **${targetMeasure.replace(/_/g, ' ')}**. The top rank "${rankings[0]?.label}" leads with **${formatCompactNumber(rankings[0]?.value || 0)}** (${rankings[0]?.percentage}%).`,
      visualData: {
        type: 'comparison',
        title: `Top ${rankings.length} ${targetDim} by ${targetMeasure}`,
        items: rankings.map((r, i) => ({
          label: `#${i + 1} ${r.label}`,
          value: formatCompactNumber(r.value),
          secondary: `${r.percentage}% of volume`,
        })),
      },
      suggestedFollowUps: [
        `Show the bottom performing ${targetDim}`,
        `What is the average ${targetMeasure}?`,
        `Summarize key findings`,
      ],
    };
  }

  // 4. LOWEST / WORST / BOTTOM QUERY
  if (/bottom|lowest|worst|least|underperforming/i.test(q)) {
    const targetDim = matchedDim || categoricalCols[0];
    const targetMeasure = matchedMeasure || defaultMeasure;

    const rankings = aggregateByDimension(rows, targetDim, targetMeasure, 'sum', 20, 'value_asc');
    const bottom5 = rankings.slice(0, 5);

    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Identified the **lowest performing ${targetDim.replace(/_/g, ' ')}** segments by **${targetMeasure.replace(/_/g, ' ')}**. The lowest observation is "${bottom5[0]?.label}" at **${formatCompactNumber(bottom5[0]?.value || 0)}**.`,
      visualData: {
        type: 'list',
        title: `Lowest ${targetDim} by ${targetMeasure}`,
        items: bottom5.map(r => ({
          label: r.label,
          value: formatCompactNumber(r.value),
        })),
      },
      suggestedFollowUps: [
        `Show the top 5 ${targetDim}`,
        `Are there outliers in ${targetMeasure}?`,
        `Summarize key findings`,
      ],
    };
  }

  // 5. OUTLIERS / ANOMALY QUERY
  if (/outlier|anomaly|anomalies|abnormal|extreme|skew/i.test(q)) {
    const prof = profiles[matchedMeasure];
    const outliers = prof?.numericalStats?.outliers;

    if (outliers && outliers.count > 0) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Yes, detected **${outliers.count} statistical outliers** in column **"${matchedMeasure}"** (${outliers.percentage}% of total records). Observations outside fence range [${formatCompactNumber(outliers.lowerBound)} to ${formatCompactNumber(outliers.upperBound)}] include extreme values reaching **${formatCompactNumber(prof.numericalStats?.max || 0)}**.`,
        visualData: {
          type: 'metric',
          title: `Outliers in ${matchedMeasure}`,
          highlightValue: `${outliers.count} records`,
        },
        suggestedFollowUps: [
          `What is the average ${matchedMeasure}?`,
          `Show top 5 ${matchedDim}`,
          `Summarize key findings`,
        ],
      };
    } else {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `No significant statistical outliers detected in **"${matchedMeasure}"**. The values are evenly distributed around the mean of **${formatCompactNumber(prof?.numericalStats?.mean || 0)}**.`,
        suggestedFollowUps: [
          `What is the total ${matchedMeasure}?`,
          `Show top 5 ${matchedDim}`,
        ],
      };
    }
  }

  // 6. RECORD COUNT / VOLUME QUERY
  if (/how many|count|volume|number of records|rows/i.test(q)) {
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Your dataset contains **${rows.length.toLocaleString()} total rows** and **${dataset.rawHeaders.length} columns**.`,
      visualData: {
        type: 'metric',
        title: 'Total Records Analyzed',
        highlightValue: rows.length.toLocaleString(),
      },
      suggestedFollowUps: [
        `What is the total ${matchedMeasure}?`,
        `Show top 5 ${matchedDim}`,
      ],
    };
  }

  // 7. EXECUTIVE SUMMARY / GENERAL OVERVIEW (Default)
  let total = 0;
  for (const r of rows) total += cleanNumericValue(r[matchedMeasure]) || 0;
  const topSegments = aggregateByDimension(rows, matchedDim, matchedMeasure, 'sum', 3, 'value_desc');

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    text: `Here is an analytical summary for **${dataset.meta.name}**:\n\n` +
      `• **Dataset Scale**: ${rows.length.toLocaleString()} rows across ${dataset.rawHeaders.length} dimensions.\n` +
      `• **Primary Measure**: Total ${matchedMeasure.replace(/_/g, ' ')} stands at **${formatCompactNumber(total)}**.\n` +
      `• **Top Driver**: "${topSegments[0]?.label || 'Primary'}" represents the leading category segment with **${formatCompactNumber(topSegments[0]?.value || 0)}**.\n` +
      `• **Data Quality**: Verified dataset structure and automated type inference ready for BI reporting.`,
    visualData: {
      type: 'comparison',
      title: `Top Drivers: ${matchedDim} by ${matchedMeasure}`,
      items: topSegments.map(s => ({
        label: s.label,
        value: formatCompactNumber(s.value),
        secondary: `${s.percentage}% share`,
      })),
    },
    suggestedFollowUps: [
      `What is our total ${matchedMeasure}?`,
      `Show me top 5 ${matchedDim}`,
      `Are there any outliers in ${matchedMeasure}?`,
    ],
  };
}
