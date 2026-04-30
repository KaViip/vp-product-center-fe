<script setup lang="ts">
import type { ProductCenterMasterdata } from '#/api/productcenter/productCenterMasterdata/model';

import { computed, nextTick, onMounted, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';
import dayjs from 'dayjs';

import {
  Anchor,
  AutoComplete,
  Collapse,
  CollapsePanel,
  Col,
  DatePicker,
  Form,
  FormItem,
  Input,
  Row,
  Select,
  Spin,
} from 'antdv-next';

import {
  productCenterMasterdataAdd,
  productCenterMasterdataAutocomplete,
  productCenterMasterdataCheckUnique,
  productCenterMasterdataInfo,
  productCenterMasterdataUpdate,
} from '#/api/productcenter/productCenterMasterdata';
import {
  ActivePassiveEnum,
  FundStatusEnum,
  FundTypeEnum,
  HedgingPolicyEnum,
  InstrumentTypeEnum,
  MarketFocusEnum,
} from '#/api/productcenter/productCenterMasterdata/model';
import { dictDataInfo } from '#/api/system/dict/dict-data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const isCopy = ref(false);
const loading = ref(false);
const formRef = ref();
const activeCollapseKeys = ref<string[]>(['core', 'parties', 'strategy', 'registration']);
const scrollContainerRef = ref<HTMLElement | null>(null);

const title = computed(() => {
  if (isCopy.value) return $t('pages.productCenter.copyFund');
  return isUpdate.value ? $t('pages.productCenter.editFund') : $t('pages.productCenter.addFund');
});

const formData = ref<Record<string, any>>({});

const enumToOptions = (enumObj: Record<string, string | number>) =>
  Object.entries(enumObj).map(([_, value]) => ({ label: String(value), value }));

const fundTypeOptions = enumToOptions(FundTypeEnum);
const fundStatusOptions = enumToOptions(FundStatusEnum);
const instrumentTypeOptions = enumToOptions(InstrumentTypeEnum);
const yesNoOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];
const activePassiveOptions = enumToOptions(ActivePassiveEnum);
const marketFocusOptions = enumToOptions(MarketFocusEnum);
const hedgingPolicyOptions = enumToOptions(HedgingPolicyEnum);
const riskLevelOptions = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
];

// ISO 3166-1 Alpha-2 country codes (commonly used jurisdictions)
const countryOptions = [
  { label: 'HK - Hong Kong', value: 'HK' },
  { label: 'IE - Ireland', value: 'IE' },
  { label: 'KY - Cayman Islands', value: 'KY' },
  { label: 'CN - China (Mainland)', value: 'CN' },
  { label: 'SG - Singapore', value: 'SG' },
  { label: 'LU - Luxembourg', value: 'LU' },
  { label: 'GB - United Kingdom', value: 'GB' },
  { label: 'US - United States', value: 'US' },
  { label: 'CH - Switzerland', value: 'CH' },
  { label: 'DE - Germany', value: 'DE' },
  { label: 'FR - France', value: 'FR' },
  { label: 'JP - Japan', value: 'JP' },
  { label: 'BM - Bermuda', value: 'BM' },
  { label: 'VG - British Virgin Islands', value: 'VG' },
  { label: 'AU - Australia', value: 'AU' },
  { label: 'NL - Netherlands', value: 'NL' },
  { label: 'TW - Taiwan', value: 'TW' },
  { label: 'MO - Macau', value: 'MO' },
  { label: 'MY - Malaysia', value: 'MY' },
  { label: 'KR - South Korea', value: 'KR' },
  { label: 'IN - India', value: 'IN' },
  { label: 'IT - Italy', value: 'IT' },
  { label: 'ES - Spain', value: 'ES' },
  { label: 'SE - Sweden', value: 'SE' },
  { label: 'FI - Finland', value: 'FI' },
  { label: 'DK - Denmark', value: 'DK' },
  { label: 'NO - Norway', value: 'NO' },
];

