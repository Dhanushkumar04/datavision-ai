import { SemanticType } from '../types/dataset';

// Common geographical keywords and known terms
const GEO_HEADER_REGEX = /(city|country|state|province|region|postal|zip|zipcode|latitude|longitude|lat|lon|address|territory|continent)/i;
const GEO_VALUES = new Set([
  'north', 'south', 'east', 'west', 'central', 'northeast', 'northwest', 'southeast', 'southwest',
  'bangalore', 'mumbai', 'delhi', 'chennai', 'hyderabad', 'kolkata', 'pune', 'ahmedabad', 'gurugram',
  'usa', 'united states', 'uk', 'india', 'germany', 'france', 'canada', 'australia', 'japan', 'china'
]);

// Date header regex
const DATE_HEADER_REGEX = /(date|time|timestamp|datetime|day|month|year|created_at|updated_at|hire_date|order_date|admission_date|discharge_date)/i;

// Currency header regex
const CURRENCY_HEADER_REGEX = /(revenue|sales|profit|price|cost|salary|mrr|arr|cac|ltv|spend|amount|budget|fee|total_sales|unit_price|net_profit)/i;
const CURRENCY_SYMBOLS_REGEX = /[$€£₹¥]/;

// Percentage header regex
const PERCENTAGE_HEADER_REGEX = /(pct|percent|percentage|rate|margin|discount|ratio|coverage_pct|discount_pct|churn_rate)/i;

// Identifier header regex
const ID_HEADER_REGEX = /^(id|_id|uuid|guid|code|key|no|num)$|(_id|_code|_key|_num|order_id|customer_id|employee_id|patient_id|campaign_id)$/i;

// Boolean patterns
const BOOLEAN_VALUES = new Set(['true', 'false', 'yes', 'no', '1', '0', 'y', 'n', 't', 'f']);

/**
 * Checks if a string looks like a standard ISO or typical date
 */
export function isValidDateString(val: string): boolean {
  if (!val || typeof val !== 'string') return false;
  const trimmed = val.trim();
  if (trimmed.length < 4 || trimmed.length > 35) return false;

  // Explicit check for numeric year formats YYYY-MM-DD or YYYY/MM/DD or DD-MM-YYYY
  const datePattern = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}(T|\s|$)/;
  const altDatePattern = /^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}$/;
  const yearMonthPattern = /^\d{4}[-/.]\d{2}$/; // e.g. 2024-01
  const monthNamePattern = /^\d{1,2}[-\s][A-Za-z]{3,9}[-\s]\d{2,4}$/i; // e.g. 15 Jan 2024

  if (!datePattern.test(trimmed) && !altDatePattern.test(trimmed) && !yearMonthPattern.test(trimmed) && !monthNamePattern.test(trimmed)) {
    return false;
  }

  const timestamp = Date.parse(trimmed);
  return !isNaN(timestamp);
}

/**
 * Tests if value is clean numeric (or currency/percentage formatted)
 */
export function cleanNumericValue(val: any): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return isNaN(val) ? null : val;

  const str = String(val).trim().replace(/[$€£₹¥,\s]/g, '');
  if (str.endsWith('%')) {
    const num = parseFloat(str.slice(0, -1));
    return isNaN(num) ? null : num;
  }

  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Semantic Type Classifier
 * Evaluates column name, sample values, uniqueness ratio, and formatting patterns
 */
export function detectSemanticType(
  columnName: string,
  values: any[],
  totalRows: number
): SemanticType {
  const nonNullValues = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  if (nonNullValues.length === 0) {
    return 'other';
  }

  const uniqueSet = new Set(nonNullValues.map(v => String(v).trim().toLowerCase()));
  const uniqueRatio = uniqueSet.size / nonNullValues.length;
  const sampleStrings = nonNullValues.slice(0, 30).map(v => String(v).trim());

  // 1. Check Date & Time FIRST
  const isDateNamed = DATE_HEADER_REGEX.test(columnName);
  const dateMatches = sampleStrings.filter(s => isValidDateString(s)).length;
  const dateRatio = dateMatches / sampleStrings.length;

  if (dateRatio > 0.6 || (isDateNamed && (dateRatio > 0.2 || sampleStrings.some(s => isValidDateString(s))))) {
    return 'datetime';
  }

  // 2. Check Identifier vs Dimensional Foreign Key
  // Primary Keys (e.g. Order_ID, EMP-8001) have high uniqueness (>= 85%).
  // Foreign Keys / Dimensions (e.g. customer_id, product_id, seller_id in an orders table)
  // have low/moderate uniqueness (< 85%) and represent categorical entities to group and filter by.
  const isIdNamed = ID_HEADER_REGEX.test(columnName);
  const hasIdPattern = sampleStrings.every(s => /^[A-Z0-9_-]{3,}$/i.test(s) && !isValidDateString(s));

  if (isIdNamed || hasIdPattern) {
    if (uniqueRatio >= 0.85) {
      return 'identifier';
    } else {
      // Repeated entity IDs across transactions are categorical dimensions
      return 'categorical';
    }
  }

  // 2. Check Boolean
  const allBooleanValues = nonNullValues.every(v => {
    const s = String(v).trim().toLowerCase();
    return BOOLEAN_VALUES.has(s);
  });
  if (allBooleanValues && uniqueSet.size <= 2) {
    return 'boolean';
  }

  // 3. Check Percentage (e.g. 10%, 0.15 with percent header)
  const hasPercentageSymbol = sampleStrings.some(s => s.endsWith('%'));
  if (hasPercentageSymbol || PERCENTAGE_HEADER_REGEX.test(columnName)) {
    const validPercentValues = nonNullValues.filter(v => {
      const s = String(v).trim();
      if (s.endsWith('%')) return !isNaN(parseFloat(s.slice(0, -1)));
      const num = parseFloat(s);
      return !isNaN(num) && num >= -100 && num <= 100;
    });
    if (validPercentValues.length / nonNullValues.length > 0.8) {
      return 'percentage';
    }
  }

  // 4. Check Currency
  const hasCurrencySymbol = sampleStrings.some(s => CURRENCY_SYMBOLS_REGEX.test(s));
  const isCurrencyNamed = CURRENCY_HEADER_REGEX.test(columnName);
  const numericCount = nonNullValues.filter(v => cleanNumericValue(v) !== null).length;
  const numericRatio = numericCount / nonNullValues.length;

  if ((hasCurrencySymbol || isCurrencyNamed) && numericRatio > 0.8) {
    return 'currency';
  }

  // 5. Check Geographic
  const isGeoNamed = GEO_HEADER_REGEX.test(columnName);
  const matchesGeoValues = sampleStrings.filter(s => GEO_VALUES.has(s.toLowerCase())).length;
  if (isGeoNamed || (matchesGeoValues / sampleStrings.length > 0.4)) {
    return 'geographic';
  }

  // 7. Check Numerical
  if (numericRatio > 0.85) {
    return 'numerical';
  }

  // 8. Text vs Categorical
  // If unique ratio is high and average string length is long (> 35 chars) -> Text
  const avgLength = sampleStrings.reduce((acc, s) => acc + s.length, 0) / sampleStrings.length;
  if (avgLength > 40 || (uniqueRatio > 0.85 && totalRows > 50)) {
    return 'text';
  }

  // Otherwise, default discrete values with low/medium cardinality are Categorical
  return 'categorical';
}
