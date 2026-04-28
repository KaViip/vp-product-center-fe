import type { ImportResult } from './model/fund-product';
import type { ShareClass } from './model/fund-operational';
import type { IDS, PageQuery, PageResult } from '#/api/common';

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

export function shareClassList(params?: PageQuery) {
  return alovaInstance.get<PageResult<ShareClass>>(Api.list, { params });
}

export function shareClassGet(productClassId: number) {
  return alovaInstance.get<ShareClass>(`${Api.root}/${productClassId}`);
}

export function shareClassAdd(data: Partial<ShareClass>) {
  return alovaInstance.postWithMsg<void>(Api.root, data);
}

export function shareClassUpdate(data: Partial<ShareClass>) {
  return alovaInstance.putWithMsg<void>(Api.root, data);
}

export function shareClassRemove(productClassIds: IDS) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${productClassIds}`);
}

export function shareClassExport(data: Partial<ShareClass>) {
  return commonExport(Api.export, data);
}

export function shareClassImport(data: FormData) {
  return alovaInstance.post<ImportResult>(Api.importData, data, {
    headers: { 'Content-Type': ContentTypeEnum.FORM_DATA },
    isTransformResponse: false,
  });
}

export function shareClassDownloadTemplate() {
  return alovaInstance.post<Blob>(Api.importTemplate, {}, {
    isTransformResponse: false,
    responseType: 'blob',
  });
}

export function getClassListByFundCode(fundCode: string) {
  return alovaInstance.get<ShareClass[]>(`${Api.classList}/${fundCode}`);
}

/**
 * Mock: Check composite uniqueness (Fund Code + Share Class Name EN + VPFS Class ID).
 * TODO: Replace with real API when backend is ready.
 */
export async function shareClassCheckUnique(
  fundCode: string,
  shareClassNameEn: string,
  vpfsClassId: string,
  excludeId?: number,
): Promise<boolean> {
  try {
    const result = await shareClassList({ pageNum: 1, pageSize: 1, fundCode, shareClassNameEn, vpfsClassId });
    const rows = result.rows || [];
    const match = rows.find((r: any) => r.id !== excludeId);
    return !match;
  } catch {
    return true;
  }
}
