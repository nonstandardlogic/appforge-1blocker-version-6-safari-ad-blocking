import reducer, {
  recordBlockedRequest,
  setPeriod,
  resetStats,
  getAppsSortedByBlockCount,
} from '../blockingStatsSlice';
import { BlockedRequestType, BlockingStatsState } from '../types';

const record = (bundleId: string, appName: string, requestType: BlockedRequestType) =>
  recordBlockedRequest({ bundleId, appName, requestType });

describe('blockingStatsSlice', () => {
  const initialState: BlockingStatsState = {
    statsByApp: [],
    selectedPeriod: 'day',
  };

  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // AC1: Given in-app blocking has been active, when I open Statistics, I see a ranked list sorted by blocked count
  describe('AC1 — ranked list sorted by blocked count', () => {
    it('records blocked requests per app', () => {
      let state = reducer(initialState, record('com.a.app', 'App A', BlockedRequestType.AD));
      state = reducer(state, record('com.a.app', 'App A', BlockedRequestType.TRACKER));
      state = reducer(state, record('com.b.app', 'App B', BlockedRequestType.AD));
      expect(state.statsByApp).toHaveLength(2);
      expect(state.statsByApp.find(s => s.bundleId === 'com.a.app')!.totalBlocked).toBe(2);
      expect(state.statsByApp.find(s => s.bundleId === 'com.b.app')!.totalBlocked).toBe(1);
    });

    it('returns apps sorted by totalBlocked descending', () => {
      let state = reducer(initialState, record('com.b.app', 'App B', BlockedRequestType.AD));
      state = reducer(state, record('com.a.app', 'App A', BlockedRequestType.AD));
      state = reducer(state, record('com.a.app', 'App A', BlockedRequestType.TRACKER));
      const sorted = getAppsSortedByBlockCount(state);
      expect(sorted[0].bundleId).toBe('com.a.app');
      expect(sorted[1].bundleId).toBe('com.b.app');
    });

    it('does not mutate state when sorting', () => {
      let state = reducer(initialState, record('com.b.app', 'App B', BlockedRequestType.AD));
      state = reducer(state, record('com.a.app', 'App A', BlockedRequestType.AD));
      state = reducer(state, record('com.a.app', 'App A', BlockedRequestType.TRACKER));
      getAppsSortedByBlockCount(state);
      expect(state.statsByApp[0].bundleId).toBe('com.b.app');
    });

    it('resetStats clears all statistics', () => {
      let state = reducer(initialState, record('com.a.app', 'App A', BlockedRequestType.AD));
      state = reducer(state, resetStats());
      expect(state.statsByApp).toHaveLength(0);
    });
  });

  // AC2: Given I tap on an app, when the detail view opens, I see a breakdown of blocked request types
  describe('AC2 — per-type breakdown', () => {
    it('increments the ads counter for AD requests', () => {
      const state = reducer(initialState, record('com.a.app', 'App A', BlockedRequestType.AD));
      expect(state.statsByApp[0].byType.ads).toBe(1);
      expect(state.statsByApp[0].byType.trackers).toBe(0);
      expect(state.statsByApp[0].byType.analytics).toBe(0);
    });

    it('increments the trackers counter for TRACKER requests', () => {
      const state = reducer(initialState, record('com.a.app', 'App A', BlockedRequestType.TRACKER));
      expect(state.statsByApp[0].byType.trackers).toBe(1);
      expect(state.statsByApp[0].byType.ads).toBe(0);
    });

    it('increments the analytics counter for ANALYTICS requests', () => {
      const state = reducer(initialState, record('com.a.app', 'App A', BlockedRequestType.ANALYTICS));
      expect(state.statsByApp[0].byType.analytics).toBe(1);
      expect(state.statsByApp[0].byType.ads).toBe(0);
    });

    it('correctly counts multiple request types for the same app', () => {
      let state = reducer(initialState, record('com.a.app', 'App A', BlockedRequestType.AD));
      state = reducer(state, record('com.a.app', 'App A', BlockedRequestType.TRACKER));
      state = reducer(state, record('com.a.app', 'App A', BlockedRequestType.ANALYTICS));
      const app = state.statsByApp[0];
      expect(app.byType.ads).toBe(1);
      expect(app.byType.trackers).toBe(1);
      expect(app.byType.analytics).toBe(1);
      expect(app.totalBlocked).toBe(3);
    });
  });

  // AC3: Given statistics span several days, when I view the chart, I can filter by day, week, or month
  describe('AC3 — period filtering', () => {
    it('starts with "day" as the default selected period', () => {
      expect(reducer(undefined, { type: '@@INIT' }).selectedPeriod).toBe('day');
    });

    it('can switch to week period', () => {
      const state = reducer(initialState, setPeriod('week'));
      expect(state.selectedPeriod).toBe('week');
    });

    it('can switch to month period', () => {
      const state = reducer(initialState, setPeriod('month'));
      expect(state.selectedPeriod).toBe('month');
    });

    it('can switch back to day from another period', () => {
      const week = reducer(initialState, setPeriod('week'));
      const day = reducer(week, setPeriod('day'));
      expect(day.selectedPeriod).toBe('day');
    });
  });
});
