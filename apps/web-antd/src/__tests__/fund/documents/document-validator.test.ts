import { describe, expect, it } from 'vitest';

import {
  validateDocumentName,
  validateFileExtension,
  validateFileSize,
} from '#/views/fund/documents/document-validator';

describe('validateFileSize', () => {
  it('should accept files under 30MB', () => {
    const result = validateFileSize(29 * 1024 * 1024);
    expect(result.valid).toBe(true);
  });

  it('should accept files exactly 30MB', () => {
    const result = validateFileSize(30 * 1024 * 1024);
    expect(result.valid).toBe(true);
  });

  it('should reject files over 30MB', () => {
    const result = validateFileSize(30 * 1024 * 1024 + 1);
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('30MB');
  });

  it('should reject zero-size files', () => {
    const result = validateFileSize(0);
    expect(result.valid).toBe(false);
  });
});

describe('validateFileExtension', () => {
  it('should accept .pdf files', () => {
    expect(validateFileExtension('test.pdf')).toEqual({ valid: true });
  });

  it('should reject non-pdf files', () => {
    const result = validateFileExtension('test.docx');
    expect(result.valid).toBe(false);
    expect(result.reason).toContain('pdf');
  });

  it('should be case insensitive', () => {
    expect(validateFileExtension('test.PDF')).toEqual({ valid: true });
    expect(validateFileExtension('test.Pdf')).toEqual({ valid: true });
  });
});

describe('validateDocumentName', () => {
  it('should validate correct format: FundID-ReportType-Date-Lang.pdf', () => {
    const result = validateDocumentName('VPAF-FactSheet-20240101-eng.pdf');
    expect(result.valid).toBe(true);
  });

  it('should validate with underscore in report type', () => {
    const result = validateDocumentName('VPAF-Annual_Reports-20240101-chi.pdf');
    expect(result.valid).toBe(true);
  });

  it('should reject missing extension', () => {
    const result = validateDocumentName('VPAF-FactSheet-20240101-eng');
    expect(result.valid).toBe(false);
  });

  it('should reject wrong date format', () => {
    const result = validateDocumentName('VPAF-FactSheet-2024-01-01-eng.pdf');
    expect(result.valid).toBe(false);
  });

  it('should reject invalid language code', () => {
    const result = validateDocumentName('VPAF-FactSheet-20240101-fr.pdf');
    expect(result.valid).toBe(false);
  });

  it('should validate class-level format: FundID-ClassID-ReportType-Date-Lang.pdf', () => {
    const result = validateDocumentName('VPAF-DUSD-KFS-20250204-chi.pdf');
    expect(result.valid).toBe(true);
  });

  it('should validate class-level format with underscore in class ID', () => {
    const result = validateDocumentName('VPAF-CMDisUSD-Fact_Sheet-20250204-eng.pdf');
    expect(result.valid).toBe(true);
  });

  it('should reject file with too few segments', () => {
    const result = validateDocumentName('VPAF-eng.pdf');
    expect(result.valid).toBe(false);
  });

  it('should reject file with non-pdf extension', () => {
    const result = validateDocumentName('VPAF-FactSheet-20240101-eng.docx');
    expect(result.valid).toBe(false);
  });

  it('should accept all valid language codes', () => {
    expect(validateDocumentName('VPAF-KFS-20240101-eng.pdf').valid).toBe(true);
    expect(validateDocumentName('VPAF-KFS-20240101-chi.pdf').valid).toBe(true);
    expect(validateDocumentName('VPAF-KFS-20240101-sc.pdf').valid).toBe(true);
    expect(validateDocumentName('VPAF-KFS-20240101-uk.pdf').valid).toBe(true);
  });
});
