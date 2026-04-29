<script setup lang="ts">
import type { ShareClass } from '#/api/product-center/model/fund-operational';
import type { FundProduct } from '#/api/product-center/model/fund-product';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  Descriptions,
  DescriptionsItem,
  Divider,
  Spin,
  Table,
  TabPane,
  Tabs,
} from 'antdv-next';

import { fundProductGet, getClassListByFundCode, shareClassGet } from '#/api/product-center';

const loading = ref(false);
const activeTab = ref<'operational' | 'product'>('product');
const fundData = ref<Partial<FundProduct>>({});
const shareClassData = ref<Partial<ShareClass>>({});
const shareClassList = ref<ShareClass[]>([]);

const [BasicModal, modalApi] = useVbenModal({
  async onOpenChange(isOpen) {
    if (!isOpen) {
      fundData.value = {};
      shareClassData.value = {};
      shareClassList.value = [];
      return;
    }

    const data = modalApi.getData<{ fundId?: string; shareClassId?: string; activeTab?: string }>();
    if (!data) return;

    activeTab.value = (data.activeTab as 'operational' | 'product') || 'product';

    loading.value = true;
    try {
      // Load from Product Team (fundId)
      if (data.fundId) {
        const result = await fundProductGet(data.fundId);
        fundData.value = result;
        if (result.fundCode) {
          try {
            shareClassList.value = await getClassListByFundCode(result.fundCode);
          } catch {
            shareClassList.value = [];
          }
        }
      }

      // Load from Operational Team (shareClassId)
      if (data.shareClassId) {
        const result = await shareClassGet(data.shareClassId);
        shareClassData.value = result;
      }
    } catch {
      fundData.value = {};
      shareClassData.value = {};
    } finally {
      loading.value = false;
    }
  },
});

// Product Team fields
const coreFields = [
  { label: 'Fund Code', key: 'fundCode' },
  { label: 'Fund Name (EN)', key: 'fundNameEn' },
  { label: 'Fund Name (TC)', key: 'fundNameTc' },
  { label: 'Fund Name (SC)', key: 'fundNameSc' },
  { label: 'Fund Type', key: 'fundType' },
  { label: 'Umbrella/OFC Name', key: 'umbrellaOfcName' },
  { label: 'Sub Fund Code', key: 'subFundCode' },
  { label: 'Domicile', key: 'domicileJurisdiction' },
  { label: 'Primary Regulator', key: 'primaryRegulator' },
  { label: 'Base Currency', key: 'baseCurrency' },
  { label: 'Fund Status', key: 'fundStatus' },
  { label: 'Launch Date', key: 'launchDate' },
  { label: 'LEI Number', key: 'leiNumber' },
  { label: 'GIIN Number', key: 'giinNumber' },
  { label: 'Complex Product', key: 'complexProduct' },
  { label: 'Professional Investors Only', key: 'professionalInvestorsOnly' },
];

const partyFields = [
  { label: 'Fund Manager', key: 'fundManager' },
  { label: 'Fund Manager LEI', key: 'fundManagerLei' },
  { label: 'Sub Manager', key: 'subManager' },
  { label: 'Investment Advisor', key: 'investmentAdvisor' },
  { label: 'Trustee/Administrator', key: 'trusteeAdministrator' },
  { label: 'Custodian/Prime Broker', key: 'custodianPrimeBroker' },
  { label: 'Sub Custodian', key: 'subCustodian' },
  { label: 'Auditor', key: 'auditor' },
];

const strategyFields = [
  { label: 'Instrument Type', key: 'primaryInstrumentType' },
  { label: 'Active/Passive', key: 'passiveOrActiveFund' },
  { label: 'Market Focus', key: 'investmentMarketFocus' },
  { label: 'Morningstar Category', key: 'morningstarCategory' },
  { label: 'Benchmark', key: 'benchmark' },
  { label: 'Benchmark Code', key: 'benchmarkCode' },
  { label: 'Risk Rating', key: 'riskLevel' },
  { label: 'Hedging Policy', key: 'hedgingPolicyFund' },
];

// Operational Team fields
const fundInfoFields = [
  { label: 'Fund Code', key: 'fundCode' },
  { label: 'Fund Name (EN)', key: 'fundNameEn' },
  { label: 'Fund Name (TC)', key: 'fundNameTc' },
  { label: 'Fund Name (SC)', key: 'fundNameSc' },
  { label: 'Fund Type', key: 'fundType' },
  { label: 'Fund Manager', key: 'fundManager' },
  { label: 'Fund Manager LEI', key: 'fundManagerLei' },
];

