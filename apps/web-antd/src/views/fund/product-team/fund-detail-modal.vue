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

import { fundProductGet, getClassListByFundCode } from '#/api/product-center';

const loading = ref(false);
const activeTab = ref('product');
const fundData = ref<Partial<FundProduct>>({});
const shareClassList = ref<ShareClass[]>([]);

const [BasicModal, modalApi] = useVbenModal({
  async onOpenChange(isOpen) {
    if (!isOpen) {
      fundData.value = {};
      shareClassList.value = [];
      return;
    }

    const data = modalApi.getData<{ id?: string }>();
    if (!data?.id) return;

    loading.value = true;
    try {
      const result = await fundProductGet(data.id);
      fundData.value = result;
      if (result.fundCode) {
        try {
          shareClassList.value = await getClassListByFundCode(result.fundCode);
        } catch {
          shareClassList.value = [];
        }
      }
    } catch {
      fundData.value = {};
    } finally {
      loading.value = false;
    }
  },
});

const coreFields = [
  { label: 'Fund Code', key: 'fundCode' },
  { label: 'Fund Name (EN)', key: 'fundNameEn' },
  { label: 'Fund Name (TC)', key: 'fundNameTc' },
  { label: 'Fund Name (SC)', key: 'fundNameSc' },
  { label: 'Fund Type', key: 'fundType' },
  { label: 'Umbrella/OFC Name', key: 'umbrellaOfcName' },
  { label: 'Domicile', key: 'domicileJurisdiction' },
  { label: 'Base Currency', key: 'baseCurrency' },
  { label: 'Fund Status', key: 'fundStatus' },
  { label: 'Launch Date', key: 'launchDate' },
  { label: 'LEI Number', key: 'leiNumber' },
  { label: 'GIIN Number', key: 'giinNumber' },
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
  { label: 'Investment Objective', key: 'investmentObjective' },
  { label: 'Benchmark', key: 'benchmark' },
  { label: 'Risk Rating', key: 'riskRating' },
];

const opTeamColumns = [
  { title: 'VPFS Class ID', dataIndex: 'vpfsClassId', key: 'vpfsClassId', width: 120 },
  { title: 'Share Class Name (EN)', dataIndex: 'shareClassNameEn', key: 'shareClassNameEn', width: 200 },
  { title: 'Currency', dataIndex: 'classCurrency', key: 'classCurrency', width: 80 },
  { title: 'Status', dataIndex: 'classStatus', key: 'classStatus', width: 90 },
  { title: 'Launch Date', dataIndex: 'launchDate', key: 'launchDate', width: 110 },
  { title: 'ISIN Code', dataIndex: 'isinCode', key: 'isinCode', width: 140 },
  { title: 'Dealing Freq.', dataIndex: 'dealingFrequency', key: 'dealingFrequency', width: 100 },
  { title: 'Mgmt Fee', dataIndex: 'managementFee', key: 'managementFee', width: 80 },
];
</script>

<template>
  <BasicModal
    :footer="true"
    :fullscreen-button="true"
    title="Fund Details"
    class="w-[70%]"
  >
    <Spin :spinning="loading">
      <Tabs v-model:activeKey="activeTab">
        <TabPane key="product" tab="Product Team">
          <Descriptions :column="2" bordered size="small">
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
            <DescriptionsItem label="Investment Strategy" :span="2">
              {{ fundData.investmentStrategy ?? '-' }}
            </DescriptionsItem>
            <DescriptionsItem label="Asset Allocation" :span="2">
              {{ fundData.assetAllocationTable ?? '-' }}
            </DescriptionsItem>
          </Descriptions>
        </TabPane>

        <TabPane key="operational" tab="Operational Team">
          <div v-if="shareClassList.length === 0" class="p-8 text-center text-gray-400">
            No share classes found for this fund.
          </div>
          <div v-else>
            <Descriptions :column="1" bordered size="small">
              <DescriptionsItem>
                <template #label><span class="font-semibold">Share Classes ({{ shareClassList.length }})</span></template>
              </DescriptionsItem>
            </Descriptions>
            <Table
              :columns="opTeamColumns"
              :data-source="shareClassList"
              :row-key="(record: ShareClass) => record.id ?? record.vpfsClassId"
              size="small"
              :pagination="false"
              bordered
              class="mt-2"
              :scroll="{ x: 1000 }"
            />
          </div>
        </TabPane>
      </Tabs>
    </Spin>
  </BasicModal>
</template>
