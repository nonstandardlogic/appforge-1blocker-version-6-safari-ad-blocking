import {createSlice, type PayloadAction} from '@reduxjs/toolkit';
import type {BlockingStats} from '../../native/modules/BlockingStatsModule';

interface StatsState {
  stats: BlockingStats;
  showBreakdown: boolean;
}

const initialState: StatsState = {
  stats: {total: 0, byCategory: {ads: 0, trackers: 0, annoyances: 0}},
  showBreakdown: false,
};

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    updateStats(state, action: PayloadAction<BlockingStats>) {
      state.stats = action.payload;
    },
    toggleBreakdown(state) {
      state.showBreakdown = !state.showBreakdown;
    },
  },
});

export const {updateStats, toggleBreakdown} = statsSlice.actions;
export default statsSlice.reducer;
