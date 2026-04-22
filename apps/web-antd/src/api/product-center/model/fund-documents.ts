/**
 * Fund Documents 数据模型
 * 对应需求文档: Fund → Documents
 */

/** 文档记录 */
export interface FundDocument {
  /** 系统ID */
  id?: string;
  /** Fund Code */
  fundCode: string;
  /** Fund Name (EN) */
  fundNameEn?: string;
  /** Class ID (Class级别文档时有值) */
  classId?: string;
  /** Class Name (EN) */
  classNameEn?: string;
  /** 文档类型 */
  documentType: DocumentTypeEnum;
  /** 文档日期 */
  documentDate: string;
  /** 语言 */
  language: LanguageEnum;
  /** 文件名 */
  fileName: string;
  /** 文件路径/URL */
  filePath: string;
  /** 文件大小(bytes) */
  fileSize?: number;
  /** 上传人 */
  uploadBy?: string;
  /** 上传时间 */
  uploadTime?: string;
  /** 版本号 */
  version?: number;
}

/** 文档类型枚举 */
export enum DocumentTypeEnum {
  FACT_SHEET = 'Fact Sheet',
  KFS = 'KFS',
  MONTHLY_REPORT = 'Monthly Report',
  QUARTERLY_COMMENTARY = 'Quarterly Commentary',
  PRODUCT_LEAFLET = 'Product Leaflet',
  ANNUAL_REPORTS = 'Annual Reports',
  INTERIM_REPORTS = 'Interim Reports',
  PRODUCT_KEY_FACTS_KIID = 'Product Key Facts/KIID',
  PROSPECTUS = 'Prospectus',
  EXPLANATORY_MEMORANDUM = 'Explanatory Memorandum',
  ADDENDUM_PROSPECTUS = 'Addendum Prospectus',
  ADDENDUM_MEMORANDUM = 'Addendum Memorandum',
  SUPPLEMENT = 'Supplement',
  INVESTOR_NOTICES = 'Investor Notices',
  SUBSCRIPTION_FORM = 'Subscription Form',
  ACCOUNT_OPENING_FORM = 'Account Opening Form',
  SUBSEQUENT_SUBSCRIPTION_FORM = 'Subsequent Subscription Form',
  SWITCHING_FORM = 'Switching Form',
  REDEMPTION_FORM = 'Redemption Form',
  CHANGE_OF_DETAILS = 'Change of Details',
  KYC_REQUIREMENT = 'KYC Requirement for Investor',
  ACCOUNT_OPENING_GUIDE = 'Account Opening Guide',
  DEALING_CALENDAR = 'Dealing Calendar',
  REPORTABLE_INCOME = 'Reportable Income',
}

/** 语言枚举 */
export enum LanguageEnum {
  EN = 'eng',
  CHI = 'chi',
  SC = 'sc',
  UK = 'uk',
}

/** 上传模式 */
export enum UploadModeEnum {
  SPECIFIED_FORMAT = 'Specified File Format',
  AI_ASSISTED = 'AI-Assisted',
  GENERIC = 'Generic files',
}

/** 文件作用域 */
export enum FileScopeEnum {
  ALL_FUNDS = 'All funds',
  SOME_FUNDS = 'Some funds',
  SOME_CLASSES = 'Some classes',
}

/** 文件校验状态 */
export enum ValidationStatusEnum {
  NOT_STARTED = 'Not started',
  VALIDATING = 'Validating',
  SUCCESS = 'Success',
  FAILED = 'Failed',
}

/** AI识别状态 */
export enum AiStatusEnum {
  NOT_STARTED = 'Not started',
  RECOGNIZING = 'Recognizing',
  SUCCESS = 'Success',
  FAILED = 'Failed',
}

/** 上传文件项 */
export interface UploadFileItem {
  /** 原始文件名 */
  fileName: string;
  /** 文件对象 */
  file: File;
  /** 校验状态 */
  validationStatus: ValidationStatusEnum;
  /** 校验失败原因 */
  failureReason?: string;
  /** AI状态 (AI-Assisted模式) */
  aiStatus?: AiStatusEnum;
  /** AI识别的Fund Code */
  aiFundCode?: string;
  /** AI识别的Class ID */
  aiClassId?: string;
  /** AI识别的Document Type */
  aiDocumentType?: string;
  /** AI识别的语言 */
  aiLanguage?: string;
  /** AI识别的日期 */
  aiDate?: string;
}

/** 上传结果 */
export interface UploadResult {
  totalCount: number;
  successCount: number;
  failedCount: number;
  failedFiles?: UploadFailureDetail[];
}

/** 上传失败明细 */
export interface UploadFailureDetail {
  fileName: string;
  failureReason: string;
}
