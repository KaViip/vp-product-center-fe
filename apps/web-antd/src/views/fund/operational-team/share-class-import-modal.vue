<script setup lang="ts">
import type { UploadFile } from 'antdv-next';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  InboxOutlined,
} from '@antdv-next/icons';
import {
  RadioButton,
  RadioGroup,
  Result,
  Spin,
  Steps,
  Switch,
  UploadDragger,
} from 'antdv-next';

import {
  shareClassDownloadTemplate,
  shareClassImport,
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
const updateSupport = ref(false);
const importing = ref(false);
const importResult = ref<{ code: number; msg: string } | null>(null);

const { exportBlob, exportLoading } = useBlobExport(shareClassDownloadTemplate);

async function handleExport() {
  exportBlob({ data: {}, fileName: 'Share_Class_Template.xlsx' });
}

async function handleConfirm() {
  if (currentStep.value === 0) {
    if (fileList.value.length !== 1) return;
    currentStep.value = 1;
    return;
  }

  if (currentStep.value === 1) {
    currentStep.value = 2;
    importing.value = true;
    try {
      const data = new FormData();
      data.append('file', fileList.value[0]!.originFileObj as Blob);
      data.append('updateSupport', String(updateSupport.value));
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
  updateSupport.value = false;
  importResult.value = null;
  importing.value = false;
}
</script>

<template>
  <BasicModal
    :close-on-click-modal="false"
    :confirm-text="currentStep === 2 ? 'Done' : 'Next'"
    :cancel-text="currentStep > 0 && currentStep < 2 ? 'Previous' : 'Cancel'"
    :footer="true"
    title="Import Share Class Data"
    class="w-[600px]"
  >
    <Steps :current="currentStep" :items="[{ title: 'Select File' }, { title: 'Confirm' }, { title: 'Result' }]" class="mb-6" />

    <div v-if="currentStep === 0">
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
      <div class="mt-3 flex items-center justify-between">
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

    <div v-if="currentStep === 1" class="space-y-4">
      <div class="flex items-center gap-3">
        <span>File:</span>
        <span class="font-medium">{{ fileList[0]?.name }}</span>
      </div>
      <div class="flex items-center gap-3">
        <span>Import Mode:</span>
        <RadioGroup v-model:value="importMode" button-style="solid" size="small">
          <RadioButton value="add data">Add</RadioButton>
          <RadioButton value="update data">Update</RadioButton>
          <RadioButton value="add and update data">Add & Update</RadioButton>
        </RadioGroup>
      </div>
      <div class="flex items-center gap-3">
        <span :class="{ 'text-red-500': updateSupport }">
          Overwrite existing data
        </span>
        <Switch v-model:checked="updateSupport" />
      </div>
    </div>

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
