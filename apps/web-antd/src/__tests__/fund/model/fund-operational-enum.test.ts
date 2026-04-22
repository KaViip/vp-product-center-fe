import { describe, expect, it } from 'vitest';

import { ClassStatusEnum, CurrencyEnum } from '#/api/product-center/model/fund-operational';

describe('ClassStatusEnum', () => {
  it('should have correct status values', () => {
    expect(ClassStatusEnum.ACTIVE).toBe('Active');
    expect(ClassStatusEnum.INACTIVE).toBe('Inactive');
    expect(ClassStatusEnum.TERMINATED).toBe('Terminated');
  });

  it('should have exactly 3 status values', () => {
    expect(Object.keys(ClassStatusEnum)).toHaveLength(3);
  });
});

describe('CurrencyEnum', () => {
  it('should have correct currency codes', () => {
    expect(CurrencyEnum.EUR).toBe('EUR');
    expect(CurrencyEnum.HKD).toBe('HKD');
    expect(CurrencyEnum.CNH).toBe('CNH');
    expect(CurrencyEnum.SGD).toBe('SGD');
    expect(CurrencyEnum.USD).toBe('USD');
    expect(CurrencyEnum.CHF).toBe('CHF');
    expect(CurrencyEnum.GBP).toBe('GBP');
    expect(CurrencyEnum.AUD).toBe('AUD');
    expect(CurrencyEnum.CAD).toBe('CAD');
    expect(CurrencyEnum.NZD).toBe('NZD');
    expect(CurrencyEnum.CNY).toBe('CNY');
    expect(CurrencyEnum.RMB).toBe('RMB');
    expect(CurrencyEnum.JPY).toBe('JPY');
  });

  it('should have exactly 13 currency codes', () => {
    expect(Object.keys(CurrencyEnum)).toHaveLength(13);
  });

  it('all values should be 3-letter codes', () => {
    const values = Object.values(CurrencyEnum);
    for (const val of values) {
      expect(val).toHaveLength(3);
    }
  });
});
