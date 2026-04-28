import type { FundProduct, ImportResult } from './model/fund-product';
import type { IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport, ContentTypeEnum } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  autocomplete = '/productcenter/productCenterMasterdata/autocomplete',
  root = '/productcenter/productCenterMasterdata',
  export = '/productcenter/productCenterMasterdata/export',
  import = '/productcenter/productCenterMasterdata/import',
  importTemplate = '/productcenter/productCenterMasterdata/importTemplate',
  list = '/productcenter/productCenterMasterdata/list',
}

export function fundProductList(params?: PageQuery) {
  return alovaInstance.get<PageResult<FundProduct>>(Api.list, { params });
}

export function fundProductGet(fundCode: string) {
  return alovaInstance.get<FundProduct>(`${Api.root}/${fundCode}`);
}

export function fundProductAdd(data: Partial<FundProduct>) {
  return alovaInstance.postWithMsg<void>(Api.root, data);
}

export function fundProductUpdate(data: Partial<FundProduct>) {
  return alovaInstance.putWithMsg<void>(Api.root, data);
}

export function fundProductRemove(fundCodes: IDS) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${fundCodes}`);
}

export function fundProductExport(data: Partial<FundProduct>) {
  return commonExport(Api.export, data);
}

export function fundProductImport(data: FormData) {
  return alovaInstance.post<ImportResult>(Api.import, data, {
    headers: { 'Content-Type': ContentTypeEnum.FORM_DATA },
    isTransformResponse: false,
  });
}

export function fundProductDownloadTemplate() {
  return alovaInstance.post<Blob>(Api.importTemplate, {}, {
    isTransformResponse: false,
    responseType: 'blob',
  });
}

export function fundProductAutocomplete(field: string, keyword: string) {
  return alovaInstance.get<string[]>(Api.autocomplete, {
    params: { field, keyword },
  });
}

/**
 * Mock: Check uniqueness for Fund Code / Fund Name fields.
 * TODO: Replace with real API endpoint when backend is ready.
 * Returns the field name that conflicts, or null if unique.
 */
export async function fundProductCheckUnique(
  field: string,
  value: string,
  excludeId?: number,
): Promise<string | null> {
  // Mock implementation: query list and check
  // In production, this should be a dedicated API: GET /product-center/fund/product/check-unique?field=xxx&value=xxx&excludeId=xxx
  try {
    const result = await fundProductList({ pageNum: 1, pageSize: 1, [field]: value });
    const rows = result.rows || [];
    const match = rows.find((r: any) => r[field] === value && r.id !== excludeId);
    return match ? field : null;
  } catch {
    return null;
  }
}
