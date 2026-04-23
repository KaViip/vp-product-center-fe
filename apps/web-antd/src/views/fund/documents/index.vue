<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { FundDocument } from '#/api/product-center/model/fund-documents';

import { computed, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { DownOutlined, RightOutlined } from '@antdv-next/icons';
import { Select, Space, Table, Tooltip } from 'antdv-next';

import { fundDocumentList } from '#/api/product-center';

import { querySchema } from './data';
import documentDetailModal from './document-detail-modal.vue';
import documentUploadModal from './document-upload-modal.vue';

interface FundDocRow {
  fundCode: string;
  fundNameEn: string;
  hasClassDocs: boolean;
  expanded: boolean;
  classDocs?: FundDocument[];
  documentsByType: Record<string, FundDocument[]>;
}

interface ClassDocRow {
  classId: string;
  classNameEn: string;
  fundCode: string;
  documentsByType: Record<string, FundDocument[]>;
}

const loading = ref(false);
const fundRows = ref<FundDocRow[]>([]);
const searchParams = ref<Record<string, any>>({});
const pagination = ref({ current: 1, pageSize: 10, total: 0 });

const [DocumentDetailModal, documentDetailModalApi] = useVbenModal({
  connectedComponent: documentDetailModal,
});

const [DocumentUploadModal, documentUploadModalApi] = useVbenModal({
  connectedComponent: documentUploadModal,
});

const DOC_TYPE_KEYS = [
  'productKeyFacts',
  'factSheet',
  'quarterlyCommentary',
  'interimReports',
  'annualReports',
  'otherDocuments',
] as const;

const DOC_TYPE_LABELS: Record<string, string> = {
  productKeyFacts: 'Product Key Facts / KIID',
  factSheet: 'Factsheet',
  quarterlyCommentary: 'Quarterly Commentary',
  interimReports: 'Interim Reports',
  annualReports: 'Annual Reports',
  otherDocuments: 'Other Documents',
};

function mapDocTypeToKey(type: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('product key facts') || lower.includes('kiid')) return 'productKeyFacts';
  if (lower.includes('fact sheet')) return 'factSheet';
  if (lower.includes('quarterly')) return 'quarterlyCommentary';
  if (lower.includes('interim')) return 'interimReports';
  if (lower.includes('annual')) return 'annualReports';
  return 'otherDocuments';
}

function getLatestDoc(docs: FundDocument[]): FundDocument | undefined {
  if (!docs.length) return undefined;
  return docs.sort((a, b) => b.documentDate.localeCompare(a.documentDate))[0];
}

function buildFundRows(docs: FundDocument[]): FundDocRow[] {
  const fundMap = new Map<string, FundDocument[]>();
  for (const doc of docs) {
    const key = doc.fundCode;
    if (!fundMap.has(key)) fundMap.set(key, []);
    fundMap.get(key)!.push(doc);
  }

  return Array.from(fundMap.entries()).map(([fundCode, fundDocs]) => {
    const docsByType: Record<string, FundDocument[]> = {};
    for (const doc of fundDocs) {
      const typeKey = mapDocTypeToKey(doc.documentType);
      if (!docsByType[typeKey]) docsByType[typeKey] = [];
      docsByType[typeKey].push(doc);
    }
    return {
      fundCode,
      fundNameEn: fundDocs[0]?.fundNameEn ?? '',
      hasClassDocs: fundDocs.some((d) => d.classId),
      expanded: false,
      classDocs: fundDocs.filter((d) => d.classId),
      documentsByType: docsByType,
    };
  });
}

async function loadData(page = 1) {
  loading.value = true;
  try {
    const result = await fundDocumentList({
      pageNum: page,
      pageSize: pagination.value.pageSize,
      ...searchParams.value,
    });
    pagination.value.total = result.total;
    pagination.value.current = page;
    fundRows.value = buildFundRows(result.rows);
  } catch {
    fundRows.value = [];
  } finally {
    loading.value = false;
  }
}

loadData();

