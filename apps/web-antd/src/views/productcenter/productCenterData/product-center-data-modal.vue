<script setup lang="ts">
import type { ProductCenterData } from '#/api/productcenter/productCenterData/model';

import { computed, nextTick, ref, watch } from 'vue';

import dayjs from 'dayjs';

import { useVbenDrawer } from '@vben/common-ui';
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
const selectedClassRow = ref<ProductCenterData | null>(null);
const fundCodeOptions = ref<{ label: string; value: string }[]>([]);

const classListColumns = [
  { title: 'Share Class Name (EN)', dataIndex: 'shareClassNameEnOfficialName', key: 'en' },
  { title: 'Share Class Name (TC)', dataIndex: 'shareClassNameTcOfficialName', key: 'tc' },
  { title: 'VPFS Class ID', dataIndex: 'vpfsClassId', key: 'vpfs' },
  { title: 'Class Currency', dataIndex: 'classCurrency', key: 'ccy' },
  { title: 'Status', dataIndex: 'fundClassStatus', key: 'status' },
];

const classListSelectedRowKeys = ref<(number | string)[]>([]);

const classListRowSelection = computed(() => ({
  type: 'radio' as const,
  selectedRowKeys: classListSelectedRowKeys.value,
  onChange: (_keys: (number | string)[], rows: ProductCenterData[]) => {
    selectedClassRow.value = rows[0] || null;
  },
}));

const title = computed(() => {
  if (isCopy.value) return 'Copy Share Class';
  return isUpdate.value ? 'Edit Share Class' : 'Add Share Class';
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
  dealingCutOff: [{ required: true, message: 'Dealing Cut-off is required' }],
  dealingCutOffTz: [{ required: true, message: 'Dealing Cut-off TZ is required' }],
  valuationPoint: [{ required: true, message: 'Valuation Point is required' }],
  valuationPointTz: [{ required: true, message: 'Valuation Point TZ is required' }],
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

function handleCopyFromClassList() {
  if (!selectedClassRow.value) return;
  const source = cloneDeep(selectedClassRow.value);
  const copyFields: (keyof ProductCenterData)[] = [
    'shareClassNameEnOfficialName', 'shareClassNameTcOfficialName', 'shareClassNameScOfficialName',
    'classCurrency', 'fundClassStatus', 'vpfsClassId',
    'endOfIopDate', 'launchDate', 'stockCode', 'isinCode',
    'morningstarFundId', 'morningstarSecId', 'morningstarPerformanceId',
    'cusip', 'valorCode', 'lipperCode', 'bloombergTicker', 'bbgIdEquity', 'sedol',
    'dealingFrequency', 'distributionPolicy', 'unitPrecision', 'navPrecision',
    'dealingCutOff', 'businessDayDefinition', 'businessCalendar',
    'subscriptionSettlement', 'redemptionSettlement',
    'minimumInitialSubscription', 'minimumSubsequentSubscription',
    'minimumRedemption', 'minimumHolding', 'redemptionCharge',
    'managementFee', 'performanceFee', 'ter', 'financialYearEnd',
    'contractNoteDeliveryDay', 'pricingMethodology', 'valuationPoint',
    'valuationFrequency', 'valuationDeliveryTime',
    'securityLending', 'hedged', 'hedgingCurrency',
  ];
  for (const field of copyFields) {
    if (source[field] !== undefined && source[field] !== null) {
      formData.value[field] = source[field];
    }
  }
}

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      formData.value = {};
      classListData.value = [];
      selectedClassRow.value = null;
      classListSelectedRowKeys.value = [];
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

          // Convert date strings "YYYY-MM-DD HH:mm:ss" → dayjs for DatePicker
          const dateFields = ['endOfIopDate', 'launchDate'];
          const monthFields = ['latestTerDate'];
          for (const key of dateFields) {
            if (d[key]) d[key] = dayjs(d[key]);
          }
          for (const key of monthFields) {
            if (d[key]) d[key] = dayjs(d[key]);
          }

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
      window.message.error('Fund Code + Share Class Name (EN) + VPFS Class ID must be unique!');
      return;
    }

    const submitData = cloneDeep(formData.value);
    if (isUpdate.value) {
      await productCenterDataUpdate(submitData);
      window.message.success('Updated successfully');
    } else {
      await productCenterDataAdd(submitData);
      window.message.success('Added successfully');
    }
    emit('reload');
    drawerApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.lock(false);
  }
}

