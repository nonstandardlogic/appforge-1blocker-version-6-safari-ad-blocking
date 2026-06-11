import { configureStore } from '@reduxjs/toolkit';
import filterUpdateReducer, {
  setWifiOnlyUpdates,
  clearError,
  runBackgroundFilterUpdate,
} from '../filterUpdateSlice';
import blockingReducer from '../blockingSlice';
import trackerLogReducer from '../trackerLogSlice';
import { UPDATE_INTERVAL_MS } from '../FilterListUpdater';

function makeTestStore() {
  return configureStore({
    reducer: {
      blocking: blockingReducer,
      trackerLog: trackerLogReducer,
      filterUpdate: filterUpdateReducer,
    },
  });
}

// Filter lists initialize with lastUpdated = now at module load time.
// Passing a "now" 25h in the future makes every list appear stale.
function futureNow(): Date {
  return new Date(Date.now() + UPDATE_INTERVAL_MS + 60_000);
}

describe('filterUpdateSlice – reducers', () => {
  it('defaults to wifiOnlyUpdates = true and zero lastUpdateCount', () => {
    const store = makeTestStore();
    const s = store.getState().filterUpdate;
    expect(s.wifiOnlyUpdates).toBe(true);
    expect(s.lastUpdateCount).toBe(0);
    expect(s.lastChecked).toBeNull();
    expect(s.isUpdating).toBe(false);
    expect(s.error).toBeNull();
  });

  it('setWifiOnlyUpdates toggles the preference', () => {
    const store = makeTestStore();
    store.dispatch(setWifiOnlyUpdates(false));
    expect(store.getState().filterUpdate.wifiOnlyUpdates).toBe(false);
    store.dispatch(setWifiOnlyUpdates(true));
    expect(store.getState().filterUpdate.wifiOnlyUpdates).toBe(true);
  });

  it('clearError resets the error field to null', () => {
    const store = makeTestStore();
    store.dispatch(clearError());
    expect(store.getState().filterUpdate.error).toBeNull();
  });
});

describe('filterUpdateSlice – runBackgroundFilterUpdate (AC1, AC2, AC3)', () => {
  it('sets isUpdating = true while the thunk is pending', () => {
    const store = makeTestStore();
    const promise = store.dispatch(
      runBackgroundFilterUpdate({ networkType: 'wifi', now: futureNow() }),
    );
    expect(store.getState().filterUpdate.isUpdating).toBe(true);
    return promise;
  });

  it('clears isUpdating and records lastChecked after completing (AC2)', async () => {
    const store = makeTestStore();
    await store.dispatch(runBackgroundFilterUpdate({ networkType: 'wifi', now: futureNow() }));
    const s = store.getState().filterUpdate;
    expect(s.isUpdating).toBe(false);
    expect(s.lastChecked).toBeTruthy();
    expect(() => new Date(s.lastChecked!).toISOString()).not.toThrow();
  });

  it('downloads and applies updates to all stale lists on Wi-Fi (AC1)', async () => {
    const store = makeTestStore();
    const now = futureNow();
    await store.dispatch(runBackgroundFilterUpdate({ networkType: 'wifi', now }));
    const lists = store.getState().blocking.filterLists;
    // Every enabled list should have been stamped with the update timestamp
    lists.forEach(l => {
      expect(l.lastUpdated).toBe(now.toISOString());
    });
    expect(store.getState().filterUpdate.lastUpdateCount).toBe(lists.length);
  });

  it('Last updated timestamp on each list reflects the most recent update (AC2)', async () => {
    const store = makeTestStore();
    const now = futureNow();
    await store.dispatch(runBackgroundFilterUpdate({ networkType: 'wifi', now }));
    store.getState().blocking.filterLists.forEach(l => {
      expect(l.lastUpdated).toBe(now.toISOString());
    });
    expect(store.getState().blocking.lastUpdated).toBe(now.toISOString());
  });

  it('skips update on cellular when wifiOnly = true (AC3)', async () => {
    const store = makeTestStore();
    const before = store.getState().blocking.filterLists.map(l => l.lastUpdated);
    await store.dispatch(runBackgroundFilterUpdate({ networkType: 'cellular', now: futureNow() }));
    const after = store.getState().blocking.filterLists.map(l => l.lastUpdated);
    expect(after).toEqual(before);
    expect(store.getState().filterUpdate.lastUpdateCount).toBe(0);
  });

  it('allows update on cellular when wifiOnly = false (respects user preference, AC3)', async () => {
    const store = makeTestStore();
    store.dispatch(setWifiOnlyUpdates(false));
    await store.dispatch(runBackgroundFilterUpdate({ networkType: 'cellular', now: futureNow() }));
    expect(store.getState().filterUpdate.lastUpdateCount).toBeGreaterThan(0);
  });

  it('skips update when there is no network connection at all', async () => {
    const store = makeTestStore();
    await store.dispatch(runBackgroundFilterUpdate({ networkType: 'none', now: futureNow() }));
    expect(store.getState().filterUpdate.lastUpdateCount).toBe(0);
  });

  it('does not update lists that are not yet stale (< 24h old)', async () => {
    const store = makeTestStore();
    // Use current time so all lists look fresh relative to now
    await store.dispatch(runBackgroundFilterUpdate({ networkType: 'wifi' }));
    expect(store.getState().filterUpdate.lastUpdateCount).toBe(0);
  });

  it('records lastChecked even when no lists needed updating', async () => {
    const store = makeTestStore();
    await store.dispatch(runBackgroundFilterUpdate({ networkType: 'wifi' }));
    expect(store.getState().filterUpdate.lastChecked).toBeTruthy();
  });
});
