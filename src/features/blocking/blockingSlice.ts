import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { BlockingEngine } from './BlockingEngine';
import type { BlockingRule, FilterList } from './types';

export type { FilterList };

export interface BlockingState {
  isEnabled: boolean;
  filterLists: FilterList[];
  compiledRulesCount: number;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Blocking is ON by default — zero user configuration required (AC1)
const BUILT_IN_FILTER_LISTS: FilterList[] = [
  {
    id: 'easylist',
    name: 'EasyList',
    category: 'ADS',
    enabled: true,
    rulesCount: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'easyprivacy',
    name: 'EasyPrivacy',
    category: 'TRACKERS',
    enabled: true,
    rulesCount: 0,
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'fanboy-annoyances',
    name: 'Fanboy Annoyances',
    category: 'ANNOYANCES',
    enabled: true,
    rulesCount: 0,
    lastUpdated: new Date().toISOString(),
  },
];

const initialState: BlockingState = {
  isEnabled: true,
  filterLists: BUILT_IN_FILTER_LISTS,
  compiledRulesCount: 0,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

export const loadAndCompileRules = createAsyncThunk<BlockingRule[]>(
  'blocking/loadAndCompileRules',
  async () => {
    const engine = new BlockingEngine();
    return engine.compileRules();
  },
);

const blockingSlice = createSlice({
  name: 'blocking',
  initialState,
  reducers: {
    setBlockingEnabled(state, action: PayloadAction<boolean>) {
      state.isEnabled = action.payload;
    },
    toggleFilterList(state, action: PayloadAction<string>) {
      const list = state.filterLists.find(l => l.id === action.payload);
      if (list) {
        list.enabled = !list.enabled;
      }
    },
    updateFilterListTimestamp(
      state,
      action: PayloadAction<{ id: string; lastUpdated: string }>,
    ) {
      const list = state.filterLists.find(l => l.id === action.payload.id);
      if (list) {
        list.lastUpdated = action.payload.lastUpdated;
      }
      state.lastUpdated = action.payload.lastUpdated;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadAndCompileRules.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadAndCompileRules.fulfilled, (state, action) => {
        state.isLoading = false;
        state.compiledRulesCount = action.payload.length;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(loadAndCompileRules.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? 'Failed to load rules';
      });
  },
});

export const blockingActions = blockingSlice.actions;
export default blockingSlice.reducer;

export const selectBlocking = (state: { blocking: BlockingState }) => state.blocking;
export const selectIsBlockingEnabled = (state: { blocking: BlockingState }) =>
  state.blocking.isEnabled;
export const selectFilterLists = (state: { blocking: BlockingState }) =>
  state.blocking.filterLists;
export const selectCompiledRulesCount = (state: { blocking: BlockingState }) =>
  state.blocking.compiledRulesCount;