// ISO 4217 currency codes
const currencyCodeOptions = [
  { label: 'HKD - Hong Kong Dollar', value: 'HKD' },
  { label: 'USD - US Dollar', value: 'USD' },
  { label: 'EUR - Euro', value: 'EUR' },
  { label: 'CNY - Chinese Yuan', value: 'CNY' },
  { label: 'CNH - Offshore Yuan', value: 'CNH' },
  { label: 'GBP - British Pound', value: 'GBP' },
  { label: 'JPY - Japanese Yen', value: 'JPY' },
  { label: 'SGD - Singapore Dollar', value: 'SGD' },
  { label: 'CHF - Swiss Franc', value: 'CHF' },
  { label: 'AUD - Australian Dollar', value: 'AUD' },
  { label: 'CAD - Canadian Dollar', value: 'CAD' },
  { label: 'NZD - New Zealand Dollar', value: 'NZD' },
  { label: 'RMB - Renminbi', value: 'RMB' },
];

const regionOptions = ref<{ label: string; value: number }[]>([]);

onMounted(async () => {
  try {
    const data = await dictDataInfo('sys_product_center_region');
    regionOptions.value = data.map((item) => ({
      label: item.dictLabel,
      value: item.dictCode,
    }));
  } catch { /* ignore */ }
});

const autocompleteCache = ref<Record<string, string[]>>({});
const autocompleteOptions = ref<Record<string, { label: string; value: string }[]>>({});

async function handleAutocomplete(field: string, keyword: string) {
  if (!keyword || keyword.length < 1) {
    autocompleteOptions.value[field] = [];
    return;
  }
  const cacheKey = `${field}:${keyword}`;
  if (autocompleteCache.value[cacheKey]) {
    autocompleteOptions.value[field] = autocompleteCache.value[cacheKey].map((r) => ({ label: r, value: r }));
    return;
  }
  const results = await productCenterMasterdataAutocomplete(field, keyword);
  autocompleteCache.value[cacheKey] = results;
  autocompleteOptions.value[field] = results.map((r) => ({ label: r, value: r }));
}

const AUTOCOMPLETE_FIELDS = [
  'fundManager',
  'investmentAdvisor',
  'trusteeAdministrator',
  'custodianPrimeBroker',
  'auditor',
  'benchmark',
];

// LEI: 20 alphanumeric characters
const leiValidator = (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^[A-Z0-9]{20}$/.test(value))
    return Promise.reject('LEI must be 20 alphanumeric characters');
  return Promise.resolve();
};

// GIIN: XXXXXX.XXXXX.XXX.XX (19 chars, alphanumeric + dots)
const giinValidator = (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^[A-Z0-9]{6}\.[A-Z0-9]{5}\.[A-Z0-9]{2}\.[A-Z0-9]{2}$/.test(value))
    return Promise.reject('GIIN format: XXXXXX.XXXXX.XX.XX');
  return Promise.resolve();
};

// ISO 4217 currency code: 3 uppercase letters
const currencyValidator = (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^[A-Z]{3}$/.test(value))
    return Promise.reject('Must be a 3-letter currency code (e.g. HKD, USD)');
  return Promise.resolve();
};

// Integer, non-negative validator
const nonNegativeIntValidator = (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^\d+$/.test(value))
    return Promise.reject('Must be a non-negative integer');
  return Promise.resolve();
};

// Stop Loss — 2 decimal places, non-negative
const nonNegativeDecimalValidator = (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^\d+(\.\d{1,2})?$/.test(value))
    return Promise.reject('Must be a non-negative number (up to 2 decimal places)');
  return Promise.resolve();
};

