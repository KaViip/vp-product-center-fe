<script setup lang="ts">
import type { ShareClass } from '#/api/product-center/model/fund-operational';

import { computed, nextTick, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import {
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  FormItem,
  Input,
  InputNumber,
  Row,
  Select,
  Spin,
  Table,
} from 'antdv-next';

import {
  getClassListByFundCode,
  shareClassAdd,
  shareClassGet,
  shareClassUpdate,
} from '#/api/product-center';
import {
  ClassStatusEnum,
  CurrencyEnum,
} from '#/api/product-center/model/fund-operational';
import { YesNoEnum } from '#/api/product-center/model/fund-product';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const isCopy = ref(false);
const loading = ref(false);
const formRef = ref();
const scrollContainerRef = ref<HTMLElement>();
const classListData = ref<ShareClass[]>([]);
const selectedClassRow = ref<ShareClass | null>(null);

const title = computed(() => {
  if (isCopy.value) return 'Copy Share Class';
  return isUpdate.value ? 'Edit Share Class' : 'Add Share Class';
});

const formData = ref<Record<string, any>>({});

const enumToOptions = (enumObj: Record<string, string | number>) =>
  Object.entries(enumObj).map(([_, value]) => ({ label: String(value), value }));

const classStatusOptions = enumToOptions(ClassStatusEnum);
const currencyOptions = enumToOptions(CurrencyEnum);
const yesNoOptions = enumToOptions(YesNoEnum);

const rules = {
  fundCode: [{ required: true, message: 'Fund Code is required' }],
  shareClassNameEn: [{ required: true, message: 'Share Class Name (EN) is required' }],
  classCurrency: [{ required: true, message: 'Class Currency is required' }],
  vpfsClassId: [{ required: true, message: 'VPFS Class ID is required' }],
};

const labelCol = { span: 8 };
const wrapperCol = { span: 16 };

const classListColumns = [
  { title: 'VPFS Class ID', dataIndex: 'vpfsClassId', key: 'vpfsClassId', width: 140 },
  { title: 'Share Class Name (EN)', dataIndex: 'shareClassNameEn', key: 'shareClassNameEn', width: 250 },
  { title: 'Class Currency', dataIndex: 'classCurrency', key: 'classCurrency', width: 120 },
  { title: 'Class Status', dataIndex: 'classStatus', key: 'classStatus', width: 120 },
  { title: 'Launch Date', dataIndex: 'launchDate', key: 'launchDate', width: 120 },
];

const classListRowSelection = computed(() => ({
  type: 'radio' as const,
  selectedRowKeys: selectedClassRow.value ? [selectedClassRow.value.id] : [],
  onChange: (_selectedRowKeys: string[], selectedRows: ShareClass[]) => {
    selectedClassRow.value = selectedRows[0] || null;
  },
}));

watch(
  () => formData.value.fundCode,
  async (newFundCode) => {
    if (newFundCode && newFundCode.length >= 1) {
      try {
        classListData.value = await getClassListByFundCode(newFundCode);
      } catch {
        classListData.value = [];
      }
    } else {
      classListData.value = [];
    }
    selectedClassRow.value = null;
  },
);

function handleCopyFromClassList() {
  if (!selectedClassRow.value) return;
  const source = cloneDeep(selectedClassRow.value);
  const copyFields: (keyof ShareClass)[] = [
    'shareClassNameEn', 'shareClassNameTc', 'shareClassNameSc',
    'classCurrency', 'classStatus', 'vpfsClassId',
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
      return;
    }

    drawerApi.drawerLoading(true);
    const data = drawerApi.getData<Record<string, any>>();
    isUpdate.value = !!data?.id && !data?.isCopy;
    isCopy.value = !!data?.isCopy;

    if (data?.id) {
      try {
        const shareClassData = await shareClassGet(data.id);
        if (isCopy.value) {
          shareClassData.id = undefined;
          shareClassData.vpfsClassId = '';
          shareClassData.shareClassNameEn = '';
        }
        formData.value = cloneDeep(shareClassData);
      } catch {
        formData.value = {};
      }
    } else {
      formData.value = {};
    }

    await nextTick();
    drawerApi.drawerLoading(false);
  },
});

