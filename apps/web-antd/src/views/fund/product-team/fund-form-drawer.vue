<script setup lang="ts">
import type { FundProduct } from '#/api/product-center/model/fund-product';

import { computed, nextTick, onMounted, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import {
  Anchor,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  FormItem,
  Input,
  Row,
  Select,
  Spin,
} from 'antdv-next';

import {
  fundProductAdd,
  fundProductAutocomplete,
  fundProductGet,
  fundProductUpdate,
} from '#/api/product-center';
import {
  ActivePassiveEnum,
  FundStatusEnum,
  FundTypeEnum,
  HedgingPolicyEnum,
  InstrumentTypeEnum,
  MarketFocusEnum,
  RiskRatingEnum,
  YesNoEnum,
} from '#/api/product-center/model/fund-product';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const isCopy = ref(false);
const loading = ref(false);
const formRef = ref();

const title = computed(() => {
  if (isCopy.value) return 'Copy Fund';
  return isUpdate.value ? 'Edit Fund' : 'Add Fund';
});

const formData = ref<Record<string, any>>({});

const enumToOptions = (enumObj: Record<string, string | number>) =>
  Object.entries(enumObj).map(([_, value]) => ({ label: String(value), value }));

const fundTypeOptions = enumToOptions(FundTypeEnum);
const fundStatusOptions = enumToOptions(FundStatusEnum);
const instrumentTypeOptions = enumToOptions(InstrumentTypeEnum);
const yesNoOptions = enumToOptions(YesNoEnum);
const activePassiveOptions = enumToOptions(ActivePassiveEnum);
const marketFocusOptions = enumToOptions(MarketFocusEnum);
const hedgingPolicyOptions = enumToOptions(HedgingPolicyEnum);
const riskRatingOptions = enumToOptions(RiskRatingEnum);

const REGISTRATION_COUNTRIES = [
  { key: 'registrationUs', label: 'United States' },
  { key: 'registrationSingapore', label: 'Singapore' },
  { key: 'registrationMacau', label: 'Macau' },
  { key: 'registrationTaiwan', label: 'Taiwan' },
  { key: 'registrationSwitzerland', label: 'Switzerland' },
  { key: 'registrationUk', label: 'United Kingdom' },
  { key: 'registrationGermany', label: 'Germany' },
  { key: 'registrationItaly', label: 'Italy' },
  { key: 'registrationSpain', label: 'Spain' },
  { key: 'registrationFrance', label: 'France' },
  { key: 'registrationIreland', label: 'Ireland' },
  { key: 'registrationSweden', label: 'Sweden' },
  { key: 'registrationFinland', label: 'Finland' },
  { key: 'registrationDenmark', label: 'Denmark' },
  { key: 'registrationNorway', label: 'Norway' },
  { key: 'registrationNetherlands', label: 'Netherlands' },
  { key: 'registrationLuxembourg', label: 'Luxembourg' },
  { key: 'registrationCaymanIslands', label: 'Cayman Islands' },
  { key: 'registrationPrc', label: 'PRC' },
  { key: 'registrationHongKong', label: 'Hong Kong' },
  { key: 'registrationJapan', label: 'Japan' },
  { key: 'registrationMalaysia', label: 'Malaysia' },
];

const autocompleteCache = ref<Record<string, string[]>>({});

async function handleAutocomplete(field: string, keyword: string) {
  if (!keyword || keyword.length < 1) return [];
  const cacheKey = `${field}:${keyword}`;
  if (autocompleteCache.value[cacheKey]) {
    return autocompleteCache.value[cacheKey];
  }
  const results = await fundProductAutocomplete(field, keyword);
  autocompleteCache.value[cacheKey] = results;
  return results;
}

const AUTOCOMPLETE_FIELDS = [
  'fundManager',
  'investmentAdvisor',
  'trusteeAdministrator',
  'custodianPrimeBroker',
  'auditor',
  'benchmark',
];

const rules = {
  fundCode: [{ required: true, message: 'Fund Code is required' }],
  fundNameEn: [{ required: true, message: 'Fund Name (EN) is required' }],
  fundNameTc: [{ required: true, message: 'Fund Name (TC) is required' }],
  fundNameSc: [{ required: true, message: 'Fund Name (SC) is required' }],
  fundType: [{ required: true, message: 'Fund Type is required' }],
  launchDate: [{ required: true, message: 'Launch Date is required' }],
  fundManager: [{ required: true, message: 'Fund Manager is required' }],
  fundManagerLei: [{ required: true, message: 'Fund Manager LEI is required' }],
  primaryInstrumentType: [{ required: true, message: 'Instrument Type is required' }],
  investmentMarketFocus: [{ required: true, message: 'Market Focus is required' }],
  investmentObjective: [{ required: true, message: 'Investment Objective is required' }],
  investmentStrategy: [{ required: true, message: 'Investment Strategy is required' }],
  assetAllocationTable: [{ required: true, message: 'Asset Allocation is required' }],
};

const labelCol = { span: 8 };
const wrapperCol = { span: 16 };

function getAutocompleteProps(field: string) {
  return {
    filterOption: false,
    showSearch: true,
    allowClear: true,
    placeholder: 'Type to search...',
    options: [],
    onSearch: async (value: string) => {
      const results = await handleAutocomplete(field, value);
      return results.map((r) => ({ label: r, value: r }));
    },
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
    isUpdate.value = !!data?.id && !data?.isCopy;
    isCopy.value = !!data?.isCopy;

    if (data?.id) {
      try {
        const fundData = await fundProductGet(data.id);
        if (isCopy.value) {
          fundData.id = undefined;
          fundData.fundCode = '';
          fundData.fundNameEn = '';
        }
        formData.value = cloneDeep(fundData);
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
      await fundProductUpdate(submitData);
    } else {
      await fundProductAdd(submitData);
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
  { href: '#section-core', title: 'Core Fund Identity' },
  { href: '#section-parties', title: 'Key Parties' },
  { href: '#section-strategy', title: 'Investment Strategy' },
  { href: '#section-registration', title: 'Foreign Registration' },
];

function handleAnchorClick(e: Event, link: { href: string; title: string }) {
  e.preventDefault();
  const href = link.href;
  if (!href?.startsWith('#')) return;
  const targetId = href.substring(1);
  const target = document.getElementById(targetId);
  if (!target) return;
  // Find the scrollable container inside the *visible* dialog. When multiple drawers
  // are open simultaneously, only the last [role="dialog"] with non-zero scrollHeight
  // is the active one.
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
        <div class="flex-1 overflow-y-auto pr-2">
          <Form
            ref="formRef"
            :model="formData"
            :rules="rules"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            layout="horizontal"
          >
            <Card id="section-core" title="Core Fund Identity" class="mb-4" size="small">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Code" name="fundCode">
                    <Input v-model:value="formData.fundCode" :disabled="isUpdate" placeholder="e.g. VPAF" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Fund ID" name="fundId">
                    <Input v-model:value="formData.fundId" disabled />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Name (EN)" name="fundNameEn">
                    <Input v-model:value="formData.fundNameEn" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Fund Name (TC)" name="fundNameTc">
                    <Input v-model:value="formData.fundNameTc" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Name (SC)" name="fundNameSc">
                    <Input v-model:value="formData.fundNameSc" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Fund Type" name="fundType">
                    <Select v-model:value="formData.fundType" :options="fundTypeOptions" show-search allow-clear option-filter-prop="label" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Umbrella/OFC Name">
                    <Input v-model:value="formData.umbrellaOfcName" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Sub Fund Code">
                    <Input v-model:value="formData.subFundCode" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Domicile">
                    <Input v-model:value="formData.domicileJurisdiction" placeholder="e.g. HK" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Primary Regulator">
                    <Input v-model:value="formData.primaryRegulator" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Base Currency">
                    <Input v-model:value="formData.baseCurrency" placeholder="e.g. HKD, USD" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Fund Status" name="fundStatus">
                    <Select v-model:value="formData.fundStatus" :options="fundStatusOptions" allow-clear />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Application Date">
                    <DatePicker v-model:value="formData.applicationSubmissionDate" class="w-full" value-format="YYYY-MM-DD" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Authorization Date">
                    <DatePicker v-model:value="formData.authorizationDate" class="w-full" value-format="YYYY-MM-DD" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Launch Date" name="launchDate">
                    <DatePicker v-model:value="formData.launchDate" class="w-full" value-format="YYYY-MM-DD" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Complex Product">
                    <Select v-model:value="formData.complexProduct" :options="yesNoOptions" allow-clear />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="IOP Start Date">
                    <DatePicker v-model:value="formData.iopStartDate" class="w-full" value-format="YYYY-MM-DD" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Operation Start Date">
                    <DatePicker v-model:value="formData.operationStartDate" class="w-full" value-format="YYYY-MM-DD" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Listing Date">
                    <DatePicker v-model:value="formData.listingDate" class="w-full" value-format="YYYY-MM-DD" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Termination Date">
                    <DatePicker v-model:value="formData.terminationDate" class="w-full" value-format="YYYY-MM-DD" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="GIIN Number">
                    <Input v-model:value="formData.giinNumber" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="LEI Number">
                    <Input v-model:value="formData.leiNumber" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Professional Investors Only">
                    <Select v-model:value="formData.professionalInvestorsOnly" :options="yesNoOptions" allow-clear />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="24">
                  <FormItem label="Investor Nationality Restriction" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                    <Input v-model:value="formData.restrictionInvestorNationality" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="24">
                  <FormItem label="Investor Residency Restriction" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                    <Input v-model:value="formData.restrictionInvestorResidency" />
                  </FormItem>
                </Col>
              </Row>
            </Card>

            <Divider />

            <Card id="section-parties" title="Key Parties" class="mb-4" size="small">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Fund Manager" name="fundManager">
                    <Select
                      v-model:value="formData.fundManager"
                      show-search
                      allow-clear
                      :filter-option="false"
                      placeholder="Type to search..."
                      :options="[]"
                    />
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
                    <Input v-model:value="formData.investmentAdvisor" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Trustee/Administrator">
                    <Input v-model:value="formData.trusteeAdministrator" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Custodian/Prime Broker">
                    <Input v-model:value="formData.custodianPrimeBroker" />
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
                    <Input v-model:value="formData.auditor" />
                  </FormItem>
                </Col>
              </Row>
            </Card>

            <Divider />

            <Card id="section-strategy" title="Investment Strategy" class="mb-4" size="small">
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Instrument Type" name="primaryInstrumentType">
                    <Select v-model:value="formData.primaryInstrumentType" :options="instrumentTypeOptions" show-search allow-clear option-filter-prop="label" />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Active/Passive">
                    <Select v-model:value="formData.passiveOrActiveFund" :options="activePassiveOptions" allow-clear />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Market Focus" name="investmentMarketFocus">
                    <Select v-model:value="formData.investmentMarketFocus" :options="marketFocusOptions" allow-clear />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Morningstar Category">
                    <Input v-model:value="formData.morningstarCategory" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="24">
                  <FormItem label="Investment Objective" name="investmentObjective" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                    <Input v-model:value="formData.investmentObjective" type="textarea" :rows="3" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="24">
                  <FormItem label="Investment Strategy" name="investmentStrategy" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                    <Input v-model:value="formData.investmentStrategy" type="textarea" :rows="3" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="24">
                  <FormItem label="Asset Allocation" name="assetAllocationTable" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }">
                    <Input v-model:value="formData.assetAllocationTable" type="textarea" :rows="3" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="12">
                  <FormItem label="Hedging Policy">
                    <Select v-model:value="formData.hedgingPolicyFund" :options="hedgingPolicyOptions" allow-clear />
                  </FormItem>
                </Col>
                <Col :span="12">
                  <FormItem label="Benchmark">
                    <Input v-model:value="formData.benchmark" />
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
                  <FormItem label="Risk Rating">
                    <Select v-model:value="formData.riskRating" :options="riskRatingOptions" allow-clear />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="8">
                  <FormItem label="Max Leverage" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
                    <Input v-model:value="formData.leverageRatioMax" />
                  </FormItem>
                </Col>
                <Col :span="8">
                  <FormItem label="Max Derivatives" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
                    <Input v-model:value="formData.derivativesRatioMax" />
                  </FormItem>
                </Col>
                <Col :span="8">
                  <FormItem label="Borrowing Limit" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
                    <Input v-model:value="formData.borrowingLimit" />
                  </FormItem>
                </Col>
              </Row>
              <Row :gutter="16">
                <Col :span="8">
                  <FormItem label="Stop Loss Limit" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
                    <Input v-model:value="formData.stopLossLimit" />
                  </FormItem>
                </Col>
                <Col :span="8">
                  <FormItem label="Stop Loss Alert" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }">
                    <Input v-model:value="formData.stopLossAlert" />
                  </FormItem>
                </Col>
              </Row>
            </Card>

            <Divider />

            <Card id="section-registration" title="Foreign Registration Status" class="mb-4" size="small">
              <Row :gutter="[16, 8]">
                <Col v-for="country in REGISTRATION_COUNTRIES" :key="country.key" :span="8">
                  <FormItem :label="country.label" :label-col="{ span: 16 }" :wrapper-col="{ span: 8 }">
                    <DatePicker v-model:value="formData[country.key]" class="w-full" value-format="YYYY-MM-DD" size="small" />
                  </FormItem>
                </Col>
              </Row>
            </Card>
          </Form>
        </div>

        <div class="w-[160px] shrink-0 sticky top-0">
          <Anchor :items="anchorItems" :offset-top="16" :target-offset="60" :affix="false" @click="handleAnchorClick" />
        </div>
      </div>
    </Spin>

    <template #footer>
      <div class="flex justify-end gap-2">
        <a-button @click="drawerApi.close()">Cancel</a-button>
        <a-button type="primary" @click="handleConfirm">
          {{ isUpdate ? 'Update' : 'Save' }}
        </a-button>
      </div>
    </template>
  </Drawer>
</template>
