import reducer, {
  setInstalledApps,
  trustApp,
  untrustApp,
  isAppTrusted,
} from '../firewallAllowlistSlice';
import { FirewallAllowlistState, TrustedApp } from '../types';

const appA: TrustedApp = { bundleId: 'com.a.app', name: 'App A' };
const appB: TrustedApp = { bundleId: 'com.b.app', name: 'App B' };

describe('firewallAllowlistSlice', () => {
  const initialState: FirewallAllowlistState = {
    installedApps: [],
    trustedBundleIds: [],
  };

  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // AC1: Given I open Firewall Settings → App Allowlist, I see a list of installed apps I can mark as trusted
  describe('AC1 — installed apps list', () => {
    it('sets the installed apps list', () => {
      const state = reducer(initialState, setInstalledApps([appA, appB]));
      expect(state.installedApps).toHaveLength(2);
      expect(state.installedApps[0]).toEqual(appA);
    });

    it('starts with no trusted apps', () => {
      const state = reducer(initialState, setInstalledApps([appA, appB]));
      expect(state.trustedBundleIds).toHaveLength(0);
    });

    it('replaces the installed apps list when updated', () => {
      const withApps = reducer(initialState, setInstalledApps([appA, appB]));
      const replaced = reducer(withApps, setInstalledApps([appA]));
      expect(replaced.installedApps).toHaveLength(1);
    });
  });

  // AC2: Given I mark an app as trusted, its network requests bypass all firewall rules
  describe('AC2 — marking an app as trusted', () => {
    it('adds an app to the trusted list', () => {
      const state = reducer(initialState, trustApp(appA.bundleId));
      expect(isAppTrusted(state, appA.bundleId)).toBe(true);
    });

    it('does not affect other apps when one is trusted', () => {
      const state = reducer(initialState, trustApp(appA.bundleId));
      expect(isAppTrusted(state, appB.bundleId)).toBe(false);
    });

    it('does not duplicate an already-trusted app', () => {
      let state = reducer(initialState, trustApp(appA.bundleId));
      state = reducer(state, trustApp(appA.bundleId));
      expect(state.trustedBundleIds).toHaveLength(1);
    });

    it('can trust multiple apps simultaneously', () => {
      let state = reducer(initialState, trustApp(appA.bundleId));
      state = reducer(state, trustApp(appB.bundleId));
      expect(isAppTrusted(state, appA.bundleId)).toBe(true);
      expect(isAppTrusted(state, appB.bundleId)).toBe(true);
    });
  });

  // AC3: Given I remove an app from the trusted list, its traffic is subject to firewall rules again immediately
  describe('AC3 — removing an app from the trusted list', () => {
    it('removes an app from the trusted list', () => {
      const trusted: FirewallAllowlistState = {
        ...initialState,
        trustedBundleIds: [appA.bundleId],
      };
      const state = reducer(trusted, untrustApp(appA.bundleId));
      expect(isAppTrusted(state, appA.bundleId)).toBe(false);
    });

    it('only removes the targeted app', () => {
      const trusted: FirewallAllowlistState = {
        ...initialState,
        trustedBundleIds: [appA.bundleId, appB.bundleId],
      };
      const state = reducer(trusted, untrustApp(appA.bundleId));
      expect(isAppTrusted(state, appA.bundleId)).toBe(false);
      expect(isAppTrusted(state, appB.bundleId)).toBe(true);
    });

    it('is a no-op for a non-trusted app', () => {
      const state = reducer(initialState, untrustApp(appA.bundleId));
      expect(state.trustedBundleIds).toHaveLength(0);
    });
  });
});
