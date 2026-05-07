<script setup lang="ts">
import type { ProductCenterData } from '#/api/productcenter/productCenterData/model';
import type { ProductCenterMasterdata } from '#/api/productcenter/productCenterMasterdata/model';

import { computed, nextTick, ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Anchor,
  Collapse,
  CollapsePanel,
  Descriptions,
  DescriptionsItem,
  Divider,
  Spin,
  Table,
  TabPane,
  Tabs,
  Tag,
} from 'antdv-next';

import { productCenterDataInfo, productCenterDataList } from '#/api/productcenter/productCenterData';
import { productCenterMasterdataInfo } from '#/api/productcenter/productCenterMasterdata';

type DetailMode = 'fund' | 'shareClass';

const loading = ref(false);
const activeTab = ref<'operational' | 'product'>('product');
const mode = ref<DetailMode>('fund');
const fundData = ref<Partial<ProductCenterMasterdata>>({});
const shareClassData = ref<Partial<ProductCenterData>>({});
const shareClassList = ref<ProductCenterData[]>([]);
const scrollContainerRef = ref<HTMLElement | null>(null);
const activeCollapseKeys = ref<string[]>(['core', 'parties', 'strategy', 'registration', 'fund-info', 'class-info', 'dealing']);

// ─── Field Definitions (data-driven) ───

interface FieldDef {
  label: string;
  key: string;
  span?: number;
  type?: 'date' | 'yesno' | 'array' | 'region';
}

// Product Team tab fields
const coreFields: FieldDef[] = [
  { label: $t('pages.productCenter.form.fundCode'), key: 'fundCode' },
  { label: $t('pages.productCenter.form.fundNameEn'), key: 'fundNameEn' },
  { label: $t('pages.productCenter.form.fundNameTc'), key: 'fundNameTc' },
  { label: $t('pages.productCenter.form.fundNameSc'), key: 'fundNameSc' },
  { label: $t('pages.productCenter.form.fundType'), key: 'fundType' },
  { label: $t('pages.productCenter.form.umbrellaOfcName'), key: 'umbrellaOfcName' },
  { label: $t('pages.productCenter.form.subFundCode'), key: 'subFundCode' },
  { label: $t('pages.productCenter.form.domicileJurisdiction'), key: 'domicileJurisdiction' },
  { label: $t('pages.productCenter.form.primaryRegulator'), key: 'primaryRegulator' },
  { label: $t('pages.productCenter.form.baseCurrency'), key: 'baseCurrency' },
  { label: $t('pages.productCenter.form.fundStatus'), key: 'fundStatus' },
  { label: $t('pages.productCenter.form.launchDate'), key: 'launchDate', type: 'date' },
  { label: $t('pages.productCenter.form.leiNumber'), key: 'leiNumber' },
  { label: $t('pages.productCenter.form.giinNumber'), key: 'giinNumber' },
  { label: $t('pages.productCenter.form.complexProduct'), key: 'complexProduct', type: 'yesno' },
  { label: $t('pages.productCenter.form.professionalInvestorsOnly'), key: 'professionalInvestorsOnly', type: 'yesno' },
  { label: $t('pages.productCenter.form.applicationSubmissionDate'), key: 'applicationSubmissionDate', type: 'date' },
  { label: $t('pages.productCenter.form.authorizationDate'), key: 'authorizationDate', type: 'date' },
  { label: $t('pages.productCenter.form.iopStartDate'), key: 'iopStartDate', type: 'date' },
  { label: $t('pages.productCenter.form.operationStartDate'), key: 'operationStartDate', type: 'date' },
  { label: $t('pages.productCenter.form.listingDate'), key: 'listingDate', type: 'date' },
  { label: $t('pages.productCenter.form.terminationDate'), key: 'terminationDate', type: 'date' },
  { label: "Restriction on Investor's Nationality", key: 'restrictionInvestorNationality' },
  { label: "Restriction on Investor's Residency", key: 'restrictionInvestorResidency' },
];

