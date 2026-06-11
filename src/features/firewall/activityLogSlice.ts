import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ActivityLogEntry, ActivityLogFilter, ActivityLogState } from './types';

const initialState: ActivityLogState = {
  entries: [],
  filter: 'all',
};

const activityLogSlice = createSlice({
  name: 'activityLog',
  initialState,
  reducers: {
    addEntry(state, action: PayloadAction<ActivityLogEntry>) {
      state.entries.unshift(action.payload);
    },
    setFilter(state, action: PayloadAction<ActivityLogFilter>) {
      state.filter = action.payload;
    },
    clearLog(state) {
      state.entries = [];
    },
  },
});

export const { addEntry, setFilter, clearLog } = activityLogSlice.actions;

export function getFilteredEntries(state: ActivityLogState): ActivityLogEntry[] {
  if (state.filter === 'blocked') {
    return state.entries.filter(e => e.action === 'blocked');
  }
  return state.entries;
}

export default activityLogSlice.reducer;
