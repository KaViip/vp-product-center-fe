<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { FundProduct } from '#/api/product-center/model/fund-product';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { Popconfirm, Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  fundProductExport,
  fundProductList,
  fundProductRemove,
} from '#/api/product-center';
import { useBlobExport } from '#/utils/file/export';

import { columns, querySchema } from './data';
import fundDetailModal from './fund-detail-modal.vue';
import fundFormDrawer from './fund-form-drawer.vue';
import fundImportDrawer from './fund-import-drawer.vue';

const formOptions: VbenFormProps = {
  schema: querySchema(),
  commonConfig: {
    labelWidth: 130,
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
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await fundProductList({
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
  id: 'fund-product-team-index',
};

function handleCellDblclick({ row }: { row: FundProduct }) {
  handleDetail(row);
}

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [FundFormDrawer, fundFormDrawerApi] = useVbenDrawer({
  connectedComponent: fundFormDrawer,
});

const [FundDetailModal, fundDetailModalApi] = useVbenModal({
  connectedComponent: fundDetailModal,
});

const [FundImportDrawer, fundImportDrawerApi] = useVbenDrawer({
  connectedComponent: fundImportDrawer,
});

function handleAdd() {
  fundFormDrawerApi.setData({});
  fundFormDrawerApi.open();
}

function handleEdit(row: FundProduct) {
  fundFormDrawerApi.setData({ id: row.id });
  fundFormDrawerApi.open();
}

async function handleDelete(row: FundProduct) {
  await fundProductRemove([row.id!]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: FundProduct) => row.id);
  window.modal.confirm({
    title: 'Confirm',
    okType: 'danger',
    content: `Are you sure you want to delete ${ids.length} selected record(s)?`,
    onOk: async () => {
      await fundProductRemove(ids);
      await tableApi.query();
    },
  });
}

function handleCopy(row: FundProduct) {
  fundFormDrawerApi.setData({ id: row.id, isCopy: true });
  fundFormDrawerApi.open();
}

function handleDetail(row: FundProduct) {
  fundDetailModalApi.setData({ id: row.id });
  fundDetailModalApi.open();
}

function handleImport() {
  fundImportDrawerApi.open();
}

const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(fundProductExport);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
    const fileName = buildExportFileName('FundInfo');
  exportBlob({ data: formValues, fileName });
}

const statusColorMap: Record<string, string> = {
  Active: 'green',
  'In Offering': 'blue',
  'In Liquidation': 'orange',
  Liquidated: 'red',
};
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="Fund - Product Team" @cell-dblclick="handleCellDblclick">
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
        <Tag :color="statusColorMap[row.fundStatus] || 'default'">
          {{ row.fundStatus }}
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
            title="Are you sure to delete this fund?"
            @confirm="handleDelete(row)"
          >
            <action-button danger @click.stop="">
              Delete
            </action-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <FundFormDrawer @reload="tableApi.query()" />
    <FundDetailModal />
    <FundImportDrawer @reload="tableApi.query()" />
  </Page>
</template>
