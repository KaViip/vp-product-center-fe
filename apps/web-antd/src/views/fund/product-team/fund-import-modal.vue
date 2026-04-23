<script setup lang="ts">
import type { UploadFile } from 'antdv-next';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { InboxOutlined } from '@antdv-next/icons';
import {
  Result,
  Select,
  Spin,
  Steps,
  Table,
  UploadDragger,
} from 'antdv-next';

import {
  fundProductDownloadTemplate,
  fundProductImport,
} from '#/api/product-center';
import { useBlobExport } from '#/utils/file/export';

const emit = defineEmits<{ reload: [] }>();

const [BasicModal, modalApi] = useVbenModal({
  onConfirm: handleConfirm,
  onCancel: handleCancel,
});

const currentStep = ref(0);
const fileList = ref<UploadFile[]>([]);
const importMode = ref('add data');
const importing = ref(false);
const importResult = ref<{ code: number; msg: string } | null>(null);
const previewData = ref<Record<string, any>[]>([]);
const previewColumns = ref<{ title: string; dataIndex: string; key: string; ellipsis?: boolean }[]>([]);

const importModeOptions = [
  { label: 'Add Data', value: 'add data' },
  { label: 'Update Data', value: 'update data' },
  { label: 'Add and Update Data', value: 'add and update data' },
];

const { exportBlob, exportLoading } = useBlobExport(fundProductDownloadTemplate);

async function handleExport() {
  exportBlob({ data: {}, fileName: 'Fund_Product_Template.xlsx' });
}

async function parseExcelPreview(file: File) {
  // TODO: Replace with real Excel parsing (e.g. xlsx library) when backend is ready.
  // For now, generate mock preview data from the file name.
  previewData.value = [
    { _row: 1, fundCode: '(preview)', fundNameEn: '(data from Excel)', fundType: '...' },
    { _row: 2, fundCode: '(preview)', fundNameEn: '(data from Excel)', fundType: '...' },
  ];
  previewColumns.value = [
    { title: '#', dataIndex: '_row', key: '_row', width: 50 },
    { title: 'Fund Code', dataIndex: 'fundCode', key: 'fundCode', ellipsis: true },
    { title: 'Fund Name (EN)', dataIndex: 'fundNameEn', key: 'fundNameEn', ellipsis: true },
    { title: 'Fund Type', dataIndex: 'fundType', key: 'fundType', ellipsis: true },
  ];
}

async function handleConfirm() {
  if (currentStep.value === 0) {
    if (fileList.value.length !== 1) return;
    await parseExcelPreview(fileList.value[0]!.originFileObj as File);
    currentStep.value = 1;
    return;
  }

  if (currentStep.value === 1) {
    currentStep.value = 2;
    importing.value = true;
    try {
      const data = new FormData();
      data.append('file', fileList.value[0]!.originFileObj as Blob);
      data.append('importMode', importMode.value);
      const result = await fundProductImport(data);
      importResult.value = result as any;
      emit('reload');
    } catch (error: any) {
      importResult.value = { code: 500, msg: error?.message || 'Import failed' };
    } finally {
      importing.value = false;
    }
    return;
  }

  handleReset();
  modalApi.close();
}

function handleCancel() {
  if (currentStep.value > 0 && currentStep.value < 2) {
    currentStep.value--;
    return;
  }
  handleReset();
  modalApi.close();
}

function handleReset() {
  currentStep.value = 0;
  fileList.value = [];
  importMode.value = 'add data';
  importResult.value = null;
  importing.value = false;
  previewData.value = [];
  previewColumns.value = [];
}
</script>

<template>
  <BasicModal
    :close-on-click-modal="false"
    :confirm-text="currentStep === 2 ? 'Done' : currentStep === 1 ? 'Import' : 'Next'"
    :cancel-text="currentStep > 0 && currentStep < 2 ? 'Previous' : 'Cancel'"
    :footer="true"
    title="Import Fund Data"
    class="w-[600px]"
  >
    <Steps
      :current="currentStep"
      :items="[{ title: 'Select Excel' }, { title: 'Browse Data' }, { title: 'Import Result' }]"
      style="margin-bottom: 24px"
    />

    <!-- Step 0: Select Excel -->
    <div v-if="currentStep === 0" class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="shrink-0">Import Mode:</span>
        <Select v-model:value="importMode" :options="importModeOptions" class="w-52" />
      </div>
      <UploadDragger
        v-model:file-list="fileList"
        :before-upload="() => false"
        :max-count="1"
        :show-upload-list="true"
        accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      >
        <p class="ant-upload-drag-icon flex items-center justify-center">
          <InboxOutlined class="size-[48px] text-primary" />
        </p>
        <p>Click or drag Excel file here to upload</p>
      </UploadDragger>
      <div class="mt-1 flex items-center justify-between">
        <span class="text-gray-500">Accepts .xlsx, .xls files</span>
        <a-button
          type="link"
          :loading="exportLoading"
          :disabled="exportLoading"
          @click="handleExport"
        >
          Download Template
        </a-button>
      </div>
    </div>

    <!-- Step 1: Browse Data -->
    <div v-if="currentStep === 1" class="space-y-4">
      <div class="flex items-center gap-3">
        <span>File:</span>
        <span class="font-medium">{{ fileList[0]?.name }}</span>
      </div>
      <div class="flex items-center gap-3">
        <span>Import Mode:</span>
        <span class="font-medium">{{ importMode }}</span>
      </div>
      <Table
        :columns="previewColumns"
        :data-source="previewData"
        :pagination="false"
        :scroll="{ y: 240 }"
        size="small"
        bordered
      />
      <p class="text-xs text-gray-400">
        Showing preview of uploaded data. Actual columns may vary.
      </p>
    </div>

    <!-- Step 2: Import Result -->
    <div v-if="currentStep === 2">
      <Spin :spinning="importing" tip="Importing...">
        <Result
          v-if="importResult"
          :status="importResult.code === 200 ? 'success' : 'error'"
          :title="importResult.code === 200 ? 'Import Successful' : 'Import Failed'"
        >
          <template #extra>
            <div
              class="max-h-[200px] overflow-y-auto text-left text-sm"
              v-html="importResult.msg"
            />
          </template>
        </Result>
      </Spin>
    </div>
  </BasicModal>
</template>