function handleSearch(_formValues: Record<string, any>) {
  searchParams.value = _formValues;
  loadData(1);
}

function handleReset() {
  searchParams.value = {};
  loadData(1);
}

function toggleExpand(row: FundDocRow) {
  row.expanded = !row.expanded;
}

function handleSeeMore(row: FundDocRow | ClassDocRow, fundCode: string, classId?: string) {
  documentDetailModalApi.setData({ fundCode, classId, documentsByType: row.documentsByType });
  documentDetailModalApi.open();
}

function handleUpload() {
  documentUploadModalApi.open();
}

const columns = [
  {
    title: '',
    key: 'expand',
    width: 40,
  },
  { title: 'Fund Code', dataIndex: 'fundCode', key: 'fundCode', width: 120 },
  { title: 'Fund Name (EN)', dataIndex: 'fundNameEn', key: 'fundNameEn', width: 250 },
  ...DOC_TYPE_KEYS.map((key) => ({
    title: DOC_TYPE_LABELS[key],
    key,
    width: 160,
  })),
];

function getClassRows(fund: FundDocRow): ClassDocRow[] {
  if (!fund.classDocs?.length) return [];
  const classMap = new Map<string, FundDocument[]>();
  for (const doc of fund.classDocs) {
    const k = doc.classId ?? '';
    if (!classMap.has(k)) classMap.set(k, []);
    classMap.get(k)!.push(doc);
  }
  return Array.from(classMap.entries()).map(([classId, docs]) => {
    const docsByType: Record<string, FundDocument[]> = {};
    for (const doc of docs) {
      const typeKey = mapDocTypeToKey(doc.documentType);
      if (!docsByType[typeKey]) docsByType[typeKey] = [];
      docsByType[typeKey].push(doc);
    }
    return {
      classId,
      classNameEn: docs[0]?.classNameEn ?? '',
      fundCode: fund.fundCode,
      documentsByType: docsByType,
    };
  });
}

function onDownload(doc: FundDocument) {
  if (doc.filePath) {
    window.open(doc.filePath, '_blank');
  }
}

const paginationConfig = computed(() => ({
  current: pagination.value.current,
  pageSize: pagination.value.pageSize,
  total: pagination.value.total,
  pageSizeOptions: ['10', '20', '50', '100'],
  showSizeChanger: true,
  showTotal: (total: number) => `Total ${total} funds`,
  onChange: (page: number) => loadData(page),
  onShowSizeChange: (_current: number, size: number) => {
    pagination.value.pageSize = size;
    loadData(1);
  },
}));
</script>

