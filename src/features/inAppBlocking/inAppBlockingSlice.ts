import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BlockedRequest, InAppBlockingState } from './types';

const initialState: InAppBlockingState = {
  enabled: false,
  blockingLog: [],
};

const inAppBlockingSlice = createSlice({
  name: 'inAppBlocking',
  initialState,
  reducers: {
    enableInAppBlocking(state) {
      state.enabled = true;
    },
    disableInAppBlocking(state) {
      state.enabled = false;
    },
    logBlockedRequest(state, action: PayloadAction<BlockedRequest>) {
      if (state.enabled) {
        state.blockingLog.push(action.payload);
      }
    },
    clearBlockingLog(state) {
      state.blockingLog = [];
    },
  },
});

export const {
  enableInAppBlocking,
  disableInAppBlocking,
  logBlockedRequest,
  clearBlockingLog,
} = inAppBlockingSlice.actions;

export default inAppBlockingSlice.reducer;