const anchorItems = [
  { href: '#section-fund-info', title: 'Fund Info' },
  { href: '#section-class-list', title: 'Class List' },
  { href: '#section-class-info', title: 'Class Info' },
  { href: '#section-dealing', title: 'Dealing & Valuation' },
];

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
            <CollapsePanel id="section-fund-info" key="fund-info" header="Fund Info">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Code" name="fundCode">
                    <Select v-model:value="formData.fundCode" :options="fundCodeOptions" show-search allow-clear option-filter-prop="label" placeholder="Select Fund Code" :disabled="isUpdate" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Fund Name (EN)">
                    <Input v-model:value="formData.fundNameEn" disabled />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Name (TC)">
                    <Input v-model:value="formData.fundNameTc" disabled />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Fund Name (SC)">
                    <Input v-model:value="formData.fundNameSc" disabled />
                  </FormItem>
                </Col>
              </Row>
            </CollapsePanel>

            <!-- Class List -->
            <CollapsePanel id="section-class-list" key="class-list" header="Class List">
              <div class="mb-2 text-gray-500 text-xs">
                Select a Fund Code above to load existing share classes. Select a row and click "Copy from Class List" to auto-fill the form.
              </div>
              <Table
                :columns="classListColumns"
                :data-source="classListData"
                :row-selection="classListRowSelection"
                :row-key="(record: ProductCenterData) => record.productClassId ?? record.vpfsClassId"
                size="small"
                :pagination="false"
                :scroll="{ y: 200 }"
              />
            </CollapsePanel>

            <!-- Class Info -->
            <CollapsePanel id="section-class-info" key="class-info" header="Class Info">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Share Class Name (EN)" name="shareClassNameEnOfficialName">
                    <Input v-model:value="formData.shareClassNameEnOfficialName" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Share Class Name (TC)" name="shareClassNameTcOfficialName">
                    <Input v-model:value="formData.shareClassNameTcOfficialName" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Share Class Name (SC)" name="shareClassNameScOfficialName">
                    <Input v-model:value="formData.shareClassNameScOfficialName" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="VPFS Class ID">
                    <Input v-model:value="formData.vpfsClassId" :disabled="isUpdate" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="ISIN Code" name="isinCode">
                    <Input v-model:value="formData.isinCode" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="CUSIP" name="cusip">
                    <Input v-model:value="formData.cusip" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Bloomberg Ticker">
                    <Input v-model:value="formData.bloombergTicker" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="BBG ID Equity">
                    <Input v-model:value="formData.bbgIdEquity" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="SEDOL" name="sedol">
                    <Input v-model:value="formData.sedol" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Morningstar Fund ID">
                    <Input v-model:value="formData.morningstarFundId" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Morningstar Sec ID">
                    <Input v-model:value="formData.morningstarSecId" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Morningstar Perf ID">
                    <Input v-model:value="formData.morningstarPerformanceId" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Stock Code" name="stockCode">
                    <Input v-model:value="formData.stockCode" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Valor Code">
                    <Input v-model:value="formData.valorCode" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Lipper Code">
                    <Input v-model:value="formData.lipperCode" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Fund Class Status" name="fundClassStatus">
                    <Select v-model:value="formData.fundClassStatus" :options="fundClassStatusOptions" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Class Currency" name="classCurrency">
                    <Select v-model:value="formData.classCurrency" :options="currencyOptions" show-search option-filter-prop="label" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="End of IOP Date">
                    <DatePicker v-model:value="formData.endOfIopDate" class="w-full" value-format="YYYY/MM/DD" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Launch Date" name="launchDate">
                    <DatePicker v-model:value="formData.launchDate" class="w-full" value-format="YYYY/MM/DD" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Latest TER Date">
                    <DatePicker v-model:value="formData.latestTerDate" class="w-full" picker="month" value-format="YYYY/MM" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Latest TER Rate(%)" name="latestTerRate">
                    <Input v-model:value="formData.latestTerRate" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Distribution Policy" name="distributionPolicy">
                    <Select v-model:value="formData.distributionPolicy" :options="distributionPolicyOptions" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Hedged" name="hedged">
                    <Select v-model:value="formData.hedged" :options="yesNoOptions" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Hedging Currency">
                    <Select v-model:value="formData.hedgingCurrency" :options="currencyOptions" show-search option-filter-prop="label" :disabled="!formData.hedged" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Unit Precision" name="unitPrecision">
                    <Select v-model:value="formData.unitPrecision" :options="unitPrecisionOptions" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="NAV Precision" name="navPrecision">
                    <Select v-model:value="formData.navPrecision" :options="navPrecisionOptions" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Subscription Settlement(T+)" name="subscriptionSettlement">
                    <Input v-model:value="formData.subscriptionSettlement" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Redemption Settlement(T+)" name="redemptionSettlement">
                    <Input v-model:value="formData.redemptionSettlement" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Min Initial Subscription" name="minimumInitialSubscription">
                    <Input v-model:value="formData.minimumInitialSubscription" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Min Subsequent Subscription" name="minimumSubsequentSubscription">
                    <Input v-model:value="formData.minimumSubsequentSubscription" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Minimum Redemption" name="minimumRedemption">
                    <Input v-model:value="formData.minimumRedemption" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Minimum Holding">
                    <Input v-model:value="formData.minimumHolding" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Redemption Charge">
                    <Input v-model:value="formData.redemptionCharge" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Management Fee(%)" name="managementFee">
                    <Input v-model:value="formData.managementFee" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Performance Fee(%)" name="performanceFee">
                    <Input v-model:value="formData.performanceFee" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Financial Year End">
                    <Select v-model:value="formData.financialYearEnd" :options="financialYearEndOptions" />
                  </FormItem>
                </Col>
              </Row>
            </CollapsePanel>

            <!-- Dealing & Valuation -->
            <CollapsePanel id="section-dealing" key="dealing" header="Dealing & Valuation">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Dealing Frequency" name="dealingFrequency">
                    <Select v-model:value="formData.dealingFrequency" :options="dealingFrequencyOptions" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Valuation Frequency" name="valuationFrequency">
                    <Select v-model:value="formData.valuationFrequency" :options="dealingFrequencyOptions" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Dealing Cut-off (Time)" name="dealingCutOff">
                    <Input v-model:value="formData.dealingCutOff" placeholder="HH:MM" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Dealing Cut-off (TZ)" name="dealingCutOffTz">
                    <Select v-model:value="formData.dealingCutOffTz" :options="tzCountryOptions" show-search option-filter-prop="label" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Valuation Point (Time)" name="valuationPoint">
                    <Input v-model:value="formData.valuationPoint" placeholder="HH:MM" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Valuation Point (TZ)" name="valuationPointTz">
                    <Select v-model:value="formData.valuationPointTz" :options="tzCountryOptions" show-search option-filter-prop="label" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Business Day Definition" name="businessDayDefinition">
                    <Input v-model:value="formData.businessDayDefinition" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Business Calendar" name="businessCalendar">
                    <Select v-model:value="formData.businessCalendar" :options="businessCalendarOptions" mode="multiple" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Contract Note Del. Day(T+)">
                    <Input v-model:value="formData.contractNoteDeliveryDay" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Pricing Methodology" name="pricingMethodology">
                    <Select v-model:value="formData.pricingMethodology" :options="pricingMethodologyOptions" mode="multiple" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Valuation Delivery Time(T+)">
                    <Input v-model:value="formData.valuationDeliveryTime" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Security Lending">
                    <Select v-model:value="formData.securityLending" :options="yesNoOptions" allow-clear />
                  </FormItem>
                </Col>
              </Row>
            </CollapsePanel>
            </Collapse>
          </Form>
        </div>

        <div class="w-[160px] shrink-0 sticky top-0 self-start">
          <Anchor :items="anchorItems" :offset-top="16" :target-offset="60" :affix="false" :get-container="() => scrollContainerRef || window" @click="handleAnchorClick" />
        </div>
      </div>
    </Spin>

    <template #footer>
      <div class="flex justify-end gap-2">
        <a-button :disabled="!selectedClassRow" @click="handleCopyFromClassList">
          Copy from Class List
        </a-button>
        <a-button @click="drawerApi.close()">Cancel</a-button>
        <a-button type="primary" @click="handleConfirm">
          {{ isUpdate ? 'Update' : 'Save' }}
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
