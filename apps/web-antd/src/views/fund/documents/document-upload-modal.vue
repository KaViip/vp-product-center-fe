<script setup lang="ts">
import type { UploadFileItem } from '#/api/product-center/model/fund-documents';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { InboxOutlined } from '@antdv-next/icons';
import {
  Checkbox,
  Alert,
  FormItem,
  Input,
  RadioGroup,
  RadioButton,
  Result,
  Select,
  Spin,
  Step,
  Steps,
  Table,
  Tooltip,
  UploadDragger,
} from 'antdv-next';

import { fundDocumentUpload } from '#/api/product-center';
import {
  AiStatusEnum,
  DocumentTypeEnum,
  FileScopeEnum,
  UploadModeEnum,
  ValidationStatusEnum,
} from '#/api/product-center/model/fund-documents';
import { validateDocumentName, validateFileSize } from './document-validator';

const emit = defineEmits<{ reload: [] }>();

const [BasicModal, modalApi] = useVbenModal({
  onCancel: handleReset,
});

const currentStep = ref(0);
const uploadMode = ref<UploadModeEnum>(UploadModeEnum.SPECIFIED_FORMAT);
const fileList = ref<UploadFileItem[]>([]);
const uploading = ref(false);
const uploadResult = ref<{ success: number; failed: number; total: number } | null>(null);
const failedFiles = ref<{ fileName: string; failureReason: string }[]>([]);

const fundScope = ref<FileScopeEnum>(FileScopeEnum.ALL_FUNDS);
const selectedFundCodes = ref<string[]>([]);
const selectedClassIds = ref<string[]>([]);
const aiFundCode = ref<string | undefined>();
const aiClassId = ref<string | undefined>();
const aiDocType = ref<string | undefined>();

const statusCounts = computed(() => {
  const counts = { [ValidationStatusEnum.NOT_STARTED]: 0, [ValidationStatusEnum.VALIDATING]: 0, [ValidationStatusEnum.SUCCESS]: 0, [ValidationStatusEnum.FAILED]: 0 };
  for (const f of fileList.value) {
    counts[f.validationStatus]++;
  }
  return counts;
});

const statusFilters = ref({
  [ValidationStatusEnum.NOT_STARTED]: true,
  [ValidationStatusEnum.VALIDATING]: true,
  [ValidationStatusEnum.SUCCESS]: true,
  [ValidationStatusEnum.FAILED]: true,
});

const filteredFiles = computed(() => {
  return fileList.value.filter((f) => statusFilters.value[f.validationStatus]);
});

const canUpload = computed(() => {
  if (fileList.value.length === 0) return false;
  return fileList.value.every((f) => f.validationStatus === ValidationStatusEnum.SUCCESS);
});

const uploadModeOptions = Object.entries(UploadModeEnum).map(([_, v]) => ({ label: v, value: v }));
const docTypeOptions = Object.entries(DocumentTypeEnum).map(([_, v]) => ({ label: v, value: v }));
const scopeOptions = Object.entries(FileScopeEnum).map(([_, v]) => ({ label: v, value: v }));

const SUPPORTED_EXTENSIONS = '.pdf,.docx,.doc,.xlsx,.xls,.jpg,.jpeg,.png,.heic,.heif';

function validateFile(file: File): UploadFileItem {
  const sizeCheck = validateFileSize(file.size);
  if (!sizeCheck.valid) {
    return { fileName: file.name, file, validationStatus: ValidationStatusEnum.FAILED, failureReason: sizeCheck.reason };
  }

  if (uploadMode.value === UploadModeEnum.SPECIFIED_FORMAT) {
    const nameCheck = validateDocumentName(file.name);
    return {
      fileName: file.name,
      file,
      validationStatus: nameCheck.valid ? ValidationStatusEnum.SUCCESS : ValidationStatusEnum.FAILED,
      failureReason: nameCheck.reason,
    };
  }

  return { fileName: file.name, file, validationStatus: ValidationStatusEnum.SUCCESS };
}

function handleFileAdded(file: File) {
  const item = validateFile(file);
  fileList.value.push(item);
  return false;
}

function handleDeleteFile(index: number) {
  fileList.value.splice(index, 1);
}

