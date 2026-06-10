import { isFeatureAvailable, isPremiumRequired, PREMIUM_FEATURES } from '../featureGating';
import { SubscriptionTier, PremiumFeature } from '../types';

describe('featureGating', () => {
  describe('isFeatureAvailable – FREE tier', () => {
    it('returns false for ADVANCED_TRACKER_BLOCKING on FREE tier', () => {
      expect(isFeatureAvailable(PremiumFeature.ADVANCED_TRACKER_BLOCKING, SubscriptionTier.FREE)).toBe(false);
    });

    it('returns false for CUSTOM_FILTER_LISTS on FREE tier', () => {
      expect(isFeatureAvailable(PremiumFeature.CUSTOM_FILTER_LISTS, SubscriptionTier.FREE)).toBe(false);
    });

    it('returns false for BLOCKING_STATISTICS on FREE tier', () => {
      expect(isFeatureAvailable(PremiumFeature.BLOCKING_STATISTICS, SubscriptionTier.FREE)).toBe(false);
    });

    it('returns false for ALLOWLIST_SYNC on FREE tier', () => {
      expect(isFeatureAvailable(PremiumFeature.ALLOWLIST_SYNC, SubscriptionTier.FREE)).toBe(false);
    });

    it('returns false for PRIORITY_SUPPORT on FREE tier', () => {
      expect(isFeatureAvailable(PremiumFeature.PRIORITY_SUPPORT, SubscriptionTier.FREE)).toBe(false);
    });
  });

  describe('isFeatureAvailable – premium tiers', () => {
    it('returns true for all features on MONTHLY tier', () => {
      PREMIUM_FEATURES.forEach(feature => {
        expect(isFeatureAvailable(feature, SubscriptionTier.MONTHLY)).toBe(true);
      });
    });

    it('returns true for all features on ANNUAL tier', () => {
      PREMIUM_FEATURES.forEach(feature => {
        expect(isFeatureAvailable(feature, SubscriptionTier.ANNUAL)).toBe(true);
      });
    });

    it('returns true for all features on LIFETIME tier', () => {
      PREMIUM_FEATURES.forEach(feature => {
        expect(isFeatureAvailable(feature, SubscriptionTier.LIFETIME)).toBe(true);
      });
    });
  });

  describe('isPremiumRequired', () => {
    it('returns true for ADVANCED_TRACKER_BLOCKING', () => {
      expect(isPremiumRequired(PremiumFeature.ADVANCED_TRACKER_BLOCKING)).toBe(true);
    });

    it('returns true for CUSTOM_FILTER_LISTS', () => {
      expect(isPremiumRequired(PremiumFeature.CUSTOM_FILTER_LISTS)).toBe(true);
    });

    it('returns true for all features in PREMIUM_FEATURES list', () => {
      PREMIUM_FEATURES.forEach(feature => {
        expect(isPremiumRequired(feature)).toBe(true);
      });
    });
  });
});
