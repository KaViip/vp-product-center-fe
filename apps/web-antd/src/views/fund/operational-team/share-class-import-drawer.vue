<script setup lang="ts">
import type { UploadFile } from 'antdv-next';

import { ref } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { InboxOutlined } from '@antdv-next/icons';
import {
  Button,
  Result,
  Select,
  Spin,
  Steps,
  Table,
  UploadDragger,
} from 'antdv-next';

import {
  shareClassDownloadTemplate,
  shareClassImport,
} from '#/api/product-center';
import { useBlobExport } from '#/utils/file/export';

const emit = defineEmits<{ reload: [] }>();

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

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: handleConfirm,
  onCancel: handleCancel,
});

const { exportBlob, exportLoading } = useBlobExport(shareClassDownloadTemplate);

async function handleExport() {
  exportBlob({ data: {}, fileName: 'Share_Class_Template.xlsx' });
}

async function parseExcelPreview(_file: File) {
  // TODO: Replace with real Excel parsing when backend is ready.
  previewData.value = [
    { _row: 1, fundCode: 'VPAF', shareClassNameEn: 'Class A (HKD)', classCurrency: 'HKD', classStatus: 'Active', vpfsClassId: 'VPAF-A', isinCode: 'HK0000123456' },
    { _row: 2, fundCode: 'VPAF', shareClassNameEn: 'Class B (USD)', classCurrency: 'USD', classStatus: 'Active', vpfsClassId: 'VPAF-B', isinCode: 'HK0000123457' },
  ];
  previewColumns.value = [
    { title: '#', dataIndex: '_row', key: '_row', width: 50 },
    { title: 'Fund Code', dataIndex: 'fundCode', key: 'fundCode', width: 120 },
    { title: 'Share Class Name (EN)', dataIndex: 'shareClassNameEn', key: 'shareClassNameEn', width: 220 },
    { title: 'Currency', dataIndex: 'classCurrency', key: 'classCurrency', width: 100 },
    { title: 'Status', dataIndex: 'classStatus', key: 'classStatus', width: 100 },
    { title: 'VPFS Class ID', dataIndex: 'vpfsClassId', key: 'vpfsClassId', width: 120 },
    { title: 'ISIN', dataIndex: 'isinCode', key: 'isinCode', width: 150 },
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
      const result = await shareClassImport(data);
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
  drawerApi.close();
}

function handleCancel() {
  if (currentStep.value > 0 && currentStep.value < 2) {
    currentStep.value--;
    return;
  }
  handleReset();
  drawerApi.close();
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
  <Drawer
    :title="'Import Share Class Data'"
    :class="'w-[70%]'"
    :footer="true"
    :confirm-text="currentStep === 2 ? 'Done' : currentStep === 1 ? 'Import' : 'Next'"
    :cancel-text="currentStep > 0 && currentStep < 2 ? 'Previous' : 'Cancel'"
  >
    <Steps
      :current="currentStep"
      :items="[{ title: 'Select Excel' }, { title: 'Browse Data' }, { title: 'Import Result' }]"
      style="margin-bottom: 24px"
    />

    <!-- Step 0: Select Excel -->
    <div v-if="currentStep === 0" class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="shrink-0 font-medium">Import Mode:</span>
        <Select v-model:value="importMode" :options="importModeOptions" class="w-56" />
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
        <Button
          type="link"
          :loading="exportLoading"
          :disabled="exportLoading"
          @click="handleExport"
        >
          Download Template
        </Button>
      </div>
    </div>

    <!-- Step 1: Browse Data -->
    <div v-if="currentStep === 1" class="space-y-4">
      <div class="flex items-center gap-6 text-sm">
        <span>File: <strong>{{ fileList[0]?.name }}</strong></span>
        <span>Mode: <strong>{{ importMode }}</strong></span>
        <span>Rows: <strong>{{ previewData.length }}</strong></span>
      </div>
      <Table
        :columns="previewColumns"
        :data-source="previewData"
        :pagination="false"
        :scroll="{ x: 900, y: 400 }"
        size="small"
        bordered
      />
      <p class="text-xs text-gray-400">
        Preview of uploaded data. Click "Import" to proceed.
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
              class="max-h-[300px] overflow-y-auto text-left text-sm"
              v-html="importResult.msg"
            />
          </template>
        </Result>
      </Spin>
    </div>
  </Drawer>
</template>