const rules = {
  fundCode: [
    { required: true, message: 'Fund Code is required' },
    { max: 20, message: 'Fund Code must be at most 20 characters' },
  ],
  fundNameEn: [
    { required: true, message: 'Fund Name (EN) is required' },
    { max: 200, message: 'Must be at most 200 characters' },
  ],
  fundNameTc: [
    { required: true, message: 'Fund Name (TC) is required' },
    { max: 200, message: 'Must be at most 200 characters' },
  ],
  fundNameSc: [
    { required: true, message: 'Fund Name (SC) is required' },
    { max: 200, message: 'Must be at most 200 characters' },
  ],
  fundType: [{ required: true, message: 'Fund Type is required' }],
  domicileJurisdiction: [{ required: true, message: 'Domicile / Jurisdiction is required' }],
  primaryRegulator: [{ required: true, message: 'Primary Regulator is required' }],
  fundStatus: [{ required: true, message: 'Fund Status is required' }],
  launchDate: [{ required: true, message: 'Launch Date is required' }],
  complexProduct: [{ required: true, message: 'Complex Product is required' }],
  fundManager: [{ required: true, message: 'Fund Manager is required' }],
  fundManagerLei: [
    { required: true, message: 'Fund Manager LEI is required' },
    { validator: leiValidator },
  ],
  primaryInstrumentType: [{ required: true, message: 'Instrument Type is required' }],
  investmentMarketFocus: [{ required: true, message: 'Market Focus is required' }],
  investmentObjective: [
    { required: true, message: 'Investment Objective is required' },
    { max: 2000, message: 'Must be at most 2000 characters' },
  ],
  investmentStrategy: [
    { required: true, message: 'Investment Strategy is required' },
    { max: 2000, message: 'Must be at most 2000 characters' },
  ],
  assetAllocationTable: [
    { required: true, message: 'Asset Allocation is required' },
    { max: 4000, message: 'Must be at most 4000 characters' },
  ],
  giinNumber: [{ validator: giinValidator }],
  leiNumber: [{ validator: leiValidator }],
  passiveOrActiveFund: [{ required: true, message: 'Passive or Active Fund is required' }],
  hedgingPolicyFund: [{ required: true, message: 'Hedging Policy is required' }],
  leverageRatioMax: [
    { required: true, message: 'Leverage Ratio (Max) is required' },
    { validator: nonNegativeIntValidator },
  ],
  derivativesRatioMax: [
    { required: true, message: 'Derivatives Ratio (Max) is required' },
    { validator: nonNegativeIntValidator },
  ],
  borrowingLimit: [
    { required: true, message: 'Borrowing Limit is required' },
    { validator: nonNegativeIntValidator },
  ],
  stopLossLimit: [{ validator: nonNegativeDecimalValidator }],
  stopLossAlert: [{ validator: nonNegativeDecimalValidator }],
};

function getAutocompleteProps(field: string) {
  return {
    allowClear: true,
    placeholder: $t('pages.productCenter.typeToSearch'),
    options: computed(() => autocompleteOptions.value[field] || []),
    onSearch: (value: string) => handleAutocomplete(field, value),
  };
}

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      formData.value = {};
      return;
    }

    drawerApi.drawerLoading(true);
    const data = drawerApi.getData<Record<string, any>>();
    isUpdate.value = !!data?.fundCode && !data?.isCopy;
    isCopy.value = !!data?.isCopy;

    if (data?.fundCode) {
      try {
        const fundData = await productCenterMasterdataInfo(data.fundCode);
        if (isCopy.value) {
          fundData.fundCode = '';
          fundData.fundNameEn = '';
        }
        const d = cloneDeep(fundData);

          // Convert date strings "YYYY-MM-DD HH:mm:ss" → dayjs for DatePicker
          const dateFields = [
            'applicationSubmissionDate', 'authorizationDate', 'launchDate',
            'iopStartDate', 'operationStartDate', 'listingDate', 'terminationDate',
          ];
          for (const key of dateFields) {
            if (d[key]) {
              d[key] = dayjs(d[key]);
            }
          }

          // Trim decimal strings: integer fields → strip decimals, decimal fields → max 2dp
          const intFields = ['leverageRatioMax', 'derivativesRatioMax', 'borrowingLimit'];
          const decimalFields = ['stopLossLimit', 'stopLossAlert'];
          for (const key of intFields) {
            if (d[key] != null) d[key] = String(Math.round(Number(d[key])));
          }
          for (const key of decimalFields) {
            if (d[key] != null) d[key] = String(Number.parseFloat(Number(d[key]).toFixed(2)));
          }

          formData.value = d;
      } catch {
        formData.value = {};
      }
    } else {
      formData.value = {};
    }

    if (!formData.value.regionDictCodes) {
      formData.value.regionDictCodes = [];
    }

    await nextTick();
    drawerApi.drawerLoading(false);

    // Resolve scroll container for Anchor scroll-spy
    await nextTick();
    const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
    for (let i = dialogs.length - 1; i >= 0; i--) {
      const sc = dialogs[i]!.querySelector<HTMLElement>('.overflow-y-auto');
      if (sc && sc.scrollHeight > 0) {
        scrollContainerRef.value = sc;
        break;
      }
    }
  },
});

