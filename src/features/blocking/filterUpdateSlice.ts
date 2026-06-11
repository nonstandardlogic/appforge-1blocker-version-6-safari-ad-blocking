import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { FilterListUpdater } from './FilterListUpdater';
import type { NetworkType } from './FilterListUpdater';
import { blockingActions } from './blockingSlice';
import type { BlockingState } from './blockingSlice';

export interface FilterUpdateState {
  lastChecked: string | null;
  isUpdating: boolean;
  error: string | null;
  wifiOnlyUpdates: boolean;
  lastUpdateCount: number;
}

const initialState: FilterUpdateState = {
  lastChecked: null,
  isUpdating: false,
  error: null,
  wifiOnlyUpdates: true,
  lastUpdateCount: 0,
};

export const runBackgroundFilterUpdate = createAsyncThunk<
  { updatedCount: number; checkedAt: string },
  { networkType: NetworkType; now?: Date }
>(
  'filterUpdate/runBackground',
  async ({ networkType, now = new Date() }, { getState, dispatch }) => {
    const state = getState() as { blocking: BlockingState; filterUpdate: FilterUpdateState };
    const { wifiOnlyUpdates } = state.filterUpdate;
    const { filterLists } = state.blocking;
    const checkedAt = now.toISOString();

    const updater = new FilterListUpdater();

    if (!updater.canUpdateOnNetwork(networkType, wifiOnlyUpdates)) {
      return { updatedCount: 0, checkedAt };
    }

    const stale = updater.getListsNeedingUpdate(filterLists, now);

    for (const list of stale) {
      dispatch(blockingActions.updateFilterListTimestamp({ id: list.id, lastUpdated: checkedAt }));
    }

    return { updatedCount: stale.length, checkedAt };
  },
);

const filterUpdateSlice = createSlice({
  name: 'filterUpdate',
  initialState,
  reducers: {
    setWifiOnlyUpdates(state, action: PayloadAction<boolean>) {
      state.wifiOnlyUpdates = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      .addCase(runBackgroundFilterUpdate.pending, state => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(runBackgroundFilterUpdate.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.lastChecked = action.payload.checkedAt;
        state.lastUpdateCount = action.payload.updatedCount;
      })
      .addCase(runBackgroundFilterUpdate.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.error.message ?? 'Update failed';
      });
  },
});

export const { setWifiOnlyUpdates, clearError } = filterUpdateSlice.actions;
export default filterUpdateSlice.reducer;
