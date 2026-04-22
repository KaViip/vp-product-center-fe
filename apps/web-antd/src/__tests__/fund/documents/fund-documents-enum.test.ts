import { describe, expect, it } from 'vitest';

import {
  AiStatusEnum,
  DocumentTypeEnum,
  FileScopeEnum,
  LanguageEnum,
  UploadModeEnum,
  ValidationStatusEnum,
} from '#/api/product-center/model/fund-documents';

describe('DocumentTypeEnum', () => {
  it('should have Fact Sheet type', () => {
    expect(DocumentTypeEnum.FACT_SHEET).toBe('Fact Sheet');
  });

  it('should have KFS type', () => {
    expect(DocumentTypeEnum.KFS).toBe('KFS');
  });

  it('should have Annual Reports type', () => {
    expect(DocumentTypeEnum.ANNUAL_REPORTS).toBe('Annual Reports');
  });

  it('should have Subscription Form type', () => {
    expect(DocumentTypeEnum.SUBSCRIPTION_FORM).toBe('Subscription Form');
  });

  it('should have at least 20 document types', () => {
    expect(Object.keys(DocumentTypeEnum).length).toBeGreaterThanOrEqual(20);
  });
});

describe('LanguageEnum', () => {
  it('should have 4 language codes', () => {
    expect(Object.keys(LanguageEnum)).toHaveLength(4);
  });

  it('should have correct language values', () => {
    expect(LanguageEnum.EN).toBe('eng');
    expect(LanguageEnum.CHI).toBe('chi');
    expect(LanguageEnum.SC).toBe('sc');
    expect(LanguageEnum.UK).toBe('uk');
  });
});

describe('UploadModeEnum', () => {
  it('should have 3 modes', () => {
    expect(Object.keys(UploadModeEnum)).toHaveLength(3);
  });

  it('should have correct mode values', () => {
    expect(UploadModeEnum.SPECIFIED_FORMAT).toBe('Specified File Format');
    expect(UploadModeEnum.AI_ASSISTED).toBe('AI-Assisted');
    expect(UploadModeEnum.GENERIC).toBe('Generic files');
  });
});

describe('FileScopeEnum', () => {
  it('should have 3 scopes', () => {
    expect(Object.keys(FileScopeEnum)).toHaveLength(3);
  });
});

describe('ValidationStatusEnum', () => {
  it('should have 4 statuses', () => {
    expect(Object.keys(ValidationStatusEnum)).toHaveLength(4);
  });
});

describe('AiStatusEnum', () => {
  it('should have 4 statuses', () => {
    expect(Object.keys(AiStatusEnum)).toHaveLength(4);
  });
});
