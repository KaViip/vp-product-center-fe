import type { FundDocument, UploadResult } from './model/fund-documents';
import type { ID, PageQuery, PageResult } from '#/api/common';

import { alovaInstance } from '#/utils/http';

enum Api {
  detail = '/product-center/fund/documents/detail',
  download = '/product-center/fund/documents/download',
  list = '/product-center/fund/documents/list',
  reUpload = '/product-center/fund/documents/re-upload',
  root = '/product-center/fund/documents',
  upload = '/product-center/fund/documents/upload',
  validate = '/product-center/fund/documents/upload/validate',
}

export function fundDocumentList(params?: PageQuery) {
  return alovaInstance.get<PageResult<FundDocument>>(Api.list, { params });
}

export function fundDocumentDetail(id: ID) {
  return alovaInstance.get<FundDocument>(`${Api.detail}/${id}`);
}

export function fundDocumentUpload(data: FormData) {
  return alovaInstance.post<UploadResult>(Api.upload, data, {
    isTransformResponse: false,
  });
}

export function fundDocumentValidate(data: FormData) {
  return alovaInstance.post<{ valid: boolean; reason?: string }>(
    Api.validate,
    data,
    { isTransformResponse: false },
  );
}

export function fundDocumentDownload(id: ID) {
  return alovaInstance.get<Blob>(`${Api.download}/${id}`, {
    responseType: 'blob',
    isTransformResponse: false,
  });
}

export function fundDocumentReUpload(data: FormData) {
  return alovaInstance.post<UploadResult>(Api.reUpload, data, {
    isTransformResponse: false,
  });
}
