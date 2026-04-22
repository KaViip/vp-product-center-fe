import { describe, expect, it } from 'vitest';

import {
  FundStatusEnum,
  FundTypeEnum,
  HedgingPolicyEnum,
  InstrumentTypeEnum,
  MarketFocusEnum,
  RiskRatingEnum,
} from '#/api/product-center/model/fund-product';

describe('FundTypeEnum', () => {
  it('should contain all expected fund types', () => {
    expect(FundTypeEnum.SFC_AUTHORIZED_UT).toBe('SFC Authorized Fund（UT）');
    expect(FundTypeEnum.SFC_AUTHORIZED_OFC).toBe('SFC Authorized Fund（OFC）');
    expect(FundTypeEnum.PRIVATE_CAYMAN).toBe('Private Fund（Cayman）');
    expect(FundTypeEnum.ADVISORY_OFFSHORE).toBe('Investment Advisory（Offshore）');
  });

  it('should have 9 fund types', () => {
    expect(Object.keys(FundTypeEnum)).toHaveLength(9);
  });
});

describe('FundStatusEnum', () => {
  it('should contain 4 statuses', () => {
    expect(FundStatusEnum.IN_OFFERING).toBe('In Offering');
    expect(FundStatusEnum.ACTIVE).toBe('Active');
    expect(FundStatusEnum.IN_LIQUIDATION).toBe('In Liquidation');
    expect(FundStatusEnum.LIQUIDATED).toBe('Liquidated');
  });
});

describe('InstrumentTypeEnum', () => {
  it('should contain 7 instrument types', () => {
    expect(Object.keys(InstrumentTypeEnum)).toHaveLength(7);
  });

  it('should have equity and fixed income', () => {
    expect(InstrumentTypeEnum.EQUITY).toBe('Equity');
    expect(InstrumentTypeEnum.FIXED_INCOME).toBe('Fixed Income');
    expect(InstrumentTypeEnum.MONEY_MARKET).toBe('Money Market (Liquidity)');
  });
});

describe('MarketFocusEnum', () => {
  it('should have 5 market focus options', () => {
    expect(Object.keys(MarketFocusEnum)).toHaveLength(5);
    expect(MarketFocusEnum.GLOBAL).toBe('Global');
    expect(MarketFocusEnum.ASIA_PACIFIC).toBe('Asia Pacific');
  });
});

describe('HedgingPolicyEnum', () => {
  it('should have 3 options', () => {
    expect(Object.keys(HedgingPolicyEnum)).toHaveLength(3);
    expect(HedgingPolicyEnum.HEDGE_TO_BASE).toBe('Hedge to Base Currency');
    expect(HedgingPolicyEnum.NA).toBe('N/A');
  });
});

describe('RiskRatingEnum', () => {
  it('should be numeric 1-5', () => {
    expect(RiskRatingEnum.LEVEL_1).toBe(1);
    expect(RiskRatingEnum.LEVEL_5).toBe(5);
    expect(Object.keys(RiskRatingEnum).filter((k) => Number.isNaN(Number(k)))).toHaveLength(5);
  });
});
