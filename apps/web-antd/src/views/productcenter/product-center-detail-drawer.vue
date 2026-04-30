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
  { label: 'Fund Code', key: 'fundCode' },
  { label: 'Fund Name (EN)', key: 'fundNameEn' },
  { label: 'Fund Name (TC)', key: 'fundNameTc' },
  { label: 'Fund Name (SC)', key: 'fundNameSc' },
  { label: 'Fund Type', key: 'fundType' },
  { label: 'Umbrella / OFC Name', key: 'umbrellaOfcName' },
  { label: 'Sub-Fund Code', key: 'subFundCode' },
  { label: 'Domicile / Jurisdiction', key: 'domicileJurisdiction' },
  { label: 'Primary Regulator', key: 'primaryRegulator' },
  { label: 'Base Currency', key: 'baseCurrency' },
  { label: 'Fund Status', key: 'fundStatus' },
  { label: 'Launch Date', key: 'launchDate', type: 'date' },
  { label: 'LEI Number', key: 'leiNumber' },
  { label: 'GIIN Number', key: 'giinNumber' },
  { label: 'Complex Product', key: 'complexProduct', type: 'yesno' },
  { label: 'Professional Investors Only', key: 'professionalInvestorsOnly', type: 'yesno' },
  { label: 'Application Submission Date', key: 'applicationSubmissionDate', type: 'date' },
  { label: 'Authorization Date', key: 'authorizationDate', type: 'date' },
  { label: 'IOP Start Date', key: 'iopStartDate', type: 'date' },
  { label: 'Operation Start Date', key: 'operationStartDate', type: 'date' },
  { label: 'Listing Date', key: 'listingDate', type: 'date' },
  { label: 'Termination Date', key: 'terminationDate', type: 'date' },
  { label: "Restriction on Investor's Nationality", key: 'restrictionInvestorNationality' },
  { label: "Restriction on Investor's Residency", key: 'restrictionInvestorResidency' },
];

const partyFields: FieldDef[] = [
  { label: 'Fund Manager', key: 'fundManager' },
  { label: 'Fund Manager LEI', key: 'fundManagerLei' },
  { label: 'Sub Manager', key: 'subManager' },
  { label: 'Investment Advisor', key: 'investmentAdvisor' },
  { label: 'Trustee / Administrator', key: 'trusteeAdministrator' },
  { label: 'Custodian / Prime Broker', key: 'custodianPrimeBroker' },
  { label: 'Sub Custodian', key: 'subCustodian' },
  { label: 'Auditor', key: 'auditor' },
];

const strategyFields: FieldDef[] = [
  { label: 'Primary Instrument Type', key: 'primaryInstrumentType' },
  { label: 'Passive or Active Fund', key: 'passiveOrActiveFund' },
  { label: 'Investment Market Focus', key: 'investmentMarketFocus' },
  { label: 'Strategy Category (MorningStar)', key: 'morningstarCategory' },
  { label: 'Benchmark', key: 'benchmark' },
  { label: 'Benchmark Code', key: 'benchmarkCode' },
  { label: 'Risk Rating', key: 'riskLevel' },
  { label: 'Hedging Policy (Fund)', key: 'hedgingPolicyFund' },
  { label: 'Leverage Ratio (Max)(%)', key: 'leverageRatioMax' },
  { label: 'Derivatives Ratio (Max)(%)', key: 'derivativesRatioMax' },
  { label: 'Borrowing Limit (%)', key: 'borrowingLimit' },
  { label: 'Stop Loss Limit (%)', key: 'stopLossLimit' },
  { label: 'Stop Loss Alert (%)', key: 'stopLossAlert' },
];

const strategyFullWidthFields: FieldDef[] = [
  { label: 'Investment Objective', key: 'investmentObjective', span: 2 },
  { label: 'Investment Strategy', key: 'investmentStrategy', span: 2 },
  { label: 'Asset Allocation Table', key: 'assetAllocationTable', span: 2 },
];

