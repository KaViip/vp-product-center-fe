import { describe, expect, it } from 'vitest';

import type { FundProduct } from '#/api/product-center/model/fund-product';

import { FundStatusEnum, FundTypeEnum, InstrumentTypeEnum, MarketFocusEnum } from '#/api/product-center/model/fund-product';

describe('FundProduct interface compliance', () => {
  it('should accept a valid FundProduct object', () => {
    const fund: FundProduct = {
      fundCode: 'VPAF',
      fundNameEn: 'Value Partners Classic Fund',
      fundNameTc: '惠理價值基金',
      fundNameSc: '惠理价值基金',
      fundType: FundTypeEnum.SFC_AUTHORIZED_UT,
      domicileJurisdiction: 'HK',
      baseCurrency: 'HKD',
      fundStatus: FundStatusEnum.ACTIVE,
      launchDate: '1993-04-06',
      fundManager: 'VPHK',
      fundManagerLei: '549300XOEKQXQNHWA818',
      primaryInstrumentType: InstrumentTypeEnum.EQUITY,
      investmentMarketFocus: MarketFocusEnum.ASIA_PACIFIC,
      investmentObjective: 'Long-term capital appreciation',
      investmentStrategy: 'Value investing across Asian markets',
      assetAllocationTable: 'Equity: 90%, Cash: 10%',
      hedgingPolicyFund: 'N/A' as any,
    };

    expect(fund.fundCode).toBe('VPAF');
    expect(fund.fundType).toBe(FundTypeEnum.SFC_AUTHORIZED_UT);
    expect(fund.launchDate).toBe('1993-04-06');
  });

  it('should allow optional fields to be undefined', () => {
    const minimalFund: FundProduct = {
      fundCode: 'TEST',
      fundNameEn: 'Test Fund',
      fundNameTc: '測試基金',
      fundNameSc: '测试基金',
      fundType: FundTypeEnum.SFC_AUTHORIZED_UT,
      launchDate: '2024-01-01',
      fundManager: 'VPHK',
      fundManagerLei: 'TEST_LEI',
      primaryInstrumentType: InstrumentTypeEnum.EQUITY,
      investmentMarketFocus: MarketFocusEnum.GLOBAL,
      investmentObjective: 'Growth',
      investmentStrategy: 'Balanced',
      assetAllocationTable: 'Equity: 80%',
      hedgingPolicyFund: 'N/A' as any,
    };

    expect(minimalFund.id).toBeUndefined();
    expect(minimalFund.umbrellaOfcName).toBeUndefined();
    expect(minimalFund.riskRating).toBeUndefined();
  });
});