const partyFields: FieldDef[] = [
  { label: $t('pages.productCenter.form.fundManager'), key: 'fundManager' },
  { label: $t('pages.productCenter.form.fundManagerLei'), key: 'fundManagerLei' },
  { label: $t('pages.productCenter.form.subManager'), key: 'subManager' },
  { label: $t('pages.productCenter.form.investmentAdvisor'), key: 'investmentAdvisor' },
  { label: $t('pages.productCenter.form.trusteeAdministrator'), key: 'trusteeAdministrator' },
  { label: $t('pages.productCenter.form.custodianPrimeBroker'), key: 'custodianPrimeBroker' },
  { label: $t('pages.productCenter.form.subCustodian'), key: 'subCustodian' },
  { label: $t('pages.productCenter.form.auditor'), key: 'auditor' },
];

const strategyFields: FieldDef[] = [
  { label: $t('pages.productCenter.form.primaryInstrumentType'), key: 'primaryInstrumentType' },
  { label: $t('pages.productCenter.form.passiveOrActiveFund'), key: 'passiveOrActiveFund' },
  { label: $t('pages.productCenter.form.investmentMarketFocus'), key: 'investmentMarketFocus' },
  { label: $t('pages.productCenter.form.morningstarCategory'), key: 'morningstarCategory' },
  { label: $t('pages.productCenter.form.benchmark'), key: 'benchmark' },
  { label: $t('pages.productCenter.form.benchmarkCode'), key: 'benchmarkCode' },
  { label: $t('pages.productCenter.form.riskLevel'), key: 'riskLevel' },
  { label: $t('pages.productCenter.form.hedgingPolicyFund'), key: 'hedgingPolicyFund' },
  { label: $t('pages.productCenter.form.leverageRatioMax'), key: 'leverageRatioMax' },
  { label: $t('pages.productCenter.form.derivativesRatioMax'), key: 'derivativesRatioMax' },
  { label: $t('pages.productCenter.form.borrowingLimit'), key: 'borrowingLimit' },
  { label: $t('pages.productCenter.form.stopLossLimit'), key: 'stopLossLimit' },
  { label: $t('pages.productCenter.form.stopLossAlert'), key: 'stopLossAlert' },
];

const strategyFullWidthFields: FieldDef[] = [
  { label: $t('pages.productCenter.form.investmentObjective'), key: 'investmentObjective', span: 2 },
  { label: $t('pages.productCenter.form.investmentStrategy'), key: 'investmentStrategy', span: 2 },
  { label: $t('pages.productCenter.form.assetAllocationTable'), key: 'assetAllocationTable', span: 2 },
];

// Operational Team tab — Fund Info (shown in both modes)
const fundInfoFields: FieldDef[] = [
  { label: $t('pages.productCenter.form.fundCode'), key: 'fundCode' },
  { label: $t('pages.productCenter.form.fundNameEn'), key: 'fundNameEn' },
  { label: $t('pages.productCenter.form.fundNameTc'), key: 'fundNameTc' },
  { label: $t('pages.productCenter.form.fundNameSc'), key: 'fundNameSc' },
  { label: $t('pages.productCenter.form.fundType'), key: 'fundType' },
  { label: $t('pages.productCenter.form.fundManager'), key: 'fundManager' },
  { label: $t('pages.productCenter.form.fundManagerLei'), key: 'fundManagerLei' },
];

