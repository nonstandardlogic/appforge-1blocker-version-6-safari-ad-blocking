import trackerLogReducer, { logBlockedTracker, clearLog } from '../trackerLogSlice';
import type { TrackerLogState } from '../trackerLogSlice';

const initialState: TrackerLogState = { events: [], totalBlocked: 0 };

describe('trackerLogSlice', () => {
  describe('logBlockedTracker', () => {
    it('adds an event with required fields', () => {
      const state = trackerLogReducer(
        initialState,
        logBlockedTracker({ trackerDomain: 'hotjar.com', hostPage: 'https://site.com' }),
      );
      expect(state.events).toHaveLength(1);
      expect(state.events[0].trackerDomain).toBe('hotjar.com');
      expect(state.events[0].hostPage).toBe('https://site.com');
      expect(state.events[0].category).toBe('TRACKER');
      expect(state.events[0].id).toBeTruthy();
      expect(state.events[0].blockedAt).toBeTruthy();
    });

    it('defaults category to TRACKER when not provided', () => {
      const state = trackerLogReducer(
        initialState,
        logBlockedTracker({ trackerDomain: 'a.com', hostPage: 'https://site.com' }),
      );
      expect(state.events[0].category).toBe('TRACKER');
    });

    it('accepts explicit AD category', () => {
      const state = trackerLogReducer(
        initialState,
        logBlockedTracker({ trackerDomain: 'ads.com', hostPage: 'https://site.com', category: 'AD' }),
      );
      expect(state.events[0].category).toBe('AD');
    });

    it('increments totalBlocked on each dispatch', () => {
      let state = trackerLogReducer(
        initialState,
        logBlockedTracker({ trackerDomain: 'a.com', hostPage: 'https://site.com' }),
      );
      state = trackerLogReducer(
        state,
        logBlockedTracker({ trackerDomain: 'b.com', hostPage: 'https://site.com' }),
      );
      expect(state.totalBlocked).toBe(2);
    });

    it('prepends so the most recent event is first', () => {
      let state = trackerLogReducer(
        initialState,
        logBlockedTracker({ trackerDomain: 'first.com', hostPage: 'https://site.com' }),
      );
      state = trackerLogReducer(
        state,
        logBlockedTracker({ trackerDomain: 'second.com', hostPage: 'https://site.com' }),
      );
      expect(state.events[0].trackerDomain).toBe('second.com');
    });

    it('caps stored events at 200', () => {
      let state = initialState;
      for (let i = 0; i < 210; i++) {
        state = trackerLogReducer(
          state,
          logBlockedTracker({ trackerDomain: `t${i}.com`, hostPage: 'https://site.com' }),
        );
      }
      expect(state.events).toHaveLength(200);
      expect(state.totalBlocked).toBe(210);
    });
  });

  describe('clearLog', () => {
    it('resets events and totalBlocked to zero', () => {
      let state = trackerLogReducer(
        initialState,
        logBlockedTracker({ trackerDomain: 'a.com', hostPage: 'https://site.com' }),
      );
      state = trackerLogReducer(state, clearLog());
      expect(state.events).toHaveLength(0);
      expect(state.totalBlocked).toBe(0);
    });
  });

  describe('initial state', () => {
    it('starts with no events and zero totalBlocked', () => {
      const state = trackerLogReducer(undefined, { type: '@@INIT' });
      expect(state.events).toEqual([]);
      expect(state.totalBlocked).toBe(0);
    });
  });
});
