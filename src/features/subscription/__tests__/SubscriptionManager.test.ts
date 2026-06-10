import { SubscriptionManager } from '../SubscriptionManager';
import { SubscriptionTier, PurchaseType } from '../types';

describe('SubscriptionManager', () => {
  let manager: SubscriptionManager;

  beforeEach(() => {
    manager = new SubscriptionManager();
  });

  describe('getPaywallProducts', () => {
    it('returns both MONTHLY and ANNUAL products', async () => {
      const products = await manager.getPaywallProducts();
      expect(products).toHaveLength(2);
      const plans = products.map(p => p.plan);
      expect(plans).toContain('MONTHLY');
      expect(plans).toContain('ANNUAL');
    });

    it('each product has required fields', async () => {
      const products = await manager.getPaywallProducts();
      products.forEach(p => {
        expect(p.id).toBeTruthy();
        expect(p.price).toBeTruthy();
        expect(p.title).toBeTruthy();
        expect(p.priceAmountMicros).toBeGreaterThan(0);
        expect(p.currencyCode).toBe('USD');
      });
    });

    it('annual price is cheaper per month than monthly', async () => {
      const products = await manager.getPaywallProducts();
      const monthly = products.find(p => p.plan === 'MONTHLY')!;
      const annual = products.find(p => p.plan === 'ANNUAL')!;
      expect(annual.priceAmountMicros).toBeLessThan(monthly.priceAmountMicros * 12);
    });
  });

  describe('purchaseSubscription', () => {
    it('returns MONTHLY tier for MONTHLY plan', async () => {
      const result = await manager.purchaseSubscription('MONTHLY');
      expect(result.tier).toBe(SubscriptionTier.MONTHLY);
      expect(result.isLifetime).toBe(false);
      expect(result.purchaseType).toBe(PurchaseType.APP_STORE);
    });

    it('returns ANNUAL tier for ANNUAL plan', async () => {
      const result = await manager.purchaseSubscription('ANNUAL');
      expect(result.tier).toBe(SubscriptionTier.ANNUAL);
      expect(result.isLifetime).toBe(false);
      expect(result.purchaseType).toBe(PurchaseType.APP_STORE);
    });

    it('MONTHLY subscription expiresAt is ~1 month out', async () => {
      const before = Date.now();
      const result = await manager.purchaseSubscription('MONTHLY');
      const expiresMs = new Date(result.expiresAt!).getTime();
      const diffDays = (expiresMs - before) / 86400000;
      expect(diffDays).toBeGreaterThan(27);
      expect(diffDays).toBeLessThan(33);
    });

    it('ANNUAL subscription expiresAt is ~1 year out', async () => {
      const before = Date.now();
      const result = await manager.purchaseSubscription('ANNUAL');
      const expiresMs = new Date(result.expiresAt!).getTime();
      const diffDays = (expiresMs - before) / 86400000;
      expect(diffDays).toBeGreaterThan(364);
      expect(diffDays).toBeLessThan(367);
    });

    it('expiresAt is a valid ISO date string', async () => {
      const result = await manager.purchaseSubscription('MONTHLY');
      expect(result.expiresAt).toBeTruthy();
      expect(new Date(result.expiresAt!).toISOString()).toBe(result.expiresAt);
    });
  });
});
