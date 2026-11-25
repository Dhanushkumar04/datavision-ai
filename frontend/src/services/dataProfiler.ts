import { 
  ParsedDataset, 
  DatasetAnalysisResult, 
  DatasetOverview, 
  ColumnProfile, 
  SemanticType, 
  NumericalStats, 
  CategoricalStats, 
  DateStats, 
  ColumnRelationship 
} from '../types/dataset';
import { detectSemanticType, cleanNumericValue, isValidDateString } from './schemaDetection';

/**
 * Calculates dataset overview statistics
 */
export function calculateOverview(dataset: ParsedDataset, profiles: Record<string, ColumnProfile>): DatasetOverview {
  const totalRows = dataset.data.length;
  const totalColumns = dataset.rawHeaders.length;

  let missingCells = 0;
  const seenRowStrings = new Set<string>();
  let duplicateRows = 0;

  for (const row of dataset.data) {
    const rowStr = JSON.stringify(row);
    if (seenRowStrings.has(rowStr)) {
      duplicateRows++;
    } else {
      seenRowStrings.add(rowStr);
    }

    for (const header of dataset.rawHeaders) {
      const val = row[header];
      if (val === null || val === undefined || String(val).trim() === '') {
        missingCells++;
      }
    }
  }

  const totalCells = totalRows * totalColumns;
  const missingCellsPercentage = totalCells > 0 ? (missingCells / totalCells) * 100 : 0;
  const duplicateRowsPercentage = totalRows > 0 ? (duplicateRows / totalRows) * 100 : 0;
  const uniqueRecordCount = seenRowStrings.size;

  // Approximate memory usage in bytes
  const memoryUsageBytes = dataset.meta.sizeBytes || new Blob([JSON.stringify(dataset.data)]).size;

  const typeCounts: Record<SemanticType, number> = {
    numerical: 0,
    categorical: 0,
    datetime: 0,
    boolean: 0,
    identifier: 0,
    currency: 0,
    percentage: 0,
    geographic: 0,
    text: 0,
    other: 0,
  };

  for (const col of Object.values(profiles)) {
    typeCounts[col.effectiveType] = (typeCounts[col.effectiveType] || 0) + 1;
  }

  return {
    totalRows,
    totalColumns,
    duplicateRows,
    duplicateRowsPercentage: Number(duplicateRowsPercentage.toFixed(1)),
    missingCells,
    missingCellsPercentage: Number(missingCellsPercentage.toFixed(1)),
    memoryUsageBytes,
    uniqueRecordCount,
    typeCounts,
  };
}

/**
 * Profiles a numerical column
 */
