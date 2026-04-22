<script setup lang="ts">
import type { FundDocument } from '#/api/product-center/model/fund-documents';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  Descriptions,
  DescriptionsItem,
  Select,
  Spin,
  TabPane,
  Table,
  Tabs,
  Tooltip,
} from 'antdv-next';

import { fundDocumentDetail } from '#/api/product-center';

interface DocGroup {
  documentType: string;
  enDocs: FundDocument[];
  tcDocs: FundDocument[];
  scDocs: FundDocument[];
}

const loading = ref(false);
const activeTab = ref('latest');
const fundCode = ref('');
const classId = ref<string | undefined>();
const classNameEn = ref('');
const fundNameEn = ref('');
const allDocs = ref<FundDocument[]>([]);

const [BasicModal, modalApi] = useVbenModal({
  async onOpenChange(isOpen) {
    if (!isOpen) {
      allDocs.value = [];
      return;
    }

    const data = modalApi.getData<{
      fundCode: string;
      classId?: string;
      documentsByType?: Record<string, FundDocument[]>;
    }>();

    if (!data?.fundCode) return;

    fundCode.value = data.fundCode;
    classId.value = data.classId;

    loading.value = true;
    try {
      if (data.documentsByType) {
        const docs: FundDocument[] = [];
        for (const arr of Object.values(data.documentsByType)) {
          docs.push(...arr);
        }
        allDocs.value = docs;
        fundNameEn.value = docs[0]?.fundNameEn ?? '';
        classNameEn.value = data.classId
          ? (docs.find((d) => d.classId === data.classId)?.classNameEn ?? '')
          : '';
      } else {
        const result = await fundDocumentDetail(data.fundCode);
        allDocs.value = Array.isArray(result) ? result : [result];
      }
    } catch {
      allDocs.value = [];
    } finally {
      loading.value = false;
    }
  },
});

function groupDocsByType(docs: FundDocument[]): DocGroup[] {
  const typeMap = new Map<string, FundDocument[]>();
  for (const doc of docs) {
    if (!typeMap.has(doc.documentType)) typeMap.set(doc.documentType, []);
    typeMap.get(doc.documentType)!.push(doc);
  }

  return Array.from(typeMap.entries()).map(([docType, typeDocs]) => {
    const sorted = [...typeDocs].sort((a, b) => b.documentDate.localeCompare(a.documentDate));
    return {
      documentType: docType,
      enDocs: sorted.filter((d) => d.language === 'eng'),
      tcDocs: sorted.filter((d) => d.language === 'chi'),
      scDocs: sorted.filter((d) => d.language === 'sc'),
    };
  });
}

const latestDocGroups = computed(() => groupDocsByType(allDocs.value));
const historicalDocGroups = computed(() => groupDocsByType(allDocs.value));

function getLatestFileName(docs: FundDocument[]): string {
  if (!docs.length) return '-';
  return docs[0]?.fileName ?? '-';
}

function onDownload(doc: FundDocument | undefined) {
  if (doc?.filePath) {
    window.open(doc.filePath, '_blank');
  }
}

const detailColumns = [
  { title: 'Document Type', dataIndex: 'documentType', key: 'documentType', width: 200 },
  {
    title: 'English Version',
    key: 'en',
    width: 220,
  },
  {
    title: 'Traditional Chinese',
    key: 'tc',
    width: 220,
  },
  {
    title: 'Simplified Chinese',
    key: 'sc',
    width: 220,
  },
];
</script>

