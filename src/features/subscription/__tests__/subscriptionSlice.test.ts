import reducer, {
  showPaywall,
  hidePaywall,
  setSubscription,
  resetPurchaseStatus,
  resetRestoreStatus,
  purchaseSubscription,
  purchaseLifetime,
} from '../subscriptionSlice';
import { SubscriptionTier, PurchaseType } from '../types';

const INIT = { type: '@@INIT' } as any;

describe('subscriptionSlice — NSL1V6SAB-18: free tier defaults', () => {
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

describe('subscriptionSlice — paywall actions', () => {
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

describe('subscriptionSlice — setSubscription', () => {
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

  it('updates subscription to LIFETIME with isLifetime true', () => {
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

describe('subscriptionSlice — resetPurchaseStatus', () => {
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

describe('subscriptionSlice — resetRestoreStatus', () => {
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

describe('subscriptionSlice — NSL1V6SAB-19: purchaseSubscription thunk', () => {
  const monthlySub = {
    tier: SubscriptionTier.MONTHLY,
    expiresAt: '2026-07-10T00:00:00.000Z',
    isLifetime: false,
    purchaseType: PurchaseType.APP_STORE,
  };

  it('sets purchaseStatus to purchasing when pending', () => {
    const state = reducer(undefined, purchaseSubscription.pending('', 'MONTHLY', undefined));
    expect(state.purchaseStatus).toBe('purchasing');
    expect(state.error).toBeNull();
  });

  it('updates subscription and closes paywall when fulfilled with MONTHLY', () => {
    let state = reducer(undefined, showPaywall());
    state = reducer(state, purchaseSubscription.fulfilled(monthlySub, '', 'MONTHLY'));
    expect(state.purchaseStatus).toBe('success');
    expect(state.subscription.tier).toBe(SubscriptionTier.MONTHLY);
    expect(state.paywallVisible).toBe(false);
  });

  it('updates subscription tier to ANNUAL when fulfilled with ANNUAL', () => {
    const annualSub = { ...monthlySub, tier: SubscriptionTier.ANNUAL };
    const state = reducer(undefined, purchaseSubscription.fulfilled(annualSub, '', 'ANNUAL'));
    expect(state.subscription.tier).toBe(SubscriptionTier.ANNUAL);
  });

  it('sets error status and message when purchase rejected', () => {
    const state = reducer(
      undefined,
      purchaseSubscription.rejected(new Error('Purchase cancelled by user'), '', 'MONTHLY')
    );
    expect(state.purchaseStatus).toBe('error');
    expect(state.error).toBe('Purchase cancelled by user');
  });

  it('clears previous error when purchase is re-attempted (pending)', () => {
    const errorState = reducer(
      undefined,
      purchaseSubscription.rejected(new Error('network error'), '', 'MONTHLY')
    );
    const retryState = reducer(errorState, purchaseSubscription.pending('', 'MONTHLY', undefined));
    expect(retryState.error).toBeNull();
    expect(retryState.purchaseStatus).toBe('purchasing');
  });
});

describe('subscriptionSlice — NSL1V6SAB-20: purchaseLifetime thunk', () => {
  const lifetimeSub = {
    tier: SubscriptionTier.LIFETIME,
    expiresAt: null,
    isLifetime: true,
    purchaseType: PurchaseType.APP_STORE,
  };

  it('sets purchaseStatus to purchasing when pending', () => {
    const state = reducer(undefined, purchaseLifetime.pending('', undefined, undefined));
    expect(state.purchaseStatus).toBe('purchasing');
    expect(state.error).toBeNull();
  });

  it('sets LIFETIME tier, isLifetime=true, expiresAt=null on fulfilled', () => {
    let state = reducer(undefined, showPaywall());
    state = reducer(state, purchaseLifetime.fulfilled(lifetimeSub, '', undefined));
    expect(state.purchaseStatus).toBe('success');
    expect(state.subscription.tier).toBe(SubscriptionTier.LIFETIME);
    expect(state.subscription.isLifetime).toBe(true);
    expect(state.subscription.expiresAt).toBeNull();
  });

  it('closes paywall after successful lifetime purchase', () => {
    let state = reducer(undefined, showPaywall());
    state = reducer(state, purchaseLifetime.fulfilled(lifetimeSub, '', undefined));
    expect(state.paywallVisible).toBe(false);
  });

  it('sets error status when lifetime purchase rejected', () => {
    const state = reducer(
      undefined,
      purchaseLifetime.rejected(new Error('Payment declined'), '', undefined)
    );
    expect(state.purchaseStatus).toBe('error');
    expect(state.error).toBe('Payment declined');
  });
});
