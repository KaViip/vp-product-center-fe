<script setup lang="ts">
import type { UploadFile } from 'antdv-next';

import { h, ref, watch } from 'vue';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { InboxOutlined } from '@antdv-next/icons';
import * as XLSX from 'xlsx';
import {
  Alert,
  Button,
  Result,
  Select,
  Space,
  Spin,
  Steps,
  Table,
  Tag,
  UploadDragger,
} from 'antdv-next';

import {
  productCenterMasterdataImportTemplate,
  productCenterMasterdataImport,
} from '#/api/productcenter/productCenterMasterdata';
import { useBlobExport } from '#/utils/file/export';
import { validateExcelData, getCellError, PRODUCT_TEAM_RULES, type ValidationError } from '../import-validation';

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
const validationErrors = ref<ValidationError[]>([]);

const importModeOptions = [
  { label: $t('pages.productCenter.addData'), value: 'add data' },
  { label: $t('pages.productCenter.updateData'), value: 'update data' },
  { label: $t('pages.productCenter.addAndUpdateData'), value: 'add and update data' },
];

watch(selectedSheet, (name) => {
  if (name) renderSheet(name);
});

const [Drawer, drawerApi] = useVbenDrawer({
  onConfirm: handleConfirm,
  onCancel: handleCancel,
});

const { exportBlob, exportLoading } = useBlobExport(productCenterMasterdataImportTemplate);

async function handleExport() {
  exportBlob({ data: {}, fileName: 'Fund_Product_Template.xlsx' });
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
  const json: Record<string, any>[] = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false, dateNF: 'yyyy/mm/dd' });

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
    customRender: ({ record, text }: any) => {
      const err = getCellError(validationErrors.value, record._row, k);
      if (err) {
        return h('div', { class: 'cell-error', title: err.message }, String(text ?? ''));
      }
      return String(text ?? '');
    },
  }));
  previewData.value = json.map((row, i) => ({ _row: i + 1, ...row }));
  previewColumns.value.unshift({ title: '#', dataIndex: '_row', key: '_row', width: 50, fixed: 'left' });

  validationErrors.value = validateExcelData(previewData.value, PRODUCT_TEAM_RULES, importMode.value !== 'add data');
}

async function handleConfirm() {
  if (currentStep.value === 0) {
    if (fileList.value.length !== 1) return;
    await parseExcelPreview(fileList.value[0]!.originFileObj as File);
    currentStep.value = 1;
    return;
  }

  if (currentStep.value === 1) {
    if (previewData.value.length === 0) {
      window.message.error('No data found in the Excel file. Please check and re-upload.');
      return;
    }
    if (validationErrors.value.length > 0) {
      window.message.error(`Found ${validationErrors.value.length} validation error(s). Please fix in Excel and re-upload.`);
      return;
    }
    currentStep.value = 2;
    importing.value = true;
    try {
      const file = fileList.value[0]!.originFileObj as File;
      const result = await productCenterMasterdataImport(file);
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
  validationErrors.value = [];
}
</script>

<template>
  <Drawer
    :title="$t('pages.productCenter.importFundData')"
    :class="'w-[90%]'"
    :footer="true"
    :confirm-text="currentStep === 2 ? $t('pages.productCenter.done') : currentStep === 1 ? $t('pages.productCenter.importBtn') : $t('pages.productCenter.nextStep')"
    :cancel-text="currentStep > 0 && currentStep < 2 ? $t('pages.productCenter.previous') : $t('pages.common.cancel')"
  >
    <Steps
      :current="currentStep"
      :items="[{ title: $t('pages.productCenter.selectExcel') }, { title: $t('pages.productCenter.browseData') }, { title: $t('pages.productCenter.importResult') }]"
      style="margin-bottom: 24px"
    />

    <!-- Step 0: Select Excel -->
    <div v-if="currentStep === 0" class="space-y-4">
      <div class="flex items-center gap-3">
        <span class="shrink-0 font-medium">{{ $t('pages.productCenter.importMode') }}</span>
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
        <p>{{ $t('pages.productCenter.clickOrDrag') }}</p>
      </UploadDragger>
      <div class="mt-1 flex items-center justify-between">
        <span class="text-gray-500">{{ $t('pages.productCenter.acceptsFiles') }}</span>
        <Button
          type="link"
          :loading="exportLoading"
          :disabled="exportLoading"
          @click="handleExport"
        >
          {{ $t('pages.productCenter.downloadTemplate') }}
        </Button>
      </div>
    </div>

    <!-- Step 1: Browse Data -->
    <div v-if="currentStep === 1" class="space-y-4">
      <div class="flex items-center gap-6 text-sm">
        <span>{{ $t('pages.productCenter.file') }} <strong>{{ fileList[0]?.name }}</strong></span>
        <span>{{ $t('pages.productCenter.mode') }} <strong>{{ importMode }}</strong></span>
        <span>{{ $t('pages.productCenter.rows') }} <strong>{{ previewData.length }}</strong></span>
      </div>
      <div v-if="sheetNames.length > 1" class="flex items-center gap-2">
        <span class="shrink-0 font-medium">{{ $t('pages.productCenter.sheetName') }}</span>
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
      <Alert v-if="validationErrors.length > 0" type="error" style="margin-top: 12px">
        <template #message>
          <span>{{ validationErrors.length }} validation error(s) found. Please fix in Excel and re-upload.</span>
        </template>
        <template #description>
          <div class="error-list">
            <div v-for="err in validationErrors.slice(0, 50)" :key="`${err.row}-${err.column}`" style="padding: 2px 0; line-height: 1.6;">
              <Tag color="red" style="margin-right: 8px; font-size: 11px;">Row {{ err.row }}</Tag>
              <strong>{{ err.column }}</strong>: {{ err.message }}
            </div>
            <div v-if="validationErrors.length > 50" style="color: #999; font-size: 12px; padding-top: 4px;">
              ... and {{ validationErrors.length - 50 }} more errors
            </div>
          </div>
        </template>
      </Alert>
      <p class="text-xs text-gray-400">
        {{ $t('pages.productCenter.previewTip') }}
      </p>
    </div>

    <!-- Step 2: Import Result -->
    <div v-if="currentStep === 2">
      <Spin :spinning="importing" :tip="$t('pages.productCenter.importing')">
        <Result
          v-if="importResult"
          :status="importResult.code === 200 ? 'success' : 'error'"
          :title="importResult.code === 200 ? $t('pages.productCenter.importSuccessful') : $t('pages.productCenter.importFailed')"
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

<style scoped>
.cell-error {
  background-color: #fff1f0;
  border: 1px solid #ffa39e;
  padding: 2px 6px;
  border-radius: 2px;
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.error-list {
  max-height: 200px;
  overflow-y: auto;
  font-size: 13px;
}
</style>
