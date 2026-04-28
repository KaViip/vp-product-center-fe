/**
 * Fund Operational Team 数据模型
 * 对应需求文档: Fund → Operational Team (BR02)
 * 对应数据库表: tbl_product_center_data
 */

import type { FundTypeEnum, YesNoEnum } from './fund-product';

/** Share Class 数据 (Operational Team 维护) */
export interface ShareClass {
  /** 系统ID */
  id?: string;
  /** Backend PK */
  productClassId?: number;
  /** VPFS Fund ID */
  fundCode: string;
  /** 基金名称(EN) */
  fundNameEn?: string;
  /** 基金名称(TC) */
  fundNameTc?: string;
  /** 基金名称(SC) */
  fundNameSc?: string;
  /** 基金中文名 */
  fundNameChinese?: string;
  /** 基金类型 */
  fundType?: FundTypeEnum;
  /** 基金经理 */
  fundManager?: string;
  /** 基金经理LEI */
  fundManagerLei?: string;
  /** Share Class状态 */
  fundClassStatus?: ClassStatusEnum;
  /** 份额类别名称(EN) Official Name */
  shareClassNameEnOfficialName: string;
  /** 份额类别名称(TC) Official Name */
  shareClassNameTcOfficialName?: string;
  /** 份额类别名称(SC) Official Name */
  shareClassNameScOfficialName?: string;
  /** Class Currency */
  classCurrency?: CurrencyEnum;
  /** VPFS Class ID */
  vpfsClassId: string;
  /** IOP截止日期 */
  endOfIopDate?: string;
  /** 成立日期 */
  launchDate?: string;
  /** 股票代码 */
  stockCode?: string;
  /** ISIN代码 */
  isinCode?: string;
  /** Morningstar Fund ID */
  morningstarFundId?: string;
  /** Morningstar Sec ID */
  morningstarSecId?: string;
  /** Morningstar Performance ID */
  morningstarPerformanceId?: string;
  /** CUSIP */
  cusip?: string;
  /** Valor Code */
  valorCode?: string;
  /** Lipper Code */
  lipperCode?: string;
  /** Bloomberg Ticker */
  bloombergTicker?: string;
  /** BBG ID Equity */
  bbgIdEquity?: string;
  /** SEDOL */
  sedol?: string;
  /** 交易频率 */
  dealingFrequency?: string;
  /** 分红政策 */
  distributionPolicy?: string;
  /** 单位精度 */
  unitPrecision?: string;
  /** NAV精度 */
  navPrecision?: string;
  /** 交易截止时间 */
  dealingCutOff?: string;
  /** 营业日定义 */
  businessDayDefinition?: string;
  /** 营业日历 */
  businessCalendar?: string;
  /** 申购结算 */
  subscriptionSettlement?: string;
  /** 赎回结算 */
  redemptionSettlement?: string;
  /** 最低初始申购 */
  minimumInitialSubscription?: string;
  /** 最低后续申购 */
  minimumSubsequentSubscription?: string;
  /** 最低赎回 */
  minimumRedemption?: string;
  /** 最低持有 */
  minimumHolding?: string;
  /** 赎回费用 */
  redemptionCharge?: string;
  /** 管理费 */
  managementFee?: number;
  /** 业绩费 */
  performanceFee?: number;
  /** TER */
  ter?: number;
  /** 财年截止 */
  financialYearEnd?: string;
  /** 合同通知交付日 */
  contractNoteDeliveryDay?: string;
  /** 估值方法 */
  pricingMethodology?: string;
  /** 估值时点 */
  valuationPoint?: string;
  /** 估值频率 */
  valuationFrequency?: string;
  /** 估值交付时间 */
  valuationDeliveryTime?: string;
  /** 证券借贷 */
  securityLending?: boolean;
  /** 是否对冲 */
  hedged?: boolean;
  /** 对冲货币 */
  hedgingCurrency?: string;
  /** 创建时间 */
  createTime?: string;
  /** 上传时间 */
  uploadTime?: string;
  /** 上传人 */
  uploadBy?: string;
}

/** Class Status 枚举 */
export enum ClassStatusEnum {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  TERMINATED = 'Terminated',
}

/** Currency 枚举 */
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