async function handleUpload() {
  uploading.value = true;
  try {
    const data = new FormData();
    for (const item of fileList.value) {
      data.append('files', item.file);
    }
    data.append('uploadMode', uploadMode.value);
    if (uploadMode.value === UploadModeEnum.GENERIC) {
      data.append('fileScope', fundScope.value);
      data.append('fundCodes', JSON.stringify(selectedFundCodes.value));
      data.append('classIds', JSON.stringify(selectedClassIds.value));
    }
    if (uploadMode.value === UploadModeEnum.AI_ASSISTED) {
      if (aiFundCode.value) data.append('fundCode', aiFundCode.value);
      if (aiClassId.value) data.append('classId', aiClassId.value);
      if (aiDocType.value) data.append('documentType', aiDocType.value);
    }
    const result = await fundDocumentUpload(data);
    uploadResult.value = result as any;
    failedFiles.value = result.failedFiles ?? [];
    emit('reload');
  } catch (error: any) {
    uploadResult.value = { success: 0, failed: fileList.value.length, total: fileList.value.length };
    failedFiles.value = fileList.value.map((f) => ({ fileName: f.fileName, failureReason: error?.message || 'Upload failed' }));
  } finally {
    uploading.value = false;
  }
  currentStep.value = 2;
}

function handleConfirm() {
  if (currentStep.value === 0) {
    currentStep.value = 1;
    return;
  }
  if (currentStep.value === 1) {
    handleUpload();
    return;
  }
  handleReset();
  modalApi.close();
}

function handleReset() {
  currentStep.value = 0;
  fileList.value = [];
  uploadResult.value = null;
  failedFiles.value = [];
  uploading.value = false;
  uploadMode.value = UploadModeEnum.SPECIFIED_FORMAT;
  fundScope.value = FileScopeEnum.ALL_FUNDS;
  selectedFundCodes.value = [];
  selectedClassIds.value = [];
  aiFundCode.value = undefined;
  aiClassId.value = undefined;
  aiDocType.value = undefined;
  statusFilters.value = {
    [ValidationStatusEnum.NOT_STARTED]: true,
    [ValidationStatusEnum.VALIDATING]: true,
    [ValidationStatusEnum.SUCCESS]: true,
    [ValidationStatusEnum.FAILED]: true,
  };
}

const validationColor = (status: ValidationStatusEnum) => {
  switch (status) {
    case ValidationStatusEnum.NOT_STARTED: return 'inherit';
    case ValidationStatusEnum.VALIDATING: return '#1890ff';
    case ValidationStatusEnum.SUCCESS: return '#52c41a';
    case ValidationStatusEnum.FAILED: return '#ff4d4f';
  }
};

const aiStatusColor = (status?: AiStatusEnum) => {
  switch (status) {
    case AiStatusEnum.NOT_STARTED: return 'inherit';
    case AiStatusEnum.RECOGNIZING: return '#1890ff';
    case AiStatusEnum.SUCCESS: return '#52c41a';
    case AiStatusEnum.FAILED: return '#ff4d4f';
    default: return 'inherit';
  }
};

const fileTableColumns = computed(() => {
  const base = [
    { title: 'File Name', dataIndex: 'fileName', key: 'fileName', ellipsis: true },
    { title: 'Validation Status', key: 'validationStatus', width: 140 },
  ];
  if (uploadMode.value === UploadModeEnum.AI_ASSISTED) {
    base.push(
      { title: 'AI Status', key: 'aiStatus', width: 120 },
      { title: 'Fund Code', key: 'aiFundCode', width: 100 },
      { title: 'Class ID', key: 'aiClassId', width: 100 },
      { title: 'Doc Type', key: 'aiDocumentType', width: 120 },
      { title: 'Language', key: 'aiLanguage', width: 80 },
      { title: 'Date', key: 'aiDate', width: 100 },
    );
  }
  base.push({ title: 'Action', key: 'action', width: 80 });
  return base;
});

const failedColumns = [
  { title: 'File Name', dataIndex: 'fileName', key: 'fileName', ellipsis: true },
  { title: 'Failure Reason', dataIndex: 'failureReason', key: 'failureReason', ellipsis: true },
  { title: 'Operation', key: 'operation', width: 100 },
];
</script>

