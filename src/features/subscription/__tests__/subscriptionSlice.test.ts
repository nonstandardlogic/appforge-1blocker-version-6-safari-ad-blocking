import reducer, {
  showPaywall,
  hidePaywall,
  setSubscription,
  resetPurchaseStatus,
  resetRestoreStatus,
} from '../subscriptionSlice';
import { SubscriptionTier, PurchaseType } from '../types';

const INIT = { type: '@@INIT' } as any;

describe('subscriptionSlice', () => {
  describe('initial state', () => {
    it('defaults to FREE tier', () => {
      const state = reducer(undefined, INIT);
      expect(state.subscription.tier).toBe(SubscriptionTier.FREE);
    });

    it('defaults expiresAt to null', () => {
      const state = reducer(undefined, INIT);
      expect(state.subscription.expiresAt).toBeNull();
    });

    it('defaults isLifetime to false', () => {
      const state = reducer(undefined, INIT);
      expect(state.subscription.isLifetime).toBe(false);
    });

    it('defaults purchaseType to null', () => {
      const state = reducer(undefined, INIT);
      expect(state.subscription.purchaseType).toBeNull();
    });

    it('starts with paywall hidden', () => {
      const state = reducer(undefined, INIT);
      expect(state.paywallVisible).toBe(false);
    });

    it('starts with purchaseStatus idle', () => {
      const state = reducer(undefined, INIT);
      expect(state.purchaseStatus).toBe('idle');
    });
  });

  describe('paywall actions', () => {
    it('showPaywall sets paywallVisible true', () => {
      const state = reducer(undefined, showPaywall());
      expect(state.paywallVisible).toBe(true);
    });

    it('hidePaywall sets paywallVisible false after showPaywall', () => {
      let state = reducer(undefined, showPaywall());
      state = reducer(state, hidePaywall());
      expect(state.paywallVisible).toBe(false);
    });
  });

  describe('setSubscription', () => {
    it('updates subscription tier to MONTHLY', () => {
      const newSub = {
        tier: SubscriptionTier.MONTHLY,
        expiresAt: '2026-07-10T00:00:00.000Z',
        isLifetime: false,
        purchaseType: PurchaseType.APP_STORE,
      };
      const state = reducer(undefined, setSubscription(newSub));
      expect(state.subscription.tier).toBe(SubscriptionTier.MONTHLY);
      expect(state.subscription.expiresAt).toBe('2026-07-10T00:00:00.000Z');
      expect(state.subscription.purchaseType).toBe(PurchaseType.APP_STORE);
    });

    it('updates subscription tier to LIFETIME with isLifetime true', () => {
      const newSub = {
        tier: SubscriptionTier.LIFETIME,
        expiresAt: null,
        isLifetime: true,
        purchaseType: PurchaseType.APP_STORE,
      };
      const state = reducer(undefined, setSubscription(newSub));
      expect(state.subscription.tier).toBe(SubscriptionTier.LIFETIME);
      expect(state.subscription.isLifetime).toBe(true);
    });
  });

  describe('resetPurchaseStatus', () => {
    it('resets purchaseStatus to idle and clears error', () => {
      const preState = {
        subscription: { tier: SubscriptionTier.FREE, expiresAt: null, isLifetime: false, purchaseType: null },
        paywallVisible: false,
        purchaseStatus: 'error' as const,
        restoreStatus: 'idle' as const,
        error: 'Purchase failed',
      };
      const state = reducer(preState, resetPurchaseStatus());
      expect(state.purchaseStatus).toBe('idle');
      expect(state.error).toBeNull();
    });
  });

  describe('resetRestoreStatus', () => {
    it('resets restoreStatus to idle and clears error', () => {
      const preState = {
        subscription: { tier: SubscriptionTier.FREE, expiresAt: null, isLifetime: false, purchaseType: null },
        paywallVisible: false,
        purchaseStatus: 'idle' as const,
        restoreStatus: 'error' as const,
        error: 'Restore failed',
      };
      const state = reducer(preState, resetRestoreStatus());
      expect(state.restoreStatus).toBe('idle');
      expect(state.error).toBeNull();
    });
  });
});
