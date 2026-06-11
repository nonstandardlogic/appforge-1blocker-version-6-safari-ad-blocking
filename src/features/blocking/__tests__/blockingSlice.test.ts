import blockingReducer, {
  blockingActions,
  loadAndCompileRules,
} from '../blockingSlice';
import type { BlockingRule } from '../types';

describe('blockingSlice', () => {
  describe('initial state', () => {
    it('has blocking enabled by default — zero user configuration required (AC1)', () => {
      const state = blockingReducer(undefined, { type: 'unknown' });
      expect(state.isEnabled).toBe(true);
    });

    it('includes EasyList (ad blocking) enabled by default', () => {
      const state = blockingReducer(undefined, { type: 'unknown' });
      const easylist = state.filterLists.find(l => l.id === 'easylist');
      expect(easylist).toBeDefined();
      expect(easylist?.enabled).toBe(true);
      expect(easylist?.category).toBe('ADS');
    });

    it('includes EasyPrivacy (tracker blocking) enabled by default', () => {
      const state = blockingReducer(undefined, { type: 'unknown' });
      const easyprivacy = state.filterLists.find(l => l.id === 'easyprivacy');
      expect(easyprivacy).toBeDefined();
      expect(easyprivacy?.enabled).toBe(true);
      expect(easyprivacy?.category).toBe('TRACKERS');
    });

    it('starts in a non-loading state with no errors', () => {
      const state = blockingReducer(undefined, { type: 'unknown' });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setBlockingEnabled', () => {
    it('disables blocking when passed false', () => {
      const state = blockingReducer(undefined, blockingActions.setBlockingEnabled(false));
      expect(state.isEnabled).toBe(false);
    });

    it('re-enables blocking when passed true', () => {
      let state = blockingReducer(undefined, blockingActions.setBlockingEnabled(false));
      state = blockingReducer(state, blockingActions.setBlockingEnabled(true));
      expect(state.isEnabled).toBe(true);
    });
  });

  describe('toggleFilterList', () => {
    it('disables a filter list', () => {
      const state = blockingReducer(undefined, blockingActions.toggleFilterList('easylist'));
      expect(state.filterLists.find(l => l.id === 'easylist')?.enabled).toBe(false);
    });

    it('re-enables a disabled filter list', () => {
      let state = blockingReducer(undefined, blockingActions.toggleFilterList('easylist'));
      state = blockingReducer(state, blockingActions.toggleFilterList('easylist'));
      expect(state.filterLists.find(l => l.id === 'easylist')?.enabled).toBe(true);
    });

    it('silently ignores unknown filter list IDs', () => {
      const before = blockingReducer(undefined, { type: 'unknown' });
      const after = blockingReducer(before, blockingActions.toggleFilterList('does-not-exist'));
      expect(after.filterLists).toEqual(before.filterLists);
    });
  });

  describe('loadAndCompileRules async thunk', () => {
    it('sets isLoading=true when pending', () => {
      const action = loadAndCompileRules.pending('req-1', undefined);
      const state = blockingReducer(undefined, action);
      expect(state.isLoading).toBe(true);
      expect(state.error).toBeNull();
    });

    it('updates compiledRulesCount and clears loading on fulfilment', () => {
      const mockRules: BlockingRule[] = [
        { trigger: { 'url-filter': '.*doubleclick\.net' }, action: { type: 'block' } },
        {
          trigger: { 'url-filter': '.*' },
          action: { type: 'css-display-none', selector: '.ad-slot' },
        },
      ];
      const action = loadAndCompileRules.fulfilled(mockRules, 'req-1', undefined);
      const state = blockingReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.compiledRulesCount).toBe(2);
      expect(state.lastUpdated).not.toBeNull();
    });

    it('records the error message and clears loading on rejection', () => {
      const action = loadAndCompileRules.rejected(
        new Error('fetch failed'),
        'req-1',
        undefined,
      );
      const state = blockingReducer(undefined, action);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBe('fetch failed');
    });
  });
});
