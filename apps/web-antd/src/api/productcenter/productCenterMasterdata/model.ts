import type { PageQuery } from '#/api/common';

export interface ProductCenterMasterdata {
  fundCode: string;
  fundId?: number;
  fundNameEn?: string;
  fundNameTc?: string;
  fundNameSc?: string;
  fundNameChinese?: string;
  fundType?: string;
  umbrellaOfcName?: string;
  subFundCode?: string;
  domicileJurisdiction?: string;
  primaryRegulator?: string;
  baseCurrency?: string;
  fundStatus?: string;
  launchDate?: string;
  complexProduct?: boolean;
  professionalInvestorsOnly?: boolean;
  fundManager?: string;
  fundManagerLei?: string;
  primaryInstrumentType?: string;
  investmentObjective?: string;
  benchmark?: string;
  leverageRatioMax?: number;
  derivativesRatioMax?: number;
  borrowingLimit?: number;
  stopLossLimit?: number;
  stopLossAlert?: number;
  riskLevel?: number;
  createTime?: string;
  applicationSubmissionDate?: string;
  authorizationDate?: string;
  iopStartDate?: string;
  operationStartDate?: string;
  listingDate?: string;
  terminationDate?: string;
  giinNumber?: string;
  leiNumber?: string;
  restrictionInvestorNationality?: string;
  restrictionInvestorResidency?: string;
  countryAvailableForSale?: string;
  subManager?: string;
  investmentAdvisor?: string;
  trusteeAdministrator?: string;
  custodianPrimeBroker?: string;
  subCustodian?: string;
  auditor?: string;
  passiveOrActiveFund?: string;
  morningstarCategory?: string;
  investmentMarketFocus?: string;
  investmentStrategy?: string;
  assetAllocationTable?: string;
  hedgingPolicyFund?: string;
  benchmarkCode?: string;
  regionDictCodes?: number[];
  uploadTime?: string;
  uploadBy?: string;
}

export interface ProductCenterMasterdataQuery extends PageQuery {
  fundCode?: string;
  fundId?: string | number;
  fundNameEn?: string;
  fundNameTc?: string;
  fundNameSc?: string;
  fundNameTcSc?: string;
  fundNameChinese?: string;
  fundType?: string;
  baseCurrency?: string;
  fundStatus?: string;
  fundManager?: string;
  restrictionInvestorNationality?: string;
  restrictionInvestorResidency?: string;
  regionDictCodes?: number[];
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

export enum FundStatusEnum {
  IN_OFFERING = 'In Offering',
  ACTIVE = 'Active',
  IN_LIQUIDATION = 'In Liquidation',
  LIQUIDATED = 'Liquidated',
}

export enum InstrumentTypeEnum {
  ALTERNATIVE = 'Alternative (Private) Assets',
  COMMODITIES = 'Commodities',
  DIGITAL_ASSETS = 'Digital Assets',
  EQUITY = 'Equity',
  FIXED_INCOME = 'Fixed Income',
  MONEY_MARKET = 'Money Market (Liquidity)',
  MULTI_ASSETS = 'Multi-Assets',
}

export enum ActivePassiveEnum {
  ACTIVE = 'Active',
  PASSIVE = 'Passive',
}

export enum MarketFocusEnum {
  AMERICA = 'America',
  ASIA_PACIFIC = 'Asia Pacific',
  EMERGING_MARKETS = 'Emerging Markets',
  EUROPE = 'Europe',
  GLOBAL = 'Global',
}

export enum HedgingPolicyEnum {
  HEDGE_TO_BASE = 'Hedge to Base Currency',
  OPTIONAL = 'Optional',
  NA = 'N/A',
}