// Operational Team tab — Class Info (shareClass mode)
const classInfoFields: FieldDef[] = [
  { label: $t('pages.productCenter.form.shareClassNameEn'), key: 'shareClassNameEnOfficialName' },
  { label: $t('pages.productCenter.form.shareClassNameTc'), key: 'shareClassNameTcOfficialName' },
  { label: $t('pages.productCenter.form.shareClassNameSc'), key: 'shareClassNameScOfficialName' },
  { label: $t('pages.productCenter.form.vpfsClassId'), key: 'vpfsClassId' },
  { label: $t('pages.productCenter.form.classCurrency'), key: 'classCurrency' },
  { label: $t('pages.productCenter.form.fundClassStatus'), key: 'fundClassStatus' },
  { label: $t('pages.productCenter.form.endOfIopDate'), key: 'endOfIopDate', type: 'date' },
  { label: $t('pages.productCenter.form.launchDate'), key: 'launchDate', type: 'date' },
  { label: $t('pages.productCenter.form.stockCode'), key: 'stockCode' },
  { label: $t('pages.productCenter.form.isinCode'), key: 'isinCode' },
  { label: $t('pages.productCenter.form.cusip'), key: 'cusip' },
  { label: $t('pages.productCenter.form.bloombergTicker'), key: 'bloombergTicker' },
  { label: $t('pages.productCenter.form.bbgIdEquity'), key: 'bbgIdEquity' },
  { label: $t('pages.productCenter.form.sedol'), key: 'sedol' },
  { label: $t('pages.productCenter.form.valorCode'), key: 'valorCode' },
  { label: $t('pages.productCenter.form.lipperCode'), key: 'lipperCode' },
  { label: $t('pages.productCenter.form.morningstarFundId'), key: 'morningstarFundId' },
  { label: $t('pages.productCenter.form.morningstarSecId'), key: 'morningstarSecId' },
  { label: $t('pages.productCenter.form.morningstarPerfId'), key: 'morningstarPerformanceId' },
  { label: $t('pages.productCenter.form.distributionPolicy'), key: 'distributionPolicy' },
  { label: $t('pages.productCenter.form.hedged'), key: 'hedged', type: 'yesno' },
  { label: $t('pages.productCenter.form.hedgingCurrency'), key: 'hedgingCurrency' },
  { label: $t('pages.productCenter.form.unitPrecision'), key: 'unitPrecision' },
  { label: $t('pages.productCenter.form.navPrecision'), key: 'navPrecision' },
  { label: $t('pages.productCenter.form.minimumInitialSubscription'), key: 'minimumInitialSubscription' },
  { label: $t('pages.productCenter.form.minimumSubsequentSubscription'), key: 'minimumSubsequentSubscription' },
  { label: $t('pages.productCenter.form.minimumRedemption'), key: 'minimumRedemption' },
  { label: $t('pages.productCenter.form.minimumHolding'), key: 'minimumHolding' },
  { label: $t('pages.productCenter.form.redemptionCharge'), key: 'redemptionCharge' },
  { label: $t('pages.productCenter.form.managementFee'), key: 'managementFee' },
  { label: $t('pages.productCenter.form.performanceFee'), key: 'performanceFee' },
  { label: $t('pages.productCenter.form.financialYearEnd'), key: 'financialYearEnd' },
  { label: $t('pages.productCenter.form.cutoffTime'), key: 'cutoffTime' },
];

const dealingFields: FieldDef[] = [
  { label: $t('pages.productCenter.form.dealingFrequency'), key: 'dealingFrequency' },
  { label: $t('pages.productCenter.form.dealingCutOff'), key: 'dealingCutOff' },
  { label: $t('pages.productCenter.form.valuationPoint'), key: 'valuationPoint' },
  { label: $t('pages.productCenter.form.valuationFrequency'), key: 'valuationFrequency' },
  { label: $t('pages.productCenter.form.valuationDeliveryTime'), key: 'valuationDeliveryTime' },
  { label: $t('pages.productCenter.form.businessDayDefinition'), key: 'businessDayDefinition' },
  { label: $t('pages.productCenter.form.businessCalendar'), key: 'businessCalendar', type: 'array' },
  { label: $t('pages.productCenter.form.subscriptionSettlement'), key: 'subscriptionSettlement' },
  { label: $t('pages.productCenter.form.redemptionSettlement'), key: 'redemptionSettlement' },
  { label: $t('pages.productCenter.form.contractNoteDeliveryDay'), key: 'contractNoteDeliveryDay' },
  { label: $t('pages.productCenter.form.pricingMethodology'), key: 'pricingMethodology', type: 'array' },
  { label: $t('pages.productCenter.form.securityLending'), key: 'securityLending', type: 'yesno' },
  { label: $t('pages.productCenter.form.ter'), key: 'ter' },
  { label: $t('pages.productCenter.form.latestTerRate'), key: 'latestTerRate' },
  { label: $t('pages.productCenter.form.latestTerDate'), key: 'latestTerDate', type: 'date' },
];

