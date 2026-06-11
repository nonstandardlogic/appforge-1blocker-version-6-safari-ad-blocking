import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SubscriptionTier, UserSubscription } from './types';
import { SubscriptionManager } from './SubscriptionManager';

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

const manager = new SubscriptionManager();

export const purchaseSubscription = createAsyncThunk<
  UserSubscription,
  'MONTHLY' | 'ANNUAL'
>('subscription/purchaseSubscription', async (plan) => {
  return manager.purchaseSubscription(plan);
});

export const purchaseLifetime = createAsyncThunk<UserSubscription, void>(
  'subscription/purchaseLifetime',
  async () => {
    return manager.purchaseLifetime();
  }
);

export const restorePurchase = createAsyncThunk<UserSubscription | null, void>(
  'subscription/restorePurchase',
  async () => {
    return manager.restorePurchase();
  }
);

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
  extraReducers: (builder) => {
    builder
      .addCase(purchaseSubscription.pending, (state) => {
        state.purchaseStatus = 'purchasing';
        state.error = null;
      })
      .addCase(purchaseSubscription.fulfilled, (state, action) => {
        state.purchaseStatus = 'success';
        state.subscription = action.payload;
        state.paywallVisible = false;
      })
      .addCase(purchaseSubscription.rejected, (state, action) => {
        state.purchaseStatus = 'error';
        state.error = action.error.message ?? 'Purchase failed';
      })
      .addCase(purchaseLifetime.pending, (state) => {
        state.purchaseStatus = 'purchasing';
        state.error = null;
      })
      .addCase(purchaseLifetime.fulfilled, (state, action) => {
        state.purchaseStatus = 'success';
        state.subscription = action.payload;
        state.paywallVisible = false;
      })
      .addCase(purchaseLifetime.rejected, (state, action) => {
        state.purchaseStatus = 'error';
        state.error = action.error.message ?? 'Purchase failed';
      })
      .addCase(restorePurchase.pending, (state) => {
        state.restoreStatus = 'restoring';
        state.error = null;
      })
      .addCase(restorePurchase.fulfilled, (state, action) => {
        state.restoreStatus = 'success';
        if (action.payload) {
          state.subscription = action.payload;
        }
      })
      .addCase(restorePurchase.rejected, (state, action) => {
        state.restoreStatus = 'error';
        state.error = action.error.message ?? 'Restore failed';
      });
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