function profileNumericalColumn(values: any[]): NumericalStats {
  const nums: number[] = [];
  for (const v of values) {
    const num = cleanNumericValue(v);
    if (num !== null) nums.push(num);
  }

  if (nums.length === 0) {
    return {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      mode: [0],
      stdDev: 0,
      variance: 0,
      p25: 0,
      p50: 0,
      p75: 0,
      p90: 0,
      p95: 0,
      iqr: 0,
      skewness: 0,
      outliers: { count: 0, percentage: 0, lowerBound: 0, upperBound: 0, sampleOutliers: [] },
      histogramBuckets: [],
    };
  }

  nums.sort((a, b) => a - b);
  const n = nums.length;
  const sum = nums.reduce((acc, val) => acc + val, 0);
  const mean = sum / n;
  const min = nums[0];
  const max = nums[n - 1];

  // Percentiles
  const getPercentile = (p: number) => {
    const idx = (p / 100) * (n - 1);
    const low = Math.floor(idx);
    const high = Math.ceil(idx);
    const weight = idx - low;
    return nums[low] * (1 - weight) + nums[high] * weight;
  };

  const p25 = getPercentile(25);
  const p50 = getPercentile(50);
  const p75 = getPercentile(75);
  const p90 = getPercentile(90);
  const p95 = getPercentile(95);
  const median = p50;

  // Variance & StdDev
  const varianceSum = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
  const variance = n > 1 ? varianceSum / (n - 1) : 0;
  const stdDev = Math.sqrt(variance);

  // Skewness
  let skewness = 0;
  if (stdDev > 0 && n > 2) {
    const m3 = nums.reduce((acc, val) => acc + Math.pow(val - mean, 3), 0) / n;
    skewness = m3 / Math.pow(stdDev, 3);
  }

  // Mode
  const freqMap = new Map<number, number>();
  let maxFreq = 0;
  for (const num of nums) {
    const f = (freqMap.get(num) || 0) + 1;
    freqMap.set(num, f);
    if (f > maxFreq) maxFreq = f;
  }
  const modes: number[] = [];
  if (maxFreq > 1) {
    for (const [k, v] of freqMap.entries()) {
      if (v === maxFreq && modes.length < 5) modes.push(k);
    }
  }

  // IQR Outliers (Tukey's method)
  const iqr = p75 - p25;
  const lowerBound = p25 - 1.5 * iqr;
  const upperBound = p75 + 1.5 * iqr;
  const outlierVals = nums.filter(x => x < lowerBound || x > upperBound);

  // Histogram buckets (7 to 10 bins)
  const bucketCount = Math.min(10, Math.max(5, Math.ceil(Math.sqrt(n))));
  const range = max - min;
  const bucketWidth = range > 0 ? range / bucketCount : 1;
  const histogramBuckets = [];

  for (let b = 0; b < bucketCount; b++) {
    const bMin = min + b * bucketWidth;
    const bMax = b === bucketCount - 1 ? max : min + (b + 1) * bucketWidth;
    const count = nums.filter(x => (b === bucketCount - 1 ? x >= bMin && x <= bMax : x >= bMin && x < bMax)).length;
    histogramBuckets.push({
      binIndex: b,
      range: `${bMin.toFixed(1)} - ${bMax.toFixed(1)}`,
      min: Number(bMin.toFixed(2)),
      max: Number(bMax.toFixed(2)),
      count,
      percentage: Number(((count / n) * 100).toFixed(1)),
    });
  }

  return {
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    mean: Number(mean.toFixed(2)),
    median: Number(median.toFixed(2)),
    mode: modes.length > 0 ? modes : [Number(median.toFixed(2))],
    stdDev: Number(stdDev.toFixed(2)),
    variance: Number(variance.toFixed(2)),
    p25: Number(p25.toFixed(2)),
    p50: Number(p50.toFixed(2)),
    p75: Number(p75.toFixed(2)),
    p90: Number(p90.toFixed(2)),
    p95: Number(p95.toFixed(2)),
    iqr: Number(iqr.toFixed(2)),
    skewness: Number(skewness.toFixed(2)),
    outliers: {
      count: outlierVals.length,
      percentage: Number(((outlierVals.length / n) * 100).toFixed(1)),
      lowerBound: Number(lowerBound.toFixed(2)),
      upperBound: Number(upperBound.toFixed(2)),
      sampleOutliers: outlierVals.slice(0, 5),
    },
    histogramBuckets,
  };
}

/**
 * Profiles a categorical column
 */
function profileCategoricalColumn(values: any[]): CategoricalStats {
  const freqMap = new Map<string, number>();
  let totalValid = 0;

  for (const v of values) {
    if (v !== null && v !== undefined && String(v).trim() !== '') {
      const key = String(v).trim();
      freqMap.set(key, (freqMap.get(key) || 0) + 1);
      totalValid++;
    }
  }

  const sortedPairs = Array.from(freqMap.entries()).sort((a, b) => b[1] - a[1]);

  const topValues = sortedPairs.slice(0, 10).map(([value, count]) => ({
    value,
    count,
    percentage: totalValid > 0 ? Number(((count / totalValid) * 100).toFixed(1)) : 0,
  }));

  const leastValues = sortedPairs.slice(-5).reverse().map(([value, count]) => ({
    value,
    count,
    percentage: totalValid > 0 ? Number(((count / totalValid) * 100).toFixed(1)) : 0,
  }));

  const mostFrequent = topValues[0] || { value: 'None', count: 0 };
  const leastFrequent = leastValues[0] || { value: 'None', count: 0 };

  return {
    cardinality: freqMap.size,
    topValues,
    leastValues,
    mostFrequent: { value: mostFrequent.value, count: mostFrequent.count },
    leastFrequent: { value: leastFrequent.value, count: leastFrequent.count },
  };
}

/**
 * Profiles a date column
 */
function profileDateColumn(values: any[]): DateStats {
  const validTimestamps: number[] = [];
  let invalidDatesCount = 0;
  let hasTimeComponent = false;

  for (const v of values) {
    if (v !== null && v !== undefined && String(v).trim() !== '') {
      const str = String(v).trim();
      if (isValidDateString(str)) {
        const ts = Date.parse(str);
        if (!isNaN(ts)) {
          validTimestamps.push(ts);
          if (str.includes(':') || str.includes('T')) {
            hasTimeComponent = true;
          }
        } else {
          invalidDatesCount++;
        }
      } else {
        invalidDatesCount++;
      }
    }
  }

  if (validTimestamps.length === 0) {
    return {
      earliest: 'N/A',
      latest: 'N/A',
      rangeDays: 0,
      hasTimeComponent: false,
      availableDimensions: ['year', 'month', 'day'],
      parsedDatesCount: 0,
      invalidDatesCount,
    };
  }

  validTimestamps.sort((a, b) => a - b);
  const minTs = validTimestamps[0];
  const maxTs = validTimestamps[validTimestamps.length - 1];
  const rangeDays = Math.ceil((maxTs - minTs) / (1000 * 60 * 60 * 24));

  const availableDimensions: ('year' | 'quarter' | 'month' | 'week' | 'day')[] = ['year', 'month', 'day'];
  if (rangeDays > 90) availableDimensions.push('quarter');
  if (rangeDays > 14) availableDimensions.push('week');

  return {
    earliest: new Date(minTs).toISOString().split('T')[0],
    latest: new Date(maxTs).toISOString().split('T')[0],
    rangeDays,
    hasTimeComponent,
    availableDimensions,
    parsedDatesCount: validTimestamps.length,
    invalidDatesCount,
  };
}

