import { SubscriptionManager } from '../SubscriptionManager';
import { SubscriptionTier, PurchaseType } from '../types';

describe('SubscriptionManager', () => {
  let manager: SubscriptionManager;

  beforeEach(() => {
    manager = new SubscriptionManager();
  });

  describe('getPaywallProducts', () => {
    it('returns MONTHLY, ANNUAL and LIFETIME products', async () => {
      const products = await manager.getPaywallProducts();
      expect(products).toHaveLength(3);
      const plans = products.map(p => p.plan);
      expect(plans).toContain('MONTHLY');
      expect(plans).toContain('ANNUAL');
      expect(plans).toContain('LIFETIME');
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

    it('LIFETIME product is priced at $39.99', async () => {
      const products = await manager.getPaywallProducts();
      const lifetime = products.find(p => p.plan === 'LIFETIME')!;
      expect(lifetime.price).toBe('$39.99');
      expect(lifetime.priceAmountMicros).toBe(39990000);
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

  describe('purchaseLifetime — NSL1V6SAB-20', () => {
    it('returns LIFETIME tier', async () => {
      const result = await manager.purchaseLifetime();
      expect(result.tier).toBe(SubscriptionTier.LIFETIME);
    });

    it('sets isLifetime to true', async () => {
      const result = await manager.purchaseLifetime();
      expect(result.isLifetime).toBe(true);
    });

    it('expiresAt is null (lifetime never expires)', async () => {
      const result = await manager.purchaseLifetime();
      expect(result.expiresAt).toBeNull();
    });

    it('purchaseType is APP_STORE', async () => {
      const result = await manager.purchaseLifetime();
      expect(result.purchaseType).toBe(PurchaseType.APP_STORE);
    });
  });
});