async function handleConfirm() {
  try {
    drawerApi.lock(true);
    const valid = await formRef.value?.validate();
    if (valid?.errorFields) {
      return;
    }

    const excludeFundCode = isUpdate.value ? formData.value.fundCode : undefined;
    const uniqueFields = [
      { field: 'fundCode', label: 'Fund Code', value: formData.value.fundCode },
      { field: 'fundNameEn', label: 'Fund Name (EN)', value: formData.value.fundNameEn },
      { field: 'fundNameTc', label: 'Fund Name (TC)', value: formData.value.fundNameTc },
      { field: 'fundNameSc', label: 'Fund Name (SC)', value: formData.value.fundNameSc },
    ];
    for (const { field, label, value } of uniqueFields) {
      if (!value) continue;
      const conflict = await productCenterMasterdataCheckUnique(field, value, excludeFundCode);
      if (conflict) {
        window.message.error(`${label} ${$t('pages.productCenter.mustBeUnique')}`);
        return;
      }
    }

    const submitData = cloneDeep(formData.value);
    if (isUpdate.value) {
      await productCenterMasterdataUpdate(submitData);
      window.message.success($t('pages.productCenter.updatedSuccessfully'));
    } else {
      await productCenterMasterdataAdd(submitData);
      window.message.success($t('pages.productCenter.addedSuccessfully'));
    }
    emit('reload');
    drawerApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.lock(false);
  }
}

const anchorItems = computed(() => [
  { href: '#section-core', title: $t('pages.productCenter.coreFundIdentity') },
  { href: '#section-parties', title: $t('pages.productCenter.keyParties') },
  { href: '#section-strategy', title: $t('pages.productCenter.investmentStrategy') },
  { href: '#section-registration', title: $t('pages.productCenter.foreignRegistration') },
]);

// TODO(v2): Enable when Asset Allocation file upload is implemented
// function onAssetUploadSuccess(_file: any, response: { url: string }) {
//   const current = formData.value.assetAllocationTable || '';
//   const imageMarkdown = `![image](${response.url})`;
//   formData.value.assetAllocationTable = current ? `${current}\n${imageMarkdown}` : imageMarkdown;
// }

function handleAnchorClick(e: Event, link: { href: string; title: string }) {
  e.preventDefault();
  const href = link.href;
  if (!href?.startsWith('#')) return;
  const targetId = href.substring(1);
  const target = document.getElementById(targetId);
  if (!target) return;

  // Ensure the target's collapse panel is expanded
  const panel = target.closest('[data-key]') || target;
  const panelKey = panel?.getAttribute('data-key');
  if (panelKey && !activeCollapseKeys.value.includes(panelKey)) {
    activeCollapseKeys.value = [...activeCollapseKeys.value, panelKey];
  }

  // Find the scrollable container inside the *visible* dialog.
  const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
  let container: HTMLElement | null = null;
  for (let i = dialogs.length - 1; i >= 0; i--) {
    const sc = dialogs[i]!.querySelector<HTMLElement>('.overflow-y-auto');
    if (sc && sc.scrollHeight > 0) {
      container = sc;
      break;
    }
  }
  if (container) {
    container.scrollTo({
      top: target.offsetTop - 60,
      behavior: 'smooth',
    });
  }
}
</script>

