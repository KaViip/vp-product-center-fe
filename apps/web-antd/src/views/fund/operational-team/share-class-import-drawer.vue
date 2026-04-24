<script setup lang="ts">
import type { UploadFile } from 'antdv-next';

import { ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';

import { InboxOutlined } from '@antdv-next/icons';
import * as XLSX from 'xlsx';
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
const sheetNames = ref<string[]>([]);
const selectedSheet = ref<string>('');
const workbookCache = ref<XLSX.WorkBook | null>(null);

const importModeOptions = [
  { label: 'Add Data', value: 'add data' },
  { label: 'Update Data', value: 'update data' },
  { label: 'Add and Update Data', value: 'add and update data' },
];

watch(selectedSheet, (name) => {
  if (name) renderSheet(name);
});

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: handleConfirm,
  onCancel: handleCancel,
});

const { exportBlob, exportLoading } = useBlobExport(shareClassDownloadTemplate);

async function handleExport() {
  exportBlob({ data: {}, fileName: 'Share_Class_Template.xlsx' });
}

async function parseExcelPreview(file: File) {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: 'array' });
  workbookCache.value = wb;
  sheetNames.value = wb.SheetNames;
  selectedSheet.value = wb.SheetNames[0] ?? '';
  renderSheet(selectedSheet.value);
}

function renderSheet(sheetName: string) {
  if (!workbookCache.value) return;
  const sheet = workbookCache.value.Sheets[sheetName];
  if (!sheet) {
    previewData.value = [];
    previewColumns.value = [];
    return;
  }
  const json: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  if (json.length === 0) {
    previewData.value = [];
    previewColumns.value = [];
    return;
  }

  const keys = Object.keys(json[0]);
  previewColumns.value = keys.map((k) => ({
    title: k,
    dataIndex: k,
    key: k,
    width: 150,
    ellipsis: true,
  }));
  previewData.value = json.map((row, i) => ({ _row: i + 1, ...row }));
  previewColumns.value.unshift({ title: '#', dataIndex: '_row', key: '_row', width: 50, fixed: 'left' });
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
  sheetNames.value = [];
  selectedSheet.value = '';
  workbookCache.value = null;
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
      <div v-if="sheetNames.length > 1" class="flex items-center gap-2">
        <span class="shrink-0 font-medium">Sheet Name:</span>
        <Select v-model:value="selectedSheet" class="w-48">
          <Select.Option v-for="name in sheetNames" :key="name" :value="name">{{ name }}</Select.Option>
        </Select>
      </div>
      <Table
        :columns="previewColumns"
        :data-source="previewData"
        :pagination="false"
        :scroll="{ x: previewColumns.length * 150, y: 400 }"
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
