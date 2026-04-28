/**
 * Fund Product Team 数据模型
 * 对应需求文档: Fund → Product Team (BR01)
 * 对应数据库表: tbl_product_center_masterData
 */

/** 基金主数据 (Product Team 维护) */
export interface FundProduct {
  /** 系统生成唯一标识（前端内部使用） */
  id?: string;
  /** VPFS Fund Code (primary key) */
  fundCode: string;
  /** 系统生成唯一标识 */
  fundId?: number;
  /** 英文基金名称 */
  fundNameEn: string;
  /** 繁体中文基金名称 */
  fundNameTc: string;
  /** 简体中文基金名称 */
  fundNameSc: string;
  /** 基金类型 */
  fundType: FundTypeEnum;
  /** 伞型基金/OFC名称 */
  umbrellaOfcName?: string;
  /** 子基金代码 */
  subFundCode?: string;
  /** 注册地/管辖权 (ISO 3166-1 2字母国家代码) */
  domicileJurisdiction?: string;
  /** 主要监管机构 */
  primaryRegulator?: string;
  /** 基础货币 (ISO 4217 3字母货币代码) */
  baseCurrency?: string;
  /** 基金状态 */
  fundStatus?: FundStatusEnum;
  /** 成立日期 */
  launchDate: string;
  /** 是否复杂产品 */
  complexProduct?: boolean;
  /** 仅限专业投资者 */
  professionalInvestorsOnly?: boolean;
  /** 基金经理 */
  fundManager: string;
  /** 基金经理LEI */
  fundManagerLei: string;
  /** 主要工具类型 */
  primaryInstrumentType: InstrumentTypeEnum;
  /** 投资目标 */
  investmentObjective: string;
  /** 基准 */
  benchmark?: string;
  /** 最大杠杆比率 */
  leverageRatioMax?: number;
  /** 最大衍生品比率 */
  derivativesRatioMax?: number;
  /** 借款限制(%) */
  borrowingLimit?: number;
  /** 止损限制(%) */
  stopLossLimit?: number;
  /** 止损预警(%) */
  stopLossAlert?: number;
  /** 风险评级 (1-5) */
  riskLevel?: number;
  /** 创建时间 */
  createTime?: string;

  // -- 以下字段后端暂未返回，表单保留但提交时可能为 null --
  /** 申请提交日期 */
  applicationSubmissionDate?: string;
  /** 授权日期 */
  authorizationDate?: string;
  /** 首次发行期开始日期 */
  iopStartDate?: string;
  /** 运营开始日期 */
  operationStartDate?: string;
  /** 上市日期 */
  listingDate?: string;
  /** 终止日期 */
  terminationDate?: string;
  /** GIIN编号 */
  giinNumber?: string;
  /** LEI编号 */
  leiNumber?: string;
  /** 投资者国籍限制 */
  restrictionInvestorNationality?: string;
  /** 投资者居住地限制 */
  restrictionInvestorResidency?: string;
  /** 副经理 */
  subManager?: string;
  /** 投资顾问 */
  investmentAdvisor?: string;
  /** 托管人/行政管理人 */
  trusteeAdministrator?: string;
  /** 托管银行/主要经纪商 */
  custodianPrimeBroker?: string;
  /** 副托管人 */
  subCustodian?: string;
  /** 审计师 */
  auditor?: string;
  /** 主动/被动基金 */
  passiveOrActiveFund?: ActivePassiveEnum;
  /** 晨星类别 */
  morningstarCategory?: string;
  /** 投资市场焦点 */
  investmentMarketFocus: MarketFocusEnum;
  /** 投资策略 */
  investmentStrategy: string;
  /** 资产配置表 */
  assetAllocationTable: string;
  /** 对冲政策 */
  hedgingPolicyFund: HedgingPolicyEnum;
  /** 基准代码 */
  benchmarkCode?: string;
  /** 境外注册状态 - 各国家/地区 Y/N */
  registrationUs?: string;
  registrationSingapore?: string;
  registrationMacau?: string;
  registrationTaiwan?: string;
  registrationSwitzerland?: string;
  registrationUk?: string;
  registrationGermany?: string;
  registrationItaly?: string;
  registrationSpain?: string;
  registrationFrance?: string;
  registrationIreland?: string;
  registrationSweden?: string;
  registrationFinland?: string;
  registrationDenmark?: string;
  registrationNorway?: string;
  registrationNetherlands?: string;
  registrationLuxembourg?: string;
  registrationCaymanIslands?: string;
  registrationPrc?: string;
  registrationHongKong?: string;
  registrationJapan?: string;
  registrationMalaysia?: string;
  /** 上传时间 */
  uploadTime?: string;
  /** 上传人 */
  uploadBy?: string;
}

/** Fund Type 枚举 */
export enum FundTypeEnum {
  SFC_AUTHORIZED_UT = 'SFC Authorized Fund（UT）',
  SFC_AUTHORIZED_OFC = 'SFC Authorized Fund（OFC）',
  SFC_AUTHORIZED_CAYMAN = 'SFC Authorized Fund（Cayman）',
  SFC_AUTHORIZED_ICAV = 'SFC Authorized Fund（ICAV）',
  PRIVATE_CAYMAN = 'Private Fund（Cayman）',
  PRIVATE_MAINLAND = 'Private Fund（Chinese Mainland）',
  ADVISORY_OFFSHORE = 'Investment Advisory（Offshore）',
  ADVISORY_MAINLAND = 'Investment Advisory（Chinese Mainland）',
  OTHER_MUTUAL = 'Other Mutual Fund',
}

/** Fund Status 枚举 */
export enum FundStatusEnum {
  IN_OFFERING = 'In Offering',
  ACTIVE = 'Active',
  IN_LIQUIDATION = 'In Liquidation',
  LIQUIDATED = 'Liquidated',
}

/** Yes/No 枚举 */
export enum YesNoEnum {
  Y = 'Y',
  N = 'N',
}

/** Primary Instrument Type 枚举 */
export enum InstrumentTypeEnum {
  ALTERNATIVE = 'Alternative (Private) Assets',
  COMMODITIES = 'Commodities',
  DIGITAL_ASSETS = 'Digital Assets',
  EQUITY = 'Equity',
  FIXED_INCOME = 'Fixed Income',
  MONEY_MARKET = 'Money Market (Liquidity)',
  MULTI_ASSETS = 'Multi-Assets',
}

/** Active/Passive 枚举 */
export enum ActivePassiveEnum {
  ACTIVE = 'Active',
  PASSIVE = 'Passive',
}

/** Investment Market Focus 枚举 */
export enum MarketFocusEnum {
  AMERICA = 'America',
  ASIA_PACIFIC = 'Asia Pacific',
  EMERGING_MARKETS = 'Emerging Markets',
  EUROPE = 'Europe',
  GLOBAL = 'Global',
}

/** Hedging Policy 枚举 */
export enum HedgingPolicyEnum {
  HEDGE_TO_BASE = 'Hedge to Base Currency',
  OPTIONAL = 'Optional',
  NA = 'N/A',
}

/** Risk Rating 枚举 */
export enum RiskRatingEnum {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
}

/** 导入模式 */
export enum ImportModeEnum {
  ADD = 'add data',
  UPDATE = 'update data',
  ADD_UPDATE = 'add and update data',
}

/** 导入结果 */
export interface ImportResult {
  totalCount: number;
  addedCount: number;
  updatedCount: number;
  failedCount: number;
  failureDetails?: ImportFailureDetail[];
}

/** 导入失败明细 */
export interface ImportFailureDetail {
  rowIndex: number;
  failureReason: string;
  rowData: Record<string, any>;
}
