export const MAX_FILE_SIZE = 30 * 1024 * 1024;

export const VALID_LANGUAGE_CODES = ['eng', 'chi', 'sc', 'uk'] as const;

export const FUND_DOC_NAME_REGEX =
  /^([A-Za-z0-9]+)-([A-Za-z_]+)-(\d{8})-(eng|chi|sc|uk)\.pdf$/i;

export const CLASS_DOC_NAME_REGEX =
  /^([A-Za-z0-9]+)-([A-Za-z0-9_]+)-([A-Za-z_]+)-(\d{8})-(eng|chi|sc|uk)\.pdf$/i;

export function validateFileSize(sizeInBytes: number): {
  reason?: string;
  valid: boolean;
} {
  if (sizeInBytes <= 0) {
    return { valid: false, reason: 'File is empty' };
  }
  if (sizeInBytes > MAX_FILE_SIZE) {
    return { valid: false, reason: `File size exceeds 30MB limit` };
  }
  return { valid: true };
}

export function validateFileExtension(fileName: string, allowedExts = ['pdf']): {
  reason?: string;
  valid: boolean;
} {
  const ext = fileName.split('.').pop()?.toLowerCase();
  if (!ext || !allowedExts.includes(ext)) {
    return { valid: false, reason: `Only ${allowedExts.join(', ')} files are accepted` };
  }
  return { valid: true };
}

export function validateDocumentName(fileName: string): {
  reason?: string;
  valid: boolean;
} {
  const classMatch = CLASS_DOC_NAME_REGEX.exec(fileName);
  if (classMatch) {
    const langCode = (classMatch[5] ?? '').toLowerCase();
    if (!VALID_LANGUAGE_CODES.includes(langCode as any)) {
      return {
        valid: false,
        reason: `Invalid language code: ${langCode}. Valid codes: ${VALID_LANGUAGE_CODES.join(', ')}`,
      };
    }
    return { valid: true };
  }

  const fundMatch = FUND_DOC_NAME_REGEX.exec(fileName);
  if (fundMatch) {
    const langCode = (fundMatch[4] ?? '').toLowerCase();
    if (!VALID_LANGUAGE_CODES.includes(langCode as any)) {
      return {
        valid: false,
        reason: `Invalid language code: ${langCode}. Valid codes: ${VALID_LANGUAGE_CODES.join(', ')}`,
      };
    }
    return { valid: true };
  }

  return {
    valid: false,
    reason:
      'File name must follow format: [FundID]-[ReportType]-[YYYYMMDD]-[LanguageCode].pdf or [FundID]-[ClassID]-[ReportType]-[YYYYMMDD]-[LanguageCode].pdf',
  };
}
