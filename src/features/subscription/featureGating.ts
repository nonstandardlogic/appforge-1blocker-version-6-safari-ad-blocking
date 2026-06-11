import { SubscriptionTier, PremiumFeature } from './types';

export const PREMIUM_FEATURES: PremiumFeature[] = [
  PremiumFeature.ADVANCED_TRACKER_BLOCKING,
  PremiumFeature.CUSTOM_FILTER_LISTS,
  PremiumFeature.BLOCKING_STATISTICS,
  PremiumFeature.ALLOWLIST_SYNC,
  PremiumFeature.PRIORITY_SUPPORT,
];

export function isFeatureAvailable(feature: PremiumFeature, tier: SubscriptionTier): boolean {
  if (tier === SubscriptionTier.FREE) {
    return false;
  }
  return true;
}

export function isPremiumRequired(feature: PremiumFeature): boolean {
  return PREMIUM_FEATURES.includes(feature);
}
