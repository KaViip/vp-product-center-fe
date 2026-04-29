import type { IDS, PageQuery, PageResult } from '#/api/common';
import type { ImportResult, ProductCenterData, ProductCenterDataQuery } from './model';

import { commonExport, ContentTypeEnum } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  classList = '/productcenter/productCenterData/class-list',
  export = '/productcenter/productCenterData/export',
  importData = '/productcenter/productCenterData/importData',
  importTemplate = '/productcenter/productCenterData/importTemplate',
  list = '/productcenter/productCenterData/list',
  root = '/productcenter/productCenterData',
}

export function productCenterDataList(params?: ProductCenterDataQuery) {
  return alovaInstance.get<PageResult<ProductCenterData>>(Api.list, { params });
}

export function productCenterDataInfo(productClassId: string | number) {
  return alovaInstance.get<ProductCenterData>(`${Api.root}/${productClassId}`);
}

export function productCenterDataAdd(data: Partial<ProductCenterData>) {
  return alovaInstance.postWithMsg<void>(Api.root, data);
}

export function productCenterDataUpdate(data: Partial<ProductCenterData>) {
  return alovaInstance.putWithMsg<void>(Api.root, data);
}

export function productCenterDataRemove(productClassIds: IDS) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${productClassIds}`);
}

export function productCenterDataExport(data: Partial<ProductCenterDataQuery>) {
  return commonExport(Api.export, data);
}

export function productCenterDataImportTemplate() {
  return commonExport(Api.importTemplate, {});
}

export function productCenterDataImport(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return alovaInstance.post<ImportResult>(Api.importData, formData, {
    headers: { 'Content-Type': ContentTypeEnum.FORM_DATA },
    isTransformResponse: false,
  });
}

export function getClassListByFundCode(fundCode: string) {
  return alovaInstance.get<ProductCenterData[]>(`${Api.classList}/${fundCode}`);
}

export async function productCenterDataCheckUnique(
  fundCode: string,
  shareClassNameEn: string,
  vpfsClassId: string,
  excludeProductClassId?: number,
): Promise<boolean> {
  try {
    const result = await productCenterDataList({ pageNum: 1, pageSize: 1, fundCode, shareClassNameEn, vpfsClassId });
    const rows = result.rows || [];
    const match = rows.find((r: any) => r.productClassId !== excludeProductClassId);
    return !match;
  } catch {
    return true;
  }
}