<template>
  <BasicModal
    :footer="false"
    :fullscreen-button="true"
    title="Documents Detail"
    class="w-[80%]"
  >
    <Spin :spinning="loading">
      <Descriptions :column="classId ? 4 : 2" bordered size="small" class="mb-4">
        <DescriptionsItem label="Fund Code">{{ fundCode }}</DescriptionsItem>
        <DescriptionsItem label="Fund Name (EN)">{{ fundNameEn }}</DescriptionsItem>
        <DescriptionsItem v-if="classId" label="Class ID">{{ classId }}</DescriptionsItem>
        <DescriptionsItem v-if="classId" label="Class Name (EN)">{{ classNameEn }}</DescriptionsItem>
      </Descriptions>

      <Tabs v-model:activeKey="activeTab">
        <TabPane key="latest" tab="Latest Documents">
          <Table
            :columns="detailColumns"
            :data-source="latestDocGroups"
            row-key="documentType"
            size="small"
            :pagination="false"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'en'">
                <Select
                  v-if="record.enDocs.length"
                  :value="record.enDocs[0]?.id"
                  class="w-full"
                  size="small"
                >
                  <Select.Option v-for="doc in record.enDocs.slice(0, 5)" :key="doc.id" :value="doc.id">
                    <Tooltip :title="doc.fileName">
                      <div class="flex items-center justify-between">
                        <span class="truncate text-xs">{{ doc.documentDate }}</span>
                        <a class="ml-1 text-blue-500" @click.stop="onDownload(doc)">⬇</a>
                      </div>
                    </Tooltip>
                  </Select.Option>
                </Select>
                <span v-else class="text-gray-300">-</span>
              </template>
              <template v-if="column.key === 'tc'">
                <Select
                  v-if="record.tcDocs.length"
                  :value="record.tcDocs[0]?.id"
                  class="w-full"
                  size="small"
                >
                  <Select.Option v-for="doc in record.tcDocs.slice(0, 5)" :key="doc.id" :value="doc.id">
                    <Tooltip :title="doc.fileName">
                      <div class="flex items-center justify-between">
                        <span class="truncate text-xs">{{ doc.documentDate }}</span>
                        <a class="ml-1 text-blue-500" @click.stop="onDownload(doc)">⬇</a>
                      </div>
                    </Tooltip>
                  </Select.Option>
                </Select>
                <span v-else class="text-gray-300">-</span>
              </template>
              <template v-if="column.key === 'sc'">
                <Select
                  v-if="record.scDocs.length"
                  :value="record.scDocs[0]?.id"
                  class="w-full"
                  size="small"
                >
                  <Select.Option v-for="doc in record.scDocs.slice(0, 5)" :key="doc.id" :value="doc.id">
                    <Tooltip :title="doc.fileName">
                      <div class="flex items-center justify-between">
                        <span class="truncate text-xs">{{ doc.documentDate }}</span>
                        <a class="ml-1 text-blue-500" @click.stop="onDownload(doc)">⬇</a>
                      </div>
                    </Tooltip>
                  </Select.Option>
                </Select>
                <span v-else class="text-gray-300">-</span>
              </template>
            </template>
          </Table>
        </TabPane>

        <TabPane key="historical" tab="Historical Documents">
          <Table
            :columns="detailColumns"
            :data-source="historicalDocGroups"
            row-key="documentType"
            size="small"
            :pagination="false"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'en'">
                <Select
                  v-if="record.enDocs.length"
                  :value="record.enDocs[0]?.id"
                  class="w-full"
                  size="small"
                >
                  <Select.Option v-for="doc in record.enDocs" :key="doc.id" :value="doc.id">
                    <Tooltip :title="doc.fileName">
                      <div class="flex items-center justify-between">
                        <span class="truncate text-xs">{{ doc.documentDate }}</span>
                        <a class="ml-1 text-blue-500" @click.stop="onDownload(doc)">⬇</a>
                      </div>
                    </Tooltip>
                  </Select.Option>
                </Select>
                <span v-else class="text-gray-300">-</span>
              </template>
              <template v-if="column.key === 'tc'">
                <Select
                  v-if="record.tcDocs.length"
                  :value="record.tcDocs[0]?.id"
                  class="w-full"
                  size="small"
                >
                  <Select.Option v-for="doc in record.tcDocs" :key="doc.id" :value="doc.id">
                    <Tooltip :title="doc.fileName">
                      <div class="flex items-center justify-between">
                        <span class="truncate text-xs">{{ doc.documentDate }}</span>
                        <a class="ml-1 text-blue-500" @click.stop="onDownload(doc)">⬇</a>
                      </div>
                    </Tooltip>
                  </Select.Option>
                </Select>
                <span v-else class="text-gray-300">-</span>
              </template>
              <template v-if="column.key === 'sc'">
                <Select
                  v-if="record.scDocs.length"
                  :value="record.scDocs[0]?.id"
                  class="w-full"
                  size="small"
                >
                  <Select.Option v-for="doc in record.scDocs" :key="doc.id" :value="doc.id">
                    <Tooltip :title="doc.fileName">
                      <div class="flex items-center justify-between">
                        <span class="truncate text-xs">{{ doc.documentDate }}</span>
                        <a class="ml-1 text-blue-500" @click.stop="onDownload(doc)">⬇</a>
                      </div>
                    </Tooltip>
                  </Select.Option>
                </Select>
                <span v-else class="text-gray-300">-</span>
              </template>
            </template>
          </Table>
        </TabPane>
      </Tabs>
    </Spin>
  </BasicModal>
</template>