const classInfoFields = [
  { label: 'Share Class Name (EN)', key: 'shareClassNameEnOfficialName' },
  { label: 'Share Class Name (TC)', key: 'shareClassNameTc' },
  { label: 'Share Class Name (SC)', key: 'shareClassNameSc' },
  { label: 'VPFS Class ID', key: 'vpfsClassId' },
  { label: 'Class Currency', key: 'classCurrency' },
  { label: 'Class Status', key: 'fundClassStatus' },
  { label: 'End of IOP Date', key: 'endOfIopDate' },
  { label: 'Launch Date', key: 'launchDate' },
  { label: 'Stock Code', key: 'stockCode' },
  { label: 'ISIN Code', key: 'isinCode' },
  { label: 'Morningstar Fund ID', key: 'morningstarFundId' },
  { label: 'Morningstar Sec ID', key: 'morningstarSecId' },
  { label: 'Morningstar Perf ID', key: 'morningstarPerformanceId' },
  { label: 'CUSIP', key: 'cusip' },
  { label: 'Valor Code', key: 'valorCode' },
  { label: 'Lipper Code', key: 'lipperCode' },
  { label: 'Bloomberg Ticker', key: 'bloombergTicker' },
  { label: 'BBG ID Equity', key: 'bbgIdEquity' },
  { label: 'SEDOL', key: 'sedol' },
  { label: 'Distribution Policy', key: 'distributionPolicy' },
];

const dealingFields = [
  { label: 'Dealing Frequency', key: 'dealingFrequency' },
  { label: 'Unit Precision', key: 'unitPrecision' },
  { label: 'NAV Precision', key: 'navPrecision' },
  { label: 'Dealing Cut Off', key: 'dealingCutOff' },
  { label: 'Business Day Def.', key: 'businessDayDefinition' },
  { label: 'Business Calendar', key: 'businessCalendar' },
  { label: 'Subscription Settlement', key: 'subscriptionSettlement' },
  { label: 'Redemption Settlement', key: 'redemptionSettlement' },
  { label: 'Min Initial Subscription', key: 'minimumInitialSubscription' },
  { label: 'Min Subsequent Sub.', key: 'minimumSubsequentSubscription' },
  { label: 'Minimum Redemption', key: 'minimumRedemption' },
  { label: 'Minimum Holding', key: 'minimumHolding' },
  { label: 'Redemption Charge', key: 'redemptionCharge' },
  { label: 'Management Fee', key: 'managementFee' },
  { label: 'Performance Fee', key: 'performanceFee' },
  { label: 'TER', key: 'ter' },
  { label: 'Financial Year End', key: 'financialYearEnd' },
  { label: 'Contract Note Del. Day', key: 'contractNoteDeliveryDay' },
  { label: 'Pricing Methodology', key: 'pricingMethodology' },
  { label: 'Valuation Point', key: 'valuationPoint' },
  { label: 'Valuation Frequency', key: 'valuationFrequency' },
  { label: 'Valuation Delivery Time', key: 'valuationDeliveryTime' },
  { label: 'Security Lending', key: 'securityLending' },
  { label: 'Hedged', key: 'hedged' },
  { label: 'Hedging Currency', key: 'hedgingCurrency' },
];

const opTeamColumns = [
  { title: 'VPFS Class ID', dataIndex: 'vpfsClassId', key: 'vpfsClassId', width: 120 },
  { title: 'Share Class Name (EN)', dataIndex: 'shareClassNameEnOfficialName', key: 'shareClassNameEnOfficialName', width: 200 },
  { title: 'Currency', dataIndex: 'classCurrency', key: 'classCurrency', width: 80 },
  { title: 'Status', dataIndex: 'fundClassStatus', key: 'fundClassStatus', width: 90 },
  { title: 'Launch Date', dataIndex: 'launchDate', key: 'launchDate', width: 110 },
  { title: 'ISIN Code', dataIndex: 'isinCode', key: 'isinCode', width: 140 },
  { title: 'Dealing Freq.', dataIndex: 'dealingFrequency', key: 'dealingFrequency', width: 100 },
  { title: 'Mgmt Fee', dataIndex: 'managementFee', key: 'managementFee', width: 80 },
];
</script>

