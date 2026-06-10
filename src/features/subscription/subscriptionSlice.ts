import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SubscriptionTier, UserSubscription } from './types';

interface SubscriptionState {
  subscription: UserSubscription;
  paywallVisible: boolean;
  purchaseStatus: 'idle' | 'purchasing' | 'success' | 'error';
  restoreStatus: 'idle' | 'restoring' | 'success' | 'error';
  error: string | null;
}

const DEFAULT_SUBSCRIPTION: UserSubscription = {
  tier: SubscriptionTier.FREE,
  expiresAt: null,
  isLifetime: false,
  purchaseType: null,
};

const initialState: SubscriptionState = {
  subscription: DEFAULT_SUBSCRIPTION,
  paywallVisible: false,
  purchaseStatus: 'idle',
  restoreStatus: 'idle',
  error: null,
};

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {
    setSubscription(state, action: PayloadAction<UserSubscription>) {
      state.subscription = action.payload;
    },
    showPaywall(state) {
      state.paywallVisible = true;
    },
    hidePaywall(state) {
      state.paywallVisible = false;
    },
    resetPurchaseStatus(state) {
      state.purchaseStatus = 'idle';
      state.error = null;
    },
    resetRestoreStatus(state) {
      state.restoreStatus = 'idle';
      state.error = null;
    },
  },
});

export const {
  setSubscription,
  showPaywall,
  hidePaywall,
  resetPurchaseStatus,
  resetRestoreStatus,
} = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
