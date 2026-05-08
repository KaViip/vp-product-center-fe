import type { IDS, PageQuery, PageResult } from '#/api/common';
import type { ProductCenterMasterdata, ProductCenterMasterdataQuery } from './model';

import { commonExport, ContentTypeEnum } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  suggestions = '/productcenter/productCenterMasterdata/suggestions',
  export = '/productcenter/productCenterMasterdata/export',
  importData = '/productcenter/productCenterMasterdata/importData',
  importTemplate = '/productcenter/productCenterMasterdata/importTemplate',
  list = '/productcenter/productCenterMasterdata/list',
  root = '/productcenter/productCenterMasterdata',
}

export function productCenterMasterdataList(params?: ProductCenterMasterdataQuery) {
  return alovaInstance.get<PageResult<ProductCenterMasterdata>>(Api.list, { params });
}

export function productCenterMasterdataInfo(fundCode: string) {
  return alovaInstance.get<ProductCenterMasterdata>(`${Api.root}/${fundCode}`);
}

export function productCenterMasterdataAdd(data: Partial<ProductCenterMasterdata>) {
  return alovaInstance.postWithMsg<void>(Api.root, data);
}

export function productCenterMasterdataUpdate(data: Partial<ProductCenterMasterdata>) {
  return alovaInstance.putWithMsg<void>(Api.root, data);
}

export function productCenterMasterdataRemove(fundCodes: IDS) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${fundCodes}`);
}

export function productCenterMasterdataExport(data: Partial<ProductCenterMasterdataQuery>) {
  return commonExport(Api.export, data);
}

export function productCenterMasterdataImportTemplate() {
  return commonExport(Api.importTemplate, {});
}

export function productCenterMasterdataImport(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return alovaInstance.post<{ code: number; msg: string }>(Api.importData, formData, {
    headers: { 'Content-Type': ContentTypeEnum.FORM_DATA },
    isTransformResponse: false,
  });
}

export type MasterdataSuggestionField =
  | 'fundManager'
  | 'subManager'
  | 'investmentAdvisor'
  | 'trusteeAdministrator'
  | 'custodianPrimeBroker'
  | 'subCustodian'
  | 'auditor'
  | 'investmentStrategy';

export function productCenterMasterdataSuggestions(
  field: MasterdataSuggestionField,
  keyword?: string,
  limit = 20,
) {
  return alovaInstance.get<string[]>(Api.suggestions, {
    params: { field, keyword, limit },
  });
}

export function productCenterMasterdataAutocomplete(field: string, keyword: string) {
  return productCenterMasterdataSuggestions(field as MasterdataSuggestionField, keyword);
}

export async function productCenterMasterdataCheckUnique(
  field: string,
  value: string,
  excludeFundCode?: string,
): Promise<string | null> {
  try {
    const result = await productCenterMasterdataList({ pageNum: 1, pageSize: 1, [field]: value });
    const rows = result.rows || [];
    const match = rows.find((r: any) => r[field] === value && r.fundCode !== excludeFundCode);
    return match ? field : null;
  } catch {
    return null;
  }
}