// Operational Team tab — Fund Info (shown in both modes)
const fundInfoFields: FieldDef[] = [
  { label: 'Fund Code', key: 'fundCode' },
  { label: 'Fund Name (EN)', key: 'fundNameEn' },
  { label: 'Fund Name (TC)', key: 'fundNameTc' },
  { label: 'Fund Name (SC)', key: 'fundNameSc' },
  { label: 'Fund Type', key: 'fundType' },
  { label: 'Fund Manager', key: 'fundManager' },
  { label: 'Fund Manager LEI', key: 'fundManagerLei' },
];

// Operational Team tab — Class Info (shareClass mode)
const classInfoFields: FieldDef[] = [
  { label: 'Share Class Name (EN)', key: 'shareClassNameEnOfficialName' },
  { label: 'Share Class Name (TC)', key: 'shareClassNameTcOfficialName' },
  { label: 'Share Class Name (SC)', key: 'shareClassNameScOfficialName' },
  { label: 'VPFS Class ID', key: 'vpfsClassId' },
  { label: 'Class Currency', key: 'classCurrency' },
  { label: 'Fund Class Status', key: 'fundClassStatus' },
  { label: 'End of IOP Date', key: 'endOfIopDate', type: 'date' },
  { label: 'Launch Date', key: 'launchDate', type: 'date' },
  { label: 'Stock Code', key: 'stockCode' },
  { label: 'ISIN Code', key: 'isinCode' },
  { label: 'CUSIP', key: 'cusip' },
  { label: 'Bloomberg Ticker', key: 'bloombergTicker' },
  { label: 'BBG ID Equity', key: 'bbgIdEquity' },
  { label: 'SEDOL', key: 'sedol' },
  { label: 'Valor Code', key: 'valorCode' },
  { label: 'Lipper Code', key: 'lipperCode' },
  { label: 'Morningstar Fund ID', key: 'morningstarFundId' },
  { label: 'Morningstar Sec ID', key: 'morningstarSecId' },
  { label: 'Morningstar Perf ID', key: 'morningstarPerformanceId' },
  { label: 'Distribution Policy', key: 'distributionPolicy' },
  { label: 'Hedged', key: 'hedged', type: 'yesno' },
  { label: 'Hedging Currency', key: 'hedgingCurrency' },
  { label: 'Unit Precision', key: 'unitPrecision' },
  { label: 'NAV Precision', key: 'navPrecision' },
  { label: 'Min Initial Subscription', key: 'minimumInitialSubscription' },
  { label: 'Min Subsequent Subscription', key: 'minimumSubsequentSubscription' },
  { label: 'Minimum Redemption', key: 'minimumRedemption' },
  { label: 'Minimum Holding', key: 'minimumHolding' },
  { label: 'Redemption Charge', key: 'redemptionCharge' },
  { label: 'Management Fee(%)', key: 'managementFee' },
  { label: 'Performance Fee(%)', key: 'performanceFee' },
  { label: 'Financial Year End', key: 'financialYearEnd' },
  { label: 'Cutoff Time', key: 'cutoffTime' },
];

const dealingFields: FieldDef[] = [
  { label: 'Dealing Frequency', key: 'dealingFrequency' },
  { label: 'Dealing Cut-off', key: 'dealingCutOff' },
  { label: 'Valuation Point', key: 'valuationPoint' },
  { label: 'Valuation Frequency', key: 'valuationFrequency' },
  { label: 'Valuation Delivery Time', key: 'valuationDeliveryTime' },
  { label: 'Business Day Definition', key: 'businessDayDefinition' },
  { label: 'Business Calendar', key: 'businessCalendar', type: 'array' },
  { label: 'Subscription Settlement(T+)', key: 'subscriptionSettlement' },
  { label: 'Redemption Settlement(T+)', key: 'redemptionSettlement' },
  { label: 'Contract Note Del. Day(T+)', key: 'contractNoteDeliveryDay' },
  { label: 'Pricing Methodology', key: 'pricingMethodology', type: 'array' },
  { label: 'Security Lending', key: 'securityLending', type: 'yesno' },
  { label: 'TER', key: 'ter' },
  { label: 'Latest TER Rate(%)', key: 'latestTerRate' },
  { label: 'Latest TER Date', key: 'latestTerDate', type: 'date' },
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
      <div class="flex h-full gap-4">
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
