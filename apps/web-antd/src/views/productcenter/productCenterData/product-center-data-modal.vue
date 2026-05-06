<script setup lang="ts">
import type { ProductCenterData } from '#/api/productcenter/productCenterData/model';

import { computed, nextTick, ref, watch } from 'vue';

import dayjs from 'dayjs';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import {
  Anchor,
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
  Table,
  TimePicker,
} from 'antdv-next';

import {
  productCenterDataAdd,
  productCenterDataCheckUnique,
  productCenterDataInfo,
  productCenterDataList,
  productCenterDataUpdate,
} from '#/api/productcenter/productCenterData';
import type { ProductCenterMasterdata } from '#/api/productcenter/productCenterMasterdata/model';
import { productCenterMasterdataList } from '#/api/productcenter/productCenterMasterdata';
import { ClassStatusEnum, CurrencyEnum } from '#/api/productcenter/productCenterData/model';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const isCopy = ref(false);
const loading = ref(false);
const formRef = ref();
const activeCollapseKeys = ref<string[]>(['fund-info', 'class-list', 'class-info', 'dealing']);
const scrollContainerRef = ref<HTMLElement | null>(null);
const classListData = ref<ProductCenterData[]>([]);
const fundCodeOptions = ref<{ label: string; value: string }[]>([]);

const classListColumns = computed<any[]>(() => [
  { title: $t('pages.productCenter.form.shareClassNameEn'), dataIndex: 'shareClassNameEnOfficialName', key: 'en' },
  { title: $t('pages.productCenter.form.shareClassNameTc'), dataIndex: 'shareClassNameTcOfficialName', key: 'tc' },
  { title: $t('pages.productCenter.form.vpfsClassId'), dataIndex: 'vpfsClassId', key: 'vpfs' },
  { title: $t('pages.productCenter.form.classCurrency'), dataIndex: 'classCurrency', key: 'ccy' },
  { title: $t('pages.productCenter.form.fundClassStatus'), dataIndex: 'fundClassStatus', key: 'status' },
  {
    title: $t('pages.productCenter.action'),
    key: 'action',
    width: 80,
    align: 'center',
  },
]);

const title = computed(() => {
  if (isCopy.value) return $t('pages.productCenter.copyShareClass');
  return isUpdate.value ? $t('pages.productCenter.editShareClass') : $t('pages.productCenter.addShareClass');
});

const formData = ref<Record<string, any>>({});

const enumToOptions = (enumObj: Record<string, string | number>) =>
  Object.entries(enumObj).map(([_, value]) => ({ label: String(value), value }));

const fundClassStatusOptions = enumToOptions(ClassStatusEnum);
const currencyOptions = enumToOptions(CurrencyEnum);
const yesNoOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

// Distribution Policy
const distributionPolicyOptions = [
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Annually', value: 'Annually' },
  { label: 'N/A', value: 'N/A' },
];

// Unit Precision
const unitPrecisionOptions = [
  { label: '2', value: '2' },
  { label: '3', value: '3' },
  { label: '4', value: '4' },
];

// NAV Precision
const navPrecisionOptions = [
  { label: '0', value: '0' },
  { label: '2', value: '2' },
  { label: '4', value: '4' },
];

// Business Calendar (multi-select)
const businessCalendarOptions = [
  { label: 'Hong Kong', value: 'Hong Kong' },
  { label: 'Taiwan', value: 'Taiwan' },
  { label: 'Japan', value: 'Japan' },
  { label: 'PRC - Stock Exchange', value: 'PRC - Stock Exchange' },
  { label: 'PRC - Bank', value: 'PRC - Bank' },
  { label: 'Ireland', value: 'Ireland' },
  { label: 'UK', value: 'UK' },
  { label: 'Relevant Market as per Prospectus', value: 'Relevant Market as per Prospectus' },
];

// Financial Year End
const financialYearEndOptions = [
  { label: '31-March', value: '31-March' },
  { label: '30-June', value: '30-June' },
  { label: '31-December', value: '31-December' },
];

