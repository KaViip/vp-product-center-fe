<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ShareClass } from '#/api/product-center/model/fund-operational';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { Popconfirm, Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  shareClassExport,
  shareClassList,
  shareClassRemove,
} from '#/api/product-center';
import { useBlobExport } from '#/utils/file/export';

import { columns, querySchema } from './data';
import shareClassDetailModal from './share-class-detail-modal.vue';
import shareClassFormDrawer from './share-class-form-drawer.vue';
import shareClassImportModal from './share-class-import-modal.vue';

const formOptions: VbenFormProps = {
  schema: querySchema(),
  commonConfig: {
    labelWidth: 200,
    componentProps: {
      allowClear: true,
    },
  },
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
  handleReset: async () => {
    const { formApi, reload } = tableApi;
    await formApi.resetForm();
    const formValues = formApi.form.values;
    formApi.setLatestSubmissionValues(formValues);
    await reload(formValues);
  },
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
    trigger: 'default',
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await shareClassList({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  headerCellConfig: {
    height: 44,
  },
  cellConfig: {
    height: 48,
  },
  rowConfig: {
    keyField: 'id',
    isHover: true,
  },
  id: 'fund-operational-team-index',
};

function handleCellDblclick({ row }: { row: ShareClass }) {
  handleDetail(row);
}

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [ShareClassFormDrawer, shareClassFormDrawerApi] = useVbenDrawer({
  connectedComponent: shareClassFormDrawer,
});

const [ShareClassDetailModal, shareClassDetailModalApi] = useVbenModal({
  connectedComponent: shareClassDetailModal,
});

const [ShareClassImportModal, shareClassImportModalApi] = useVbenModal({
  connectedComponent: shareClassImportModal,
});

function handleAdd() {
  shareClassFormDrawerApi.setData({});
  shareClassFormDrawerApi.open();
}

function handleEdit(row: ShareClass) {
  shareClassFormDrawerApi.setData({ id: row.id });
  shareClassFormDrawerApi.open();
}

async function handleDelete(row: ShareClass) {
  await shareClassRemove([row.id!]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: ShareClass) => row.id);
  window.modal.confirm({
    title: 'Confirm',
    okType: 'danger',
    content: `Are you sure you want to delete ${ids.length} selected record(s)?`,
    onOk: async () => {
      await shareClassRemove(ids);
      await tableApi.query();
    },
  });
}

function handleCopy(row: ShareClass) {
  shareClassFormDrawerApi.setData({ id: row.id, isCopy: true });
  shareClassFormDrawerApi.open();
}

function handleDetail(row: ShareClass) {
  shareClassDetailModalApi.setData({ id: row.id });
  shareClassDetailModalApi.open();
}

function handleImport() {
  shareClassImportModalApi.open();
}

const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(shareClassExport);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('Share_Class_Operational_Team');
  exportBlob({ data: formValues, fileName });
}

const statusColorMap: Record<string, string> = {
  Active: 'green',
  Inactive: 'orange',
  Terminated: 'red',
};
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="Fund - Operational Team" @cell-dblclick="handleCellDblclick">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" @click="handleAdd">
            Add
          </a-button>
          <a-button @click="handleImport">
            Import
          </a-button>
          <a-button
            :loading="exportLoading"
            :disabled="exportLoading"
            @click="handleExport"
          >
            Export
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            @click="handleMultiDelete"
          >
            Delete
          </a-button>
        </Space>
      </template>
      <template #status="{ row }">
        <Tag :color="statusColorMap[row.classStatus] || 'default'">
          {{ row.classStatus }}
        </Tag>
      </template>
      <template #action="{ row }">
        <Space>
          <action-button @click.stop="handleDetail(row)">
            Detail
          </action-button>
          <action-button @click.stop="handleEdit(row)">
            Edit
          </action-button>
          <action-button @click.stop="handleCopy(row)">
            Copy
          </action-button>
          <Popconfirm
            placement="left"
            title="Are you sure to delete this share class?"
            @confirm="handleDelete(row)"
          >
            <action-button danger @click.stop="">
              Delete
            </action-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <ShareClassFormDrawer @reload="tableApi.query()" />
    <ShareClassDetailModal />
    <ShareClassImportModal @reload="tableApi.query()" />
  </Page>
</template>