/**
 * Detects relationships across columns (Formulas, Identifiers, Correlations, Hierarchies)
 */
export function detectRelationships(
  dataset: ParsedDataset,
  profiles: Record<string, ColumnProfile>
): ColumnRelationship[] {
  const relationships: ColumnRelationship[] = [];
  const rows = dataset.data;
  const n = rows.length;
  if (n === 0) return relationships;

  // 1. Primary Key Detection (only on entity identifier or text/code columns)
  for (const col of Object.values(profiles)) {
    if (['identifier', 'text', 'categorical'].includes(col.effectiveType) && col.nullCount === 0 && col.uniqueCount === n) {
      const isNamedId = /^(id|_id|order_id|customer_id|emp|pt|employee_id|patient_id)$/i.test(col.name);
      relationships.push({
        type: 'primary_key',
        sourceColumns: [col.name],
        targetColumn: col.name,
        description: `Column "${col.name}" has 100% unique values and zero missing values. Strong candidate for Primary Key.`,
        confidence: isNamedId ? 'verified' : 'inferred',
      });
    }
  }

  // 2. Arithmetic / Derived Metric Relationships (e.g. Quantity * Unit_Price = Total_Sales)
  const numericCols = Object.values(profiles)
    .filter(p => ['numerical', 'currency', 'percentage'].includes(p.effectiveType))
    .map(p => p.name);

  if (numericCols.length >= 3) {
    for (let i = 0; i < numericCols.length; i++) {
      for (let j = i + 1; j < numericCols.length; j++) {
        for (let k = 0; k < numericCols.length; k++) {
          if (k === i || k === j) continue;

          const colA = numericCols[i];
          const colB = numericCols[j];
          const colC = numericCols[k];

          let multMatches = 0;
          let diffMatches = 0;
          let validTriples = 0;

          for (const row of rows) {
            const valA = cleanNumericValue(row[colA]);
            const valB = cleanNumericValue(row[colB]);
            const valC = cleanNumericValue(row[colC]);

            if (valA !== null && valB !== null && valC !== null) {
              validTriples++;
              // Check A * B = C (within 1% tolerance for rounding/floats)
              const expectedMult = valA * valB;
              if (Math.abs(expectedMult - valC) < Math.max(0.05, 0.01 * Math.abs(valC))) {
                multMatches++;
              }
              // Check A - B = C
              if (Math.abs(valA - valB - valC) < Math.max(0.05, 0.01 * Math.abs(valC))) {
                diffMatches++;
              }
            }
          }

          if (validTriples >= 5 && multMatches / validTriples > 0.85) {
            relationships.push({
              type: 'arithmetic',
              sourceColumns: [colA, colB],
              targetColumn: colC,
              formula: `${colA} × ${colB} = ${colC}`,
              description: `Verified derived formula: "${colA}" multiplied by "${colB}" equals "${colC}".`,
              confidence: 'verified',
            });
          } else if (validTriples >= 5 && diffMatches / validTriples > 0.85) {
            relationships.push({
              type: 'arithmetic',
              sourceColumns: [colA, colB],
              targetColumn: colC,
              formula: `${colA} - ${colB} = ${colC}`,
              description: `Verified derived metric: "${colA}" minus "${colB}" equals "${colC}".`,
              confidence: 'verified',
            });
          }
        }
      }
    }
  }

  // 3. Pearson Correlation between Numerical Column pairs
  if (numericCols.length >= 2) {
    for (let i = 0; i < numericCols.length; i++) {
      for (let j = i + 1; j < numericCols.length; j++) {
        const colA = numericCols[i];
        const colB = numericCols[j];

        const pairs: [number, number][] = [];
        for (const row of rows) {
          const a = cleanNumericValue(row[colA]);
          const b = cleanNumericValue(row[colB]);
          if (a !== null && b !== null) pairs.push([a, b]);
        }

        if (pairs.length >= 8) {
          const meanA = pairs.reduce((acc, p) => acc + p[0], 0) / pairs.length;
          const meanB = pairs.reduce((acc, p) => acc + p[1], 0) / pairs.length;

          let num = 0;
          let denA = 0;
          let denB = 0;

          for (const [a, b] of pairs) {
            const diffA = a - meanA;
            const diffB = b - meanB;
            num += diffA * diffB;
            denA += diffA * diffA;
            denB += diffB * diffB;
          }

          const denom = Math.sqrt(denA * denB);
          if (denom > 0) {
            const r = num / denom;
            if (Math.abs(r) >= 0.7) {
              relationships.push({
                type: 'correlation',
                sourceColumns: [colA],
                targetColumn: colB,
                metricValue: Number(r.toFixed(2)),
                description: `Strong ${r > 0 ? 'positive' : 'negative'} linear correlation (r = ${r.toFixed(2)}) between "${colA}" and "${colB}".`,
                confidence: 'inferred',
              });
            }
          }
        }
      }
    }
  }

  // 4. Geographic or Categorical Hierarchy (e.g. City -> Region)
  const catCols = Object.values(profiles)
    .filter(p => ['categorical', 'geographic'].includes(p.effectiveType))
    .map(p => p.name);

  if (catCols.length >= 2) {
    for (const child of catCols) {
      for (const parent of catCols) {
        if (child === parent) continue;

        // Check if each unique child value maps to exactly one parent value
        const childToParent = new Map<string, string>();
        let isStrictHierarchy = true;

        for (const row of rows) {
          const c = String(row[child] || '').trim();
          const p = String(row[parent] || '').trim();
          if (!c || !p) continue;

          if (childToParent.has(c)) {
            if (childToParent.get(c) !== p) {
              isStrictHierarchy = false;
              break;
            }
          } else {
            childToParent.set(c, p);
          }
        }

        if (isStrictHierarchy && childToParent.size >= 3) {
          relationships.push({
            type: 'hierarchy',
            sourceColumns: [child],
            targetColumn: parent,
            description: `Hierarchical relationship: each "${child}" maps strictly to one "${parent}".`,
            confidence: 'verified',
          });
        }
      }
    }
  }

  return relationships;
}

