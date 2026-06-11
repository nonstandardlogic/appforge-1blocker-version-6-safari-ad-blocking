import reducer, { addEntry, setFilter, clearLog, getFilteredEntries } from '../activityLogSlice';
import { ActivityLogEntry, ActivityLogState } from '../types';

const makeEntry = (overrides: Partial<ActivityLogEntry> = {}): ActivityLogEntry => ({
  id: 'entry-1',
  timestamp: '2026-06-10T10:00:00.000Z',
  domain: 'ads.example.com',
  appName: 'News App',
  action: 'blocked',
  ...overrides,
});

describe('activityLogSlice', () => {
  const initialState: ActivityLogState = { entries: [], filter: 'all' };

  it('has correct initial state', () => {
    expect(reducer(undefined, { type: '@@INIT' })).toEqual(initialState);
  });

  // AC1: Given the firewall is active, the Activity Log shows timestamp, domain, app, and blocked/allowed
  describe('AC1 — live-updating activity log', () => {
    it('adds an entry to the log', () => {
      const state = reducer(initialState, addEntry(makeEntry()));
      expect(state.entries).toHaveLength(1);
    });

    it('prepends new entries so the newest appears first', () => {
      const e1 = makeEntry({ id: 'e1', timestamp: '2026-06-10T10:00:00Z' });
      const e2 = makeEntry({ id: 'e2', timestamp: '2026-06-10T10:01:00Z' });
      let state = reducer(initialState, addEntry(e1));
      state = reducer(state, addEntry(e2));
      expect(state.entries[0].id).toBe('e2');
    });

    it('stores all required fields on each log entry', () => {
      const entry = makeEntry({ appName: 'App A', domain: 'tracker.com', action: 'blocked' });
      const state = reducer(initialState, addEntry(entry));
      const logged = state.entries[0];
      expect(logged.timestamp).toBeDefined();
      expect(logged.domain).toBe('tracker.com');
      expect(logged.appName).toBe('App A');
      expect(logged.action).toBe('blocked');
    });

    it('clearLog empties all entries', () => {
      const withEntry = reducer(initialState, addEntry(makeEntry()));
      const state = reducer(withEntry, clearLog());
      expect(state.entries).toHaveLength(0);
    });
  });

  // AC2: Given the log is populated, filtering by "Blocked only" shows only blocked entries
  describe('AC2 — filtering to blocked-only', () => {
    it('setFilter changes the active filter', () => {
      const state = reducer(initialState, setFilter('blocked'));
      expect(state.filter).toBe('blocked');
    });

    it('getFilteredEntries returns all entries when filter is "all"', () => {
      let state = reducer(initialState, addEntry(makeEntry({ id: 'e1', action: 'blocked' })));
      state = reducer(state, addEntry(makeEntry({ id: 'e2', action: 'allowed' })));
      expect(getFilteredEntries(state)).toHaveLength(2);
    });

    it('getFilteredEntries returns only blocked entries when filter is "blocked"', () => {
      let state = reducer(initialState, addEntry(makeEntry({ id: 'e1', action: 'blocked' })));
      state = reducer(state, addEntry(makeEntry({ id: 'e2', action: 'allowed' })));
      state = reducer(state, setFilter('blocked'));
      const filtered = getFilteredEntries(state);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].action).toBe('blocked');
    });

    it('switching back to "all" filter restores all entries', () => {
      let state = reducer(initialState, addEntry(makeEntry({ id: 'e1', action: 'blocked' })));
      state = reducer(state, addEntry(makeEntry({ id: 'e2', action: 'allowed' })));
      state = reducer(state, setFilter('blocked'));
      state = reducer(state, setFilter('all'));
      expect(getFilteredEntries(state)).toHaveLength(2);
    });
  });

  // AC3: Given I tap a log entry, the domain is available to add to the block list or allowlist
  describe('AC3 — log entry detail supports block/allow actions', () => {
    it('exposes the domain field for adding to the block list', () => {
      const state = reducer(initialState, addEntry(makeEntry({ domain: 'suspicious.example.com' })));
      expect(state.entries[0].domain).toBe('suspicious.example.com');
    });

    it('distinguishes blocked from allowed entries via the action field', () => {
      let state = reducer(initialState, addEntry(makeEntry({ id: 'b', action: 'blocked' })));
      state = reducer(state, addEntry(makeEntry({ id: 'a', action: 'allowed' })));
      expect(state.entries.find(e => e.id === 'b')?.action).toBe('blocked');
      expect(state.entries.find(e => e.id === 'a')?.action).toBe('allowed');
    });
  });
});