// Dealing Frequency
const dealingFrequencyOptions = [
  { label: 'Daily', value: 'Daily' },
  { label: 'Weekly', value: 'Weekly' },
  { label: 'Monthly', value: 'Monthly' },
  { label: 'Quarterly', value: 'Quarterly' },
  { label: 'Yearly', value: 'Yearly' },
];

// Pricing Methodology (multi-select)
const pricingMethodologyOptions = [
  { label: 'Amortization', value: 'Amortization' },
  { label: 'Cost', value: 'Cost' },
  { label: 'Mark to Market', value: 'Mark to Market' },
];

// Country options for time+country picker (HKG, IRL, CHN first, then alpha)
const tzCountryOptions = [
  { label: 'HKG - Hong Kong', value: 'HKG' },
  { label: 'IRL - Ireland', value: 'IRL' },
  { label: 'CHN - China', value: 'CHN' },
  { label: 'AUS - Australia', value: 'AUS' },
  { label: 'CAN - Canada', value: 'CAN' },
  { label: 'FRA - France', value: 'FRA' },
  { label: 'DEU - Germany', value: 'DEU' },
  { label: 'JPN - Japan', value: 'JPN' },
  { label: 'LUX - Luxembourg', value: 'LUX' },
  { label: 'SGP - Singapore', value: 'SGP' },
  { label: 'CHE - Switzerland', value: 'CHE' },
  { label: 'TWN - Taiwan', value: 'TWN' },
  { label: 'GBR - United Kingdom', value: 'GBR' },
  { label: 'USA - United States', value: 'USA' },
];

// ISIN: 2 letters + 10 alphanumeric (12 chars total)
const isinValidator = (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^[A-Z]{2}[A-Z0-9]{10}$/.test(value))
    return Promise.reject('ISIN must be 2 letters + 10 alphanumeric (e.g. HK0000123456)');
  return Promise.resolve();
};

// Stock Code (HK): 5 digits
const stockCodeValidator = (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^\d{1,5}$/.test(value))
    return Promise.reject('Stock Code must be 1-5 digits');
  return Promise.resolve();
};

// SEDOL: 7 alphanumeric
const sedolValidator = (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^[A-Z0-9]{7}$/.test(value))
    return Promise.reject('SEDOL must be 7 alphanumeric characters');
  return Promise.resolve();
};

// CUSIP: 9 alphanumeric
const cusipValidator = (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^[A-Z0-9]{9}$/.test(value))
    return Promise.reject('CUSIP must be 9 alphanumeric characters');
  return Promise.resolve();
};

// Integer string validator
const integerValidator = (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^\d+$/.test(value))
    return Promise.reject('Must be a whole number');
  return Promise.resolve();
};

// Numeric string validator (supports decimals)
const numericValidator = (label: string) => (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^\d+(\.\d+)?$/.test(value))
    return Promise.reject(`${label} must be a number`);
  return Promise.resolve();
};

// Decimal 2 places, non-negative validator
const decimal2Validator = (label: string) => (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^\d+(\.\d{1,2})?$/.test(value))
    return Promise.reject(`${label} must be a non-negative number (up to 2 decimal places)`);
  return Promise.resolve();
};

// Time validator (HH:MM)
const timeValidator = (_rule: any, value: string) => {
  if (!value) return Promise.resolve();
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value))
    return Promise.reject('Time must be in HH:MM format');
  return Promise.resolve();
};

