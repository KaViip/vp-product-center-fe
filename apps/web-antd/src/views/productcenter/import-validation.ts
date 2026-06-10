export interface ValidationRule {
  type: 'required' | 'enum' | 'regex' | 'dateFormat' | 'compositeTime' | 'integer' | 'decimal2' | 'numeric' | 'enumList';
  values?: string[];
  pattern?: RegExp;
}

export type ValidationRuleMap = Record<string, ValidationRule>;

export interface ValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
}

const MONTH_MAP: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

function normalizeDate(raw: string): string | null {
  if (!raw || !raw.trim()) return null;
  const s = raw.trim();

  // DD-MMM-YYYY (e.g. 05-May-2025)
  const ddMmmYyyy = /^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/.exec(s);
  if (ddMmmYyyy) {
    const d = Number(ddMmmYyyy[1]);
    const m = MONTH_MAP[ddMmmYyyy[2].charAt(0).toUpperCase() + ddMmmYyyy[2].slice(1).toLowerCase()];
    const y = Number(ddMmmYyyy[3]);
    if (m) {
      const date = new Date(y, m - 1, d);
      if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
        return `${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`;
      }
    }
  }

  // YYYY/MM/DD or YYYY-MM-DD
  if (/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s)) {
    const [y, m, d] = s.split(/[\/-]/);
    const date = new Date(Number(y), Number(m) - 1, Number(d));
    if (date.getFullYear() === Number(y) && date.getMonth() === Number(m) - 1 && date.getDate() === Number(d)) {
      return `${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`;
    }
  }

  // DD/MM/YYYY or D/M/YYYY
  if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(s)) {
    const parts = s.split(/[\/-]/);
    const [d, m, y] = [Number(parts[0]), Number(parts[1]), Number(parts[2])];
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
      return `${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`;
    }
  }

  // MM/DD/YYYY (American format)
  if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(s)) {
    const parts = s.split(/[\/-]/);
    const [m, d, y] = [Number(parts[0]), Number(parts[1]), Number(parts[2])];
    const date = new Date(y, m - 1, d);
    if (date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
      return `${y}/${String(m).padStart(2, '0')}/${String(d).padStart(2, '0')}`;
    }
  }

  // M/D/YY (Excel short date like 5/16/26)
  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) {
    const date = new Date(parsed);
    const y = date.getFullYear();
    if (y >= 1900 && y <= 2100) {
      return `${y}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    }
  }
  return null;
}

function validateCell(value: string, column: string, rule: ValidationRule): string | null {
  const trimmed = (value ?? '').toString().trim();

  if (rule.type === 'required') {
    if (!trimmed) return `Value is required. Please enter a value for ${column}.`;
    return null;
  }

  if (!trimmed) return null;

  switch (rule.type) {
    case 'enum': {
      if (!rule.values?.includes(trimmed)) {
        return `'${trimmed}' is not valid. Must be one of: ${rule.values!.join(', ')}`;
      }
      return null;
    }
    case 'regex': {
      if (rule.pattern && !rule.pattern.test(trimmed)) {
        const examples: Record<string, string> = {
          '^[A-Z]{2}[A-Z0-9]{10}$': 'HK0000123456',
          '^\\d{1,5}$': '12345',
          '^[A-Z0-9]{7}$': 'B1Y34K7',
          '^[A-Z0-9]{9}$': '17275R102',
        };
        const example = examples[rule.pattern.source] || 'check format';
        return `'${trimmed}' is not valid. Expected format: ${example}`;
      }
      return null;
    }
    case 'dateFormat': {
      const normalized = normalizeDate(trimmed);
      if (!normalized) {
        return `'${trimmed}' is not a valid date. Please enter a valid date (e.g. 2026/05/16)`;
      }
      return null;
    }
    case 'compositeTime': {
      if (!/^\d{2}:\d{2}\s+[A-Z]{3}$/.test(trimmed)) {
        return `'${trimmed}' is not valid. Must be in HH:mm CCC format (e.g. 16:00 HKG). CCC must be a 3-letter country code`;
      }
      return null;
    }
    case 'integer': {
      if (!/^\d+$/.test(trimmed) || Number(trimmed) < 0) {
        return `'${trimmed}' is not valid. Must be a non-negative integer (e.g. 5)`;
      }
      return null;
    }
    case 'decimal2': {
      if (!/^\d+(\.\d{1,2})?$/.test(trimmed) || Number(trimmed) < 0) {
        return `'${trimmed}' is not valid. Must be a non-negative number with max 2 decimal places (e.g. 1.50)`;
      }
      return null;
    }
    case 'numeric': {
      if (Number.isNaN(Number(trimmed)) || Number(trimmed) < 0) {
        return `'${trimmed}' is not valid. Must be a non-negative number`;
      }
      return null;
    }
    case 'enumList': {
      if (!rule.values) return null;
      const items = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
      const invalid = items.filter((item) => !rule.values!.includes(item));
      if (invalid.length > 0) {
        return `Contains invalid value(s): ${invalid.join(', ')}. Valid values: ${rule.values.join(', ')}`;
      }
      return null;
    }
    default:
      return null;
  }
}

export function validateExcelData(
  data: Record<string, any>[],
  rules: ValidationRuleMap,
  skipRequired = false,
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const row of data) {
    const rowNum: number = row._row ?? 0;
    for (const [column, rule] of Object.entries(rules)) {
      if (skipRequired && rule.type === 'required') continue;
      const value = (row[column] ?? '').toString();
      const error = validateCell(value, column, rule);
      if (error) {
        errors.push({ row: rowNum, column, value, message: error });
      } else if (rule.type === 'dateFormat' && value.trim()) {
        const normalized = normalizeDate(value.trim());
        if (normalized) {
          row[column] = normalized;
        }
      }
    }
  }

  return errors;
}

export function getCellError(
  errors: ValidationError[],
  row: number,
  column: string,
): ValidationError | undefined {
  return errors.find((e) => e.row === row && e.column === column);
}

export const OPERATIONAL_TEAM_RULES: ValidationRuleMap = {
  Fund_Code: { type: 'required' },
  VPFS_Class_ID: { type: 'required' },
  'Share_Class_Name_(EN)_Official_Name': { type: 'required' },
  Fund_Class_Status: { type: 'enum', values: ['Active', 'Inactive', 'Terminated'] },
  Class_Currency: { type: 'enum', values: ['EUR', 'HKD', 'CNH', 'SGD', 'USD', 'CHF', 'GBP', 'AUD', 'CAD', 'NZD', 'CNY', 'RMB', 'JPY'] },
  Distribution_Policy: { type: 'enum', values: ['Monthly', 'Quarterly', 'Annually', 'N/A'] },
  Hedged: { type: 'enum', values: ['true', 'false', 'TRUE', 'FALSE'] },
  Hedging_Currency: { type: 'enum', values: ['EUR', 'HKD', 'CNH', 'SGD', 'USD', 'CHF', 'GBP', 'AUD', 'CAD', 'NZD', 'CNY', 'RMB', 'JPY'] },
  Security_Lending: { type: 'enum', values: ['true', 'false', 'TRUE', 'FALSE'] },
  Unit_Precision: { type: 'integer' },
  NAV_Precision: { type: 'integer' },
  ISIN_Code: { type: 'regex', pattern: /^[A-Z]{2}[A-Z0-9]{10}$/ },
  Stock_Code: { type: 'regex', pattern: /^\d{1,5}$/ },
  SEDOL: { type: 'regex', pattern: /^[A-Z0-9]{7}$/ },
  CUSIP: { type: 'regex', pattern: /^[A-Z0-9]{9}$/ },
  Launch_Date: { type: 'dateFormat' },
  End_of_IOP_Date: { type: 'dateFormat' },
  Latest_TER_Date: { type: 'dateFormat' },
  Valuation_point: { type: 'compositeTime' },
  Cutoff_Time: { type: 'compositeTime' },
  Dealing_Frequency: { type: 'enum', values: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] },
  Valuation_Frequency: { type: 'enum', values: ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Yearly'] },
  Financial_Year_End: { type: 'enum', values: ['31-March', '30-June', '31-December'] },
  Sub_unit_rounding: { type: 'enum', values: ['Round Up', 'Round Down'] },
  Red_unit_rounding: { type: 'enum', values: ['Round Up', 'Round Down'] },
  Management_Fee: { type: 'decimal2' },
  Performance_Fee: { type: 'decimal2' },
  Latest_TER_Rate: { type: 'decimal2' },
  Minimum_initial_subscription: { type: 'numeric' },
  Minimum_Subsequent_Subscription: { type: 'numeric' },
  Minimum_Redemption: { type: 'numeric' },
  Minimum_Holding: { type: 'numeric' },
  Redemption_Charge: { type: 'numeric' },
  Subscription_Settlement: { type: 'integer' },
  Redemption_Settlement: { type: 'integer' },
};

export const PRODUCT_TEAM_RULES: ValidationRuleMap = {
  'fund Code': { type: 'required' },
  'fund Name En': { type: 'required' },
  'fund Name Tc': { type: 'required' },
  'fund Name Sc': { type: 'required' },
  'fund Type': {
    type: 'enum',
    values: [
      'SFC Authorized Fund（UT）',
      'SFC Authorized Fund（OFC）',
      'SFC Authorized Fund（Cayman）',
      'SFC Authorized Fund（ICAV）',
      'Private Fund（Cayman）',
      'Private Fund（Chinese Mainland）',
      'Investment Advisory（Offshore）',
      'Investment Advisory（Chinese Mainland）',
      'Other Mutual Fund',
    ],
  },
  'fund Status': { type: 'enum', values: ['In Offering', 'Active', 'In Liquidation', 'Liquidated'] },
  'primary Instrument Type': {
    type: 'enum',
    values: ['Alternative (Private) Assets', 'Commodities', 'Digital Assets', 'Equity', 'Fixed Income', 'Money Market (Liquidity)', 'Multi-Assets'],
  },
  'passive Or Active Fund': { type: 'enum', values: ['Active', 'Passive'] },
  'investment Market Focus': { type: 'enum', values: ['America', 'Asia Pacific', 'Emerging Markets', 'Europe', 'Global'] },
  'hedging Policy Fund': { type: 'enum', values: ['Hedge to Base Currency', 'Optional', 'N/A'] },
  'complex Product': { type: 'enum', values: ['true', 'false', 'TRUE', 'FALSE'] },
  'professional Investors Only': { type: 'enum', values: ['true', 'false', 'TRUE', 'FALSE'] },
  'launch Date': { type: 'dateFormat' },
  'application Submission Date': { type: 'dateFormat' },
  'authorization Date': { type: 'dateFormat' },
  'iop Start Date': { type: 'dateFormat' },
  'operation Start Date': { type: 'dateFormat' },
  'listing Date': { type: 'dateFormat' },
  'termination Date': { type: 'dateFormat' },
  'leverage Ratio Max': { type: 'integer' },
  'derivatives Ratio Max': { type: 'integer' },
  'borrowing Limit': { type: 'integer' },
  'stop Loss Limit': { type: 'decimal2' },
  'stop Loss Alert': { type: 'decimal2' },
  'risk Level': { type: 'integer' },
};
