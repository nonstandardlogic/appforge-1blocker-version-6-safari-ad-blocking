import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FirewallAllowlistState, TrustedApp } from './types';

const initialState: FirewallAllowlistState = {
  installedApps: [],
  trustedBundleIds: [],
};

const firewallAllowlistSlice = createSlice({
  name: 'firewallAllowlist',
  initialState,
  reducers: {
    setInstalledApps(state, action: PayloadAction<TrustedApp[]>) {
      state.installedApps = action.payload;
    },
    trustApp(state, action: PayloadAction<string>) {
      if (!state.trustedBundleIds.includes(action.payload)) {
        state.trustedBundleIds.push(action.payload);
      }
    },
    untrustApp(state, action: PayloadAction<string>) {
      state.trustedBundleIds = state.trustedBundleIds.filter(
        id => id !== action.payload
      );
    },
  },
});

export const { setInstalledApps, trustApp, untrustApp } = firewallAllowlistSlice.actions;

export function isAppTrusted(state: FirewallAllowlistState, bundleId: string): boolean {
  return state.trustedBundleIds.includes(bundleId);
}

export default firewallAllowlistSlice.reducer;