const rules = {
  fundCode: [{ required: true, message: 'Fund Code is required' }],
  shareClassNameEnOfficialName: [
    { required: true, message: 'Share Class Name (EN) is required' },
    { max: 200, message: 'Must be at most 200 characters' },
  ],
  shareClassNameTcOfficialName: [
    { required: true, message: 'Share Class Name (TC) is required' },
    { max: 200, message: 'Must be at most 200 characters' },
  ],
  shareClassNameScOfficialName: [
    { required: true, message: 'Share Class Name (SC) is required' },
    { max: 200, message: 'Must be at most 200 characters' },
  ],
  classCurrency: [{ required: true, message: 'Class Currency is required' }],
  fundClassStatus: [{ required: true, message: 'Fund Class Status is required' }],
  launchDate: [{ required: true, message: 'Launch Date is required' }],
  distributionPolicy: [{ required: true, message: 'Distribution Policy is required' }],
  hedged: [{ required: true, message: 'Hedged is required' }],
  unitPrecision: [{ required: true, message: 'Unit Precision is required' }],
  navPrecision: [{ required: true, message: 'NAV Precision is required' }],
  businessDayDefinition: [{ required: true, message: 'Business Day Definition is required' }],
  businessCalendar: [{ required: true, message: 'Business Calendar is required' }],
  dealingFrequency: [{ required: true, message: 'Dealing Frequency is required' }],
  valuationFrequency: [{ required: true, message: 'Valuation Frequency is required' }],
  dealingCutOff: [{
    validator: (_rule: any, _value: any, callback: (error?: Error) => void) => {
      const time = formData.value.dealingCutOff_time;
      const tz = formData.value.dealingCutOff_tz;
      if (time && tz) callback();
      else if (!time && !tz) callback(new Error('Dealing Cut-off is required'));
      else callback(new Error('Please fill both time and timezone'));
    },
  }],
  valuationPoint: [{
    validator: (_rule: any, _value: any, callback: (error?: Error) => void) => {
      const time = formData.value.valuationPoint_time;
      const tz = formData.value.valuationPoint_tz;
      if (time && tz) callback();
      else if (!time && !tz) callback(new Error('Valuation Point is required'));
      else callback(new Error('Please fill both time and timezone'));
    },
  }],
  cutoffTime: [{
    validator: (_rule: any, _value: any, callback: (error?: Error) => void) => {
      const time = formData.value.cutoffTime_time;
      const tz = formData.value.cutoffTime_tz;
      if (time && tz) callback();
      else if (!time && !tz) callback(new Error('Cutoff Time is required'));
      else callback(new Error('Please fill both time and timezone'));
    },
  }],
  pricingMethodology: [{ required: true, message: 'Pricing Methodology is required' }],
  subscriptionSettlement: [{ required: true, message: 'Subscription Settlement is required' }],
  redemptionSettlement: [{ required: true, message: 'Redemption Settlement is required' }],
  minimumInitialSubscription: [{ required: true, message: 'Min Initial Subscription is required' }],
  minimumSubsequentSubscription: [{ required: true, message: 'Min Subsequent Subscription is required' }],
  minimumRedemption: [{ required: true, message: 'Minimum Redemption is required' }],
  isinCode: [{ validator: isinValidator }],
  stockCode: [{ validator: stockCodeValidator }],
  sedol: [{ validator: sedolValidator }],
  cusip: [{ validator: cusipValidator }],
  latestTerRate: [{ validator: decimal2Validator('Latest TER Rate') }],
  managementFee: [{ validator: decimal2Validator('Management Fee') }],
  performanceFee: [{ validator: decimal2Validator('Performance Fee') }],
  subscriptionSettlementT: [{ validator: integerValidator }],
  redemptionSettlementT: [{ validator: integerValidator }],
  contractNoteDeliveryDayT: [{ validator: integerValidator }],
  valuationDeliveryTimeT: [{ validator: integerValidator }],
};

// Auto-detect Hedged from Share Class Name (EN)
watch(() => formData.value.shareClassNameEnOfficialName, (val) => {
  if (val && /\bhedged\b/i.test(val)) {
    formData.value.hedged = true;
  }
});

watch(() => formData.value.hedged, (val) => {
  if (val !== true) {
    formData.value.hedgingCurrency = undefined;
  }
});

