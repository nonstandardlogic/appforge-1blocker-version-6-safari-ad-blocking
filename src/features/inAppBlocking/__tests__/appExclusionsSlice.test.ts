import reducer, {
  setInstalledApps,
  excludeApp,
  includeApp,
  isAppExcluded,
} from '../appExclusionsSlice';
import { AppExclusionsState, InstalledApp } from '../types';

const appA: InstalledApp = { bundleId: 'com.a.app', name: 'App A' };
const appB: InstalledApp = { bundleId: 'com.b.app', name: 'App B' };

describe('appExclusionsSlice', () => {
  const initialState: AppExclusionsState = {
    installedApps: [],
    excludedBundleIds: [],
  };

  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // AC1: Given in-app blocking is active, when I open Per-App Settings, I see a list of installed apps with a toggle to exclude each one
  describe('AC1 — installed apps list', () => {
    it('sets the installed apps list', () => {
      const state = reducer(initialState, setInstalledApps([appA, appB]));
      expect(state.installedApps).toHaveLength(2);
      expect(state.installedApps[0]).toEqual(appA);
    });

    it('starts with no excluded apps', () => {
      const state = reducer(initialState, setInstalledApps([appA, appB]));
      expect(state.excludedBundleIds).toHaveLength(0);
    });

    it('replaces the installed apps list when updated', () => {
      const withApps = reducer(initialState, setInstalledApps([appA, appB]));
      const replaced = reducer(withApps, setInstalledApps([appA]));
      expect(replaced.installedApps).toHaveLength(1);
    });
  });

  // AC2: Given I toggle an app to "Excluded," when that app makes network requests for ads, those requests are not blocked
  describe('AC2 — excluding an app', () => {
    it('marks an app as excluded', () => {
      const state = reducer(initialState, excludeApp(appA.bundleId));
      expect(isAppExcluded(state, appA.bundleId)).toBe(true);
    });

    it('does not exclude apps that are not targeted', () => {
      const state = reducer(initialState, excludeApp(appA.bundleId));
      expect(isAppExcluded(state, appB.bundleId)).toBe(false);
    });

    it('does not duplicate an already-excluded app', () => {
      let state = reducer(initialState, excludeApp(appA.bundleId));
      state = reducer(state, excludeApp(appA.bundleId));
      expect(state.excludedBundleIds).toHaveLength(1);
    });

    it('can exclude multiple apps', () => {
      let state = reducer(initialState, excludeApp(appA.bundleId));
      state = reducer(state, excludeApp(appB.bundleId));
      expect(state.excludedBundleIds).toHaveLength(2);
      expect(isAppExcluded(state, appA.bundleId)).toBe(true);
      expect(isAppExcluded(state, appB.bundleId)).toBe(true);
    });
  });

  // AC3: Given I re-enable blocking for an excluded app, when the setting is saved, ad requests are blocked again immediately
  describe('AC3 — re-enabling blocking for an excluded app', () => {
    it('removes an app from exclusions', () => {
      const excluded: AppExclusionsState = { ...initialState, excludedBundleIds: [appA.bundleId] };
      const state = reducer(excluded, includeApp(appA.bundleId));
      expect(isAppExcluded(state, appA.bundleId)).toBe(false);
    });

    it('only removes the targeted app from exclusions', () => {
      const excluded: AppExclusionsState = { ...initialState, excludedBundleIds: [appA.bundleId, appB.bundleId] };
      const state = reducer(excluded, includeApp(appA.bundleId));
      expect(isAppExcluded(state, appA.bundleId)).toBe(false);
      expect(isAppExcluded(state, appB.bundleId)).toBe(true);
    });

    it('is a no-op for a non-excluded app', () => {
      const state = reducer(initialState, includeApp(appA.bundleId));
      expect(state.excludedBundleIds).toHaveLength(0);
    });
  });
});
