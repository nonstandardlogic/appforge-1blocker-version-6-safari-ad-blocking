import { FilterListUpdater, UPDATE_INTERVAL_MS } from '../FilterListUpdater';
import type { FilterList } from '../types';

function makeList(id: string, lastUpdated: string, enabled = true): FilterList {
  return { id, name: id, category: 'ADS', enabled, rulesCount: 100, lastUpdated };
}

describe('FilterListUpdater', () => {
  let updater: FilterListUpdater;

  beforeEach(() => {
    updater = new FilterListUpdater();
  });

  describe('isStale()', () => {
    it('returns true when list was last updated more than 24h ago', () => {
      const now = new Date();
      const old = new Date(now.getTime() - UPDATE_INTERVAL_MS - 1000).toISOString();
      expect(updater.isStale(makeList('l', old), now)).toBe(true);
    });

    it('returns false when list was updated within 24h', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 1000).toISOString();
      expect(updater.isStale(makeList('l', recent), now)).toBe(false);
    });

    it('returns false when age equals exactly UPDATE_INTERVAL_MS', () => {
      const now = new Date();
      const exact = new Date(now.getTime() - UPDATE_INTERVAL_MS).toISOString();
      expect(updater.isStale(makeList('l', exact), now)).toBe(false);
    });
  });

  describe('canUpdateOnNetwork()', () => {
    it('allows update on wifi regardless of wifiOnly setting', () => {
      expect(updater.canUpdateOnNetwork('wifi', true)).toBe(true);
      expect(updater.canUpdateOnNetwork('wifi', false)).toBe(true);
    });

    it('blocks update on cellular when wifiOnly is true (AC3)', () => {
      expect(updater.canUpdateOnNetwork('cellular', true)).toBe(false);
    });

    it('allows update on cellular when wifiOnly is false (user preference)', () => {
      expect(updater.canUpdateOnNetwork('cellular', false)).toBe(true);
    });

    it('always blocks update when there is no network connection', () => {
      expect(updater.canUpdateOnNetwork('none', true)).toBe(false);
      expect(updater.canUpdateOnNetwork('none', false)).toBe(false);
    });
  });

  describe('getListsNeedingUpdate()', () => {
    it('returns only stale, enabled lists', () => {
      const now = new Date();
      const old = new Date(now.getTime() - UPDATE_INTERVAL_MS - 1000).toISOString();
      const fresh = new Date(now.getTime() - 1000).toISOString();
      const lists = [
        makeList('stale-enabled', old, true),
        makeList('fresh-enabled', fresh, true),
        makeList('stale-disabled', old, false),
      ];
      const result = updater.getListsNeedingUpdate(lists, now);
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('stale-enabled');
    });

    it('returns empty array when all lists are fresh', () => {
      const now = new Date();
      const lists = [makeList('l', new Date(now.getTime() - 1000).toISOString())];
      expect(updater.getListsNeedingUpdate(lists, now)).toHaveLength(0);
    });

    it('returns empty array when stale lists are disabled', () => {
      const now = new Date();
      const old = new Date(now.getTime() - UPDATE_INTERVAL_MS - 1000).toISOString();
      expect(updater.getListsNeedingUpdate([makeList('l', old, false)], now)).toHaveLength(0);
    });

    it('returns all stale enabled lists when multiple qualify', () => {
      const now = new Date();
      const old = new Date(now.getTime() - UPDATE_INTERVAL_MS - 1000).toISOString();
      const lists = [
        makeList('a', old, true),
        makeList('b', old, true),
        makeList('c', old, true),
      ];
      expect(updater.getListsNeedingUpdate(lists, now)).toHaveLength(3);
    });
  });

  describe('buildUpdatedList()', () => {
    it('returns a new object with the updated lastUpdated timestamp', () => {
      const list = makeList('l', '2020-01-01T00:00:00.000Z');
      const updatedAt = new Date().toISOString();
      const result = updater.buildUpdatedList(list, updatedAt);
      expect(result.lastUpdated).toBe(updatedAt);
      expect(result).not.toBe(list);
    });

    it('applies newRulesCount when provided', () => {
      const list = makeList('l', '2020-01-01T00:00:00.000Z');
      const result = updater.buildUpdatedList(list, new Date().toISOString(), 500);
      expect(result.rulesCount).toBe(500);
    });

    it('preserves original rulesCount when newRulesCount is omitted', () => {
      const list = makeList('l', '2020-01-01T00:00:00.000Z');
      const result = updater.buildUpdatedList(list, new Date().toISOString());
      expect(result.rulesCount).toBe(list.rulesCount);
    });

    it('preserves all other fields (id, name, category, enabled)', () => {
      const list = makeList('my-list', '2020-01-01T00:00:00.000Z');
      const result = updater.buildUpdatedList(list, new Date().toISOString());
      expect(result.id).toBe('my-list');
      expect(result.enabled).toBe(list.enabled);
      expect(result.category).toBe(list.category);
      expect(result.name).toBe(list.name);
    });
  });
});