// When Fund Code changes, auto-populate Fund Name fields
watch(() => formData.value.fundCode, async (fundCode) => {
  if (!fundCode) {
    formData.value.fundNameEn = undefined;
    formData.value.fundNameTc = undefined;
    formData.value.fundNameSc = undefined;
    classListData.value = [];
    return;
  }
  // Load class list for the selected fund
  try {
    classListData.value = (await productCenterDataList({ pageNum: 1, pageSize: 999, fundCode })).rows || [];
  } catch {
    classListData.value = [];
  }
  // Auto-populate fund names from fund code options
  const fund = fundCodeOptions.value.find((o) => o.value === fundCode);
  if (fund) {
    // Try loading full fund data for names
    try {
      const fundList = await productCenterMasterdataList({ pageNum: 1, pageSize: 1, fundCode });
      const match = fundList.rows?.find((f: ProductCenterMasterdata) => f.fundCode === fundCode);
      if (match) {
        formData.value.fundNameEn = match.fundNameEn;
        formData.value.fundNameTc = match.fundNameTc;
        formData.value.fundNameSc = match.fundNameSc;
      }
    } catch { /* ignore */ }
  }
}, { immediate: true });

// Transform raw API data into form-ready format (dayjs, arrays, composite time split, fee trim)
function transformShareClassData(d: Record<string, any>) {
  // Convert date strings → dayjs for DatePicker
  const dateFields = ['endOfIopDate', 'launchDate'];
  const monthFields = ['latestTerDate'];
  for (const key of dateFields) {
    if (d[key]) d[key] = dayjs(d[key]);
  }
  for (const key of monthFields) {
    if (d[key]) d[key] = dayjs(d[key]);
  }

  // Backend stores comma-separated strings → split for multi-select
  const multiSelectFields = ['businessCalendar', 'pricingMethodology'];
  for (const key of multiSelectFields) {
    if (typeof d[key] === 'string' && d[key]) {
      d[key] = d[key].split(',');
    } else if (!Array.isArray(d[key])) {
      d[key] = [];
    }
  }

  // Convert composite time+tz strings "HH:mm CCC" → separate _time (dayjs) and _tz (string)
  const compositeTimeFields = ['dealingCutOff', 'valuationPoint', 'cutoffTime'];
  for (const key of compositeTimeFields) {
    const raw = d[key];
    if (raw && typeof raw === 'string') {
      const parts = raw.trim().split(/\s+/);
      d[`${key}_time`] = dayjs(parts[0], 'HH:mm');
      d[`${key}_tz`] = parts[1] || undefined;
      delete d[key];
    }
  }

  // Trim fee fields to max 2 decimal places
  const feeFields = ['managementFee', 'performanceFee'];
  for (const key of feeFields) {
    if (d[key] != null) {
      d[key] = String(Number.parseFloat(Number(d[key]).toFixed(2)));
    }
  }

  return d;
}