// Share class list table columns (fund mode → Operational Team tab)
const shareClassListColumns = [
  { title: 'VPFS Class ID', dataIndex: 'vpfsClassId', key: 'vpfsClassId', width: 120 },
  { title: 'Share Class Name (EN)', dataIndex: 'shareClassNameEnOfficialName', key: 'shareClassNameEnOfficialName', width: 200 },
  { title: 'Currency', dataIndex: 'classCurrency', key: 'classCurrency', width: 80 },
  { title: 'Status', dataIndex: 'fundClassStatus', key: 'fundClassStatus', width: 90 },
  { title: 'Launch Date', dataIndex: 'launchDate', key: 'launchDate', width: 110 },
  { title: 'ISIN Code', dataIndex: 'isinCode', key: 'isinCode', width: 140 },
  { title: 'Dealing Freq.', dataIndex: 'dealingFrequency', key: 'dealingFrequency', width: 100 },
  { title: 'Mgmt Fee(%)', dataIndex: 'managementFee', key: 'managementFee', width: 90 },
];

// ─── Value Formatting ───

function formatValue(value: any, type?: string): string {
  if (value === null || value === undefined || value === '') return '-';
  if (type === 'yesno') {
    if (value === 'Y' || value === true) return 'Yes';
    if (value === 'N' || value === false) return 'No';
    return String(value);
  }
  if (type === 'date') {
    if (typeof value === 'string') {
      return value.substring(0, 10);
    }
    return String(value);
  }
  if (type === 'array') {
    if (Array.isArray(value)) return value.join(', ') || '-';
    if (typeof value === 'string' && value) return value.replace(/,/g, ', ');
    return '-';
  }
  if (type === 'region') {
    if (Array.isArray(value)) return value.join(', ') || '-';
    return String(value);
  }
  return String(value);
}

function getFieldValue(data: Record<string, any>, field: FieldDef): string {
  return formatValue(data[field.key], field.type);
}

// ─── Anchor Items ───

const productTabAnchors = computed(() => [
  { href: '#detail-core', title: $t('pages.productCenter.coreFundIdentity') },
  { href: '#detail-parties', title: $t('pages.productCenter.keyParties') },
  { href: '#detail-strategy', title: $t('pages.productCenter.investmentStrategy') },
  { href: '#detail-registration', title: $t('pages.productCenter.foreignRegistration') },
]);

const operationalTabAnchors = computed(() => {
  if (mode.value === 'fund') {
    return [
      { href: '#detail-fund-info', title: $t('pages.productCenter.fundInfo') },
      { href: '#detail-share-class-list', title: $t('pages.productCenter.classList') },
    ];
  }
  return [
    { href: '#detail-fund-info', title: $t('pages.productCenter.fundInfo') },
    { href: '#detail-class-info', title: $t('pages.productCenter.classInfo') },
    { href: '#detail-dealing', title: $t('pages.productCenter.dealingAndValuation') },
  ];
});

const currentAnchors = computed(() => {
  return activeTab.value === 'product' ? productTabAnchors.value : operationalTabAnchors.value;
});

