import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getPopupContainer } from '@vben/utils';

import { $t } from '@vben/locales';

import {
  FundTypeEnum,
  InstrumentTypeEnum,
} from '#/api/productcenter/productCenterMasterdata/model';

const fundTypeOptions = Object.entries(FundTypeEnum).map(([_, value]) => ({
  label: value,
  value,
}));

const instrumentTypeOptions = Object.entries(InstrumentTypeEnum).map(
  ([_, value]) => ({
    label: value,
    value,
  }),
);

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'fundCode',
    label: $t('pages.productCenter.fundCode'),
  },
  {
    component: 'Input',
    fieldName: 'fundNameEn',
    label: $t('pages.productCenter.fundNameEn'),
  },
  {
    component: 'Input',
    fieldName: 'fundNameTcSc',
    label: $t('pages.productCenter.fundNameTcSc'),
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      mode: 'multiple',
      options: fundTypeOptions,
    },
    fieldName: 'fundType',
    label: $t('pages.productCenter.fundType'),
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      mode: 'multiple',
      options: instrumentTypeOptions,
    },
    fieldName: 'primaryInstrumentType',
    label: $t('pages.productCenter.instrumentType'),
  },
  {
    component: 'Input',
    fieldName: 'umbrellaOfcName',
    label: $t('pages.productCenter.umbrellaOfcName'),
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
    field: 'fundNameTc',
    title: $t('pages.productCenter.fundNameTc'),
    minWidth: 160,
  },
  {
    field: 'fundNameSc',
    title: $t('pages.productCenter.fundNameSc'),
    minWidth: 160,
  },
  {
    field: 'fundType',
    title: $t('pages.productCenter.fundType'),
    minWidth: 140,
  },
  {
    field: 'umbrellaOfcName',
    title: $t('pages.productCenter.umbrellaOfcName'),
    minWidth: 160,
  },
  {
    field: 'domicileJurisdiction',
    title: $t('pages.productCenter.domicileJurisdiction'),
    minWidth: 140,
  },
  {
    field: 'baseCurrency',
    title: $t('pages.productCenter.baseCurrency'),
    minWidth: 100,
  },
  {
    field: 'fundStatus',
    title: $t('pages.productCenter.fundStatus'),
    minWidth: 100,
    slots: { default: 'status' },
  },
  {
    field: 'launchDate',
    title: $t('pages.productCenter.launchDate'),
    minWidth: 120,
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
