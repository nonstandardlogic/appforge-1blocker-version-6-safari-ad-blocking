import { PaywallProduct, UserSubscription, SubscriptionTier, PurchaseType } from './types';

export class SubscriptionManager {
  async getPaywallProducts(): Promise<PaywallProduct[]> {
    return [
      {
        id: 'com.1blocker.monthly',
        plan: 'MONTHLY',
        price: '$2.99',
        priceAmountMicros: 2990000,
        currencyCode: 'USD',
        title: '1Blocker Premium Monthly',
        description: 'Full access to all premium features',
      },
      {
        id: 'com.1blocker.annual',
        plan: 'ANNUAL',
        price: '$19.99',
        priceAmountMicros: 19990000,
        currencyCode: 'USD',
        title: '1Blocker Premium Annual',
        description: 'Full access to all premium features — save 44%',
      },
    ];
  }

  async purchaseSubscription(plan: 'MONTHLY' | 'ANNUAL'): Promise<UserSubscription> {
    const now = new Date();
    const expiresAt = new Date(now);
    if (plan === 'MONTHLY') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }
    return {
      tier: plan === 'MONTHLY' ? SubscriptionTier.MONTHLY : SubscriptionTier.ANNUAL,
      expiresAt: expiresAt.toISOString(),
      isLifetime: false,
      purchaseType: PurchaseType.APP_STORE,
    };
  }

  async purchaseLifetime(): Promise<UserSubscription> {
    throw new Error('Not implemented — see NSL1V6SAB-20');
  }

  async restorePurchase(): Promise<UserSubscription | null> {
    throw new Error('Not implemented — see NSL1V6SAB-21');
  }
}
