<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ProductCenterMasterdata } from '#/api/productcenter/productCenterMasterdata/model';

import { watch } from 'vue';

import { Page, useVbenDrawer } from '@vben/common-ui';

import { Popconfirm, Space, Tag } from 'antdv-next';

import { $t } from '#/locales';
import { useI18n } from '@vben/locales';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import {
  productCenterMasterdataExport,
  productCenterMasterdataList,
  productCenterMasterdataRemove,
} from '#/api/productcenter/productCenterMasterdata';
import { useBlobExport } from '#/utils/file/export';

import { getColumns, querySchema } from './data';
import productCenterDetailDrawer from '../product-center-detail-drawer.vue';
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
  columns: getColumns(),
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

// 切換語言時刷新列表表頭
const { locale } = useI18n();
watch(locale, () => {
  (tableApi.grid as any).reloadColumn(getColumns());
});

const [FundFormDrawer, productCenterMasterdataModalApi] = useVbenDrawer({
  connectedComponent: productCenterMasterdataModal,
});

const [ProductCenterDetailDrawer, productCenterDetailDrawerApi] = useVbenDrawer({
  connectedComponent: productCenterDetailDrawer,
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
    title: $t('pages.common.tip'),
    okType: 'danger',
    content: $t('pages.common.confirmDelete', [fundCodes.length]),
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
  productCenterDetailDrawerApi.setData({ fundCode: row.fundCode });
  productCenterDetailDrawerApi.open();
}

function handleImport() {
  productCenterMasterdataImportModalApi.open();
}

const { exportBlob, exportLoading, buildExportFileName } =
  useBlobExport(productCenterMasterdataExport);

async function handleExport() {
  const rows = tableApi.grid.getCheckboxRecords();
  const fileName = buildExportFileName('FundInfo');
  if (rows.length > 0) {
    // 勾選了行 → 確認後按主鍵導出
    const fundCodes = rows.map((row: ProductCenterMasterdata) => row.fundCode);
    window.modal.confirm({
      title: $t('pages.common.tip'),
      content: $t('pages.common.confirmExportSelected', [fundCodes.length]),
      onOk: async () => {
        exportBlob({ data: { fundCodes }, fileName });
      },
    });
  } else {
    // 未勾選 → 確認後按搜索條件導出全部
    window.modal.confirm({
      title: $t('pages.common.tip'),
      content: $t('pages.common.confirmExportAll'),
      onOk: async () => {
        const formValues = await tableApi.formApi.getValues();
        exportBlob({ data: formValues, fileName });
      },
    });
  }
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
    <BasicTable :table-title="$t('pages.productCenter.productTeamTitle')" @cell-dblclick="handleCellDblclick">
      <template #toolbar-tools>
        <Space>
          <a-button type="primary" @click="handleAdd">
            {{ $t('pages.common.add') }}
          </a-button>
          <a-button @click="handleImport">
            {{ $t('pages.common.import') }}
          </a-button>
          <a-button
            :loading="exportLoading"
            :disabled="exportLoading"
            @click="handleExport"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
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
            {{ $t('pages.common.detail') }}
          </action-button>
          <action-button @click.stop="handleEdit(row)">
            {{ $t('pages.common.edit') }}
          </action-button>
          <action-button @click.stop="handleCopy(row)">
            {{ $t('pages.common.copy') }}
          </action-button>
          <Popconfirm
            placement="left"
            :title="$t('pages.common.confirmDeleteSingle')"
            @confirm="handleDelete(row)"
          >
            <action-button danger @click.stop="">
              {{ $t('pages.common.delete') }}
            </action-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <FundFormDrawer @reload="tableApi.query()" />
    <ProductCenterDetailDrawer />
    <FundImportDrawer @reload="tableApi.query()" />
  </Page>
</template>