<template>
  <BasicModal
    :close-on-click-modal="false"
    :confirm-text="currentStep === 2 ? 'Done' : currentStep === 1 ? 'Upload' : 'Next'"
    :cancel-text="currentStep > 0 && currentStep < 2 ? 'Previous' : 'Cancel'"
    :footer="true"
    :ok-button-props="{ disabled: currentStep === 1 && !canUpload }"
    title="Upload Documents"
    class="w-[800px]"
    @confirm="handleConfirm"
    @cancel="
      currentStep > 0 && currentStep < 2
        ? (currentStep--, undefined)
        : (handleReset(), modalApi.close())
    "
  >
    <Steps :current="currentStep" class="mb-6">
      <Step title="Select Mode" />
      <Step title="Upload Files" />
      <Step title="Result" />
    </Steps>

    <!-- Step 0: Select Upload Mode -->
    <div v-if="currentStep === 0" class="space-y-4">
      <FormItem label="Upload Mode">
        <RadioGroup v-model:value="uploadMode" button-style="solid">
          <RadioButton v-for="opt in uploadModeOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </RadioButton>
        </RadioGroup>
      </FormItem>

      <div class="rounded bg-gray-50 p-3 text-sm text-gray-600">
        <template v-if="uploadMode === UploadModeEnum.SPECIFIED_FORMAT">
          Upload according to the specified file format:<br />
          <code class="text-xs">[FundID]-[DocumentType]-[YYYYMMDD]-[eng|chi|sc|uk].pdf</code><br />
          or <code class="text-xs">[FundID]-[ClassID]-[DocumentType]-[YYYYMMDD]-[eng|chi|sc|uk].pdf</code><br />
          Example: <code class="text-xs">VPAF-KFS-chi-20250204.pdf</code>
        </template>
        <template v-else-if="uploadMode === UploadModeEnum.AI_ASSISTED">
          The uploaded file's name is automatically updated to a standard name by AI.
        </template>
        <template v-else>
          Upload generic files (e.g. subscription form, dealing calendar).
        </template>
      </div>

      <!-- AI-Assisted extra fields -->
      <template v-if="uploadMode === UploadModeEnum.AI_ASSISTED">
        <FormItem label="Fund Code">
          <Input v-model:value="aiFundCode" placeholder="e.g. VPAF" />
        </FormItem>
        <FormItem label="Class ID">
          <Input v-model:value="aiClassId" placeholder="Optional" />
        </FormItem>
        <FormItem label="Document Type">
          <Select v-model:value="aiDocType" :options="docTypeOptions" allow-clear show-search option-filter-prop="label" placeholder="Select type" />
        </FormItem>
      </template>

      <!-- Generic extra fields -->
      <template v-if="uploadMode === UploadModeEnum.GENERIC">
        <FormItem label="File Scope">
          <RadioGroup v-model:value="fundScope">
            <RadioButton v-for="opt in scopeOptions" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </RadioButton>
          </RadioGroup>
        </FormItem>
        <FormItem v-if="fundScope === FileScopeEnum.SOME_FUNDS" label="Fund Codes">
          <Select v-model:value="selectedFundCodes" mode="multiple" allow-clear show-search placeholder="Select fund codes" />
        </FormItem>
        <FormItem v-if="fundScope === FileScopeEnum.SOME_CLASSES" label="Fund Codes">
          <Select v-model:value="selectedFundCodes" mode="multiple" allow-clear show-search placeholder="Select fund codes" />
        </FormItem>
        <FormItem v-if="fundScope === FileScopeEnum.SOME_CLASSES && selectedFundCodes.length" label="Class IDs">
          <Select v-model:value="selectedClassIds" mode="multiple" allow-clear show-search placeholder="Select class IDs" />
        </FormItem>
      </template>
    </div>

    <!-- Step 1: Upload Files -->
    <div v-if="currentStep === 1" class="space-y-4">
      <UploadDragger
        :before-upload="(file: File) => { handleFileAdded(file); return false; }"
        :show-upload-list="false"
        :accept="SUPPORTED_EXTENSIONS"
        :multiple="true"
      >
        <p class="ant-upload-drag-icon flex items-center justify-center">
          <InboxOutlined class="size-[48px] text-primary" />
        </p>
        <p>Click or drag file to this area to upload</p>
        <p class="text-gray-400 text-xs">Supported extensions: pdf, docx, doc, xlsx, xls, jpg, jpeg, png, heic, heif</p>
      </UploadDragger>

      <div v-if="!canUpload && fileList.length > 0">
        <Alert type="warning" message="You can only submit when all filenames are in the correct format." show-icon />
      </div>

      <!-- Status filter checkboxes -->
      <div v-if="fileList.length > 0" class="flex flex-wrap gap-3 text-sm">
        <Checkbox v-model:checked="statusFilters[ValidationStatusEnum.NOT_STARTED]">
          Not started ({{ statusCounts[ValidationStatusEnum.NOT_STARTED] }})
        </Checkbox>
        <Checkbox v-model:checked="statusFilters[ValidationStatusEnum.VALIDATING]">
          Validating ({{ statusCounts[ValidationStatusEnum.VALIDATING] }})
        </Checkbox>
        <Checkbox v-model:checked="statusFilters[ValidationStatusEnum.SUCCESS]">
          <span class="text-green-500">Success ({{ statusCounts[ValidationStatusEnum.SUCCESS] }})</span>
        </Checkbox>
        <Checkbox v-model:checked="statusFilters[ValidationStatusEnum.FAILED]">
          <span class="text-red-500">Failed ({{ statusCounts[ValidationStatusEnum.FAILED] }})</span>
        </Checkbox>
      </div>

      <Table
        v-if="filteredFiles.length > 0"
        :columns="fileTableColumns"
        :data-source="filteredFiles"
        row-key="fileName"
        size="small"
        :pagination="false"
        bordered
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'validationStatus'">
            <span :style="{ color: validationColor(record.validationStatus) }">
              {{ record.validationStatus }}
            </span>
          </template>
          <template v-if="column.key === 'aiStatus'">
            <span :style="{ color: aiStatusColor(record.aiStatus) }">
              {{ record.aiStatus ?? '-' }}
            </span>
          </template>
          <template v-if="column.key === 'action'">
            <a class="text-red-500" @click="handleDeleteFile(index)">Delete</a>
          </template>
          <template v-if="column.key === 'aiFundCode'">
            {{ record.aiFundCode ?? '-' }}
          </template>
          <template v-if="column.key === 'aiClassId'">
            {{ record.aiClassId ?? '-' }}
          </template>
          <template v-if="column.key === 'aiDocumentType'">
            {{ record.aiDocumentType ?? '-' }}
          </template>
          <template v-if="column.key === 'aiLanguage'">
            {{ record.aiLanguage ?? '-' }}
          </template>
          <template v-if="column.key === 'aiDate'">
            {{ record.aiDate ?? '-' }}
          </template>
        </template>
      </Table>
    </div>

    <!-- Step 2: Result -->
    <div v-if="currentStep === 2">
      <Spin :spinning="uploading" tip="Uploading...">
        <template v-if="uploadResult">
          <Result
            v-if="uploadResult.failed === 0"
            status="success"
            title="Upload Successful"
            :sub-title="`All ${uploadResult.total} file(s) uploaded successfully.`"
          />
          <Result
            v-else
            status="warning"
            title="Upload Completed with Errors"
          >
            <template #subTitle>
              <span>
                Total <strong>{{ uploadResult.total }}</strong> files.
                <strong class="text-green-500">{{ uploadResult.success }}</strong> succeeded,
                <strong class="text-red-500">{{ uploadResult.failed }}</strong> failed.
              </span>
            </template>
            <template #extra>
              <Table
                v-if="failedFiles.length > 0"
                :columns="failedColumns"
                :data-source="failedFiles"
                row-key="fileName"
                size="small"
                :pagination="false"
                bordered
                class="mt-4 text-left"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.key === 'operation'">
                    <a class="text-blue-500">Re-upload</a>
                  </template>
                </template>
              </Table>
            </template>
          </Result>
        </template>
      </Spin>
    </div>
  </BasicModal>
</template>