<template>
  <Drawer :title="title" :class="'w-[85%]'" :footer="true">
    <Spin :spinning="loading" class="h-full">
      <div class="flex h-full gap-4">
        <div class="flex-1">
          <Form
            ref="formRef"
            :model="formData"
            :rules="rules"
            layout="vertical"
          >
            <Collapse v-model:activeKey="activeCollapseKeys" :bordered="false">
            <CollapsePanel id="section-core" key="core" :header="$t('pages.productCenter.coreFundIdentity')">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Code" name="fundCode">
                     <Input v-model:value="formData.fundCode" :disabled="isUpdate" :placeholder="$t('pages.productCenter.fundCode')" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Fund Name (EN)" name="fundNameEn">
                    <Input v-model:value="formData.fundNameEn" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Name (TC)" name="fundNameTc">
                    <Input v-model:value="formData.fundNameTc" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Fund Name (SC)" name="fundNameSc">
                    <Input v-model:value="formData.fundNameSc" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Type" name="fundType">
                    <Select v-model:value="formData.fundType" :options="fundTypeOptions" show-search allow-clear option-filter-prop="label" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Umbrella / OFC Name">
                    <Input v-model:value="formData.umbrellaOfcName" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Sub-Fund Code">
                    <Input v-model:value="formData.subFundCode" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Domicile / Jurisdiction" name="domicileJurisdiction">
                     <Select v-model:value="formData.domicileJurisdiction" :options="countryOptions" show-search allow-clear option-filter-prop="label" :placeholder="$t('pages.productCenter.selectCountry')" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Primary Regulator" name="primaryRegulator">
                    <Input v-model:value="formData.primaryRegulator" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Base Currency" name="baseCurrency">
                     <Select v-model:value="formData.baseCurrency" :options="currencyCodeOptions" show-search allow-clear option-filter-prop="label" :placeholder="$t('pages.productCenter.selectCurrency')" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Status" name="fundStatus">
                    <Select v-model:value="formData.fundStatus" :options="fundStatusOptions" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Application Submission Date">
                    <DatePicker v-model:value="formData.applicationSubmissionDate" class="w-full" value-format="YYYY/MM/DD" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Authorization Date">
                    <DatePicker v-model:value="formData.authorizationDate" class="w-full" value-format="YYYY/MM/DD" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Launch Date" name="launchDate">
                    <DatePicker v-model:value="formData.launchDate" class="w-full" value-format="YYYY/MM/DD" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Complex Product" name="complexProduct">
                    <Select v-model:value="formData.complexProduct" :options="yesNoOptions" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="IOP Start Date">
                    <DatePicker v-model:value="formData.iopStartDate" class="w-full" value-format="YYYY/MM/DD" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Operation Start Date">
                    <DatePicker v-model:value="formData.operationStartDate" class="w-full" value-format="YYYY/MM/DD" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Listing Date">
                    <DatePicker v-model:value="formData.listingDate" class="w-full" value-format="YYYY/MM/DD" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Termination Date">
                    <DatePicker v-model:value="formData.terminationDate" class="w-full" value-format="YYYY/MM/DD" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="LEI Number" name="leiNumber">
                    <Input v-model:value="formData.leiNumber" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="GIIIN Number" name="giinNumber">
                    <Input v-model:value="formData.giinNumber" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Professional Investors only">
                    <Select v-model:value="formData.professionalInvestorsOnly" :options="yesNoOptions" allow-clear />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Restriction on investor's nationality">
                    <Input v-model:value="formData.restrictionInvestorNationality" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Restriction on investor's residency">
                    <Input v-model:value="formData.restrictionInvestorResidency" />
                  </FormItem>
                </Col>
              </Row>
            </CollapsePanel>

             <CollapsePanel id="section-parties" key="parties" :header="$t('pages.productCenter.keyParties')">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Manager" name="fundManager">
                    <AutoComplete v-model:value="formData.fundManager" v-bind="getAutocompleteProps('fundManager')" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Fund Manager LEI" name="fundManagerLei">
                    <Input v-model:value="formData.fundManagerLei" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Sub Manager">
                    <Input v-model:value="formData.subManager" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Investment Advisor">
                    <AutoComplete v-model:value="formData.investmentAdvisor" v-bind="getAutocompleteProps('investmentAdvisor')" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Trustee / Administrator">
                    <AutoComplete v-model:value="formData.trusteeAdministrator" v-bind="getAutocompleteProps('trusteeAdministrator')" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Custodian / Prime Broker">
                    <AutoComplete v-model:value="formData.custodianPrimeBroker" v-bind="getAutocompleteProps('custodianPrimeBroker')" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Sub Custodian">
                    <Input v-model:value="formData.subCustodian" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Auditor">
                    <AutoComplete v-model:value="formData.auditor" v-bind="getAutocompleteProps('auditor')" />
                  </FormItem>
                </Col>
              </Row>
            </CollapsePanel>

             <CollapsePanel id="section-strategy" key="strategy" :header="$t('pages.productCenter.investmentStrategy')">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Primary Instrument Type" name="primaryInstrumentType">
                    <Select v-model:value="formData.primaryInstrumentType" :options="instrumentTypeOptions" show-search allow-clear option-filter-prop="label" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Passive or Active Fund" name="passiveOrActiveFund">
                    <Select v-model:value="formData.passiveOrActiveFund" :options="activePassiveOptions" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Investment Market Focus" name="investmentMarketFocus">
                    <Select v-model:value="formData.investmentMarketFocus" :options="marketFocusOptions" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Strategy Category (MorningStar)">
                    <Input v-model:value="formData.morningstarCategory" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="24">
                  <FormItem label="Investment Objective" name="investmentObjective">
                    <Input v-model:value="formData.investmentObjective" type="textarea" :rows="3" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="24">
                  <FormItem label="Investment Strategy" name="investmentStrategy">
                    <Input v-model:value="formData.investmentStrategy" type="textarea" :rows="3" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="24">
                  <FormItem label="Asset Allocation Table" name="assetAllocationTable">
                    <Input v-model:value="formData.assetAllocationTable" type="textarea" :rows="4" />
                    <!-- TODO(v2): Add file upload alongside text input -->
                    <!-- <div class="mt-3">
                      <FileUpload
                        :accept="'image/jpeg,image/jpg,image/png,image/heic,image/heif'"
                        :max-size="10"
                        :max-count="5"
                        :enable-drag-upload="true"
                        :show-success-msg="false"
                        :help-message="false"
                        @success="onAssetUploadSuccess"
                      />
                      <div class="mt-1 text-xs text-gray-400">
                        Supports JPEG, JPG, PNG, HEIC, HEIF. Max 10MB each, up to 5 images.
                      </div>
                    </div> -->
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Hedging Policy (Fund)" name="hedgingPolicyFund">
                    <Select v-model:value="formData.hedgingPolicyFund" :options="hedgingPolicyOptions" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Benchmark">
                    <AutoComplete v-model:value="formData.benchmark" v-bind="getAutocompleteProps('benchmark')" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Benchmark Code">
                    <Input v-model:value="formData.benchmarkCode" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Risk Rating" name="riskLevel">
                    <Select v-model:value="formData.riskLevel" :options="riskLevelOptions" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="8">
                   <FormItem label="Leverage Ratio (Max)(%)" name="leverageRatioMax">
                    <Input v-model:value="formData.leverageRatioMax" />
                  </FormItem>
                </Col>
                <Col :span="8">
                   <FormItem label="Derivatives Ratio (Max)(%)" name="derivativesRatioMax">
                    <Input v-model:value="formData.derivativesRatioMax" />
                  </FormItem>
                </Col>
                <Col :span="8">
                   <FormItem label="Borrowing Limit (%)" name="borrowingLimit">
                    <Input v-model:value="formData.borrowingLimit" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="8">
                   <FormItem label="Stop Loss Limit (%)" name="stopLossLimit">
                    <Input v-model:value="formData.stopLossLimit" />
                  </FormItem>
                </Col>
                <Col :span="8">
                   <FormItem label="Stop Loss Alert (%)" name="stopLossAlert">
                    <Input v-model:value="formData.stopLossAlert" />
                  </FormItem>
                </Col>
              </Row>
            </CollapsePanel>

             <CollapsePanel id="section-registration" key="registration" :header="$t('pages.productCenter.foreignRegistration')">
              <FormItem label="Registered Regions" name="regionDictCodes">
                <Select
                  v-model:value="formData.regionDictCodes"
                  :options="regionOptions"
                  mode="multiple"
                   :placeholder="$t('pages.productCenter.selectRegions')"
                  allow-clear
                  :filter-option="true"
                  option-filter-prop="label"
                />
              </FormItem>
            </CollapsePanel>
            </Collapse>
          </Form>
        </div>

        <div class="w-[160px] shrink-0 sticky top-0 self-start">
          <Anchor :key="scrollContainerRef" :items="anchorItems" :offset-top="16" :target-offset="60" :affix="false" :get-container="() => scrollContainerRef || window" @click="handleAnchorClick" />
        </div>
      </div>
    </Spin>

    <template #footer>
      <div class="flex justify-end gap-2">
        <a-button @click="drawerApi.close()">{{ $t('pages.common.cancel') }}</a-button>
        <a-button type="primary" @click="handleConfirm">
          {{ isUpdate ? $t('pages.common.edit') : $t('pages.common.add') }}
        </a-button>
      </div>
    </template>
  </Drawer>
</template>

<style scoped>
:deep(.ant-collapse-header) {
  border-radius: 6px;
  transition: background-color 0.2s ease;
  font-weight: 600;
  font-size: 15px;
}
:deep(.ant-collapse-header:hover) {
  background-color: rgba(0, 0, 0, 0.04);
}
:deep(.ant-collapse-header:active) {
  background-color: rgba(0, 0, 0, 0.08);
}
:deep(.ant-anchor-link) {
  font-size: 14px;
}
:deep(.ant-anchor-link-title-active) {
  font-weight: 500;
}
</style>
