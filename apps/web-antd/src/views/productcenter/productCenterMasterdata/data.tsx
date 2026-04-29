import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { getPopupContainer } from '@vben/utils';

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
    label: 'Fund Code',
  },
  {
    component: 'Input',
    fieldName: 'fundNameEn',
    label: 'Fund Name (EN)',
  },
  {
    component: 'Input',
    fieldName: 'fundNameTcSc',
    label: 'Fund Name (TC/SC)',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      mode: 'multiple',
      options: fundTypeOptions,
    },
    fieldName: 'fundType',
    label: 'Fund Type',
  },
  {
    component: 'Select',
    componentProps: {
      getPopupContainer,
      mode: 'multiple',
      options: instrumentTypeOptions,
    },
    fieldName: 'primaryInstrumentType',
    label: 'Instrument Type',
  },
  {
    component: 'Input',
    fieldName: 'umbrellaOfcName',
    label: 'Umbrella / OFC Name',
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
    field: 'fundNameTc',
    title: 'Fund Name (TC)',
    minWidth: 160,
  },
  {
    field: 'fundNameSc',
    title: 'Fund Name (SC)',
    minWidth: 160,
  },
  {
    field: 'fundType',
    title: 'Fund Type',
    minWidth: 140,
  },
  {
    field: 'umbrellaOfcName',
    title: 'Umbrella / OFC Name',
    minWidth: 160,
  },
  {
    field: 'domicileJurisdiction',
    title: 'Domicile / Jurisdiction',
    minWidth: 140,
  },
  {
    field: 'baseCurrency',
    title: 'Base Currency',
    minWidth: 100,
  },
  {
    field: 'fundStatus',
    title: 'Fund Status',
    minWidth: 100,
    slots: { default: 'status' },
  },
  {
    field: 'launchDate',
    title: 'Launch Date',
    minWidth: 120,
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
