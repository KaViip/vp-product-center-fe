import type { ShareClass } from '#/api/product-center/model/fund-operational';

import { describe, expect, it } from 'vitest';

import {
  ClassStatusEnum,
  CurrencyEnum,
} from '#/api/product-center/model/fund-operational';
import {
  FundTypeEnum,
  YesNoEnum,
} from '#/api/product-center/model/fund-product';

describe('ShareClass Interface Compliance', () => {
  it('should accept a complete ShareClass object', () => {
    const shareClass: ShareClass = {
      id: '1',
      fundCode: 'VPAF',
      fundNameEn: 'Value Partners Classic Fund',
      fundNameTc: '惠理價值基金',
      fundNameSc: '惠理价值基金',
      fundType: FundTypeEnum.SFC_AUTHORIZED_UT,
      fundManager: 'VPHK',
      fundManagerLei: '549300XOEKQXQNHWA818',
      classStatus: ClassStatusEnum.ACTIVE,
      shareClassNameEn: 'Class D Units USD',
      shareClassNameTc: 'D單位美元',
      shareClassNameSc: 'D單位美元',
      classCurrency: CurrencyEnum.USD,
      vpfsClassId: 'DUSD',
      endOfIopDate: '2025-02-21',
      launchDate: '2025-02-24',
      isinCode: 'HK0001047114',
      morningstarFundId: 'FSUSA08DY0',
      morningstarSecId: 'F00001MIT3',
      cusip: 'TBC',
      valorCode: 'TBC',
      lipperCode: '68820971',
      bloombergTicker: 'VLPACDU HK Equity',
      bbgIdEquity: 'BBG01P490BB2',
      dealingFrequency: 'Daily',
      unitPrecision: '4 dp',
      navPrecision: '2 dp',
      dealingCutOff: 'Daily 17:00 HKT',
      businessDayDefinition: 'Hong Kong Business Day',
      businessCalendar: 'Hong Kong',
      subscriptionSettlement: 'Within 3 business days after dealing day',
      redemptionSettlement: '4 Business days after dealing day',
      minimumInitialSubscription: 'USD 10,000',
      minimumSubsequentSubscription: 'USD 5,000',
      minimumRedemption: '-',
      minimumHolding: 'USD 10,000',
      redemptionCharge: 'Currently waived',
      managementFee: 0.015,
      performanceFee: 0,
      financialYearEnd: '31-December',
      contractNoteDeliveryDay: '2',
      pricingMethodology: 'MTM',
      valuationFrequency: 'Daily',
      valuationDeliveryTime: 'T+1',
      securityLending: YesNoEnum.N,
      hedged: YesNoEnum.N,
      hedgingCurrency: 'N/A',
      uploadTime: '2026-01-28T16:59:48.033',
      uploadBy: 'pittwong',
    };

    expect(shareClass.fundCode).toBe('VPAF');
    expect(shareClass.shareClassNameEn).toBe('Class D Units USD');
    expect(shareClass.classCurrency).toBe(CurrencyEnum.USD);
    expect(shareClass.vpfsClassId).toBe('DUSD');
    expect(shareClass.managementFee).toBe(0.015);
  });

  it('should accept a minimal ShareClass object with only required fields', () => {
    const shareClass: ShareClass = {
      fundCode: 'VPAF',
      shareClassNameEn: 'Class A Units',
      vpfsClassId: 'A',
    };

    expect(shareClass.fundCode).toBe('VPAF');
    expect(shareClass.shareClassNameEn).toBe('Class A Units');
    expect(shareClass.vpfsClassId).toBe('A');
    expect(shareClass.id).toBeUndefined();
    expect(shareClass.classStatus).toBeUndefined();
  });

  it('should allow optional fields to be undefined', () => {
    const shareClass: ShareClass = {
      fundCode: 'VPAF',
      shareClassNameEn: 'Class B Units',
      vpfsClassId: 'B',
    };

    expect(shareClass.launchDate).toBeUndefined();
    expect(shareClass.isinCode).toBeUndefined();
    expect(shareClass.bloombergTicker).toBeUndefined();
    expect(shareClass.hedgingCurrency).toBeUndefined();
  });

  it('should accept enum values for status, currency, and yes/no fields', () => {
    const shareClass: ShareClass = {
      fundCode: 'VPGB',
      shareClassNameEn: 'Class C Units',
      vpfsClassId: 'C',
      classStatus: ClassStatusEnum.ACTIVE,
      classCurrency: CurrencyEnum.HKD,
      securityLending: YesNoEnum.Y,
      hedged: YesNoEnum.N,
    };

    expect(shareClass.classStatus).toBe('Active');
    expect(shareClass.classCurrency).toBe('HKD');
    expect(shareClass.securityLending).toBe('Y');
    expect(shareClass.hedged).toBe('N');
  });
});
