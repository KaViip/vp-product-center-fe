import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getPopupContainer } from '@vben/utils';

import { $t } from '@vben/locales';

import { ClassStatusEnum, CurrencyEnum } from '#/api/productcenter/productCenterData/model';

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
    label: $t('pages.productCenter.fundCode'),
  },
  {
    component: 'Input',
    fieldName: 'fundNameEnTcSc',
    label: $t('pages.productCenter.fundNameEnTcSc'),
  },
  {
    component: 'Input',
    fieldName: 'shareClassNameEnTcSc',
    label: $t('pages.productCenter.shareClassNameEnTcSc'),
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      mode: 'multiple',
      options: currencyOptions,
    },
    fieldName: 'classCurrency',
    label: $t('pages.productCenter.classCurrency'),
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      mode: 'multiple',
      options: classStatusOptions,
    },
    fieldName: 'fundClassStatus',
    label: $t('pages.productCenter.classStatus'),
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  {
    field: 'fundCode',
    title: $t('pages.productCenter.fundCode'),
    minWidth: 100,
  },
  {
    field: 'fundNameEn',
    title: $t('pages.productCenter.fundNameEn'),
    minWidth: 200,
  },
  {
    field: 'shareClassNameEnOfficialName',
    title: $t('pages.productCenter.shareClassNameEn'),
    minWidth: 200,
  },
  {
    field: 'shareClassNameTcOfficialName',
    title: $t('pages.productCenter.shareClassNameTc'),
    minWidth: 160,
  },
  {
    field: 'shareClassNameScOfficialName',
    title: $t('pages.productCenter.shareClassNameSc'),
    minWidth: 160,
  },
  {
    field: 'classCurrency',
    title: $t('pages.productCenter.classCurrency'),
    minWidth: 100,
  },
  {
    field: 'fundClassStatus',
    title: $t('pages.productCenter.classStatus'),
    minWidth: 100,
    slots: { default: 'status' },
  },
  {
    field: 'launchDate',
    title: $t('pages.productCenter.launchDate'),
    minWidth: 120,
    formatter: ({ cellValue }: any) => {
      if (!cellValue) return '';
      return String(cellValue).replace(/-/g, '/');
    },
  },
  {
    field: 'isinCode',
    title: $t('pages.productCenter.isinCode'),
    minWidth: 140,
  },
  {
    field: 'morningstarSecId',
    title: $t('pages.productCenter.morningstarSecId'),
    minWidth: 150,
  },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: $t('pages.productCenter.action'),
    resizable: false,
    width: 'auto',
  },
];
