import type { FormSchemaGetter } from '#/adapter/form';

import { getPopupContainer } from '@vben/utils';

import { LanguageEnum } from '#/api/product-center/model/fund-documents';

const languageOptions = Object.entries(LanguageEnum).map(([key, value]) => ({
  label: key === 'EN' ? 'English (eng)' : key === 'CHI' ? '繁體中文 (chi)' : key === 'SC' ? '简体中文 (sc)' : 'EMEA (uk)',
  value,
}));

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'fundCode',
    label: 'Fund Code',
  },
  {
    component: 'Input',
    fieldName: 'fundNameEn',
    label: 'Fund Name (EN)',
  },
  {
    component: 'Input',
    fieldName: 'fundNameTc',
    label: 'Fund Name (TC/SC)',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      options: languageOptions,
    },
    fieldName: 'language',
    label: 'Language',
  },
];

/** Document type display order for the list columns */
export const DOCUMENT_TYPE_COLUMNS = [
  { key: 'productKeyFacts', label: 'Product Key Facts / KIID' },
  { key: 'factSheet', label: 'Factsheet' },
  { key: 'quarterlyCommentary', label: 'Quarterly Commentary' },
  { key: 'interimReports', label: 'Interim Reports' },
  { key: 'annualReports', label: 'Annual Reports' },
  { key: 'otherDocuments', label: 'Other Documents' },
] as const;