async function handleConfirm() {
  try {
    drawerApi.lock(true);
    const valid = await formRef.value?.validate();
    if (valid?.errorFields) {
      return;
    }
    const submitData = cloneDeep(formData.value);
    if (isUpdate.value) {
      await shareClassUpdate(submitData);
    } else {
      await shareClassAdd(submitData);
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

function getContainer() {
  return scrollContainerRef.value || window;
}
</script>

<template>
  <Drawer :title="title" :class="'w-[85%]'" :footer="true">
    <Spin :spinning="loading" class="h-full">
      <div class="flex h-full gap-4">
        <div ref="scrollContainerRef" class="flex-1 overflow-y-auto pr-2" style="max-height: calc(100vh - 200px)">
          <Form
            ref="formRef"
            :model="formData"
            :rules="rules"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            layout="horizontal"
          >
            <!-- Section 1: Fund Info -->
            <Card id="section-fund-info" title="Fund Info" class="mb-4" size="small">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Code" name="fundCode">
                    <Input v-model:value="formData.fundCode" :disabled="isUpdate" placeholder="e.g. VPAF" />
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
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Type">
                    <Input v-model:value="formData.fundType" disabled />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Fund Manager">
                    <Input v-model:value="formData.fundManager" disabled />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Manager LEI">
                    <Input v-model:value="formData.fundManagerLei" disabled />
                  </FormItem>
                </Col>
              </Row>
            </Card>

            <Divider />

            <!-- Section 2: Class List -->
            <Card id="section-class-list" title="Class List" class="mb-4" size="small">
              <div class="mb-2 text-gray-500 text-xs">
                Enter a Fund Code above to load existing share classes. Select a row and click "Copy" to fill the form below.
              </div>
              <Table
                :columns="classListColumns"
                :data-source="classListData"
                :row-selection="classListRowSelection"
                :row-key="(record: ShareClass) => record.id"
                size="small"
                :pagination="false"
                :scroll="{ y: 200 }"
              />
            </Card>

            <Divider />

            <!-- Section 3: Class Info -->
            <Card id="section-class-info" title="Class Info" class="mb-4" size="small">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Share Class Name (EN)" name="shareClassNameEn">
                    <Input v-model:value="formData.shareClassNameEn" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Share Class Name (TC)">
                    <Input v-model:value="formData.shareClassNameTc" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Share Class Name (SC)">
                    <Input v-model:value="formData.shareClassNameSc" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Class Currency" name="classCurrency">
                    <Select v-model:value="formData.classCurrency" :options="currencyOptions" show-search allow-clear option-filter-prop="label" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="VPFS Class ID" name="vpfsClassId">
                    <Input v-model:value="formData.vpfsClassId" :disabled="isUpdate" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Class Status">
                    <Select v-model:value="formData.classStatus" :options="classStatusOptions" allow-clear />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="End of IOP Date">
                    <DatePicker v-model:value="formData.endOfIopDate" class="w-full" value-format="YYYY-MM-DD" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Launch Date">
                    <DatePicker v-model:value="formData.launchDate" class="w-full" value-format="YYYY-MM-DD" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Stock Code">
                    <Input v-model:value="formData.stockCode" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="ISIN Code">
                    <Input v-model:value="formData.isinCode" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Morningstar Fund ID">
                    <Input v-model:value="formData.morningstarFundId" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Morningstar Sec ID">
                    <Input v-model:value="formData.morningstarSecId" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Morningstar Perf ID">
                    <Input v-model:value="formData.morningstarPerformanceId" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="CUSIP">
                    <Input v-model:value="formData.cusip" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Valor Code">
                    <Input v-model:value="formData.valorCode" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Lipper Code">
                    <Input v-model:value="formData.lipperCode" />
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
                  <FormItem label="SEDOL">
                    <Input v-model:value="formData.sedol" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Distribution Policy">
                    <Input v-model:value="formData.distributionPolicy" />
                  </FormItem>
                </Col>
              </Row>
            </Card>

            <Divider />

            <!-- Section 4: Dealing & Valuation -->
            <Card id="section-dealing" title="Dealing & Valuation" class="mb-4" size="small">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Dealing Frequency">
                    <Input v-model:value="formData.dealingFrequency" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Unit Precision">
                    <Input v-model:value="formData.unitPrecision" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="NAV Precision">
                    <Input v-model:value="formData.navPrecision" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Dealing Cut Off">
                    <Input v-model:value="formData.dealingCutOff" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Business Day Def.">
                    <Input v-model:value="formData.businessDayDefinition" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Business Calendar">
                    <Input v-model:value="formData.businessCalendar" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Subscription Settlement">
                    <Input v-model:value="formData.subscriptionSettlement" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Redemption Settlement">
                    <Input v-model:value="formData.redemptionSettlement" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Min Initial Subscription">
                    <Input v-model:value="formData.minimumInitialSubscription" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Min Subsequent Sub.">
                    <Input v-model:value="formData.minimumSubsequentSubscription" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Minimum Redemption">
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
                  <FormItem label="Management Fee">
                    <InputNumber v-model:value="formData.managementFee" :min="0" :max="1" :step="0.0001" class="w-full" :precision="5" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Performance Fee">
                    <InputNumber v-model:value="formData.performanceFee" :min="0" :max="1" :step="0.0001" class="w-full" :precision="5" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="TER">
                    <Input v-model:value="formData.ter" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Financial Year End">
                    <Input v-model:value="formData.financialYearEnd" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Contract Note Del. Day">
                    <Input v-model:value="formData.contractNoteDeliveryDay" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Pricing Methodology">
                    <Input v-model:value="formData.pricingMethodology" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Valuation Point">
                    <Input v-model:value="formData.valuationPoint" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Valuation Frequency">
                    <Input v-model:value="formData.valuationFrequency" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Valuation Delivery Time">
                    <Input v-model:value="formData.valuationDeliveryTime" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Security Lending">
                    <Select v-model:value="formData.securityLending" :options="yesNoOptions" allow-clear />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Hedged">
                    <Select v-model:value="formData.hedged" :options="yesNoOptions" allow-clear />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Hedging Currency">
                    <Input v-model:value="formData.hedgingCurrency" />
                  </FormItem>
                </Col>
              </Row>
            </Card>
          </Form>
        </div>

        <div class="w-[140px] shrink-0">
          <a-anchor :get-container="getContainer" :offset-top="16" :target-offset="60">
            <a-anchor-link v-for="item in anchorItems" :key="item.href" :href="item.href" :title="item.title" />
          </a-anchor>
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
