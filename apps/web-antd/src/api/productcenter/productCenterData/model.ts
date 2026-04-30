import type { PageQuery } from '#/api/common';

export interface ProductCenterData {
  productClassId?: number;
  fundCode: string;
  vpfsClassId: string;
  fundManager?: string;
  fundManagerLei?: string;
  fundType?: string;
  fundNameEn?: string;
  fundNameTc?: string;
  fundNameSc?: string;
  fundNameChinese?: string;
  fundClassStatus?: string;
  fundName?: string;
  shareClassNameEnOfficialName: string;
  shareClassNameTcOfficialName?: string;
  shareClassNameScOfficialName?: string;
  classCurrency?: string;
  launchDate?: string;
  endOfIopDate?: string;
  stockCode?: string;
  isinCode?: string;
  cusip?: string;
  bloombergTicker?: string;
  bbgIdEquity?: string;
  sedol?: string;
  valorCode?: string;
  lipperCode?: string;
  morningstarFundId?: string;
  morningstarSecId?: string;
  morningstarPerformanceId?: string;
  dealingFrequency?: string;
  distributionPolicy?: string;
  unitPrecision?: string;
  navPrecision?: string;
  dealingCutOff?: string;
  valuationPoint?: string;
  cutoffTime?: string;
  businessDayDefinition?: string;
  businessCalendar?: string;
  subscriptionSettlement?: string;
  redemptionSettlement?: string;
  minimumInitialSubscription?: string;
  minimumSubsequentSubscription?: string;
  minimumRedemption?: string;
  minimumHolding?: string;
  redemptionCharge?: string;
  managementFee?: number;
  performanceFee?: number;
  ter?: number;
  terDate?: string;
  financialYearEnd?: string;
  contractNoteDeliveryDay?: string;
  pricingMethodology?: string;
  valuationFrequency?: string;
  valuationDeliveryTime?: string;
  securityLending?: string;
  hedged?: string;
  hedgingCurrency?: string;
  createTime?: string;
  uploadTime?: string;
  uploadBy?: string;
}

export interface ProductCenterDataQuery extends PageQuery {
  fundCode?: string;
  vpfsClassId?: string;
  fundManager?: string;
  fundType?: string;
  fundName?: string;
  shareClassNameEn?: string;
  shareClassNameTc?: string;
  shareClassNameSc?: string;
  classCurrency?: string;
  fundClassStatus?: string;
}

export interface ImportResult {
  totalCount: number;
  addedCount: number;
  updatedCount: number;
  failedCount: number;
  failureDetails?: ImportFailureDetail[];
}

export interface ImportFailureDetail {
  rowIndex: number;
  failureReason: string;
  rowData: Record<string, any>;
}

export enum ClassStatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  TERMINATED = 'Terminated',
}

export enum CurrencyEnum {
  EUR = 'EUR',
  HKD = 'HKD',
  CNH = 'CNH',
  SGD = 'SGD',
  USD = 'USD',
  CHF = 'CHF',
  GBP = 'GBP',
  AUD = 'AUD',
  CAD = 'CAD',
  NZD = 'NZD',
  CNY = 'CNY',
  RMB = 'RMB',
  JPY = 'JPY',
}