/**
 * Main profiling function: analyzes complete dataset and returns comprehensive profile
 */
export function profileDataset(
  dataset: ParsedDataset,
  existingOverrides?: Record<string, SemanticType>
): DatasetAnalysisResult {
  const columnProfiles: Record<string, ColumnProfile> = {};
  const totalRows = dataset.data.length;

  // Profile each column
  for (const header of dataset.rawHeaders) {
    const rawValues = dataset.data.map(row => row[header]);
    const detectedType = detectSemanticType(header, rawValues, totalRows);
    const effectiveType = existingOverrides && existingOverrides[header] ? existingOverrides[header] : detectedType;
    const isUserOverridden = Boolean(existingOverrides && existingOverrides[header]);

    // Completeness & Uniqueness
    let nullCount = 0;
    const uniqueValues = new Set<string>();

    for (const v of rawValues) {
      if (v === null || v === undefined || String(v).trim() === '') {
        nullCount++;
      } else {
        uniqueValues.add(String(v).trim());
      }
    }

    const nullPercentage = totalRows > 0 ? (nullCount / totalRows) * 100 : 0;
    const uniqueCount = uniqueValues.size;
    const uniquePercentage = totalRows > 0 ? (uniqueCount / totalRows) * 100 : 0;
    const sampleValues = rawValues.filter(v => v !== null && v !== undefined && String(v).trim() !== '').slice(0, 5);

    // Compute detailed stats according to effective type
    let numericalStats: NumericalStats | undefined;
    let categoricalStats: CategoricalStats | undefined;
    let dateStats: DateStats | undefined;

    if (['numerical', 'currency', 'percentage'].includes(effectiveType)) {
      numericalStats = profileNumericalColumn(rawValues);
    }

    if (['categorical', 'geographic', 'text', 'identifier', 'boolean'].includes(effectiveType)) {
      categoricalStats = profileCategoricalColumn(rawValues);
    }

    if (effectiveType === 'datetime') {
      dateStats = profileDateColumn(rawValues);
    }

    columnProfiles[header] = {
      name: header,
      detectedType,
      effectiveType,
      isUserOverridden,
      totalCount: totalRows,
      nullCount,
      nullPercentage: Number(nullPercentage.toFixed(1)),
      uniqueCount,
      uniquePercentage: Number(uniquePercentage.toFixed(1)),
      sampleValues,
      numericalStats,
      categoricalStats,
      dateStats,
    };
  }

  const overview = calculateOverview(dataset, columnProfiles);
  const relationships = detectRelationships(dataset, columnProfiles);

  return {
    overview,
    columnProfiles,
    relationships,
    analyzedAt: new Date().toISOString(),
  };
}
