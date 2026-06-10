import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppExclusionsState, InstalledApp } from './types';

const initialState: AppExclusionsState = {
  installedApps: [],
  excludedBundleIds: [],
};

const appExclusionsSlice = createSlice({
  name: 'appExclusions',
  initialState,
  reducers: {
    setInstalledApps(state, action: PayloadAction<InstalledApp[]>) {
      state.installedApps = action.payload;
    },
    excludeApp(state, action: PayloadAction<string>) {
      if (!state.excludedBundleIds.includes(action.payload)) {
        state.excludedBundleIds.push(action.payload);
      }
    },
    includeApp(state, action: PayloadAction<string>) {
      state.excludedBundleIds = state.excludedBundleIds.filter(
        id => id !== action.payload
      );
    },
  },
});

export const { setInstalledApps, excludeApp, includeApp } = appExclusionsSlice.actions;

export function isAppExcluded(state: AppExclusionsState, bundleId: string): boolean {
  return state.excludedBundleIds.includes(bundleId);
}

export default appExclusionsSlice.reducer;
