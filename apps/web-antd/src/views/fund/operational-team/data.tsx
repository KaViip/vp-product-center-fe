import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getPopupContainer } from '@vben/utils';

import { ClassStatusEnum, CurrencyEnum } from '#/api/product-center/model/fund-operational';

const classStatusOptions = Object.entries(ClassStatusEnum).map(([_, value]) => ({
  label: value,
  value,
}));

const currencyOptions = Object.entries(CurrencyEnum).map(([_, value]) => ({
  label: value,
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
    label: 'Fund Name (EN/TC/SC)',
  },
  {
    component: 'Input',
    fieldName: 'shareClassNameEn',
    label: 'Share Class Name (EN/TC/SC)',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      mode: 'multiple',
      options: currencyOptions,
    },
    fieldName: 'classCurrency',
    label: 'Class Currency',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      mode: 'multiple',
      options: classStatusOptions,
    },
    fieldName: 'classStatus',
    label: 'Class Status',
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    field: 'fundCode',
    title: 'Fund Code',
    minWidth: 100,
  },
  {
    field: 'fundNameEn',
    title: 'Fund Name (EN)',
    minWidth: 200,
  },
  {
    field: 'shareClassNameEn',
    title: 'Share Class Name (EN)',
    minWidth: 200,
  },
  {
    field: 'shareClassNameTc',
    title: 'Share Class Name (TC)',
    minWidth: 160,
  },
  {
    field: 'shareClassNameSc',
    title: 'Share Class Name (SC)',
    minWidth: 160,
  },
  {
    field: 'classCurrency',
    title: 'Class Currency',
    minWidth: 100,
  },
  {
    field: 'classStatus',
    title: 'Class Status',
    minWidth: 100,
    slots: { default: 'status' },
  },
  {
    field: 'launchDate',
    title: 'Launch Date',
    minWidth: 120,
  },
  {
    field: 'isinCode',
    title: 'ISIN Code',
    minWidth: 140,
  },
  {
    field: 'morningstarSecId',
    title: 'Morningstar Sec ID',
    minWidth: 150,
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: 'Action',
    resizable: false,
    width: 'auto',
  },
];
