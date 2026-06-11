import reducer, {
  activateFirewall,
  firewallActivated,
  deactivateFirewall,
  firewallDeactivated,
  incrementBlockedCount,
  resetBlockedCount,
} from '../firewallSlice';
import { FirewallState, FirewallStatus } from '../types';

describe('firewallSlice', () => {
  const initialState: FirewallState = {
    status: FirewallStatus.INACTIVE,
    blockedRequestCount: 0,
  };

  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // AC1: Given I toggle the firewall on, 1Blocker activates a VPN-based network extension
  describe('AC1 — activating the firewall', () => {
    it('transitions to ACTIVATING when the toggle is turned on', () => {
      const state = reducer(initialState, activateFirewall());
      expect(state.status).toBe(FirewallStatus.ACTIVATING);
    });

    it('transitions to ACTIVE once the VPN extension is established', () => {
      const activating = { ...initialState, status: FirewallStatus.ACTIVATING };
      const state = reducer(activating, firewallActivated());
      expect(state.status).toBe(FirewallStatus.ACTIVE);
    });

    it('preserves blockedRequestCount when activating', () => {
      const state = reducer(initialState, activateFirewall());
      expect(state.blockedRequestCount).toBe(0);
    });
  });

  // AC2: Given the firewall is active, blocked domain requests are counted and logged
  describe('AC2 — blocking domains when firewall is active', () => {
    it('increments blockedRequestCount when a request is blocked', () => {
      const active = { ...initialState, status: FirewallStatus.ACTIVE };
      const state = reducer(active, incrementBlockedCount());
      expect(state.blockedRequestCount).toBe(1);
    });

    it('accumulates the blocked request count over multiple requests', () => {
      const active = { ...initialState, status: FirewallStatus.ACTIVE };
      let state = reducer(active, incrementBlockedCount());
      state = reducer(state, incrementBlockedCount());
      state = reducer(state, incrementBlockedCount());
      expect(state.blockedRequestCount).toBe(3);
    });

    it('can reset the blocked request count', () => {
      const withCount: FirewallState = { status: FirewallStatus.ACTIVE, blockedRequestCount: 5 };
      const state = reducer(withCount, resetBlockedCount());
      expect(state.blockedRequestCount).toBe(0);
    });
  });

  // AC3: Given I disable the firewall, the VPN tunnel is torn down within 5 seconds
  describe('AC3 — deactivating the firewall', () => {
    it('transitions to DEACTIVATING when the toggle is turned off', () => {
      const active = { ...initialState, status: FirewallStatus.ACTIVE };
      const state = reducer(active, deactivateFirewall());
      expect(state.status).toBe(FirewallStatus.DEACTIVATING);
    });

    it('transitions to INACTIVE once the VPN tunnel is torn down', () => {
      const deactivating = { ...initialState, status: FirewallStatus.DEACTIVATING };
      const state = reducer(deactivating, firewallDeactivated());
      expect(state.status).toBe(FirewallStatus.INACTIVE);
    });

    it('preserves blockedRequestCount after deactivation', () => {
      const active: FirewallState = { status: FirewallStatus.ACTIVE, blockedRequestCount: 7 };
      const deactivating = reducer(active, deactivateFirewall());
      const inactive = reducer(deactivating, firewallDeactivated());
      expect(inactive.blockedRequestCount).toBe(7);
    });
  });
});
