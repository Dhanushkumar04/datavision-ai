import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedDataset, DatasetMeta, ValidationResult } from '../types/dataset';

export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB
export const SUPPORTED_EXTENSIONS = ['.csv', '.xlsx', '.xls'];

/**
 * Validates file format, size, and basic integrity checks
 */
export function validateFile(file: File): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const lowerName = file.name.toLowerCase();
  const hasValidExt = SUPPORTED_EXTENSIONS.some(ext => lowerName.endsWith(ext));

  if (!hasValidExt) {
    errors.push(`Unsupported file format. Please upload a CSV (.csv) or Excel spreadsheet (.xlsx, .xls).`);
  }

  if (file.size === 0) {
    errors.push(`The selected file is empty (0 bytes). Please upload a valid dataset.`);
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    errors.push(`File exceeds the maximum recommended limit of 50 MB (current size: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
  }

  if (file.size > 20 * 1024 * 1024) {
    warnings.push(`Large file detected (>20MB). Processing may take a few seconds.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Parses a CSV file or CSV string into a structured ParsedDataset
 * Note: Never pass `step:` to Papa.parse if you expect `complete(results)` to have `results.data`!
 */
export async function parseCsvFile(
  fileOrString: File | string,
  onProgress?: (percent: number) => void
): Promise<ParsedDataset> {
  let csvText = '';
  let fileName = 'dataset.csv';
  let fileSize = 1024;

  if (typeof fileOrString === 'string') {
    csvText = fileOrString;
    fileSize = csvText.length;
  } else if (fileOrString instanceof File) {
    fileName = fileOrString.name;
    fileSize = fileOrString.size;
    if (onProgress) onProgress(20);
    csvText = await fileOrString.text();
    if (onProgress) onProgress(50);
  }

  if (!csvText || csvText.trim() === '') {
    throw new Error('The uploaded CSV file is empty (contains no text).');
  }

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, any>>(csvText, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false, // Keep raw strings initially for precise quality audits
      delimitersToGuess: [',', '\t', '|', ';'],
      complete: (results) => {
        if (onProgress) onProgress(100);

        if (!results.data || results.data.length === 0) {
          return reject(new Error('The uploaded CSV file contains no data rows.'));
        }

        // Clean headers: remove BOM and surrounding whitespace
        let rawHeaders = (results.meta.fields || []).map(h => (h ? h.trim().replace(/^\uFEFF/, '') : ''));
        rawHeaders = rawHeaders.filter(h => h.length > 0);

        if (rawHeaders.length === 0) {
          // If no fields found in header, fallback to keys of first record
          rawHeaders = Object.keys(results.data[0] || {}).map(k => k.trim().replace(/^\uFEFF/, ''));
        }

        if (rawHeaders.length === 0) {
          return reject(new Error('Could not identify any valid column headers in the CSV.'));
        }

        // Sanitize rows to match cleaned headers
        const rows: Record<string, any>[] = [];
        for (const row of results.data) {
          const cleanRow: Record<string, any> = {};
          let rowHasData = false;

          for (const key of Object.keys(row)) {
            const cleanKey = key.trim().replace(/^\uFEFF/, '');
            const val = row[key];
            cleanRow[cleanKey] = val;
            if (val !== null && val !== undefined && String(val).trim() !== '') {
              rowHasData = true;
            }
          }

          if (rowHasData) {
            rows.push(cleanRow);
          }
        }

        if (rows.length === 0) {
          return reject(new Error('The uploaded file does not contain any valid data rows.'));
        }

        const meta: DatasetMeta = {
          name: fileName,
          sizeBytes: fileSize,
          format: 'csv',
          rowCount: rows.length,
          columnCount: rawHeaders.length,
          parsedAt: new Date().toISOString(),
          delimiter: results.meta.delimiter || ',',
        };

        resolve({
          meta,
          rawHeaders,
          data: rows,
        });
      },
      error: (error: Error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

/**
 * Inspects an Excel file, reads worksheet names, and extracts data
 */
export async function parseExcelFile(
  file: File | ArrayBuffer,
  sheetName?: string,
  fileName: string = 'workbook.xlsx'
): Promise<{ sheetNames: string[]; dataset: ParsedDataset }> {
  try {
    let buffer: ArrayBuffer;
    let sizeBytes = 0;

    if (file instanceof File) {
      buffer = await file.arrayBuffer();
      sizeBytes = file.size;
      fileName = file.name;
    } else {
      buffer = file;
      sizeBytes = buffer.byteLength;
    }

    // Read workbook with safe CSP options (cellDates true, raw false, without eval/code generation)
    const workbook = XLSX.read(buffer, {
      type: 'array',
      cellDates: true,
      cellNF: false,
      cellText: true,
    });

    const sheetNames = workbook.SheetNames;
    if (!sheetNames || sheetNames.length === 0) {
      throw new Error('The Excel workbook contains no visible worksheets.');
    }

    const targetSheetName = sheetName && sheetNames.includes(sheetName) ? sheetName : sheetNames[0];
    const worksheet = workbook.Sheets[targetSheetName];

    if (!worksheet) {
      throw new Error(`Could not find worksheet "${targetSheetName}".`);
    }

    // Convert worksheet to JSON rows with header
    const rawJson = XLSX.utils.sheet_to_json<any[]>(worksheet, {
      header: 1,
      raw: false,
      dateNF: 'yyyy-mm-dd',
      defval: '',
    });

    if (!rawJson || rawJson.length < 2) {
      throw new Error(`The worksheet "${targetSheetName}" does not contain a header and data rows.`);
    }

    const headerRow = rawJson[0] as any[];
    const headers = headerRow.map((h, i) => (h ? String(h).trim() : `Column_${i + 1}`));

    const rows: Record<string, any>[] = [];
    for (let i = 1; i < rawJson.length; i++) {
      const rowArr = rawJson[i] as any[];
      if (!rowArr || rowArr.length === 0) continue;

      const rowObj: Record<string, any> = {};
      let hasData = false;

      headers.forEach((header, colIdx) => {
        const val = rowArr[colIdx] !== undefined ? rowArr[colIdx] : '';
        rowObj[header] = val;
        if (val !== null && val !== undefined && String(val).trim() !== '') {
          hasData = true;
        }
      });

      if (hasData) {
        rows.push(rowObj);
      }
    }

    if (rows.length === 0) {
      throw new Error(`Worksheet "${targetSheetName}" contains headers but no valid data rows.`);
    }

    const format: 'xlsx' | 'xls' = fileName.toLowerCase().endsWith('.xls') ? 'xls' : 'xlsx';

    const meta: DatasetMeta = {
      name: fileName,
      sizeBytes,
      format,
      rowCount: rows.length,
      columnCount: headers.length,
      parsedAt: new Date().toISOString(),
      sheetNames,
      activeSheet: targetSheetName,
    };

    return {
      sheetNames,
      dataset: {
        meta,
        rawHeaders: headers,
        data: rows,
      },
    };
  } catch (err: any) {
    throw new Error(`Excel parsing error: ${err.message || 'Unknown error'}`);
  }
}
