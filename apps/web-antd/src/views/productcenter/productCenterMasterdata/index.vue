<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ProductCenterMasterdata } from '#/api/productcenter/productCenterMasterdata/model';

import { Page, useVbenDrawer, useVbenModal } from '@vben/common-ui';

import { Popconfirm, Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  productCenterMasterdataExport,
  productCenterMasterdataList,
  productCenterMasterdataRemove,
} from '#/api/productcenter/productCenterMasterdata';
import { useBlobExport } from '#/utils/file/export';

import { columns, querySchema } from './data';
import fundDetailModal from '../../fund/components/fund-detail-modal.vue';
import productCenterMasterdataModal from './product-center-masterdata-modal.vue';
import productCenterMasterdataImportModal from './product-center-masterdata-import-modal.vue';

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
        return await productCenterMasterdataList({
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
    keyField: 'fundCode',
    isHover: true,
  },
  id: 'fund-product-team-index',
};

function handleCellDblclick({ row }: { row: ProductCenterMasterdata }) {
  handleDetail(row);
}

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});

const [FundFormDrawer, productCenterMasterdataModalApi] = useVbenDrawer({
  connectedComponent: productCenterMasterdataModal,
});

const [FundDetailModal, fundDetailModalApi] = useVbenModal({
  connectedComponent: fundDetailModal,
});

const [FundImportDrawer, productCenterMasterdataImportModalApi] = useVbenDrawer({
  connectedComponent: productCenterMasterdataImportModal,
});

function handleAdd() {
  productCenterMasterdataModalApi.setData({});
  productCenterMasterdataModalApi.open();
}

function handleEdit(row: ProductCenterMasterdata) {
  productCenterMasterdataModalApi.setData({ fundCode: row.fundCode });
  productCenterMasterdataModalApi.open();
}

async function handleDelete(row: ProductCenterMasterdata) {
  await productCenterMasterdataRemove([row.fundCode]);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const fundCodes = rows.map((row: ProductCenterMasterdata) => row.fundCode);
  window.modal.confirm({
    title: 'Confirm',
    okType: 'danger',
    content: `Are you sure you want to delete ${fundCodes.length} selected record(s)?`,
    onOk: async () => {
      await productCenterMasterdataRemove(fundCodes);
      await tableApi.query();
    },
  });
}

function handleCopy(row: ProductCenterMasterdata) {
  productCenterMasterdataModalApi.setData({ fundCode: row.fundCode, isCopy: true });
  productCenterMasterdataModalApi.open();
}

function handleDetail(row: ProductCenterMasterdata) {
  fundDetailModalApi.setData({ fundId: row.fundCode, activeTab: 'product' });
  fundDetailModalApi.open();
}

function handleImport() {
  productCenterMasterdataImportModalApi.open();
}

const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(productCenterMasterdataExport);

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
