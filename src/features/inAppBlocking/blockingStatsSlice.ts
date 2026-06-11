import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppBlockingStats, BlockedRequestType, BlockingStatsState, StatsPeriod } from './types';

const initialState: BlockingStatsState = {
  statsByApp: [],
  selectedPeriod: 'day',
};

const blockingStatsSlice = createSlice({
  name: 'blockingStats',
  initialState,
  reducers: {
    recordBlockedRequest(
      state,
      action: PayloadAction<{ bundleId: string; appName: string; requestType: BlockedRequestType }>
    ) {
      const { bundleId, appName, requestType } = action.payload;
      const existing = state.statsByApp.find(s => s.bundleId === bundleId);
      if (!existing) {
        state.statsByApp.push({
          bundleId,
          appName,
          totalBlocked: 1,
          byType: {
            ads: requestType === BlockedRequestType.AD ? 1 : 0,
            trackers: requestType === BlockedRequestType.TRACKER ? 1 : 0,
            analytics: requestType === BlockedRequestType.ANALYTICS ? 1 : 0,
          },
        });
      } else {
        existing.totalBlocked += 1;
        if (requestType === BlockedRequestType.AD) existing.byType.ads += 1;
        else if (requestType === BlockedRequestType.TRACKER) existing.byType.trackers += 1;
        else if (requestType === BlockedRequestType.ANALYTICS) existing.byType.analytics += 1;
      }
    },
    setPeriod(state, action: PayloadAction<StatsPeriod>) {
      state.selectedPeriod = action.payload;
    },
    resetStats(state) {
      state.statsByApp = [];
    },
  },
});

export const { recordBlockedRequest, setPeriod, resetStats } = blockingStatsSlice.actions;

export function getAppsSortedByBlockCount(state: BlockingStatsState): AppBlockingStats[] {
  return [...state.statsByApp].sort((a, b) => b.totalBlocked - a.totalBlocked);
}

export default blockingStatsSlice.reducer;
