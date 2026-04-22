import type { FundProduct, ImportResult } from './model/fund-product';
import type { ID, IDS, PageQuery, PageResult } from '#/api/common';

import { commonExport, ContentTypeEnum } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  autocomplete = '/product-center/fund/product/autocomplete',
  root = '/product-center/fund/product',
  export = '/product-center/fund/product/export',
  import = '/product-center/fund/product/import',
  importTemplate = '/product-center/fund/product/importTemplate',
  list = '/product-center/fund/product/list',
}

export function fundProductList(params?: PageQuery) {
  return alovaInstance.get<PageResult<FundProduct>>(Api.list, { params });
}

export function fundProductGet(id: ID) {
  return alovaInstance.get<FundProduct>(`${Api.root}/${id}`);
}

export function fundProductAdd(data: Partial<FundProduct>) {
  return alovaInstance.postWithMsg<void>(Api.root, data);
}

export function fundProductUpdate(data: Partial<FundProduct>) {
  return alovaInstance.putWithMsg<void>(Api.root, data);
}

export function fundProductRemove(ids: IDS) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${ids}`);
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
