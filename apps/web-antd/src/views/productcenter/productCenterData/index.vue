<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ProductCenterData } from '#/api/productcenter/productCenterData/model';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { Popconfirm, Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  productCenterDataExport,
  productCenterDataList,
  productCenterDataRemove,
} from '#/api/productcenter/productCenterData';
import { useBlobExport } from '#/utils/file/export';

import { columns, querySchema } from './data';
import fundDetailModal from '../../fund/components/fund-detail-modal.vue';
import productCenterDataModal from './product-center-data-modal.vue';
import productCenterDataImportModal from './product-center-data-import-modal.vue';

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
  pagerConfig: {
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
  },
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await productCenterDataList({
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
    keyField: 'productClassId',
    isHover: true,
  },
  id: 'fund-operational-team-index',
};

function handleCellDblclick({ row }: { row: ProductCenterData }) {
  handleDetail(row);
}

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [ProductCenterDataFormDrawer, productCenterDataModalApi] = useVbenDrawer({
  connectedComponent: productCenterDataModal,
});

const [FundDetailModal, fundDetailModalApi] = useVbenModal({
  connectedComponent: fundDetailModal,
});

const [ProductCenterDataImportDrawer, productCenterDataImportModalApi] = useVbenDrawer({
  connectedComponent: productCenterDataImportModal,
});

function handleAdd() {
  productCenterDataModalApi.setData({});
  productCenterDataModalApi.open();
}

function handleEdit(row: ProductCenterData) {
  productCenterDataModalApi.setData({ productClassId: row.productClassId });
  productCenterDataModalApi.open();
}

async function handleDelete(row: ProductCenterData) {
  await productCenterDataRemove([row.productClassId!]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: ProductCenterData) => row.productClassId);
  window.modal.confirm({
    title: 'Confirm',
    okType: 'danger',
    content: `Are you sure you want to delete ${ids.length} selected record(s)?`,
    onOk: async () => {
      await productCenterDataRemove(ids);
      await tableApi.query();
    },
  });
}

function handleCopy(row: ProductCenterData) {
  productCenterDataModalApi.setData({ productClassId: row.productClassId, isCopy: true });
  productCenterDataModalApi.open();
}

function handleDetail(row: ProductCenterData) {
  fundDetailModalApi.setData({ shareClassId: row.productClassId, activeTab: 'operational' });
  fundDetailModalApi.open();
}

function handleImport() {
  productCenterDataImportModalApi.open();
}

const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(productCenterDataExport);

async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
    const fileName = buildExportFileName('ProductCenterDataInfo');
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
        <Tag :color="statusColorMap[row.fundClassStatus] || 'default'">
          {{ row.fundClassStatus }}
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
    <ProductCenterDataFormDrawer @reload="tableApi.query()" />
    <FundDetailModal />
    <ProductCenterDataImportDrawer @reload="tableApi.query()" />
  </Page>
</template>
