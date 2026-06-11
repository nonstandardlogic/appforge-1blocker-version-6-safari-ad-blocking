import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterUpdateManifest, FilterUpdateState } from './types';

const initialState: FilterUpdateState = {
  status: 'idle',
  currentVersion: null,
  pendingManifest: null,
  lastCheckedAt: null,
  lastAppliedVersion: null,
  error: null,
  checksumValid: null,
};

const filterUpdateSlice = createSlice({
  name: 'filterUpdate',
  initialState,
  reducers: {
    checkForUpdate(state) {
      state.status = 'checking';
      state.error = null;
    },
    updateManifestReceived(state, action: PayloadAction<FilterUpdateManifest>) {
      state.status = 'downloading';
      state.pendingManifest = action.payload;
    },
    noUpdateAvailable(state) {
      state.status = 'up_to_date';
    },
    checksumFailed(state) {
      state.status = 'error';
      state.pendingManifest = null;
      state.checksumValid = false;
      state.error = 'Checksum validation failed';
    },
    applyUpdate(state) {
      state.status = 'applying';
      state.checksumValid = true;
    },
    updateApplied(state, action: PayloadAction<string>) {
      state.status = 'idle';
      state.lastAppliedVersion = action.payload;
      state.pendingManifest = null;
      state.error = null;
    },
    updateFailed(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.error = action.payload;
    },
  },
});

export const {
  checkForUpdate,
  updateManifestReceived,
  noUpdateAvailable,
  checksumFailed,
  applyUpdate,
  updateApplied,
  updateFailed,
} = filterUpdateSlice.actions;

export default filterUpdateSlice.reducer;
