import { createSlice } from '@reduxjs/toolkit';
import { FirewallState, FirewallStatus } from './types';

const initialState: FirewallState = {
  status: FirewallStatus.INACTIVE,
  blockedRequestCount: 0,
};

const firewallSlice = createSlice({
  name: 'firewall',
  initialState,
  reducers: {
    activateFirewall(state) {
      state.status = FirewallStatus.ACTIVATING;
    },
    firewallActivated(state) {
      state.status = FirewallStatus.ACTIVE;
    },
    deactivateFirewall(state) {
      state.status = FirewallStatus.DEACTIVATING;
    },
    firewallDeactivated(state) {
      state.status = FirewallStatus.INACTIVE;
    },
    incrementBlockedCount(state) {
      state.blockedRequestCount += 1;
    },
    resetBlockedCount(state) {
      state.blockedRequestCount = 0;
    },
  },
});

export const {
  activateFirewall,
  firewallActivated,
  deactivateFirewall,
  firewallDeactivated,
  incrementBlockedCount,
  resetBlockedCount,
} = firewallSlice.actions;

export default firewallSlice.reducer;
