export enum SubscriptionTier {
  FREE = 'FREE',
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
  LIFETIME = 'LIFETIME',
}

export enum PurchaseType {
  APP_STORE = 'APP_STORE',
  RESTORED = 'RESTORED',
}

export enum PremiumFeature {
  ADVANCED_TRACKER_BLOCKING = 'ADVANCED_TRACKER_BLOCKING',
  CUSTOM_FILTER_LISTS = 'CUSTOM_FILTER_LISTS',
  BLOCKING_STATISTICS = 'BLOCKING_STATISTICS',
  ALLOWLIST_SYNC = 'ALLOWLIST_SYNC',
  PRIORITY_SUPPORT = 'PRIORITY_SUPPORT',
}

export interface UserSubscription {
  tier: SubscriptionTier;
  expiresAt: string | null;
  isLifetime: boolean;
  purchaseType: PurchaseType | null;
}

export interface PaywallProduct {
  id: string;
  plan: 'MONTHLY' | 'ANNUAL' | 'LIFETIME';
  price: string;
  priceAmountMicros: number;
  currencyCode: string;
  title: string;
  description: string;
}