function handleAnchorClick(e: Event, link: { href: string; title: string }) {
  e.preventDefault();
  const href = link.href;
  if (!href?.startsWith('#')) return;
  const targetId = href.substring(1);
  const target = document.getElementById(targetId);
  if (!target) return;

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

// ─── Drawer Setup ───

const [Drawer, drawerApi] = useVbenDrawer({
  async onOpenChange(isOpen) {
    if (!isOpen) {
      fundData.value = {};
      shareClassData.value = {};
      shareClassList.value = [];
      return;
    }

    const data = drawerApi.getData<{
      fundCode?: string;
      productClassId?: string | number;
      activeTab?: string;
    }>();
    if (!data) return;

    // Determine mode
    if (data.fundCode) {
      mode.value = 'fund';
      activeTab.value = 'product';
    } else if (data.productClassId) {
      mode.value = 'shareClass';
      activeTab.value = 'operational';
    }

    loading.value = true;
    try {
      // Load fund data
      if (data.fundCode) {
        const fund = await productCenterMasterdataInfo(data.fundCode);
        fundData.value = fund;

        // Also load share classes for this fund
        try {
          const result = await productCenterDataList({ pageNum: 1, pageSize: 999, fundCode: data.fundCode });
          shareClassList.value = result.rows || [];
        } catch {
          shareClassList.value = [];
        }
      }

      // Load share class data
      if (data.productClassId) {
        const shareClass = await productCenterDataInfo(data.productClassId);
        shareClassData.value = shareClass;

        // Also load the parent fund
        if (shareClass.fundCode) {
          try {
            const fund = await productCenterMasterdataInfo(shareClass.fundCode);
            fundData.value = fund;
          } catch {
            // Fund may not exist yet
          }

          // Load all share classes for this fund (for the Product Team tab)
          try {
            const result = await productCenterDataList({ pageNum: 1, pageSize: 999, fundCode: shareClass.fundCode });
            shareClassList.value = result.rows || [];
          } catch {
            shareClassList.value = [];
          }
        }
      }
    } catch {
      fundData.value = {};
      shareClassData.value = {};
    } finally {
      loading.value = false;

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

const statusColorMap: Record<string, string> = {
  Active: 'green',
  'In Offering': 'blue',
  'In Liquidation': 'orange',
  Liquidated: 'red',
  Inactive: 'orange',
  Terminated: 'red',
};
</script>

<template>
  <Drawer :footer="false" :title="$t('pages.productCenter.detailDrawerTitle')" :class="'w-[85%]'">
    <Spin :spinning="loading" class="h-full">
      <div class="flex h-full gap-4 overflow-x-hidden">
        <div class="flex-1 overflow-y-auto">
          <Tabs v-model:activeKey="activeTab">
            <!-- ═══════════════════════════════════════════════ -->
            <!-- Product Team Tab -->
            <!-- ═══════════════════════════════════════════════ -->
            <TabPane key="product" tab="Product Team">
              <Collapse v-model:activeKey="activeCollapseKeys" :bordered="false">
                <CollapsePanel id="detail-core" key="core" :header="$t('pages.productCenter.coreFundIdentity')">
                  <Descriptions :column="2" bordered size="small">
                    <DescriptionsItem
                      v-for="field in coreFields"
                      :key="field.key"
                      :label="field.label"
                      :span="field.span ?? 1"
                    >
                      <template v-if="field.key === 'fundStatus' && fundData.fundStatus">
                        <Tag :color="statusColorMap[fundData.fundStatus] || 'default'">
                          {{ fundData.fundStatus }}
                        </Tag>
                      </template>
                      <template v-else>
                        {{ getFieldValue(fundData, field) }}
                      </template>
                    </DescriptionsItem>
                  </Descriptions>
                </CollapsePanel>

                <CollapsePanel id="detail-parties" key="parties" :header="$t('pages.productCenter.keyParties')">
                  <Descriptions :column="2" bordered size="small">
                    <DescriptionsItem
                      v-for="field in partyFields"
                      :key="field.key"
                      :label="field.label"
                    >
                      {{ getFieldValue(fundData, field) }}
                    </DescriptionsItem>
                  </Descriptions>
                </CollapsePanel>

                <CollapsePanel id="detail-strategy" key="strategy" :header="$t('pages.productCenter.investmentStrategy')">
                  <Descriptions :column="2" bordered size="small">
                    <DescriptionsItem
                      v-for="field in strategyFields"
                      :key="field.key"
                      :label="field.label"
                    >
                      {{ getFieldValue(fundData, field) }}
                    </DescriptionsItem>
                    <DescriptionsItem
                      v-for="field in strategyFullWidthFields"
                      :key="field.key"
                      :label="field.label"
                      :span="2"
                    >
                      {{ getFieldValue(fundData, field) }}
                    </DescriptionsItem>
                  </Descriptions>
                </CollapsePanel>

                <CollapsePanel id="detail-registration" key="registration" :header="$t('pages.productCenter.foreignRegistration')">
                  <Descriptions :column="1" bordered size="small">
                    <DescriptionsItem label="Registered Regions">
                      {{ formatValue(fundData.regionDictCodes, 'region') }}
                    </DescriptionsItem>
                  </Descriptions>
                </CollapsePanel>
              </Collapse>
            </TabPane>

            <!-- ═══════════════════════════════════════════════ -->
            <!-- Operational Team Tab -->
            <!-- ═══════════════════════════════════════════════ -->
            <TabPane key="operational" tab="Operational Team">
              <!-- Fund mode: show fund info + share class list -->
              <template v-if="mode === 'fund'">
                <Collapse v-model:activeKey="activeCollapseKeys" :bordered="false">
                  <CollapsePanel id="detail-fund-info" key="fund-info" :header="$t('pages.productCenter.fundInfo')">
                    <Descriptions :column="2" bordered size="small">
                      <DescriptionsItem
                        v-for="field in fundInfoFields"
                        :key="field.key"
                        :label="field.label"
                      >
                        {{ getFieldValue(fundData, field) }}
                      </DescriptionsItem>
                    </Descriptions>
                  </CollapsePanel>

                  <CollapsePanel id="detail-share-class-list" key="class-list" :header="`${$t('pages.productCenter.classList')} (${shareClassList.length})`">
                    <div v-if="shareClassList.length === 0" class="p-8 text-center text-gray-400">
                      {{ $t('pages.productCenter.noData') }}
                    </div>
                    <Table
                      v-else
                      :columns="shareClassListColumns"
                      :data-source="shareClassList"
                      :row-key="(record: ProductCenterData) => record.productClassId ?? record.vpfsClassId"
                      size="small"
                      :pagination="false"
                      bordered
                      :scroll="{ x: 960 }"
                    >
                      <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'fundClassStatus'">
                          <Tag :color="statusColorMap[record.fundClassStatus] || 'default'">
                            {{ record.fundClassStatus }}
                          </Tag>
                        </template>
                      </template>
                    </Table>
                  </CollapsePanel>
                </Collapse>
              </template>

              <!-- ShareClass mode: show fund info + class info + dealing -->
              <template v-else>
                <Collapse v-model:activeKey="activeCollapseKeys" :bordered="false">
                  <CollapsePanel id="detail-fund-info" key="fund-info" :header="$t('pages.productCenter.fundInfo')">
                    <Descriptions :column="2" bordered size="small">
                      <DescriptionsItem
                        v-for="field in fundInfoFields"
                        :key="field.key"
                        :label="field.label"
                      >
                        {{ getFieldValue(fundData, field) }}
                      </DescriptionsItem>
                    </Descriptions>
                  </CollapsePanel>

                  <CollapsePanel id="detail-class-info" key="class-info" :header="$t('pages.productCenter.classInfo')">
                    <Descriptions :column="2" bordered size="small">
                      <DescriptionsItem
                        v-for="field in classInfoFields"
                        :key="field.key"
                        :label="field.label"
                      >
                        <template v-if="field.key === 'fundClassStatus' && shareClassData.fundClassStatus">
                          <Tag :color="statusColorMap[shareClassData.fundClassStatus] || 'default'">
                            {{ shareClassData.fundClassStatus }}
                          </Tag>
                        </template>
                        <template v-else>
                          {{ getFieldValue(shareClassData, field) }}
                        </template>
                      </DescriptionsItem>
                    </Descriptions>
                  </CollapsePanel>

                  <CollapsePanel id="detail-dealing" key="dealing" :header="$t('pages.productCenter.dealingAndValuation')">
                    <Descriptions :column="2" bordered size="small">
                      <DescriptionsItem
                        v-for="field in dealingFields"
                        :key="field.key"
                        :label="field.label"
                      >
                        {{ getFieldValue(shareClassData, field) }}
                      </DescriptionsItem>
                    </Descriptions>
                  </CollapsePanel>
                </Collapse>
              </template>
            </TabPane>
          </Tabs>
        </div>

        <!-- Anchor sidebar -->
        <div class="w-[160px] shrink-0 sticky top-0 self-start">
          <Anchor
            :key="scrollContainerRef"
            :items="currentAnchors"
            :offset-top="16"
            :target-offset="60"
            :affix="false"
            :get-container="() => scrollContainerRef || window"
            @click="handleAnchorClick"
          />
        </div>
      </div>
    </Spin>
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
