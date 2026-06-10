import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { TrackerBlockEvent } from './types';

const MAX_EVENTS_IN_STATE = 200;

export interface TrackerLogState {
  events: TrackerBlockEvent[];
  totalBlocked: number;
}

const initialState: TrackerLogState = {
  events: [],
  totalBlocked: 0,
};

const trackerLogSlice = createSlice({
  name: 'trackerLog',
  initialState,
  reducers: {
    logBlockedTracker(
      state,
      action: PayloadAction<{
        trackerDomain: string;
        hostPage: string;
        category?: TrackerBlockEvent['category'];
      }>,
    ) {
      const event: TrackerBlockEvent = {
        id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`,
        trackerDomain: action.payload.trackerDomain,
        hostPage: action.payload.hostPage,
        blockedAt: new Date().toISOString(),
        category: action.payload.category ?? 'TRACKER',
      };
      state.events.unshift(event);
      if (state.events.length > MAX_EVENTS_IN_STATE) {
        state.events.splice(MAX_EVENTS_IN_STATE);
      }
      state.totalBlocked += 1;
    },
    clearLog(state) {
      state.events.splice(0);
      state.totalBlocked = 0;
    },
  },
});

export const { logBlockedTracker, clearLog } = trackerLogSlice.actions;
export default trackerLogSlice.reducer;
