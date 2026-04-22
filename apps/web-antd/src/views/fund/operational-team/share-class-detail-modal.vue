<script setup lang="ts">
import type { ShareClass } from '#/api/product-center/model/fund-operational';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  Descriptions,
  DescriptionsItem,
  Divider,
  Spin,
  TabPane,
  Tabs,
} from 'antdv-next';

import { shareClassGet } from '#/api/product-center';

const loading = ref(false);
const activeTab = ref('operational');
const shareClassData = ref<Partial<ShareClass>>({});

const [BasicModal, modalApi] = useVbenModal({
  async onOpenChange(isOpen) {
    if (!isOpen) {
      shareClassData.value = {};
      return;
    }

    const data = modalApi.getData<{ id?: string }>();
    if (!data?.id) return;

    loading.value = true;
    try {
      const result = await shareClassGet(data.id);
      shareClassData.value = result;
    } catch {
      shareClassData.value = {};
    } finally {
      loading.value = false;
    }
  },
});

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
  { label: 'Share Class Name (EN)', key: 'shareClassNameEn' },
  { label: 'Share Class Name (TC)', key: 'shareClassNameTc' },
  { label: 'Share Class Name (SC)', key: 'shareClassNameSc' },
  { label: 'VPFS Class ID', key: 'vpfsClassId' },
  { label: 'Class Currency', key: 'classCurrency' },
  { label: 'Class Status', key: 'classStatus' },
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
</script>

<template>
  <BasicModal
    :footer="false"
    :fullscreen-button="true"
    title="Share Class Details"
    class="w-[70%]"
  >
    <Spin :spinning="loading">
      <Tabs v-model:activeKey="activeTab">
        <TabPane key="product" tab="Product Team">
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
        </TabPane>

        <TabPane key="operational" tab="Operational Team">
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
        </TabPane>
      </Tabs>
    </Spin>
  </BasicModal>
</template>