async function handleCopyFromClassList(record: ProductCenterData) {
  if (!record.productClassId) return;
  try {
    const detail = await productCenterDataInfo(record.productClassId);
    const d = cloneDeep(detail);
    transformShareClassData(d);
    // Merge transformed data into formData (preserve fundCode, fundName fields)
    const preserved = {
      fundCode: formData.value.fundCode,
      fundNameEn: formData.value.fundNameEn,
      fundNameTc: formData.value.fundNameTc,
      fundNameSc: formData.value.fundNameSc,
    };
    formData.value = { ...d, ...preserved };
  } catch {
    window.message.error('Failed to load class details');
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      formData.value = {};
      classListData.value = [];
      return;
    }

    try {
      // Load fund codes for dropdown
      try {
        const fundList = await productCenterMasterdataList({ pageNum: 1, pageSize: 999 });
        fundCodeOptions.value = (fundList.rows || []).map((f: ProductCenterMasterdata) => ({
          label: `${f.fundCode} - ${f.fundNameEn}`,
          value: f.fundCode,
        }));
      } catch { /* ignore */ }

      drawerApi.drawerLoading(true);
      const data = drawerApi.getData<Record<string, any>>();
      isUpdate.value = !!data?.productClassId && !data?.isCopy;
      isCopy.value = !!data?.isCopy;

      if (data?.productClassId) {
        try {
          const shareClassData = await productCenterDataInfo(data.productClassId);
          if (isCopy.value) {
            shareClassData.vpfsClassId = '';
            shareClassData.shareClassNameEnOfficialName = '';
          }
          const d = cloneDeep(shareClassData);
          transformShareClassData(d);
          formData.value = d;
        } catch {
          formData.value = {};
        }
      } else {
        formData.value = {};
      }

      await nextTick();
    } catch (error) {
      console.error('[ProductCenterDataFormDrawer] onOpenChange error:', error);
      formData.value = {};
    } finally {
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

    const excludeId = isUpdate.value ? formData.value.productClassId : undefined;
    const isUnique = await productCenterDataCheckUnique(
      formData.value.fundCode,
      formData.value.shareClassNameEnOfficialName,
      formData.value.vpfsClassId,
      excludeId,
    );
    if (!isUnique) {
      window.message.error($t('pages.productCenter.fundCodeShareClassUnique'));
      return;
    }

    const submitData = cloneDeep(formData.value);

    // Backend expects comma-separated strings, not arrays
    if (Array.isArray(submitData.businessCalendar)) {
      submitData.businessCalendar = submitData.businessCalendar.join(',');
    }
    if (Array.isArray(submitData.pricingMethodology)) {
      submitData.pricingMethodology = submitData.pricingMethodology.join(',');
    }

    // Composite time+tz fields: combine _time (dayjs) + _tz (string) → "HH:mm CCC"
    const compositeTimeFields = ['dealingCutOff', 'valuationPoint', 'cutoffTime'];
    for (const key of compositeTimeFields) {
      const time = submitData[`${key}_time`];
      const tz = submitData[`${key}_tz`];
      const timeStr = time && dayjs.isDayjs(time) ? time.format('HH:mm') : '';
      submitData[key] = [timeStr, tz].filter(Boolean).join(' ');
      delete submitData[`${key}_time`];
      delete submitData[`${key}_tz`];
    }

    if (isUpdate.value) {
      await productCenterDataUpdate(submitData);
      window.message.success($t('pages.productCenter.updatedSuccessfully'));
    } else {
      await productCenterDataAdd(submitData);
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
  { href: '#section-fund-info', title: $t('pages.productCenter.fundInfo') },
  { href: '#section-class-list', title: $t('pages.productCenter.classList') },
  { href: '#section-class-info', title: $t('pages.productCenter.classInfo') },
  { href: '#section-dealing', title: $t('pages.productCenter.dealingAndValuation') },
]);

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
            <!-- Fund Info -->
            <CollapsePanel id="section-fund-info" key="fund-info" :header="$t('pages.productCenter.fundInfo')">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.fundCode')" name="fundCode">
                    <Select v-model:value="formData.fundCode" :options="fundCodeOptions" show-search allow-clear option-filter-prop="label" :placeholder="$t('pages.productCenter.selectFundCode')" :disabled="isUpdate" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.fundNameEn')">
                    <Input v-model:value="formData.fundNameEn" disabled />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.fundNameTc')">
                    <Input v-model:value="formData.fundNameTc" disabled />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.fundNameSc')">
                    <Input v-model:value="formData.fundNameSc" disabled />
                  </FormItem>
                </Col>
              </Row>
            </CollapsePanel>

            <!-- Class List -->
            <CollapsePanel id="section-class-list" key="class-list" :header="$t('pages.productCenter.classList')">
              <div class="mb-2 text-gray-500 text-xs">
                {{ $t('pages.productCenter.classListTip') }}
              </div>
              <Table
                :columns="classListColumns"
                :data-source="classListData"
                :row-key="(record: ProductCenterData) => record.productClassId ?? record.vpfsClassId"
                size="small"
                :pagination="false"
                :scroll="{ y: 200 }"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'action'">
                    <a style="color: #1677ff; cursor: pointer; font-size: 13px;" @click="handleCopyFromClassList(record)">Copy</a>
                  </template>
                </template>
              </Table>
            </CollapsePanel>

            <!-- Class Info -->
            <CollapsePanel id="section-class-info" key="class-info" :header="$t('pages.productCenter.classInfo')">
              <!-- 1. Share Class Name (EN) / Share Class Name (TC) -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.shareClassNameEn')" name="shareClassNameEnOfficialName">
                    <Input v-model:value="formData.shareClassNameEnOfficialName" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.shareClassNameTc')" name="shareClassNameTcOfficialName">
                    <Input v-model:value="formData.shareClassNameTcOfficialName" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 2. Share Class Name (SC) / VPFS Class ID -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.shareClassNameSc')" name="shareClassNameScOfficialName">
                    <Input v-model:value="formData.shareClassNameScOfficialName" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.vpfsClassId')">
                    <Input v-model:value="formData.vpfsClassId" :disabled="isUpdate" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 3. ISIN Code / CUSIP -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.isinCode')" name="isinCode">
                    <Input v-model:value="formData.isinCode" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.cusip')" name="cusip">
                    <Input v-model:value="formData.cusip" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 4. Bloomberg Ticker / BBG ID Equity -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.bloombergTicker')">
                    <Input v-model:value="formData.bloombergTicker" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.bbgIdEquity')">
                    <Input v-model:value="formData.bbgIdEquity" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 5. SEDOL / Morningstar Fund ID -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.sedol')" name="sedol">
                    <Input v-model:value="formData.sedol" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.morningstarFundId')">
                    <Input v-model:value="formData.morningstarFundId" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 6. Morningstar Sec ID / Morningstar Performance ID -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.morningstarSecId')">
                    <Input v-model:value="formData.morningstarSecId" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.morningstarPerfId')">
                    <Input v-model:value="formData.morningstarPerformanceId" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 7. Stock Code / Valor Code -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.stockCode')" name="stockCode">
                    <Input v-model:value="formData.stockCode" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.valorCode')">
                    <Input v-model:value="formData.valorCode" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 8. Lipper Code / Fund Class Status -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.lipperCode')">
                    <Input v-model:value="formData.lipperCode" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.fundClassStatus')" name="fundClassStatus">
                    <Select v-model:value="formData.fundClassStatus" :options="fundClassStatusOptions" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 9. Class Currency / End of IOP Date -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.classCurrency')" name="classCurrency">
                    <Select v-model:value="formData.classCurrency" :options="currencyOptions" show-search option-filter-prop="label" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.endOfIopDate')">
                    <DatePicker v-model:value="formData.endOfIopDate" style="width: 100%" value-format="YYYY/MM/DD" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 10. Launch Date / Cutoff Time -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.launchDate')" name="launchDate">
                    <DatePicker v-model:value="formData.launchDate" style="width: 100%" value-format="YYYY/MM/DD" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.cutoffTime')" name="cutoffTime">
                    <div style="display: flex; gap: 8px;">
                      <TimePicker v-model:value="formData.cutoffTime_time" format="HH:mm" :allow-clear="true" style="width: 110px" />
                      <Select v-model:value="formData.cutoffTime_tz" :options="tzCountryOptions" show-search option-filter-prop="label" style="flex: 1; min-width: 0" placeholder="TZ" />
                    </div>
                  </FormItem>
                </Col>
              </Row>
              <!-- 11. Business Day Definition / Business Calendar -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.businessDayDefinition')" name="businessDayDefinition">
                    <Input v-model:value="formData.businessDayDefinition" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.businessCalendar')" name="businessCalendar">
                    <Select v-model:value="formData.businessCalendar" :options="businessCalendarOptions" mode="multiple" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 12. Distribution Frequency / Hedged -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.distributionPolicy')" name="distributionPolicy">
                    <Select v-model:value="formData.distributionPolicy" :options="distributionPolicyOptions" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.hedged')" name="hedged">
                    <Select v-model:value="formData.hedged" :options="yesNoOptions" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 13. Hedging Currency / Unit Precision -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.hedgingCurrency')">
                    <Select v-model:value="formData.hedgingCurrency" :options="currencyOptions" show-search option-filter-prop="label" :disabled="!formData.hedged" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.unitPrecision')" name="unitPrecision">
                    <Select v-model:value="formData.unitPrecision" :options="unitPrecisionOptions" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 14. NAV Precision / Subscription Settlement(T+) -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.navPrecision')" name="navPrecision">
                    <Select v-model:value="formData.navPrecision" :options="navPrecisionOptions" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.subscriptionSettlement')" name="subscriptionSettlement">
                    <Input v-model:value="formData.subscriptionSettlement" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 15. Redemption Settlement(T+) / Min Initial Subscription -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.redemptionSettlement')" name="redemptionSettlement">
                    <Input v-model:value="formData.redemptionSettlement" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.minimumInitialSubscription')" name="minimumInitialSubscription">
                    <Input v-model:value="formData.minimumInitialSubscription" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 16. Min Subsequent Subscription / Minimum Redemption -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.minimumSubsequentSubscription')" name="minimumSubsequentSubscription">
                    <Input v-model:value="formData.minimumSubsequentSubscription" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.minimumRedemption')" name="minimumRedemption">
                    <Input v-model:value="formData.minimumRedemption" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 17. Minimum Holding / Redemption Charge -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.minimumHolding')">
                    <Input v-model:value="formData.minimumHolding" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.redemptionCharge')">
                    <Input v-model:value="formData.redemptionCharge" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 18. Management Fee(%) / Performance Fee(%) -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.managementFee')" name="managementFee">
                    <Input v-model:value="formData.managementFee" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.performanceFee')" name="performanceFee">
                    <Input v-model:value="formData.performanceFee" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 19. Financial Year End / Latest TER Date -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.financialYearEnd')">
                    <Select v-model:value="formData.financialYearEnd" :options="financialYearEndOptions" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.latestTerDate')">
                    <DatePicker v-model:value="formData.latestTerDate" style="width: 100%" picker="month" value-format="YYYY/MM" />
                  </FormItem>
                </Col>
              </Row>
              <!-- 20. Latest TER Rate(%) -->
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.latestTerRate')" name="latestTerRate">
                    <Input v-model:value="formData.latestTerRate" />
                  </FormItem>
                </Col>
              </Row>
            </CollapsePanel>

            <!-- Dealing & Valuation -->
            <CollapsePanel id="section-dealing" key="dealing" :header="$t('pages.productCenter.dealingAndValuation')">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.dealingFrequency')" name="dealingFrequency">
                    <Select v-model:value="formData.dealingFrequency" :options="dealingFrequencyOptions" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.valuationFrequency')" name="valuationFrequency">
                    <Select v-model:value="formData.valuationFrequency" :options="dealingFrequencyOptions" />
                  </FormItem>
                </Col>
              </Row>
               <Row :gutter="16">
                 <Col :span="12">
                    <FormItem :label="$t('pages.productCenter.form.dealingCutOff')" name="dealingCutOff">
                       <div style="display: flex; gap: 8px;">
                         <TimePicker v-model:value="formData.dealingCutOff_time" format="HH:mm" :allow-clear="true" style="width: 110px" />
                         <Select v-model:value="formData.dealingCutOff_tz" :options="tzCountryOptions" show-search option-filter-prop="label" style="flex: 1; min-width: 0" placeholder="TZ" />
                      </div>
                    </FormItem>
                 </Col>
                 <Col :span="12">
                    <FormItem :label="$t('pages.productCenter.form.valuationPoint')" name="valuationPoint">
                       <div style="display: flex; gap: 8px;">
                         <TimePicker v-model:value="formData.valuationPoint_time" format="HH:mm" :allow-clear="true" style="width: 110px" />
                         <Select v-model:value="formData.valuationPoint_tz" :options="tzCountryOptions" show-search option-filter-prop="label" style="flex: 1; min-width: 0" placeholder="TZ" />
                      </div>
                    </FormItem>
                 </Col>
               </Row>
               <Row :gutter="16">
                 <Col :span="12">
                   <FormItem :label="$t('pages.productCenter.form.contractNoteDeliveryDay')">
                    <Input v-model:value="formData.contractNoteDeliveryDay" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.pricingMethodology')" name="pricingMethodology">
                    <Select v-model:value="formData.pricingMethodology" :options="pricingMethodologyOptions" mode="multiple" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.valuationDeliveryTime')">
                    <Input v-model:value="formData.valuationDeliveryTime" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem :label="$t('pages.productCenter.form.securityLending')">
                    <Select v-model:value="formData.securityLending" :options="yesNoOptions" allow-clear />
                  </FormItem>
                </Col>
              </Row>
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