<template>
  <BasicModal
    :footer="false"
    :fullscreen-button="true"
    title="Fund Details"
    class="w-[70%]"
  >
    <Spin :spinning="loading">
      <Tabs v-model:activeKey="activeTab">
        <!-- Product Team Tab -->
        <TabPane key="product" tab="Product Team">
          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem>
              <template #label><span class="font-semibold">Core Fund Identity</span></template>
            </DescriptionsItem>
          </Descriptions>
          <Descriptions :column="2" bordered size="small" class="mt-2">
            <DescriptionsItem
              v-for="field in coreFields"
              :key="field.key"
              :label="field.label"
            >
              {{ fundData[field.key as keyof FundProduct] ?? '-' }}
            </DescriptionsItem>
          </Descriptions>

          <Divider />

          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem>
              <template #label><span class="font-semibold">Key Parties</span></template>
            </DescriptionsItem>
          </Descriptions>
          <Descriptions :column="2" bordered size="small" class="mt-2">
            <DescriptionsItem
              v-for="field in partyFields"
              :key="field.key"
              :label="field.label"
            >
              {{ fundData[field.key as keyof FundProduct] ?? '-' }}
            </DescriptionsItem>
          </Descriptions>

          <Divider />

          <Descriptions :column="1" bordered size="small">
            <DescriptionsItem>
              <template #label><span class="font-semibold">Investment Strategy</span></template>
            </DescriptionsItem>
          </Descriptions>
          <Descriptions :column="2" bordered size="small" class="mt-2">
            <DescriptionsItem
              v-for="field in strategyFields"
              :key="field.key"
              :label="field.label"
            >
              {{ fundData[field.key as keyof FundProduct] ?? '-' }}
            </DescriptionsItem>
            <DescriptionsItem label="Investment Objective" :span="2">
              {{ fundData.investmentObjective ?? '-' }}
            </DescriptionsItem>
            <DescriptionsItem label="Investment Strategy" :span="2">
              {{ fundData.investmentStrategy ?? '-' }}
            </DescriptionsItem>
            <DescriptionsItem label="Asset Allocation" :span="2">
              {{ fundData.assetAllocationTable ?? '-' }}
            </DescriptionsItem>
          </Descriptions>
        </TabPane>

        <!-- Operational Team Tab -->
        <TabPane key="operational" tab="Operational Team">
          <!-- If opened from Product Team, show share class list -->
          <template v-if="shareClassData.id == null && shareClassList.length >= 0">
            <Descriptions :column="1" bordered size="small">
              <DescriptionsItem>
                <template #label><span class="font-semibold">Fund Info</span></template>
              </DescriptionsItem>
            </Descriptions>
            <Descriptions :column="2" bordered size="small" class="mt-2">
              <DescriptionsItem
                v-for="field in fundInfoFields"
                :key="field.key"
                :label="field.label"
              >
                {{ fundData[field.key as keyof FundProduct] ?? '-' }}
              </DescriptionsItem>
            </Descriptions>

            <Divider />

            <Descriptions :column="1" bordered size="small">
              <DescriptionsItem>
                <template #label><span class="font-semibold">Share Classes ({{ shareClassList.length }})</span></template>
              </DescriptionsItem>
            </Descriptions>
            <div v-if="shareClassList.length === 0" class="p-8 text-center text-gray-400">
              No share classes found for this fund.
            </div>
            <Table
              v-else
              :columns="opTeamColumns"
              :data-source="shareClassList"
              :row-key="(record: ShareClass) => record.productClassId ?? record.vpfsClassId"
              size="small"
              :pagination="false"
              bordered
              class="mt-2"
              :scroll="{ x: 1000 }"
            />
          </template>

          <!-- If opened from Operational Team, show single share class detail -->
          <template v-else>
            <Descriptions :column="1" bordered size="small">
              <DescriptionsItem>
                <template #label><span class="font-semibold">Fund Info</span></template>
              </DescriptionsItem>
            </Descriptions>
            <Descriptions :column="2" bordered size="small" class="mt-2">
              <DescriptionsItem
                v-for="field in fundInfoFields"
                :key="field.key"
                :label="field.label"
              >
                {{ shareClassData[field.key as keyof ShareClass] ?? '-' }}
              </DescriptionsItem>
            </Descriptions>

            <Divider />

            <Descriptions :column="1" bordered size="small">
              <DescriptionsItem>
                <template #label><span class="font-semibold">Class Info</span></template>
              </DescriptionsItem>
            </Descriptions>
            <Descriptions :column="2" bordered size="small" class="mt-2">
              <DescriptionsItem
                v-for="field in classInfoFields"
                :key="field.key"
                :label="field.label"
              >
                {{ shareClassData[field.key as keyof ShareClass] ?? '-' }}
              </DescriptionsItem>
            </Descriptions>

            <Divider />

            <Descriptions :column="1" bordered size="small">
              <DescriptionsItem>
                <template #label><span class="font-semibold">Dealing & Valuation</span></template>
              </DescriptionsItem>
            </Descriptions>
            <Descriptions :column="2" bordered size="small" class="mt-2">
              <DescriptionsItem
                v-for="field in dealingFields"
                :key="field.key"
                :label="field.label"
              >
                {{ shareClassData[field.key as keyof ShareClass] ?? '-' }}
              </DescriptionsItem>
            </Descriptions>
          </template>
        </TabPane>
      </Tabs>
    </Spin>
  </BasicModal>
</template>