<template>
  <Page :auto-content-height="true">
    <div class="flex h-full flex-col">
      <div class="mb-4 flex items-center justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <a-input
            v-model:value="searchParams.fundCode"
            placeholder="Fund Code"
            allow-clear
            class="w-[150px]"
            @press-enter="loadData(1)"
          />
          <a-input
            v-model:value="searchParams.fundNameEn"
            placeholder="Fund Name (EN)"
            allow-clear
            class="w-[200px]"
            @press-enter="loadData(1)"
          />
          <a-input
            v-model:value="searchParams.fundNameTc"
            placeholder="Fund Name (TC/SC)"
            allow-clear
            class="w-[200px]"
            @press-enter="loadData(1)"
          />
          <Select
            v-model:value="searchParams.language"
            :options="querySchema().find(s => s.fieldName === 'language')?.componentProps?.options"
            placeholder="Language"
            allow-clear
            class="w-[160px]"
          />
          <a-button type="primary" @click="loadData(1)">Search</a-button>
          <a-button @click="handleReset">Reset</a-button>
        </div>
        <Space>
          <a-button type="primary" @click="handleUpload">Upload</a-button>
        </Space>
      </div>

      <div class="flex-1 overflow-auto">
        <Table
          :columns="columns"
          :data-source="fundRows"
          :loading="loading"
          :pagination="paginationConfig"
          row-key="fundCode"
          size="small"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'expand'">
              <span
                v-if="record.hasClassDocs"
                class="cursor-pointer"
                @click="toggleExpand(record)"
              >
                <DownOutlined v-if="record.expanded" />
                <RightOutlined v-else />
              </span>
            </template>

            <template v-for="typeKey in DOC_TYPE_KEYS" :key="typeKey">
              <template v-if="column.key === typeKey">
                <template v-if="typeKey === 'otherDocuments'">
                  <a
                    v-if="record.documentsByType[typeKey]?.length"
                    class="text-blue-500 cursor-pointer"
                    @click="handleSeeMore(record, record.fundCode, record.classId)"
                  >
                    See more
                  </a>
                </template>
                <template v-else>
                  <Select
                    v-if="record.documentsByType[typeKey]?.length"
                    :value="getLatestDoc(record.documentsByType[typeKey])?.id"
                    class="w-full"
                    size="small"
                  >
                    <Select.Option
                      v-for="doc in record.documentsByType[typeKey]?.slice(0, 5)"
                      :key="doc.id"
                      :value="doc.id"
                    >
                      <Tooltip :title="`${doc.fileName} (${doc.documentDate})`">
                        <div class="flex items-center justify-between">
                          <span class="truncate">{{ doc.documentDate }}</span>
                          <a @click.stop="onDownload(doc)" class="ml-1 text-blue-500">⬇</a>
                        </div>
                      </Tooltip>
                    </Select.Option>
                  </Select>
                  <span v-else class="text-gray-300">-</span>
                </template>
              </template>
            </template>
          </template>

          <template #expandedRowRender="{ record }">
            <Table
              v-if="record.expanded && getClassRows(record).length"
              :columns="[
                { title: '', key: 'expand-spacer', width: 40 },
                { title: 'Class ID', dataIndex: 'classId', key: 'classId', width: 120 },
                { title: 'Class Name (EN)', dataIndex: 'classNameEn', key: 'classNameEn', width: 230 },
                ...DOC_TYPE_KEYS.map((key) => ({ title: DOC_TYPE_LABELS[key], key, width: 160 })),
              ]"
              :data-source="getClassRows(record)"
              row-key="classId"
              size="small"
              :pagination="false"
              bordered
            >
              <template #bodyCell="{ column: innerCol, record: classRow }">
                <template v-if="innerCol.key === 'expand-spacer'">
                  <span />
                </template>
                <template v-for="typeKey in DOC_TYPE_KEYS" :key="'class-' + typeKey">
                  <template v-if="innerCol.key === typeKey">
                    <template v-if="typeKey === 'otherDocuments'">
                      <a
                        v-if="classRow.documentsByType[typeKey]?.length"
                        class="text-blue-500 cursor-pointer"
                        @click="handleSeeMore(classRow, classRow.fundCode, classRow.classId)"
                      >
                        See more
                      </a>
                    </template>
                    <template v-else>
                      <Select
                        v-if="classRow.documentsByType[typeKey]?.length"
                        :value="getLatestDoc(classRow.documentsByType[typeKey])?.id"
                        class="w-full"
                        size="small"
                      >
                        <Select.Option
                          v-for="doc in classRow.documentsByType[typeKey]?.slice(0, 5)"
                          :key="doc.id"
                          :value="doc.id"
                        >
                          <Tooltip :title="`${doc.fileName} (${doc.documentDate})`">
                            <div class="flex items-center justify-between">
                              <span class="truncate">{{ doc.documentDate }}</span>
                              <a @click.stop="onDownload(doc)" class="ml-1 text-blue-500">⬇</a>
                            </div>
                          </Tooltip>
                        </Select.Option>
                      </Select>
                      <span v-else class="text-gray-300">-</span>
                    </template>
                  </template>
                </template>
              </template>
            </Table>
          </template>
        </Table>
      </div>
    </div>

    <DocumentDetailModal @reload="loadData(pagination.current)" />
    <DocumentUploadModal @reload="loadData(pagination.current)" />
  </Page>
</template>
